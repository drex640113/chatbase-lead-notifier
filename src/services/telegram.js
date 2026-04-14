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

async function sendLeadTelegram({ name, email, phone, aiSummary, messages, timestamp }) {
  // 第一則：Lead 聯繫資訊（最重要）
  const msg1 = [
    '🔔 <b>新 Lead 通知</b>',
    `⏰ ${timestamp}`,
    '─────────────────',
    `👤 姓名：<b>${name}</b>`,
    `📧 Email：<b>${email}</b>`,
    `📱 電話：<b>${phone}</b>`,
    '',
    '🤖 <b>AI 意圖分析：</b>',
    aiSummary,
  ].join('\n');

  await sendTelegram(msg1);
  console.log('📲 Telegram msg 1 sent');

  // 第二則：只取訪客問的問題，過濾掉 AI 回覆和 [object Object]
  if (messages && messages.length > 0) {
    const userLines = messages
      .filter(m => m.role === 'user')
      .map(m => {
        // 如果 content 是物件就跳過
        if (typeof m.content !== 'string') return null;
        const text = m.content.trim();
        if (!text) return null;
        return `👤 ${text}`;
      })
      .filter(Boolean);

    if (userLines.length > 0) {
      let convo = userLines.join('\n\n');
      if (convo.length > 3500) convo = convo.substring(0, 3500) + '\n...(已截斷)';

      const msg2 = '❓ <b>訪客詢問的問題：</b>\n─────────────────\n' + convo;
      await sendTelegram(msg2);
      console.log('📲 Telegram msg 2 sent');
    }
  }
}

module.exports = { sendLeadTelegram };
