const transactionService = require('../services/transactionService');
const categorizationService = require('../services/categorizationService');

/**
 * Get all transactions with filters
 */
async function getAllTransactions(req, res, next) {
  try {
    const { type, categoryId, search, startDate, endDate, limit, skip } = req.query;
    const result = await transactionService.getTransactions({
      type,
      categoryId,
      search,
      startDate,
      endDate,
      limit,
      skip,
    });
    res.json({
      success: true,
      data: result.transactions,
      total: result.totalCount,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single transaction by ID
 */
async function getTransactionById(req, res, next) {
  try {
    const { id } = req.params;
    const transaction = await transactionService.getTransactionById(id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new transaction
 */
async function createTransaction(req, res, next) {
  try {
    const { title, amount, type, categoryId, date, description, paymentMethod } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    if (amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'A positive amount is required' });
    }

    const transaction = await transactionService.createTransaction({
      title,
      amount,
      type: type || 'EXPENSE',
      categoryId,
      date,
      description,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing transaction
 */
async function updateTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const { title, amount, type, categoryId, date, description, paymentMethod } = req.body;

    const existing = await transactionService.getTransactionById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const updated = await transactionService.updateTransaction(id, {
      title,
      amount,
      type,
      categoryId,
      date,
      description,
      paymentMethod,
    });

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a transaction
 */
async function deleteTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await transactionService.getTransactionById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    await transactionService.deleteTransaction(id);
    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Predict category automatically based on title / text
 */
async function predictCategory(req, res, next) {
  try {
    const { title, type } = req.query;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required for categorization' });
    }

    const prediction = await categorizationService.predictCategory(title, type || 'EXPENSE');
    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  predictCategory,
};
