const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

// GET /api/budgets - get monthly budgets with utilization
router.get('/', budgetController.getMonthlyBudgets);

// POST /api/budgets - set or update budget limit
router.post('/', budgetController.setBudget);

// DELETE /api/budgets/:id - delete budget limit
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
