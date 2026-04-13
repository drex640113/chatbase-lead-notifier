const express = require('express');
const router = express.Router();
const { fetchConversation } = require('../services/chatbase');
const { summarizeWithClaude } = require('../services/claude');
const { sendEmail } = require('../services/email');

router.post('/chatbase-lead', async (req, res) => {
  res.status(200).json({ received: true });

  try {
    const body = req.body;
    console.log('📩 Raw payload:', JSON.stringify(body, null, 2));

    const chatbotId = body.chatbotId;
    const conversationId = body.payload?.conversationId;
    const name = body.payload?.customerName || '未提供';
    const email = body.payload?.customerEmail || '未提供';
    const phone = body.payload?.customerPhone || '未提供';

    console.log(`📌 chatbotId: ${chatbotId}`);
    console.log(`📌 conversationId: ${conversationId}`);

    const messages = await fetchConversation(chatbotId, conversationId);
    const aiSummary = await summarizeWithClaude(messages);

    await sendEmail({
      name, email, phone,
      conversation_id: conversationId,
      aiSummary, messages,
      timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    });

    console.log('✅ Done');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
});

module.exports = router;
