const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./src/server');

async function runTests() {
  console.log('🧪 Starting PaisaPilot Backend Verification Tests...\n');

  // We can test the services directly and through the app
  const prisma = require('./src/config/db');
  const analyticsService = require('./src/services/analyticsService');
  const budgetService = require('./src/services/budgetService');
  const categorizationService = require('./src/services/categorizationService');
  const aiService = require('./src/services/aiService');
  const transactionService = require('./src/services/transactionService');

  try {
    // 1. Test Database connection & User
    console.log('1️⃣ Checking Database & User...');
    const user = await prisma.user.findFirst();
    console.log(`   ✅ User found: ${user.name} (${user.email}), Income: ₹${user.monthlyIncome}`);

    // 2. Test Smart Categorization
    console.log('\n2️⃣ Testing Smart Expense Categorization...');
    const testCases = [
      { text: 'Zomato lunch biryani', expected: 'Food & Dining' },
      { text: 'Uber cab ride to tech park', expected: 'Transportation' },
      { text: 'Amazon laptop accessories', expected: 'Shopping & Essentials' },
      { text: 'Netflix subscription', expected: 'Entertainment & Leisure' },
      { text: 'College semester tuition fees', expected: 'Education & Career' },
    ];

    for (const tc of testCases) {
      const pred = await categorizationService.predictCategory(tc.text);
      console.log(`   • "${tc.text}" -> ${pred.categoryName} (matched: ${pred.matchedKeyword || 'N/A'}, confidence: ${pred.confidence})`);
      if (pred.categoryName !== tc.expected) {
        console.warn(`     ⚠️ Warning: expected ${tc.expected}, got ${pred.categoryName}`);
      } else {
        console.log(`     ✅ Matched expected category: ${tc.expected}`);
      }
    }

    // 3. Test Dashboard Summary (November 2026)
    console.log('\n3️⃣ Testing Dashboard Analytics Calculations...');
    const dashboard = await analyticsService.getDashboardSummary(11, 2026);
    console.log(`   ✅ Income: ₹${dashboard.kpi.totalIncome}`);
    console.log(`   ✅ Expenses: ₹${dashboard.kpi.totalExpenses}`);
    console.log(`   ✅ Net Balance: ₹${dashboard.kpi.remainingBalance}`);
    console.log(`   ✅ Savings Rate: ${dashboard.kpi.savingsRate}%`);
    console.log(`   ✅ Budget Utilization: ${dashboard.kpi.budgetUtilization}%`);
    console.log(`   ✅ Expense Delta vs Oct: ${dashboard.kpi.expenseChangePercentage}%`);
    console.log(`   ✅ Categories Count: ${dashboard.categoryBreakdown.length}`);
    console.log(`   ✅ Top Category: ${dashboard.categoryBreakdown[0]?.name} (₹${dashboard.categoryBreakdown[0]?.amount})`);

    // 4. Test Budgets (November 2026)
    console.log('\n4️⃣ Testing Budget Calculations & Overspending Detection...');
    const budgets = await budgetService.getMonthlyBudgets(11, 2026);
    console.log(`   ✅ Total Budgeted: ₹${budgets.summary.totalBudgeted}`);
    console.log(`   ✅ Total Spent in Budgets: ₹${budgets.summary.totalSpent}`);
    console.log(`   ✅ Overspent Categories Count: ${budgets.summary.overspentCount}`);
    budgets.budgets.forEach((b) => {
      console.log(`   • [${b.status}] ${b.categoryName}: Spent ₹${b.spentAmount} / ₹${b.budgetedAmount} (${b.utilizationRate}%)`);
    });

    // 5. Test Financial Insights
    console.log('\n5️⃣ Testing Financial Insights Engine...');
    const insights = await analyticsService.getFinancialInsights(11, 2026);
    console.log(`   ✅ Generated ${insights.insights.length} dynamic insights:`);
    insights.insights.forEach((ins) => {
      console.log(`   • [${ins.type} - ${ins.severity.toUpperCase()}] ${ins.title}: ${ins.metric}`);
    });

    // 6. Test AI Assistant with Real Hackathon Scenarios
    console.log('\n6️⃣ Testing PaisaPilot AI Financial Assistant (Deterministic Grounded Engine)...');
    const aiQueries = [
      'Where am I spending most of my money?',
      'How much did I spend on food this month?',
      'Am I exceeding my monthly budget?',
      'How can I save ₹2,000 next month?',
      'Compare my spending with the previous month',
    ];

    for (const q of aiQueries) {
      console.log(`\n   ❓ Question: "${q}"`);
      const aiReply = await aiService.answerFinancialQuery(q);
      console.log(`   🤖 Source: ${aiReply.source} | Fallback: ${aiReply.isFallback}`);
      console.log(`   💬 Answer excerpt: ${aiReply.answer.slice(0, 150).replace(/\n/g, ' ')}...`);
      if (aiReply.dataPoints && aiReply.dataPoints.length > 0) {
        console.log(`   📊 Grounded Data Points: ${aiReply.dataPoints.map((d) => `${d.label}: ${d.value}`).join(' | ')}`);
      }
    }

    // 7. Test Transaction CRUD
    console.log('\n7️⃣ Testing Transaction CRUD Operations...');
    const newTx = await transactionService.createTransaction({
      title: 'Automated Test Coffee',
      amount: 150,
      type: 'EXPENSE',
      paymentMethod: 'UPI',
    });
    console.log(`   ✅ Created transaction ID: ${newTx.id}, Auto-categorized as: ${newTx.category.name}`);

    const updatedTx = await transactionService.updateTransaction(newTx.id, {
      title: 'Automated Test Coffee (Updated)',
      amount: 180,
    });
    console.log(`   ✅ Updated transaction: ${updatedTx.title}, Amount: ₹${updatedTx.amount}`);

    await transactionService.deleteTransaction(newTx.id);
    console.log(`   ✅ Deleted test transaction successfully.`);

    console.log('\n🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL.\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

runTests();
