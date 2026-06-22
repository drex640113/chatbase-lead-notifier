const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// 自動重試機制，最多重試 3 次
async function sendTelegramWithRetry(text, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        { chat_id: CHAT_ID, text, parse_mode: 'HTML' },
        { timeout: 15000 }
      );
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.description || err.message || '未知錯誤';
      console.error(`❌ Telegram attempt ${i}/${retries} failed: ${errMsg}`);
      if (i < retries) {
        console.log(`⏳ Retrying in 3 seconds...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }
  console.error('❌ Telegram failed after all retries');
  return false;
}

async function sendLeadTelegram({ name, email, phone, chatbotName, aiSummary, messages, timestamp }) {
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

  const success = await sendTelegramWithRetry(msg);
  if (success) {
    console.log('📲 Telegram sent');
  }
}

module.exports = { sendLeadTelegram };
