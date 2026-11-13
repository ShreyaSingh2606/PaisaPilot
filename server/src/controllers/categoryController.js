const prisma = require('../config/db');

/**
 * Get all categories
 */
async function getCategories(req, res, next) {
  try {
    const { type } = req.query;
    const where = {};
    if (type && (type === 'EXPENSE' || type === 'INCOME')) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new custom category
 */
async function createCategory(req, res, next) {
  try {
    const { name, type, icon, color, keywords } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const existing = await prisma.category.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        type: type || 'EXPENSE',
        icon: icon || 'Tag',
        color: color || '#10B981',
        keywords: keywords ? keywords.toLowerCase().trim() : '',
        isCustom: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  createCategory,
};
