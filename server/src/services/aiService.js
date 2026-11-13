const prisma = require('../config/db');
const { getDashboardSummary } = require('./analyticsService');
const { getMonthlyBudgets } = require('./budgetService');

/**
 * Builds a strict ground-truth financial context object from the user's actual database records
 */
async function buildFinancialContext(userId) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const summary = await getDashboardSummary(currentMonth, currentYear, userId);
  const budgetData = await getMonthlyBudgets(currentMonth, currentYear, userId);

  const topCategory = summary.categoryBreakdown[0] || null;
  const lowestCategory =
    summary.categoryBreakdown.length > 1
      ? summary.categoryBreakdown[summary.categoryBreakdown.length - 1]
      : null;

  const overspentBudgets = budgetData.budgets.filter((b) => b.status === 'OVERSPENT');
  const warningBudgets = budgetData.budgets.filter((b) => b.status === 'WARNING');

  return {
    month: currentMonth,
    year: currentYear,
    monthName: now.toLocaleString('en-IN', { month: 'long' }),
    kpi: summary.kpi,
    categoryBreakdown: summary.categoryBreakdown,
    budgets: budgetData.budgets,
    budgetSummary: budgetData.summary,
    overspentBudgets,
    warningBudgets,
    topCategory,
    lowestCategory,
    recentTransactions: summary.recentTransactions.map((tx) => ({
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      category: tx.category.name,
      date: tx.date.toISOString().split('T')[0],
      method: tx.paymentMethod,
    })),
  };
}

/**
 * Deterministic rule-based financial reasoning engine.
 * Computes exact answers based on database records without requiring an external LLM API.
 */
