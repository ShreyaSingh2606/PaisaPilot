const budgetService = require('../services/budgetService');

/**
 * Get monthly budgets with utilization calculations
 */
async function getMonthlyBudgets(req, res, next) {
  try {
    const { month, year } = req.query;
    const result = await budgetService.getMonthlyBudgets(month, year);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update a category budget
 */
async function setBudget(req, res, next) {
  try {
    const { categoryId, amount, month, year } = req.body;

    if (!categoryId) {
      return res.status(400).json({ success: false, error: 'Category is required' });
    }
    if (amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
      return res.status(400).json({ success: false, error: 'A valid budget amount is required' });
    }

    const budget = await budgetService.upsertBudget({
      categoryId,
      amount: parseFloat(amount),
      month: month || new Date().getMonth() + 1,
      year: year || new Date().getFullYear(),
    });

    res.json({
      success: true,
      message: 'Budget saved successfully',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a budget limit
 */
async function deleteBudget(req, res, next) {
  try {
    const { id } = req.params;
    await budgetService.deleteBudget(id);
    res.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMonthlyBudgets,
  setBudget,
  deleteBudget,
};
