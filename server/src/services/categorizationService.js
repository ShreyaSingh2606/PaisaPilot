const prisma = require('../config/db');

/**
 * Built-in keyword catalog mapping common Indian student & professional expenses
 */
const DEFAULT_RULES = [
  {
    category: 'Food & Dining',
    keywords: [
      'zomato', 'swiggy', 'canteen', 'starbucks', 'chai', 'dhaba', 'mcdonalds',
      'kfc', 'burger', 'dominos', 'cafe', 'lunch', 'dinner', 'breakfast', 'snack',
      'biryani', 'pizza', 'restaurant', 'food', 'tea', 'coffee', 'subway', 'haldiram'
    ],
  },
  {
    category: 'Transportation',
    keywords: [
      'uber', 'ola', 'rapido', 'metro', 'auto', 'petrol', 'diesel', 'fuel',
      'bus', 'train', 'irctc', 'cab', 'ride', 'parking', 'toll', 'flight', 'indigo'
    ],
  },
  {
    category: 'Shopping & Essentials',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'blinkit', 'zepto', 'instamart', 'zara',
      'h&m', 'clothes', 'shoes', 'groceries', 'supermarket', 'meesho', 'nykaa',
      'ajio', 'shopping', 'electronics'
    ],
  },
  {
    category: 'Entertainment & Leisure',
    keywords: [
      'netflix', 'spotify', 'cinema', 'pvr', 'inox', 'movie', 'prime', 'hotstar',
      'gaming', 'steam', 'concert', 'outing', 'youtube premium', 'discord', 'game'
    ],
  },
  {
    category: 'Education & Career',
    keywords: [
      'udemy', 'coursera', 'college', 'fees', 'books', 'stationery', 'hostel',
      'tuition', 'certifications', 'exam', 'library', 'course', 'sem fees', 'pen', 'xerox'
    ],
  },
  {
    category: 'Housing & Utilities',
    keywords: [
      'rent', 'electricity', 'wifi', 'broadband', 'water', 'gas', 'maintenance',
      'recharge', 'jio', 'airtel', 'vi', 'bill', 'room', 'flat'
    ],
  },
  {
    category: 'Healthcare & Fitness',
    keywords: [
      'pharmacy', 'medicine', 'apollo', 'gym', 'cult', 'doctor', 'hospital',
      'supplements', '1mg', 'clinic', 'dentist', 'meds'
    ],
  },
  {
    category: 'Investments & Savings',
    keywords: [
      'groww', 'zerodha', 'sip', 'mutual fund', 'fixed deposit', 'fd', 'stocks',
      'gold', 'etf', 'coin', 'indmoney'
    ],
  },
  {
    category: 'Internship Stipend',
    keywords: ['stipend', 'salary', 'payroll', 'internship'],
  },
  {
    category: 'Freelancing & Projects',
    keywords: ['freelance', 'client', 'upwork', 'fiverr', 'contract', 'gig'],
  },
  {
    category: 'Allowance & Family',
    keywords: ['pocket money', 'parents', 'allowance', 'papa', 'mummy', 'family'],
  },
];

/**
 * Predicts the most appropriate category for a given title/description
 * @param {string} text - Transaction title or description
 * @param {string} [type='EXPENSE'] - "EXPENSE" or "INCOME"
 */
async function predictCategory(text, type = 'EXPENSE') {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const cleanText = text.toLowerCase().trim();
  const dbCategories = await prisma.category.findMany({
    where: { type },
  });

  // 1. Check DB categories and their custom keywords first
  for (const cat of dbCategories) {
    if (cat.keywords) {
      const keywords = cat.keywords.split(',').map((k) => k.trim().toLowerCase());
      for (const kw of keywords) {
        if (kw && cleanText.includes(kw)) {
          return {
            categoryId: cat.id,
            categoryName: cat.name,
            matchedKeyword: kw,
            confidence: 0.95,
          };
        }
      }
    }
  }

  // 2. Check DEFAULT_RULES catalog
  for (const rule of DEFAULT_RULES) {
    for (const kw of rule.keywords) {
      if (cleanText.includes(kw)) {
        const matchedDbCat = dbCategories.find(
          (c) => c.name.toLowerCase() === rule.category.toLowerCase()
        );
        if (matchedDbCat) {
          return {
            categoryId: matchedDbCat.id,
            categoryName: matchedDbCat.name,
            matchedKeyword: kw,
            confidence: 0.85,
          };
        }
      }
    }
  }

  // 3. Fallback: Return default Miscellaneous or first matching type category
  const fallbackCat =
    dbCategories.find((c) => c.name.toLowerCase() === 'miscellaneous') ||
    dbCategories[0] ||
    null;

  return {
    categoryId: fallbackCat ? fallbackCat.id : null,
    categoryName: fallbackCat ? fallbackCat.name : 'Miscellaneous',
    matchedKeyword: null,
    confidence: 0.2,
  };
}

module.exports = {
  predictCategory,
  DEFAULT_RULES,
};