function generateDeterministicResponse(userQuery, ctx) {
  const query = userQuery.toLowerCase().trim();
  const k = ctx.kpi;

  // 1. "Where am I spending most of my money?" / "Highest expense category"
  if (
    query.includes('most') ||
    query.includes('highest') ||
    query.includes('where am i spending') ||
    query.includes('top expense')
  ) {
    if (!ctx.topCategory) {
      return {
        answer: `You haven't recorded any expenses yet for ${ctx.monthName} ${ctx.year}. Once you add transactions, I'll identify your highest spending areas!`,
        dataPoints: [],
        suggestions: ['Add your recent expenses to unlock spending analysis.'],
      };
    }

    return {
      answer: `Based on your database records for ${ctx.monthName} ${ctx.year}, you are spending most of your money on **${ctx.topCategory.name}**.\n\nYou have spent **₹${ctx.topCategory.amount.toLocaleString('en-IN')}**, which makes up **${ctx.topCategory.percentage}%** of your total monthly expenses (₹${k.totalExpenses.toLocaleString('en-IN')}).`,
      dataPoints: [
        { label: 'Top Category', value: ctx.topCategory.name },
        { label: 'Amount Spent', value: `₹${ctx.topCategory.amount.toLocaleString('en-IN')}` },
        { label: 'Share of Spending', value: `${ctx.topCategory.percentage}%` },
      ],
      suggestions: [
        `Review the transactions under ${ctx.topCategory.name} to see if any are discretionary.`,
        `Set a target budget for ${ctx.topCategory.name} in the Budget Planner.`,
      ],
    };
  }

  // 2. Specific Category Spending (e.g., Food, Transport, Shopping, etc.)
  for (const cat of ctx.categoryBreakdown) {
    const catLower = cat.name.toLowerCase();
    const shortNames = catLower.split('&').map((s) => s.trim());
    const matchesCategory =
      query.includes(catLower) || shortNames.some((sn) => query.includes(sn));

    if (matchesCategory) {
      const budgetForCat = ctx.budgets.find(
        (b) => b.categoryName.toLowerCase() === cat.name.toLowerCase()
      );

      let budgetNote = '';
      if (budgetForCat) {
        budgetNote = `\n\nYour allocated budget for this category is **₹${budgetForCat.budgetedAmount.toLocaleString('en-IN')}** (Utilization: **${budgetForCat.utilizationRate}%**). ${
          budgetForCat.status === 'OVERSPENT'
            ? `⚠️ You have exceeded this budget by **₹${budgetForCat.overspentAmount.toLocaleString('en-IN')}**!`
            : `You have **₹${budgetForCat.remainingAmount.toLocaleString('en-IN')}** remaining.`
        }`;
      }

      return {
        answer: `This month (${ctx.monthName} ${ctx.year}), you have spent **₹${cat.amount.toLocaleString('en-IN')}** on **${cat.name}**, accounting for **${cat.percentage}%** of your total expenses.${budgetNote}`,
        dataPoints: [
          { label: cat.name, value: `₹${cat.amount.toLocaleString('en-IN')}` },
          { label: 'Share of Total', value: `${cat.percentage}%` },
        ],
        suggestions: [
          `Track small daily spends in ${cat.name} using UPI records.`,
          budgetForCat ? `Check the Budget tab to adjust your limit if necessary.` : `Create a monthly budget for ${cat.name}.`,
        ],
      };
    }
  }

  // 3. "Am I exceeding my monthly budget?" / "Budget status"
  if (
    query.includes('budget') ||
    query.includes('exceed') ||
    query.includes('limit') ||
    query.includes('overspend')
  ) {
    if (ctx.budgets.length === 0) {
      return {
        answer: `You don't have any budgets configured for ${ctx.monthName} ${ctx.year} yet. Head over to the Budget Planner tab to set monthly spending ceilings for each category!`,
        dataPoints: [],
        suggestions: ['Create your first budget in the Budget Planner.'],
      };
    }

    if (ctx.overspentBudgets.length > 0) {
      const overspentList = ctx.overspentBudgets
        .map(
          (b) =>
            `- **${b.categoryName}**: Spent ₹${b.spentAmount.toLocaleString('en-IN')} vs budget of ₹${b.budgetedAmount.toLocaleString('en-IN')} (Overspent by **₹${b.overspentAmount.toLocaleString('en-IN')}**)`
        )
        .join('\n');

      return {
        answer: `⚠️ **Yes, you have exceeded your budget in ${ctx.overspentBudgets.length} category:**\n\n${overspentList}\n\nOverall, you have spent **₹${ctx.budgetSummary.totalSpent.toLocaleString('en-IN')}** of your **₹${ctx.budgetSummary.totalBudgeted.toLocaleString('en-IN')}** total budgeted limit (**${ctx.budgetSummary.overallUtilizationRate}%** utilization).`,
        dataPoints: [
          { label: 'Overspent Categories', value: `${ctx.overspentBudgets.length}` },
          { label: 'Total Budgeted', value: `₹${ctx.budgetSummary.totalBudgeted.toLocaleString('en-IN')}` },
          { label: 'Overall Utilization', value: `${ctx.budgetSummary.overallUtilizationRate}%` },
        ],
        suggestions: [
          'Pause discretionary spending in overspent categories for the remainder of the month.',
          'Reallocate surplus budget from under-utilized categories.',
        ],
      };
    }

    return {
      answer: `✅ **Great news! You are currently within all your category budgets for ${ctx.monthName} ${ctx.year}.**\n\nYou have spent **₹${ctx.budgetSummary.totalSpent.toLocaleString('en-IN')}** out of your **₹${ctx.budgetSummary.totalBudgeted.toLocaleString('en-IN')}** total budgeted allowance (**${ctx.budgetSummary.overallUtilizationRate}%** overall utilization).\n\nYou have **₹${ctx.budgetSummary.totalRemaining.toLocaleString('en-IN')}** left across your budgeted categories.`,
      dataPoints: [
        { label: 'Total Budget', value: `₹${ctx.budgetSummary.totalBudgeted.toLocaleString('en-IN')}` },
        { label: 'Total Spent', value: `₹${ctx.budgetSummary.totalSpent.toLocaleString('en-IN')}` },
        { label: 'Remaining', value: `₹${ctx.budgetSummary.totalRemaining.toLocaleString('en-IN')}` },
      ],
      suggestions: [
        'Keep maintaining this momentum to maximize your savings at month-end.',
      ],
    };
  }

  // 4. "How can I save ₹2,000 next month?" / "How to save money"
  if (
    query.includes('save') ||
    query.includes('saving') ||
    query.includes('2000') ||
    query.includes('2,000') ||
    query.includes('cut cost')
  ) {
    const discretionary = ctx.categoryBreakdown.filter((c) =>
      ['Food & Dining', 'Shopping & Essentials', 'Entertainment & Leisure', 'Transportation'].includes(c.name)
    );

    let planItems = [];
    if (discretionary.length > 0) {
      planItems = discretionary.map((c) => {
        const targetCut = Math.min(Math.round(c.amount * 0.2), 700);
        return `- **${c.name}**: Current spend is ₹${c.amount.toLocaleString('en-IN')}. Reducing 20% saves **₹${targetCut.toLocaleString('en-IN')}** (e.g., cook with friends instead of delivery or limit rides).`;
      });
    } else {
      planItems = [
        '- Reduce takeaway orders by 2 meals a week: Saves ~₹800/month.',
        '- Review recurring subscriptions and cancel unused ones: Saves ~₹400/month.',
        '- Use public transport/metro instead of on-demand cabs: Saves ~₹800/month.',
      ];
    }

    return {
      answer: `Here is a practical, grounded roadmap to **save an extra ₹2,000 next month** based on your spending profile:\n\n${planItems.slice(0, 3).join('\n')}\n\nYour current savings rate is **${k.savingsRate}%** (₹${k.remainingBalance.toLocaleString('en-IN')}). Achieving an extra ₹2,000 in savings will boost your savings to **₹${(k.remainingBalance + 2000).toLocaleString('en-IN')}**!`,
      dataPoints: [
        { label: 'Target Savings', value: '₹2,000' },
        { label: 'Current Savings', value: `₹${k.remainingBalance.toLocaleString('en-IN')}` },
        { label: 'Current Rate', value: `${k.savingsRate}%` },
      ],
      suggestions: [
        'Set up a recurring ₹2,000 auto-deposit / SIP right on the 1st of next month.',
        'Apply the 24-hour rule before making any non-essential online purchases.',
      ],
    };
  }

  // 5. "Which category should I reduce spending in?"
  if (
    query.includes('reduce') ||
    query.includes('cut down') ||
    query.includes('decrease') ||
    query.includes('trim')
  ) {
    const candidate = ctx.overspentBudgets[0]
      ? { name: ctx.overspentBudgets[0].categoryName, reason: 'you have already exceeded its allocated budget' }
      : ctx.topCategory
      ? { name: ctx.topCategory.name, reason: `it represents your largest expense category (${ctx.topCategory.percentage}% of all expenses)` }
      : null;

    if (!candidate) {
      return {
        answer: 'You have very few expenses logged this month! Start by adding your day-to-day purchases to identify reduction opportunities.',
        dataPoints: [],
        suggestions: [],
      };
    }

    return {
      answer: `You should prioritize reducing spending in **${candidate.name}** because ${candidate.reason}.\n\nBy dialing back non-essential transactions in this category by just 15%, you could retain significant capital for your emergency fund or investments.`,
      dataPoints: [
        { label: 'Recommended Category', value: candidate.name },
      ],
      suggestions: [
        `Audit your last 5 transactions in ${candidate.name}.`,
        'Set a strict weekly allowance for this category.',
      ],
    };
  }

  // 6. "Compare my spending with the previous month"
  if (
    query.includes('compare') ||
    query.includes('previous month') ||
    query.includes('last month') ||
    query.includes('trend')
  ) {
    const change = k.expenseChangePercentage;
    const direction = change > 0 ? 'increased' : change < 0 ? 'decreased' : 'stayed level';

    return {
      answer: `📊 **Month-over-Month Comparison:**\n\n- **Current Month Expenses:** ₹${k.totalExpenses.toLocaleString('en-IN')}\n- **Current Month Income:** ₹${k.totalIncome.toLocaleString('en-IN')}\n- **Expense Trend:** Spending has **${direction} by ${Math.abs(change)}%** compared to last month.\n- **Current Savings Rate:** ${k.savingsRate}% (Net: ₹${k.remainingBalance.toLocaleString('en-IN')}).`,
      dataPoints: [
        { label: 'Current Expenses', value: `₹${k.totalExpenses.toLocaleString('en-IN')}` },
        { label: 'Expense Delta', value: `${change > 0 ? '+' : ''}${change}%` },
        { label: 'Current Savings Rate', value: `${k.savingsRate}%` },
      ],
      suggestions: [
        change > 0
          ? 'Check whether this month included one-time semester fees or festive purchases.'
          : 'Consistent lower spending allows you to boost your emergency savings.',
      ],
    };
  }

  // 7. General Financial Health Overview / Fallback
  return {
    answer: `Here is a summary of your financial health for **${ctx.monthName} ${ctx.year}** based on your PaisaPilot records:\n\n- **Total Income:** ₹${k.totalIncome.toLocaleString('en-IN')}\n- **Total Expenses:** ₹${k.totalExpenses.toLocaleString('en-IN')}\n- **Remaining Balance:** ₹${k.remainingBalance.toLocaleString('en-IN')}\n- **Savings Rate:** ${k.savingsRate}%\n- **Top Expense:** ${ctx.topCategory ? `${ctx.topCategory.name} (₹${ctx.topCategory.amount.toLocaleString('en-IN')})` : 'N/A'}\n\nAsk me specific questions like:\n- *"Where am I spending most of my money?"*\n- *"How much did I spend on food this month?"*\n- *"Am I exceeding my monthly budget?"*\n- *"How can I save ₹2,000 next month?"*`,
    dataPoints: [
      { label: 'Income', value: `₹${k.totalIncome.toLocaleString('en-IN')}` },
      { label: 'Expenses', value: `₹${k.totalExpenses.toLocaleString('en-IN')}` },
      { label: 'Net Balance', value: `₹${k.remainingBalance.toLocaleString('en-IN')}` },
      { label: 'Savings Rate', value: `${k.savingsRate}%` },
    ],
    suggestions: [
      'Ask about a specific category (e.g., "Food", "Transport", "Shopping").',
      'Check budget utilization or month-over-month comparisons.',
    ],
  };
}

