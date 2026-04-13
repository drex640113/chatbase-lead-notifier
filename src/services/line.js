const axios = require('axios');
const qs = require('querystring');

/**
 * 發送 Line Notify 通知
 * 第一則：Lead 基本資訊 + AI 摘要
 * 第二則：對話紀錄（訊息太長時自動截斷）
 */
async function sendLineNotify(data) {
  const { name, email, phone, aiSummary, messages, timestamp } = data;

  const token = process.env.LINE_NOTIFY_TOKEN;
  const lineApi = 'https://notify-api.line.me/api/notify';
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  // ── 第一則：Lead 資訊 + AI 摘要 ──
  const msg1 = [
    '',
    '━━━━━━━━━━━━━━',
    '🔔 新 Lead 通知',
    `⏰ ${timestamp}`,
    '━━━━━━━━━━━━━━',
    `👤 姓名：${name}`,
    `📧 Email：${email}`,
    `📱 電話：${phone}`,
    '',
    '🤖 AI 分析意圖：',
    `${aiSummary}`,
    '━━━━━━━━━━━━━━',
  ].join('\n');

  await axios.post(lineApi, qs.stringify({ message: msg1 }), { headers });
  console.log('📲 Line Notify #1 sent (lead info)');

  // ── 第二則：對話紀錄 ──
  if (messages && messages.length > 0) {
    const convoLines = messages.map(m => {
      const label = m.role === 'user' ? '👤' : '🤖';
      return `${label} ${m.content}`;
    });

    // Line Notify 單則上限 1000 字元，超過就截斷
    let convoText = convoLines.join('\n');
    if (convoText.length > 800) {
      convoText = convoText.substring(0, 800) + '\n...(對話過長，詳見 Email)';
    }

    const msg2 = [
      '',
      '━━━━━━━━━━━━━━',
      '💬 留 Lead 前的對話紀錄：',
      '━━━━━━━━━━━━━━',
      convoText,
    ].join('\n');

    await axios.post(lineApi, qs.stringify({ message: msg2 }), { headers });
    console.log('📲 Line Notify #2 sent (conversation)');
  }
}

module.exports = { sendLineNotify };
