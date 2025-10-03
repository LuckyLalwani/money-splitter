const Expense = require('../models/expenseModel');
const Group = require('../models/groupModel');

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const { 
      description, 
      amount, 
      groupId, 
      splitType,
      splits,
      notes,
      date 
    } = req.body;
    
    // Check if group exists and user is a member
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to add expense to this group' });
    }
    
    // Create expense
    const expense = await Expense.create({
      description,
      amount,
      paidBy: req.user._id,
      group: groupId,
      splitType: splitType || 'equal',
      splits: splits || group.members.map(member => ({
        user: member.user,
        amount: 0, // This will be calculated by the pre-save hook if splitType is 'equal'
      })),
      notes,
      date: date || new Date()
    });
    
    // Add expense to group
    group.expenses.push(expense._id);
    await group.save();
    
    // Populate user details in the response
    await expense.populate('paidBy', 'name email');
    await expense.populate('splits.user', 'name email');
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all expenses for a group
exports.getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Check if group exists and user is a member
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view expenses of this group' });
    }
    
    // Get expenses
    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .sort({ date: -1 });
    
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .populate('group', 'name');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check if user is part of the group
    const group = await Group.findById(expense.group);
    
    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view this expense' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update expense settlement status
exports.updateSettlementStatus = async (req, res) => {
  try {
    const { expenseId, userId, status } = req.body;
    
    const expense = await Expense.findById(expenseId);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check if user is involved in the expense
    const split = expense.splits.find(
      split => split.user.toString() === userId
    );
    
    if (!split) {
      return res.status(400).json({ message: 'User is not part of this expense' });
    }
    
    // Update the settlement status
    split.status = status;
    await expense.save();
    
    // Populate user details in the response
    await expense.populate('paidBy', 'name email');
    await expense.populate('splits.user', 'name email');
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check if user created the expense or is an admin
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      const group = await Group.findById(expense.group);
      
      const isAdmin = group.members.some(
        member => 
          member.user.toString() === req.user._id.toString() && 
          member.isAdmin
      );
      
      if (!isAdmin) {
        return res.status(403).json({ message: 'Not authorized to delete this expense' });
      }
    }
    
    // Remove expense from group
    await Group.updateOne(
      { _id: expense.group },
      { $pull: { expenses: expense._id } }
    );
    
    // Delete expense
    await expense.remove();
    
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get expense summary for a user
exports.getUserExpenseSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all expenses where user is involved
    const expenses = await Expense.find({
      $or: [
        { paidBy: userId },
        { 'splits.user': userId }
      ]
    })
    .populate('paidBy', 'name email')
    .populate('splits.user', 'name email')
    .populate('group', 'name');
    
    // Calculate totals
    let paid = 0;
    let owed = 0;
    let owedToMe = 0;
    
    expenses.forEach(expense => {
      // If user paid for this expense
      if (expense.paidBy._id.toString() === userId.toString()) {
        paid += expense.amount;
        
        // Calculate how much others owe to the user
        expense.splits.forEach(split => {
          if (split.user._id.toString() !== userId.toString()) {
            owedToMe += split.amount;
          }
        });
      } else {
        // Find how much user owes for expenses paid by others
        const userSplit = expense.splits.find(
          split => split.user._id.toString() === userId.toString()
        );
        
        if (userSplit) {
          owed += userSplit.amount;
        }
      }
    });
    
    res.json({
      paid,
      owed,
      owedToMe,
      balance: owedToMe - owed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 