const Group = require('../models/groupModel');
const User = require('../models/userModel');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    // Create new group with creator as the logged in user
    const group = await Group.create({
      name,
      description,
      creator: req.user._id,
      members: members ? members.map(id => ({ user: id })) : []
    });
    
    await group.populate('members.user', 'name email');
    
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all groups for a user
exports.getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id
    })
    .populate('creator', 'name email')
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });
    
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('members.user', 'name email')
      .populate({
        path: 'expenses',
        populate: {
          path: 'paidBy',
          select: 'name email'
        }
      });
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member of the group
    const isMember = group.members.some(
      member => member.user._id.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to access this group' });
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add members to a group
exports.addGroupMembers = async (req, res) => {
  try {
    const { memberIds } = req.body;
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is admin
    const isAdmin = group.members.some(
      member => 
        member.user.toString() === req.user._id.toString() && 
        member.isAdmin
    );
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to add members' });
    }
    
    // Add new members if they don't already exist
    const existingMemberIds = group.members.map(m => m.user.toString());
    
    for (const id of memberIds) {
      if (!existingMemberIds.includes(id)) {
        group.members.push({ user: id });
      }
    }
    
    await group.save();
    await group.populate('members.user', 'name email');
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a member from a group
exports.removeGroupMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is admin
    const isAdmin = group.members.some(
      member => 
        member.user.toString() === req.user._id.toString() && 
        member.isAdmin
    );
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to remove members' });
    }
    
    // Cannot remove creator
    if (group.creator.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove the group creator' });
    }
    
    // Remove member
    group.members = group.members.filter(
      member => member.user.toString() !== memberId
    );
    
    await group.save();
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 