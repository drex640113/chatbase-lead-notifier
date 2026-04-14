const express = require('express');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(express.json());

const { fetchRecentLeads } = require('./services/leads');
const { fetchConversation } = require('./services/chatbase');
const { summarizeWithClaude } = require('./services/claude');
const { sendHourlyEmail } = require('./services/email');

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'AEGIS Lead Notifier', version: '2.0.0' });
});

// 手動觸發（測試用）
app.get('/run-now', async (req, res) => {
  res.json({ message: 'Running lead check now...' });
  await runLeadCheck();
});

// 主要執行函式
async function runLeadCheck() {
  console.log(`\n🔄 [${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}] Running hourly lead check...`);

  const chatbotId = process.env.CHATBASE_CHATBOT_ID;
  if (!chatbotId) {
    console.error('❌ CHATBASE_CHATBOT_ID not set');
    return;
  }

  try {
    // 1. 拿最近 65 分鐘的 leads（多 5 分鐘避免邊界漏掉）
    const leads = await fetchRecentLeads(chatbotId, 65);

    if (leads.length === 0) {
      console.log('📭 No new leads this hour');
      return;
    }

    // 2. 每筆 lead 拿對話記錄 + AI 摘要
    const leadsData = [];
    for (const lead of leads) {
      const conversationId = lead.conversationId || lead.conversation_id;
      const messages = await fetchConversation(chatbotId, conversationId);
      const aiSummary = await summarizeWithClaude(messages);

      leadsData.push({
        name: lead.customerName || lead.name || '未提供',
        email: lead.customerEmail || lead.email || '未提供',
        phone: lead.customerPhone || lead.phone || '未提供',
        conversation_id: conversationId,
        aiSummary,
        messages,
        timestamp: new Date(lead.created_at || lead.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      });
    }

    // 3. 發彙整 Email
    const now = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    await sendHourlyEmail(leadsData, now);

  } catch (err) {
    console.error('❌ Lead check error:', err.message);
  }
}

// 每小時整點執行（台北時間）
cron.schedule('0 * * * *', runLeadCheck, {
  timezone: 'Asia/Taipei'
});

console.log('⏰ Cron job scheduled: every hour on the hour (Taipei time)');

// 啟動時也執行一次（把之前漏掉的補回來）
setTimeout(runLeadCheck, 5000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
