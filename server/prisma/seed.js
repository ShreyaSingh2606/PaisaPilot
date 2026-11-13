const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PaisaPilot database seed...');

  // 1. Clean existing records (in reverse relation order)
  await prisma.transaction.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create primary user
  const user = await prisma.user.create({
    data: {
      name: 'Shreya Singh',
      email: 'shreya@paisapilot.local',
      currency: 'INR',
      monthlyIncome: 35000,
    },
  });
  console.log(`👤 Created user: ${user.name} (${user.email})`);

  // 3. Define Standard FinTech Categories
  const categoriesData = [
    // Expense Categories
    {
      name: 'Food & Dining',
      type: 'EXPENSE',
      icon: 'Utensils',
      color: '#10B981',
      keywords: 'zomato,swiggy,canteen,starbucks,chai,dhaba,mcdonalds,kfc,burger,dominos,cafe,lunch,dinner,breakfast,snack,biryani,pizza',
    },
    {
      name: 'Transportation',
      type: 'EXPENSE',
      icon: 'Car',
      color: '#3B82F6',
      keywords: 'uber,ola,rapido,metro,auto,petrol,fuel,bus,train,irctc,cab,ride,parking',
    },
    {
      name: 'Shopping & Essentials',
      type: 'EXPENSE',
      icon: 'ShoppingBag',
      color: '#EC4899',
      keywords: 'amazon,flipkart,myntra,blinkit,zepto,instamart,zara,h&m,clothes,shoes,groceries,supermarket',
    },
    {
      name: 'Entertainment & Leisure',
      type: 'EXPENSE',
      icon: 'Film',
      color: '#8B5CF6',
      keywords: 'netflix,spotify,cinema,pvr,inox,movie,prime,hotstar,gaming,steam,concert,outing',
    },
    {
      name: 'Education & Career',
      type: 'EXPENSE',
      icon: 'GraduationCap',
      color: '#F59E0B',
      keywords: 'udemy,coursera,college,fees,books,stationery,hostel,tuition,certifications,exam,library,course',
    },
    {
      name: 'Housing & Utilities',
      type: 'EXPENSE',
      icon: 'Home',
      color: '#06B6D4',
      keywords: 'rent,electricity,wifi,broadband,water,gas,maintenance,recharge,jio,airtel,phone bill',
    },
    {
      name: 'Healthcare & Fitness',
      type: 'EXPENSE',
      icon: 'HeartPulse',
      color: '#EF4444',
      keywords: 'pharmacy,medicine,apollo,gym,cult,doctor,hospital,supplements,1mg,clinic',
    },
    {
      name: 'Investments & Savings',
      type: 'EXPENSE',
      icon: 'TrendingUp',
      color: '#14B8A6',
      keywords: 'groww,zerodha,sip,mutual fund,fixed deposit,fd,stocks,gold,etf',
    },
    {
      name: 'Miscellaneous',
      type: 'EXPENSE',
      icon: 'Tag',
      color: '#6B7280',
      keywords: 'gift,donation,laundry,cash,other,service',
    },

    // Income Categories
    {
      name: 'Internship Stipend',
      type: 'INCOME',
      icon: 'Briefcase',
      color: '#10B981',
      keywords: 'stipend,salary,company,internship,payroll',
    },
    {
      name: 'Freelancing & Projects',
      type: 'INCOME',
      icon: 'Laptop',
      color: '#3B82F6',
      keywords: 'freelance,client,upwork,fiverr,project,gig,consulting',
    },
    {
      name: 'Allowance & Family',
      type: 'INCOME',
      icon: 'Wallet',
      color: '#F59E0B',
      keywords: 'pocket money,parents,allowance,gift,family',
    },
    {
      name: 'Cashback & Rewards',
      type: 'INCOME',
      icon: 'PiggyBank',
      color: '#8B5CF6',
      keywords: 'cashback,reward,dividend,interest,cred,gpay scratch',
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.name] = created.id;
  }
  console.log(`📂 Created ${Object.keys(categoryMap).length} categories`);

  // Current date reference: November 2026
  const currentYear = 2026;
  const currentMonth = 11; // November
  const prevMonth = 10;    // October

  // 4. Create Category Budgets for November 2026
  const budgetData = [
    { categoryName: 'Food & Dining', amount: 6000 },
    { categoryName: 'Transportation', amount: 2500 },
    { categoryName: 'Shopping & Essentials', amount: 4000 },
    { categoryName: 'Entertainment & Leisure', amount: 2000 },
    { categoryName: 'Education & Career', amount: 3000 },
    { categoryName: 'Housing & Utilities', amount: 8000 },
  ];

  for (const b of budgetData) {
    await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: categoryMap[b.categoryName],
        amount: b.amount,
        month: currentMonth,
        year: currentYear,
      },
    });
  }
  console.log(`🎯 Created ${budgetData.length} category budgets for ${currentMonth}/${currentYear}`);

  // 5. Seed Realistic Transactions
  // October 2026 (Previous month for comparison analytics)
  const octoberTransactions = [
    { title: 'Tech Internship Stipend', amount: 25000, type: 'INCOME', cat: 'Internship Stipend', date: '2026-10-01', method: 'Net Banking' },
    { title: 'Website UI Gig for College Senior', amount: 7500, type: 'INCOME', cat: 'Freelancing & Projects', date: '2026-10-15', method: 'UPI' },
    { title: 'Hostel Rent & Maintenance', amount: 7500, type: 'EXPENSE', cat: 'Housing & Utilities', date: '2026-10-02', method: 'UPI' },
    { title: 'Campus Mess & Zomato Food', amount: 4850, type: 'EXPENSE', cat: 'Food & Dining', date: '2026-10-08', method: 'UPI' },
    { title: 'Metro Smart Card Recharge', amount: 1500, type: 'EXPENSE', cat: 'Transportation', date: '2026-10-04', method: 'UPI' },
    { title: 'Deep Learning Book & Printouts', amount: 1450, type: 'EXPENSE', cat: 'Education & Career', date: '2026-10-12', method: 'UPI' },
    { title: 'Myntra Diwali Sale Clothes', amount: 3200, type: 'EXPENSE', cat: 'Shopping & Essentials', date: '2026-10-18', method: 'Debit Card' },
    { title: 'Netflix & Spotify Student Subscriptions', amount: 398, type: 'EXPENSE', cat: 'Entertainment & Leisure', date: '2026-10-20', method: 'UPI' },
    { title: 'Groww Nifty 50 Index SIP', amount: 2500, type: 'EXPENSE', cat: 'Investments & Savings', date: '2026-10-05', method: 'Net Banking' },
  ];

  // November 2026 (Current month - realistic college student expenses up to Nov 12)
  const novemberTransactions = [
    // Income
    { title: 'Tech Internship Stipend', amount: 30000, type: 'INCOME', cat: 'Internship Stipend', date: '2026-11-01', method: 'Net Banking', desc: 'Monthly software engineering stipend' },
    { title: 'Freelance Portfolio Website Client', amount: 5000, type: 'INCOME', cat: 'Freelancing & Projects', date: '2026-11-06', method: 'UPI', desc: 'Front-end development milestone 1' },
    { title: 'Diwali Shagun from Grandparents', amount: 2000, type: 'INCOME', cat: 'Allowance & Family', date: '2026-11-02', method: 'Cash', desc: 'Gift for festive celebration' },

    // Housing & Utilities
    { title: 'Hostel Accommodation Fee', amount: 7500, type: 'EXPENSE', cat: 'Housing & Utilities', date: '2026-11-02', method: 'UPI', desc: 'Monthly hostel rent including electricity' },
    { title: 'Airtel Fiber Broadband Bill', amount: 589, type: 'EXPENSE', cat: 'Housing & Utilities', date: '2026-11-04', method: 'UPI', desc: 'High-speed internet for hackathons' },

    // Food & Dining (High frequency, realistic Indian student scenario)
    { title: 'Zomato Pizza Party after Mid-terms', amount: 1250, type: 'EXPENSE', cat: 'Food & Dining', date: '2026-11-03', method: 'UPI', desc: 'Ordered Dominos with hostel friends' },
    { title: 'College Canteen Lunch & Chai', amount: 380, type: 'EXPENSE', cat: 'Food & Dining', date: '2026-11-04', method: 'UPI', desc: 'Lunch + snacks with team' },
    { title: 'Swiggy Biryani Delivery', amount: 640, type: 'EXPENSE', cat: 'Food & Dining', date: '2026-11-06', method: 'UPI', desc: 'Late night coding session' },
    { title: 'Starbucks Cold Coffee & Sandwich', amount: 490, type: 'EXPENSE', cat: 'Food & Dining', date: '2026-11-08', method: 'Debit Card', desc: 'Study session during weekend' },
    { title: 'Hostel Mess Monthly Supplement', amount: 1800, type: 'EXPENSE', cat: 'Food & Dining', date: '2026-11-09', method: 'UPI', desc: 'Monthly evening snack coupon' },
    { title: 'Dhaba Dinner with Study Group', amount: 720, type: 'EXPENSE', cat: 'Food & Dining', date: '2026-11-11', method: 'Cash', desc: 'Paneer butter masala and rotis' },

    // Transportation
    { title: 'Delhi Metro Smart Card Recharge', amount: 1000, type: 'EXPENSE', cat: 'Transportation', date: '2026-11-03', method: 'UPI', desc: 'Monthly commute pass' },
    { title: 'Uber Cab to Hackathon Venue', amount: 480, type: 'EXPENSE', cat: 'Transportation', date: '2026-11-07', method: 'UPI', desc: 'Shared cab with teammates' },
    { title: 'Rapido Bike Taxi Rides', amount: 320, type: 'EXPENSE', cat: 'Transportation', date: '2026-11-10', method: 'UPI', desc: 'Quick rides between campus and library' },

    // Shopping & Essentials (Triggering slight budget overshoot: ₹4,300 spent vs ₹4,000 budget!)
    { title: 'Blinkit Hostel Snacks & Toiletries', amount: 1150, type: 'EXPENSE', cat: 'Shopping & Essentials', date: '2026-11-02', method: 'UPI', desc: 'Quick commerce essentials' },
    { title: 'Amazon Laptop Stand & Type-C Hub', amount: 1850, type: 'EXPENSE', cat: 'Shopping & Essentials', date: '2026-11-05', method: 'UPI', desc: 'Ergonomic desk accessories' },
    { title: 'Myntra Winter Hoodie', amount: 1300, type: 'EXPENSE', cat: 'Shopping & Essentials', date: '2026-11-09', method: 'Debit Card', desc: 'Campus winter wear' },

    // Education & Career
    { title: 'Coursera AI Specialization Certificate', amount: 1499, type: 'EXPENSE', cat: 'Education & Career', date: '2026-11-05', method: 'Debit Card', desc: 'Deep Learning specialization' },
    { title: 'Hackathon Registration Kit & Supplies', amount: 350, type: 'EXPENSE', cat: 'Education & Career', date: '2026-11-08', method: 'UPI', desc: 'Notebooks, markers, badge' },

    // Entertainment & Leisure
    { title: 'Netflix & Spotify Premium Bundle', amount: 398, type: 'EXPENSE', cat: 'Entertainment & Leisure', date: '2026-11-04', method: 'UPI', desc: 'Monthly recurring entertainment' },
    { title: 'PVR Cinema Ticket - Interstellar Re-release', amount: 550, type: 'EXPENSE', cat: 'Entertainment & Leisure', date: '2026-11-10', method: 'UPI', desc: 'Movie night with friends' },

    // Healthcare & Fitness
    { title: 'Apollo Pharmacy Multivitamins & Eye drops', amount: 620, type: 'EXPENSE', cat: 'Healthcare & Fitness', date: '2026-11-06', method: 'UPI', desc: 'Eye care for screen time' },

    // Investments & Savings
    { title: 'Groww Mutual Fund SIP (Nifty 50)', amount: 3000, type: 'EXPENSE', cat: 'Investments & Savings', date: '2026-11-05', method: 'Net Banking', desc: 'Monthly systematic investment' },
  ];

  let txCount = 0;
  for (const tx of [...octoberTransactions, ...novemberTransactions]) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId: categoryMap[tx.cat],
        amount: tx.amount,
        type: tx.type,
        title: tx.title,
        description: tx.desc || '',
        date: new Date(tx.date + 'T12:00:00Z'),
        paymentMethod: tx.method,
      },
    });
    txCount++;
  }

  console.log(`💳 Seeded ${txCount} realistic transactions across Oct & Nov 2026!`);
  console.log('✅ PaisaPilot database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
