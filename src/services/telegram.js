const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(text) {
  await axios.post(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
    },
    { timeout: 10000 }
  );
}

async function sendLeadTelegram({ name, email, phone, aiSummary, messages, timestamp }) {
  // 第一則：Lead 基本資訊
  const msg1 = [
    '🔔 <b>新 Lead 通知</b>',
    `⏰ ${timestamp}`,
    '─────────────────',
    `👤 姓名：${name}`,
    `📧 Email：${email}`,
    `📱 電話：${phone}`,
    '',
    '🤖 <b>AI 意圖分析：</b>',
    aiSummary,
  ].join('\n');

  await sendTelegram(msg1);
  console.log('📲 Telegram msg 1 sent');

  // 第二則：對話紀錄
  if (messages && messages.length > 0) {
    const lines = messages.map(m => {
      const label = m.role === 'user' ? '👤' : '🤖';
      const content = String(m.content).substring(0, 200); // 截斷太長的
      return `${label} ${content}`;
    });

    let convo = lines.join('\n\n');
    if (convo.length > 3500) convo = convo.substring(0, 3500) + '\n...(對話過長，已截斷)';

    const msg2 = '💬 <b>對話紀錄：</b>\n─────────────────\n' + convo;
    await sendTelegram(msg2);
    console.log('📲 Telegram msg 2 sent');
  }
}

module.exports = { sendLeadTelegram };
