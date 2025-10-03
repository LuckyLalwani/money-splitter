const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  splitType: {
    type: String,
    enum: ['equal', 'percentage', 'exact'],
    default: 'equal'
  },
  splits: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'settled'],
      default: 'pending'
    }
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate equal split before saving if splitType is 'equal'
expenseSchema.pre('save', function(next) {
  const expense = this;
  
  if (expense.splitType === 'equal' && expense.splits.length > 0) {
    const splitAmount = expense.amount / expense.splits.length;
    
    expense.splits.forEach(split => {
      split.amount = parseFloat(splitAmount.toFixed(2));
    });
  }
  
  next();
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense; 