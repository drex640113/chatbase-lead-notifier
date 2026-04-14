const express = require('express');
require('dotenv').config();
const axios = require('axios');

const app = express();
app.use(express.json());

const webhookRouter = require('./routes/webhook');
app.use('/webhook', webhookRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'AEGIS Lead Notifier', version: '3.1.0' });
});

// 測試端點：直接查 Leads API 看原始資料
app.get('/test/leads', async (req, res) => {
  try {
    const response = await axios.get(
      'https://www.chatbase.co/api/v1/get-leads',
      {
        headers: { Authorization: `Bearer ${process.env.CHATBASE_API_KEY}` },
        params: { chatbotId: process.env.CHATBASE_CHATBOT_ID, size: 5 },
        timeout: 10000,
      }
    );
    res.json({ success: true, data: response.data });
  } catch (err) {
    res.json({ success: false, error: err.response?.data || err.message });
  }
});

// 測試端點：查 Conversations API 看原始資料
app.get('/test/conversations', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const response = await axios.get(
      'https://www.chatbase.co/api/v1/get-conversations',
      {
        headers: { Authorization: `Bearer ${process.env.CHATBASE_API_KEY}` },
        params: {
          chatbotId: process.env.CHATBASE_CHATBOT_ID,
          startDate: today,
          size: 5,
        },
        timeout: 10000,
      }
    );
    res.json({ success: true, data: response.data });
  } catch (err) {
    res.json({ success: false, error: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
