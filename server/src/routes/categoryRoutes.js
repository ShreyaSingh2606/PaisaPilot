const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET /api/categories - list all categories
router.get('/', categoryController.getCategories);

// POST /api/categories - create custom category
router.post('/', categoryController.createCategory);

module.exports = router;
