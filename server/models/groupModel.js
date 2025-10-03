const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  }],
  expenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  }]
}, {
  timestamps: true
});

// Ensure creator is added as a member and admin upon creation
groupSchema.pre('save', function(next) {
  const group = this;
  
  if (group.isNew) {
    // Check if creator is already in members array
    const creatorExists = group.members.some(member => 
      member.user.toString() === group.creator.toString()
    );
    
    if (!creatorExists) {
      group.members.unshift({
        user: group.creator,
        isAdmin: true
      });
    }
  }
  
  next();
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group; 