const express = require('express');
const router = express.Router();
const { fetchConversation } = require('../services/chatbase');
const { summarizeWithClaude } = require('../services/claude');
const { sendEmail } = require('../services/email');
const { sendLineNotify } = require('../services/line');

// POST /webhook/chatbase-lead
router.post('/chatbase-lead', async (req, res) => {
  // 立刻回 200，避免 Chatbase timeout
  res.status(200).json({ received: true });

  try {
    const payload = req.body;
    console.log('📩 Lead received:', JSON.stringify(payload, null, 2));

    // Chatbase webhook payload 結構:
    // { conversation_id, lead: { name, email, phone }, chatbot_id, timestamp }
    const { conversation_id, lead, chatbot_id } = payload;
    const { name, email, phone } = lead || {};

    // 1. 拿對話紀錄
    console.log(`🔍 Fetching conversation: ${conversation_id}`);
    const messages = await fetchConversation(chatbot_id, conversation_id);

    // 2. Claude AI 摘要
    console.log('🤖 Generating AI summary...');
    const aiSummary = await summarizeWithClaude(messages);

    // 3. 組通知內容
    const notificationData = {
      name: name || '未提供',
      email: email || '未提供',
      phone: phone || '未提供',
      conversation_id,
      aiSummary,
      messages,
      timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    };

    // 4. 並行發送 Email + Line Notify
    await Promise.allSettled([
      sendEmail(notificationData),
      sendLineNotify(notificationData),
    ]);

    console.log('✅ Notifications sent successfully');

  } catch (err) {
    console.error('❌ Error processing lead webhook:', err.message);
  }
});

module.exports = router;
