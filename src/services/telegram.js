const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(text) {
  await axios.post(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    { chat_id: CHAT_ID, text, parse_mode: 'HTML' },
    { timeout: 10000 }
  );
}

async function sendLeadTelegram({ name, email, phone, chatbotName, aiSummary, messages, timestamp }) {
  // 整理訪客問題
  const userLines = (messages || [])
    .filter(m => m.role === 'user' && typeof m.content === 'string')
    .map(m => m.content.trim())
    .filter(l => l.length > 0);

  let questionsBlock = '';
  if (userLines.length > 0) {
    let convo = userLines.join('\n');
    if (convo.length > 2000) convo = convo.substring(0, 2000) + '\n...(已截斷)';
    questionsBlock = `\n<b>訪客詢問的問題：</b>\n${convo}`;
  }

  const msg = [
    `<b>新 Lead 通知</b>`,
    `時間：${timestamp}`,
    `來源：${chatbotName}`,
    `─────────────────`,
    `姓名：<b>${name}</b>`,
    `Email：<b>${email}</b>`,
    `電話：<b>${phone}</b>`,
    questionsBlock,
    `<b>AI 意圖分析：</b>`,
    aiSummary,
  ].filter(l => l !== '').join('\n');

  await sendTelegram(msg);
  console.log('📲 Telegram sent');
}

module.exports = { sendLeadTelegram };
