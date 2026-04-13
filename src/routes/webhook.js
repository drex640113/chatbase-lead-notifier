const express = require('express');
const router = express.Router();
const { fetchConversation } = require('../services/chatbase');
const { summarizeWithClaude } = require('../services/claude');
const { sendEmail } = require('../services/email');

// POST /webhook/chatbase-lead
router.post('/chatbase-lead', async (req, res) => {
  res.status(200).json({ received: true });

  try {
    const payload = req.body;
    console.log('📩 Lead received:', JSON.stringify(payload, null, 2));

    // 修正：Chatbase 實際 payload 結構
    const chatbotId = payload.chatbotId;
    const conversationId = payload.payload?.conversationId;
    const name = payload.payload?.customerName || '未提供';
    const email = payload.payload?.customerEmail || '未提供';
    const phone = payload.payload?.customerPhone || '未提供';

    console.log(`🔍 Fetching conversation: ${conversationId}`);
    const messages = await fetchConversation(chatbotId, conversationId);

    console.log('🤖 Generating AI summary...');
    const aiSummary = await summarizeWithClaude(messages);

    const notificationData = {
      name,
      email,
      phone,
      conversation_id: conversationId,
      aiSummary,
      messages,
      timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    };

    await sendEmail(notificationData);
    console.log('✅ Email notification sent successfully');

  } catch (err) {
    console.error('❌ Error processing lead webhook:', err.message);
  }
});

module.exports = router;
