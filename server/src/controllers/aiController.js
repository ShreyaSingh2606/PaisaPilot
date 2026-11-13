const aiService = require('../services/aiService');

/**
 * Handle conversational AI financial inquiries
 */
async function askAiAssistant(req, res, next) {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Query message cannot be empty' });
    }

    const response = await aiService.answerFinancialQuery(message);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current financial context snapshot (useful for debugging & transparency)
 */
async function getAiContext(req, res, next) {
  try {
    const context = await aiService.buildFinancialContext();
    res.json({
      success: true,
      data: context,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  askAiAssistant,
  getAiContext,
};
