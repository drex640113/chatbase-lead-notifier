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

    const { conversation_id, lead, chatbot_id } = payload;
    const { name, email, phone } = lead || {};

    console.log(`🔍 Fetching conversation: ${conversation_id}`);
    const messages = await fetchConversation(chatbot_id, conversation_id);

    console.log('🤖 Generating AI summary...');
    const aiSummary = await summarizeWithClaude(messages);

    const notificationData = {
      name: name || '未提供',
      email: email || '未提供',
      phone: phone || '未提供',
      conversation_id,
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
