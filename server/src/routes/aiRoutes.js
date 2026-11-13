const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/ask - send question to PaisaPilot AI
router.post('/ask', aiController.askAiAssistant);

// GET /api/ai/context - get financial ground-truth context
router.get('/context', aiController.getAiContext);

module.exports = router;
