const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { fetchConversationById } = require('../services/chatbase');
const { summarizeWithMinimax } = require('../services/claude');
const { sendLeadEmail } = require('../services/email');

// SHA-1 簽名驗證
function verifySignature(rawBody, signature, secret) {
  if (!secret) return true; // 沒設定 secret 就跳過驗證
  const expected = crypto.createHmac('sha1', secret).update(rawBody).digest('hex');
  return expected === signature;
}

router.post('/chatbase-lead', express.raw({ type: 'application/json' }), async (req, res) => {
  // 立即回 200
  res.status(200).json({ received: true });

  try {
    const rawBody = req.body;
    const signature = req.headers['x-chatbase-signature'];
    const secret = process.env.CHATBASE_WEBHOOK_SECRET;

    // 驗證簽名
    if (secret && !verifySignature(rawBody, signature, secret)) {
      console.warn('⚠️ Signature mismatch, ignoring request');
      return;
    }

    const body = JSON.parse(rawBody.toString());
    console.log('📩 Webhook received:', JSON.stringify(body, null, 2));

    // 根據官方文件解析 payload
    const chatbotId = body.chatbotId;
    const conversationId = body.payload?.conversationId;
    const name = body.payload?.customerName || '未提供';
    const email = body.payload?.customerEmail || '未提供';
    const phone = body.payload?.customerPhone || '未提供';

    console.log(`📌 chatbotId: ${chatbotId}, conversationId: ${conversationId}`);

    // 拿對話紀錄
    const messages = await fetchConversationById(chatbotId, conversationId);

    // AI 摘要
    const aiSummary = await summarizeWithMinimax(messages);

    // 發 Email
    await sendLeadEmail({
      name, email, phone,
      conversationId,
      aiSummary,
      messages,
      timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    });

    console.log('✅ Done - email sent');

  } catch (err) {
    console.error('❌ Webhook error:', err.message);
  }
});

module.exports = router;
