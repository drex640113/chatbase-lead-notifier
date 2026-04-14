const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { fetchConversationById } = require('../services/chatbase');
const { summarizeWithMinimax } = require('../services/claude');
const { sendLeadTelegram } = require('../services/telegram');

// 不用 express.raw，直接用 express.json 解析
router.post('/chatbase-lead', async (req, res) => {
  res.status(200).json({ received: true });

  try {
    const body = req.body;
    console.log('📩 Webhook:', JSON.stringify(body, null, 2));

    const chatbotId = body.chatbotId;
    const conversationId = body.payload?.conversationId;
    const name = body.payload?.customerName || '未提供';
    const email = body.payload?.customerEmail || '未提供';
    const phone = body.payload?.customerPhone || '未提供';

    console.log(`📌 chatbotId: ${chatbotId}, conversationId: ${conversationId}`);

    const messages = await fetchConversationById(chatbotId, conversationId);
    const aiSummary = await summarizeWithMinimax(messages);

    await sendLeadTelegram({
      name, email, phone,
      conversationId,
      aiSummary,
      messages,
      timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    });

    console.log('✅ Done');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
});

module.exports = router;
