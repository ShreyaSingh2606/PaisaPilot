const analyticsService = require('../services/analyticsService');

/**
 * Get financial dashboard summary
 */
async function getDashboardSummary(req, res, next) {
  try {
    const { month, year } = req.query;
    const summary = await analyticsService.getDashboardSummary(month, year);
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get actionable financial insights & spending flags
 */
async function getInsights(req, res, next) {
  try {
    const { month, year } = req.query;
    const insights = await analyticsService.getFinancialInsights(month, year);
    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary,
  getInsights,
};
