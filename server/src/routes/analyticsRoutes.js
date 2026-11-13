const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/dashboard - full dashboard KPI summary & charts data
router.get('/dashboard', analyticsController.getDashboardSummary);

// GET /api/analytics/insights - financial health insights and alerts
router.get('/insights', analyticsController.getInsights);

module.exports = router;
