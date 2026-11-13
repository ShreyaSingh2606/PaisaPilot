const prisma = require('../config/db');
const { getDefaultUserId } = require('./transactionService');

/**
 * Get comprehensive dashboard analytics calculated strictly from real database records
 */
async function getDashboardSummary(month, year, userId) {
  const activeUserId = userId || (await getDefaultUserId());
  const now = new Date();
  const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1; // 1-12
  const targetYear = year ? parseInt(year, 10) : now.getFullYear();

  // Date bounds for current target month
  const startOfCurrentMonth = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
  const endOfCurrentMonth = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

  // Date bounds for previous month
  const prevMonthNum = targetMonth === 1 ? 12 : targetMonth - 1;
  const prevYearNum = targetMonth === 1 ? targetYear - 1 : targetYear;
  const startOfPrevMonth = new Date(Date.UTC(prevYearNum, prevMonthNum - 1, 1));
  const endOfPrevMonth = new Date(Date.UTC(prevYearNum, prevMonthNum, 0, 23, 59, 59, 999));

  // 1. Fetch user data (for monthlyIncome baseline)
  const user = await prisma.user.findUnique({
    where: { id: activeUserId },
  });

  // 2. Fetch all transactions for target month
  const currentMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId: activeUserId,
      date: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  // 3. Fetch transactions for previous month
  const prevMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId: activeUserId,
      date: {
        gte: startOfPrevMonth,
        lte: endOfPrevMonth,
      },
    },
  });

  // 4. Calculate Income & Expenses for Current Month
  let totalIncome = 0;
  let totalExpenses = 0;
  const categorySpendingMap = {};

  for (const tx of currentMonthTransactions) {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      const catName = tx.category.name;
      if (!categorySpendingMap[catName]) {
        categorySpendingMap[catName] = {
          name: catName,
          amount: 0,
          color: tx.category.color,
          icon: tx.category.icon,
        };
      }
      categorySpendingMap[catName].amount += tx.amount;
    }
  }

  // 5. Calculate Previous Month Totals
  let prevTotalIncome = 0;
  let prevTotalExpenses = 0;
  for (const tx of prevMonthTransactions) {
    if (tx.type === 'INCOME') {
      prevTotalIncome += tx.amount;
    } else {
      prevTotalExpenses += tx.amount;
    }
  }

  // 6. Net Balance and Savings Rate
  const remainingBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Month-over-month growth calculations
  const expenseChangePercentage =
    prevTotalExpenses > 0
      ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100
      : 0;

  const incomeChangePercentage =
    prevTotalIncome > 0
      ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100
      : 0;

  // 7. Category Breakdown with percentages
  const categoryBreakdown = Object.values(categorySpendingMap)
    .map((c) => ({
      ...c,
      amount: Math.round(c.amount * 100) / 100,
      percentage: totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 8. 6-Month Monthly Spending Trend
  // Calculate trailing 6 months from target
  const trendMonths = [];
  for (let i = 5; i >= 0; i--) {
    let m = targetMonth - i;
    let y = targetYear;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    trendMonths.push({ month: m, year: y });
  }

  const monthlyTrends = [];
  for (const tm of trendMonths) {
    const s = new Date(Date.UTC(tm.year, tm.month - 1, 1));
    const e = new Date(Date.UTC(tm.year, tm.month, 0, 23, 59, 59, 999));

    const monthTxs = await prisma.transaction.findMany({
      where: {
        userId: activeUserId,
        date: { gte: s, lte: e },
      },
    });

    let mIncome = 0;
    let mExpense = 0;
    monthTxs.forEach((t) => {
      if (t.type === 'INCOME') mIncome += t.amount;
      else mExpense += t.amount;
    });

    const monthName = new Date(Date.UTC(tm.year, tm.month - 1, 1)).toLocaleString('en-IN', {
      month: 'short',
    });

    monthlyTrends.push({
      monthLabel: `${monthName} '${String(tm.year).slice(-2)}`,
      month: tm.month,
      year: tm.year,
      income: Math.round(mIncome),
      expenses: Math.round(mExpense),
      savings: Math.round(mIncome - mExpense),
    });
  }

  // 9. Fetch Budgets for target month to compute overall utilization
  const budgets = await prisma.budget.findMany({
    where: {
      userId: activeUserId,
      month: targetMonth,
      year: targetYear,
    },
    include: { category: true },
  });

  let totalBudget = 0;
  budgets.forEach((b) => {
    totalBudget += b.amount;
  });

  const budgetUtilization = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 1000) / 10 : 0;

  // 10. Recent Transactions (last 6)
  const recentTransactions = currentMonthTransactions.slice(0, 6);

  return {
    user: {
      id: user ? user.id : activeUserId,
      name: user ? user.name : 'Shreya Singh',
      currency: user ? user.currency : 'INR',
    },
    selectedMonth: targetMonth,
    selectedYear: targetYear,
    kpi: {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      totalBudget: Math.round(totalBudget * 100) / 100,
      budgetUtilization,
      expenseChangePercentage: Math.round(expenseChangePercentage * 10) / 10,
      incomeChangePercentage: Math.round(incomeChangePercentage * 10) / 10,
    },
    categoryBreakdown,
    monthlyTrends,
    recentTransactions,
  };
}

/**
 * Generate deep financial insights and rule-based advisory derived from actual database records
 */
async function getFinancialInsights(month, year, userId) {
  const summary = await getDashboardSummary(month, year, userId);
  const { kpi, categoryBreakdown, monthlyTrends } = summary;

  const insights = [];

  // Insight 1: Highest & Lowest Spending Categories
  if (categoryBreakdown.length > 0) {
    const highest = categoryBreakdown[0];
    insights.push({
      type: 'SPENDING_LEADER',
      severity: 'info',
      title: 'Top Expense Category',
      description: `Your highest expenditure this month is on ${highest.name} totaling ₹${highest.amount.toLocaleString('en-IN')}, accounting for ${highest.percentage}% of your total spending.`,
      metric: `${highest.percentage}% of total`,
      category: highest.name,
    });

    if (categoryBreakdown.length > 1) {
      const lowest = categoryBreakdown[categoryBreakdown.length - 1];
      insights.push({
        type: 'SPENDING_MINIMUM',
        severity: 'success',
        title: 'Lowest Expense Category',
        description: `You've controlled expenses well in ${lowest.name}, spending only ₹${lowest.amount.toLocaleString('en-IN')} (${lowest.percentage}%).`,
        metric: `₹${lowest.amount}`,
        category: lowest.name,
      });
    }
  }

  // Insight 2: Savings Health
  if (kpi.savingsRate >= 30) {
    insights.push({
      type: 'SAVINGS_HEALTHY',
      severity: 'success',
      title: 'Strong Savings Habit',
      description: `Awesome discipline! You are saving ${kpi.savingsRate}% of your income (₹${kpi.remainingBalance.toLocaleString('en-IN')}), comfortably exceeding the recommended 20% benchmark.`,
      metric: `${kpi.savingsRate}% saved`,
    });
  } else if (kpi.savingsRate > 0) {
    insights.push({
      type: 'SAVINGS_MODERATE',
      severity: 'warning',
      title: 'Savings Within Reach of 20% Target',
      description: `You saved ${kpi.savingsRate}% this month (₹${kpi.remainingBalance.toLocaleString('en-IN')}). Consider trimming discretionary spending (like food delivery or shopping) to hit a 20-30% savings rate.`,
      metric: `${kpi.savingsRate}% saved`,
    });
  } else {
    insights.push({
      type: 'SAVINGS_DEFICIT',
      severity: 'danger',
      title: 'Deficit Alert: Expenses Exceed Income',
      description: `Your monthly expenses (₹${kpi.totalExpenses.toLocaleString('en-IN')}) have surpassed your income (₹${kpi.totalIncome.toLocaleString('en-IN')}) by ₹${Math.abs(kpi.remainingBalance).toLocaleString('en-IN')}. Pause non-essential purchases immediately.`,
      metric: `-₹${Math.abs(kpi.remainingBalance).toLocaleString('en-IN')}`,
    });
  }

  // Insight 3: Month-over-Month Comparison
  if (kpi.expenseChangePercentage !== 0) {
    if (kpi.expenseChangePercentage > 15) {
      insights.push({
        type: 'UNUSUAL_SPIKE',
        severity: 'warning',
        title: 'Spending Spike vs Last Month',
        description: `Your total spending increased by ${Math.abs(kpi.expenseChangePercentage)}% compared to last month. Review recent one-off purchases or group outings to prevent budget strain.`,
        metric: `+${Math.abs(kpi.expenseChangePercentage)}%`,
      });
    } else if (kpi.expenseChangePercentage < -10) {
      insights.push({
        type: 'SPENDING_DROP',
        severity: 'success',
        title: 'Spending Cut vs Last Month',
        description: `Great job! Your spending decreased by ${Math.abs(kpi.expenseChangePercentage)}% compared to the previous month.`,
        metric: `-${Math.abs(kpi.expenseChangePercentage)}%`,
      });
    }
  }

  // Insight 4: Actionable 2,000 INR Savings Plan
  const discretionaryCats = categoryBreakdown.filter((c) =>
    ['Food & Dining', 'Shopping & Essentials', 'Entertainment & Leisure'].includes(c.name)
  );

  let recommendationText = 'To boost your savings by ₹2,000 next month: ';
  if (discretionaryCats.length > 0) {
    const suggestions = discretionaryCats.map((c) => {
      const cutTarget = Math.min(Math.round(c.amount * 0.15), 1000);
      return `trim ₹${cutTarget} from ${c.name}`;
    });
    recommendationText += suggestions.join(' and ') + '. Also check for unused OTT subscriptions.';
  } else {
    recommendationText += 'reduce non-essential dining out and switch to campus mess or home cooking 2-3 times a week.';
  }

  insights.push({
    type: 'SAVINGS_ACTION_PLAN',
    severity: 'info',
    title: '₹2,000 Monthly Savings Playbook',
    description: recommendationText,
    metric: '₹2,000 potential savings',
  });

  return {
    summary,
    insights,
  };
}

module.exports = {
  getDashboardSummary,
  getFinancialInsights,
};