/**
 * Handle AI query by grounding prompt with actual database records.
 * Gracefully calls Gemini LLM if key is configured, otherwise uses deterministic engine.
 */
async function answerFinancialQuery(userQuery, userId) {
  if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
    throw new Error('A valid question is required.');
  }

  const context = await buildFinancialContext(userId);

  // Check if Gemini API Key is configured
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey && geminiApiKey.trim() !== '') {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `You are PaisaPilot, an empathetic, smart, educational AI financial assistant designed for Indian college students and young professionals.
You must STRICTLY adhere to the Ground Truth Financial Context provided below.
DO NOT hallucinate, invent, or assume any transactions or figures not provided in this context.
Provide friendly, clear, actionable, educational advice formatted in clean Markdown.
Always include an educational disclaimer that this is educational analysis of their PaisaPilot records and not certified financial advice.

GROUND TRUTH FINANCIAL CONTEXT FOR ${context.monthName.toUpperCase()} ${context.year}:
- Total Monthly Income: INR ${context.kpi.totalIncome}
- Total Monthly Expenses: INR ${context.kpi.totalExpenses}
- Net Remaining Balance: INR ${context.kpi.remainingBalance}
- Savings Rate: ${context.kpi.savingsRate}%
- Total Budgeted: INR ${context.budgetSummary.totalBudgeted}
- Total Spent in Budgeted Categories: INR ${context.budgetSummary.totalSpent}
- Overall Budget Utilization: ${context.budgetSummary.overallUtilizationRate}%
- Overspent Budgets: ${JSON.stringify(context.overspentBudgets)}
- Category Spending Breakdown: ${JSON.stringify(context.categoryBreakdown)}
- Recent Transactions: ${JSON.stringify(context.recentTransactions.slice(0, 8))}
`;

      const prompt = `${systemPrompt}\n\nUSER QUESTION: "${userQuery.trim()}"\n\nPlease answer accurately using only the data above:`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      return {
        query: userQuery,
        answer: responseText,
        isFallback: false,
        source: 'google-gemini-ai',
        contextMonth: `${context.monthName} ${context.year}`,
        dataPoints: [
          { label: 'Income', value: `₹${context.kpi.totalIncome.toLocaleString('en-IN')}` },
          { label: 'Expenses', value: `₹${context.kpi.totalExpenses.toLocaleString('en-IN')}` },
          { label: 'Balance', value: `₹${context.kpi.remainingBalance.toLocaleString('en-IN')}` },
        ],
        disclaimer: 'Educational insights generated with Google Gemini grounded in your PaisaPilot records. Not certified financial advice.',
      };
    } catch (llmError) {
      console.warn('⚠️ Gemini API call failed or timed out. Falling back seamlessly to deterministic engine:', llmError.message);
      // Fall through to deterministic engine
    }
  }

  // Deterministic Rule-Based Fallback Engine
  const deterministicResult = generateDeterministicResponse(userQuery, context);

  return {
    query: userQuery,
    answer: deterministicResult.answer,
    isFallback: true,
    source: 'paisa-deterministic-engine',
    contextMonth: `${context.monthName} ${context.year}`,
    dataPoints: deterministicResult.dataPoints,
    suggestions: deterministicResult.suggestions,
    disclaimer: 'Calculated directly from your database records by PaisaPilot Analytics Engine. Not certified financial advice.',
  };
}

module.exports = {
  buildFinancialContext,
  answerFinancialQuery,
  generateDeterministicResponse,
};
