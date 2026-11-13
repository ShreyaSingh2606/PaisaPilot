const prisma = require('../config/db');
const { predictCategory } = require('./categorizationService');

/**
 * Helper to ensure a default user exists and returns its ID
 */
async function getDefaultUserId() {
  const user = await prisma.user.findFirst();
  if (user) return user.id;

  const newUser = await prisma.user.create({
    data: {
      name: 'Shreya Singh',
      email: 'shreya@paisapilot.local',
      currency: 'INR',
      monthlyIncome: 35000,
    },
  });
  return newUser.id;
}

/**
 * Fetch transactions with multi-criteria filters
 */
async function getTransactions(filters = {}) {
  const userId = filters.userId || (await getDefaultUserId());
  const where = { userId };

  if (filters.type && (filters.type === 'EXPENSE' || filters.type === 'INCOME')) {
    where.type = filters.type;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      // include up to end of the day
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: filters.limit ? parseInt(filters.limit, 10) : undefined,
    skip: filters.skip ? parseInt(filters.skip, 10) : undefined,
  });

  const totalCount = await prisma.transaction.count({ where });

  return { transactions, totalCount };
}

/**
 * Get single transaction by ID
 */
async function getTransactionById(id) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { category: true },
  });
  return transaction;
}

/**
 * Create a new transaction
 */
async function createTransaction(data) {
  const userId = data.userId || (await getDefaultUserId());
  let categoryId = data.categoryId;

  // Auto-categorize if no category was explicitly provided
  if (!categoryId && data.title) {
    const prediction = await predictCategory(data.title, data.type || 'EXPENSE');
    if (prediction && prediction.categoryId) {
      categoryId = prediction.categoryId;
    }
  }

  // If still missing category, select default
  if (!categoryId) {
    const defaultCat = await prisma.category.findFirst({
      where: { type: data.type || 'EXPENSE' },
    });
    if (!defaultCat) {
      throw new Error('No categories available in the database.');
    }
    categoryId = defaultCat.id;
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      categoryId,
      amount: parseFloat(data.amount),
      type: data.type || 'EXPENSE',
      title: data.title.trim(),
      description: data.description ? data.description.trim() : null,
      date: data.date ? new Date(data.date) : new Date(),
      paymentMethod: data.paymentMethod || 'UPI',
    },
    include: {
      category: true,
    },
  });

  return transaction;
}

/**
 * Update transaction by ID
 */
async function updateTransaction(id, data) {
  const updatePayload = {};

  if (data.amount !== undefined) updatePayload.amount = parseFloat(data.amount);
  if (data.type !== undefined) updatePayload.type = data.type;
  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.description !== undefined) updatePayload.description = data.description ? data.description.trim() : null;
  if (data.date !== undefined) updatePayload.date = new Date(data.date);
  if (data.paymentMethod !== undefined) updatePayload.paymentMethod = data.paymentMethod;
  if (data.categoryId !== undefined) updatePayload.categoryId = data.categoryId;

  const transaction = await prisma.transaction.update({
    where: { id },
    data: updatePayload,
    include: { category: true },
  });

  return transaction;
}

/**
 * Delete transaction by ID
 */
async function deleteTransaction(id) {
  return await prisma.transaction.delete({
    where: { id },
  });
}

module.exports = {
  getDefaultUserId,
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
