const prisma = require('../config/db');
const { getDefaultUserId } = require('./transactionService');

/**
 * Get monthly budgets with actual spending calculations & utilization status
 */
async function getMonthlyBudgets(month, year, userId) {
  const activeUserId = userId || (await getDefaultUserId());
  const now = new Date();
  const currentMonth = month ? parseInt(month, 10) : now.getMonth() + 1; // 1-12
  const currentYear = year ? parseInt(year, 10) : now.getFullYear();

  // First day and last day of target month
  const startOfMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
  const endOfMonth = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));

  // 1. Fetch defined budgets for this month/year
  const budgets = await prisma.budget.findMany({
    where: {
      userId: activeUserId,
      month: currentMonth,
      year: currentYear,
    },
    include: {
      category: true,
    },
    orderBy: {
      amount: 'desc',
    },
  });

  // 2. Fetch all expenses in this month to calculate utilization
  const monthlyExpenses = await prisma.transaction.findMany({
    where: {
      userId: activeUserId,
      type: 'EXPENSE',
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  // Group expenses by category
  const expensesByCategory = {};
  let totalSpentAcrossBudgets = 0;

  monthlyExpenses.forEach((tx) => {
    expensesByCategory[tx.categoryId] = (expensesByCategory[tx.categoryId] || 0) + tx.amount;
  });

  // 3. Calculate utilization for each budget
  const analyzedBudgets = budgets.map((b) => {
    const spent = expensesByCategory[b.categoryId] || 0;
    const remaining = Math.max(0, b.amount - spent);
    const overspent = Math.max(0, spent - b.amount);
    const utilizationRate = b.amount > 0 ? (spent / b.amount) * 100 : 0;

    totalSpentAcrossBudgets += spent;

    let status = 'ON_TRACK';
    if (utilizationRate > 100) {
      status = 'OVERSPENT';
    } else if (utilizationRate >= 80) {
      status = 'WARNING';
    }

    return {
      id: b.id,
      categoryId: b.categoryId,
      categoryName: b.category.name,
      categoryColor: b.category.color,
      categoryIcon: b.category.icon,
      budgetedAmount: b.amount,
      spentAmount: Math.round(spent * 100) / 100,
      remainingAmount: Math.round(remaining * 100) / 100,
      overspentAmount: Math.round(overspent * 100) / 100,
      utilizationRate: Math.round(utilizationRate * 10) / 10,
      status,
      month: b.month,
      year: b.year,
    };
  });

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpentAcrossBudgets);
  const totalOverspent = Math.max(0, totalSpentAcrossBudgets - totalBudgeted);
  const overallUtilizationRate =
    totalBudgeted > 0 ? (totalSpentAcrossBudgets / totalBudgeted) * 100 : 0;

  return {
    month: currentMonth,
    year: currentYear,
    summary: {
      totalBudgeted: Math.round(totalBudgeted * 100) / 100,
      totalSpent: Math.round(totalSpentAcrossBudgets * 100) / 100,
      totalRemaining: Math.round(totalRemaining * 100) / 100,
      totalOverspent: Math.round(totalOverspent * 100) / 100,
      overallUtilizationRate: Math.round(overallUtilizationRate * 10) / 10,
      overspentCount: analyzedBudgets.filter((b) => b.status === 'OVERSPENT').length,
      warningCount: analyzedBudgets.filter((b) => b.status === 'WARNING').length,
    },
    budgets: analyzedBudgets,
  };
}

/**
 * Upsert or create a budget for a category and month/year
 */
async function upsertBudget(data) {
  const userId = data.userId || (await getDefaultUserId());
  const month = parseInt(data.month, 10);
  const year = parseInt(data.year, 10);
  const amount = parseFloat(data.amount);
  const categoryId = data.categoryId;

  if (!categoryId || isNaN(month) || isNaN(year) || isNaN(amount)) {
    throw new Error('Valid categoryId, month, year, and amount are required.');
  }

  const budget = await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId,
        month,
        year,
      },
    },
    update: {
      amount,
    },
    create: {
      userId,
      categoryId,
      amount,
      month,
      year,
    },
    include: {
      category: true,
    },
  });

  return budget;
}

/**
 * Delete a budget entry
 */
async function deleteBudget(id) {
  return await prisma.budget.delete({
    where: { id },
  });
}

module.exports = {
  getMonthlyBudgets,
  upsertBudget,
  deleteBudget,
};
