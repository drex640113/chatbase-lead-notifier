const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { fetchConversationById } = require('../services/chatbase');
const { summarizeWithMinimax } = require('../services/claude');
const { sendLeadTelegram } = require('../services/telegram');

function verifySignature(rawBody, signature, secret) {
  if (!secret) return true;
  const expected = crypto.createHmac('sha1', secret).update(rawBody).digest('hex');
  return expected === signature;
}

router.post('/chatbase-lead', express.raw({ type: 'application/json' }), async (req, res) => {
  res.status(200).json({ received: true });

  try {
    const rawBody = req.body;
    const signature = req.headers['x-chatbase-signature'];
    const secret = process.env.CHATBASE_WEBHOOK_SECRET;

    if (secret && !verifySignature(rawBody, signature, secret)) {
      console.warn('⚠️ Signature mismatch');
      return;
    }

    const body = JSON.parse(rawBody.toString());
    console.log('📩 Webhook:', JSON.stringify(body, null, 2));

    const chatbotId = body.chatbotId;
    const conversationId = body.payload?.conversationId;
    const name = body.payload?.customerName || '未提供';
    const email = body.payload?.customerEmail || '未提供';
    const phone = body.payload?.customerPhone || '未提供';

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
