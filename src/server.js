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
const { sendLeadEmail } = require('./services/email');

app.get('/', (req, res) => {
  res.json({ status: 'ok', version: '3.2.0' });
});

// 查 Leads 原始資料
app.get('/test/leads', async (req, res) => {
  try {
    const response = await axios.get(
      'https://www.chatbase.co/api/v1/get-leads',
      {
        headers: { Authorization: `Bearer ${process.env.CHATBASE_API_KEY}` },
        params: { chatbotId: process.env.CHATBASE_CHATBOT_ID, size: 5 },
      }
    );
    res.json({ success: true, data: response.data });
  } catch (err) {
    res.json({ success: false, error: err.response?.data || err.message });
  }
});

// 查 Conversations 原始資料
app.get('/test/conversations', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const response = await axios.get(
      'https://www.chatbase.co/api/v1/get-conversations',
      {
        headers: { Authorization: `Bearer ${process.env.CHATBASE_API_KEY}` },
        params: { chatbotId: process.env.CHATBASE_CHATBOT_ID, startDate: today, size: 5 },
      }
    );
    res.json({ success: true, data: response.data });
  } catch (err) {
    res.json({ success: false, error: err.response?.data || err.message });
  }
});

// 模擬完整流程：拿最近 leads → 對話 → AI 摘要 → Email
app.get('/test/run', async (req, res) => {
  res.json({ message: 'Running full test... check your email in ~30 seconds' });

  try {
    const chatbotId = process.env.CHATBASE_CHATBOT_ID;
    const leads = await fetchRecentLeads(chatbotId, 1440); // 最近 24 小時

    if (leads.length === 0) {
      console.log('📭 No leads found');
      return;
    }

    console.log(`🚀 Processing ${leads.length} lead(s)...`);

    // 只取最新一筆測試
    const lead = leads[0];
    console.log('Lead:', JSON.stringify(lead, null, 2));

    // Leads API 沒有 conversationId，所以從 Conversations API 用 email 比對
    // 先直接發不含對話的 Email 驗證流程
    const aiSummary = '（測試模式：無對話紀錄）';

    await sendLeadEmail({
      name: lead.name || '未提供',
      email: lead.email || '未提供',
      phone: lead.phone || '未提供',
      conversationId: 'test-mode',
      aiSummary,
      messages: [],
      timestamp: new Date(lead.created_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    });

    console.log('✅ Test email sent!');
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
