const express = require('express');
require('dotenv').config();
const axios = require('axios');

const app = express();
app.use(express.json());

const webhookRouter = require('./routes/webhook');
app.use('/webhook', webhookRouter);

const { fetchRecentLeads } = require('./services/leads');
const { fetchConversationById } = require('./services/chatbase');
const { summarizeWithMinimax } = require('./services/claude');
const { sendLeadTelegram } = require('./services/telegram');

app.get('/', (req, res) => {
  res.json({ status: 'ok', version: '4.0.0' });
});

app.get('/test/leads', async (req, res) => {
  try {
    const response = await axios.get('https://www.chatbase.co/api/v1/get-leads', {
      headers: { Authorization: `Bearer ${process.env.CHATBASE_API_KEY}` },
      params: { chatbotId: process.env.CHATBASE_CHATBOT_ID, size: 5 },
    });
    res.json({ success: true, data: response.data });
  } catch (err) {
    res.json({ success: false, error: err.response?.data || err.message });
  }
});

app.get('/test/conversations', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const response = await axios.get('https://www.chatbase.co/api/v1/get-conversations', {
      headers: { Authorization: `Bearer ${process.env.CHATBASE_API_KEY}` },
      params: { chatbotId: process.env.CHATBASE_CHATBOT_ID, startDate: today, size: 3 },
    });
    res.json({ success: true, data: response.data });
  } catch (err) {
    res.json({ success: false, error: err.response?.data || err.message });
  }
});

// 完整流程測試
app.get('/test/run', async (req, res) => {
  res.json({ message: 'Running... check Telegram in ~30 seconds' });

  try {
    const chatbotId = process.env.CHATBASE_CHATBOT_ID;
    const leads = await fetchRecentLeads(chatbotId, 1440);

    if (leads.length === 0) {
      console.log('📭 No leads found');
      return;
    }

    const lead = leads[0];
    console.log('🚀 Processing lead:', lead.name, lead.email);

    // Webhook 有 conversationId，但 Leads API 沒有，這裡先跳過對話
    await sendLeadTelegram({
      name: lead.name || '未提供',
      email: lead.email || '未提供',
      phone: lead.phone || '未提供',
      conversationId: 'test',
      aiSummary: '（測試模式）',
      messages: [],
      timestamp: new Date(lead.created_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    });

    console.log('✅ Telegram sent!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
