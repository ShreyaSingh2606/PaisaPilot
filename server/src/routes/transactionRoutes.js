const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// GET /api/transactions - fetch with filters
router.get('/', transactionController.getAllTransactions);

// GET /api/transactions/predict-category - smart categorization prediction
router.get('/predict-category', transactionController.predictCategory);

// GET /api/transactions/:id - get single
router.get('/:id', transactionController.getTransactionById);

// POST /api/transactions - create new
router.post('/', transactionController.createTransaction);

// PUT /api/transactions/:id - update existing
router.put('/:id', transactionController.updateTransaction);

// DELETE /api/transactions/:id - delete
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
