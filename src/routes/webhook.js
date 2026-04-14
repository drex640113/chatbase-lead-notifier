const express = require('express');
const router = express.Router();
const { fetchConversationById } = require('../services/chatbase');
const { summarizeWithMinimax } = require('../services/claude');
const { sendLeadTelegram } = require('../services/telegram');
const { getChatbotName } = require('../services/chatbots');

router.post('/chatbase-lead', async (req, res) => {
  res.status(200).json({ received: true });

  try {
    const body = req.body;
    console.log('📩 Webhook received');

    const chatbotId = body.chatbotId;
    const conversationId = body.payload?.conversationId;
    const name = body.payload?.customerName || '未提供';
    const email = body.payload?.customerEmail || '未提供';
    const phone = body.payload?.customerPhone || '未提供';
    const chatbotName = getChatbotName(chatbotId);

    console.log(`📌 Agent: ${chatbotName} | ${conversationId}`);

    const messages = await fetchConversationById(chatbotId, conversationId);
    const aiSummary = await summarizeWithMinimax(messages);

    await sendLeadTelegram({
      name, email, phone,
      chatbotName,
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
