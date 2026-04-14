const express = require('express');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(express.json());

const { fetchRecentLeads } = require('./services/leads');
const { sendHourlyEmail } = require('./services/email');

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'AEGIS Lead Notifier', version: '2.1.0' });
});

app.get('/run-now', async (req, res) => {
  res.json({ message: 'Running lead check now...' });
  await runLeadCheck();
});

async function runLeadCheck() {
  const now = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  console.log(`\n🔄 [${now}] Running hourly lead check...`);

  const chatbotId = process.env.CHATBASE_CHATBOT_ID;
  if (!chatbotId) {
    console.error('❌ CHATBASE_CHATBOT_ID not set');
    return;
  }

  try {
    const leads = await fetchRecentLeads(chatbotId, 65);
    if (leads.length === 0) {
      console.log('📭 No new leads this hour');
      return;
    }

    // Lead 沒有 conversationId，直接組通知資料
    const leadsData = leads.map(lead => ({
      name: lead.name || '未提供',
      email: lead.email || '未提供',
      phone: lead.phone || '未提供',
      aiSummary: '（此版本不含對話紀錄）',
      messages: [],
      timestamp: new Date(lead.created_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    }));

    await sendHourlyEmail(leadsData, now);

  } catch (err) {
    console.error('❌ Lead check error:', err.message);
  }
}

cron.schedule('0 * * * *', runLeadCheck, { timezone: 'Asia/Taipei' });
console.log('⏰ Cron job scheduled: every hour on the hour (Taipei time)');

setTimeout(runLeadCheck, 3000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
