const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

// All expense routes are protected
router.use(protect);

router.post('/', expenseController.createExpense);
router.get('/group/:groupId', expenseController.getGroupExpenses);
router.get('/summary', expenseController.getUserExpenseSummary);
router.get('/:id', expenseController.getExpenseById);
router.patch('/settle', expenseController.updateSettlementStatus);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router; 