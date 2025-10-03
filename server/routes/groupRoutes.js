const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

// All group routes are protected
router.use(protect);

router.post('/', groupController.createGroup);
router.get('/', groupController.getUserGroups);
router.get('/:id', groupController.getGroupById);
router.post('/:id/members', groupController.addGroupMembers);
router.delete('/:id/members', groupController.removeGroupMember);

module.exports = router; 