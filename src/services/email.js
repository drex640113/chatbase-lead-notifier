const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function formatMessagesHtml(messages) {
  if (!messages || messages.length === 0) {
    return '<p style="color:#888;font-size:13px;">（無對話紀錄）</p>';
  }
  return messages.map(m => {
    const isUser = m.role === 'user';
    const bg = isUser ? '#EBF5FB' : '#F0F0F0';
    const label = isUser ? '👤 訪客' : '🤖 AI';
    const align = isUser ? 'left' : 'right';
    return `
      <div style="margin:6px 0;text-align:${align};">
        <div style="font-size:11px;color:#888;margin-bottom:2px;">${label}</div>
        <div style="display:inline-block;background:${bg};border-radius:8px;padding:8px 12px;max-width:82%;text-align:left;font-size:13px;line-height:1.6;">
          ${String(m.content).replace(/</g,'&lt;').replace(/>/g,'&gt;')}
        </div>
      </div>`;
  }).join('');
}

async function sendLeadEmail({ name, email, phone, conversationId, aiSummary, messages, timestamp }) {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#333;">
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:22px 28px;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:20px;">🔔 新 Lead 通知</h1>
      <p style="color:#aaa;margin:5px 0 0;font-size:12px;">${timestamp}</p>
    </div>

    <div style="background:#fff;padding:20px 28px;border:1px solid #eee;border-top:none;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#888;padding:5px 0;width:60px;">姓名</td><td style="font-weight:bold;">${name}</td></tr>
        <tr><td style="color:#888;padding:5px 0;">Email</td><td><a href="mailto:${email}" style="color:#2980B9;">${email}</a></td></tr>
        <tr><td style="color:#888;padding:5px 0;">電話</td><td>${phone}</td></tr>
      </table>
    </div>

    <div style="background:#FDF9E7;padding:16px 28px;border:1px solid #f0e090;border-top:none;">
      <div style="font-size:12px;color:#7D6608;margin-bottom:6px;">🤖 AI 意圖分析</div>
      <div style="font-size:15px;font-weight:bold;color:#333;">${aiSummary}</div>
    </div>

    <div style="background:#fafafa;padding:18px 28px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
      <div style="font-size:12px;color:#888;margin-bottom:10px;">💬 留 Lead 前的對話紀錄</div>
      ${formatMessagesHtml(messages)}
    </div>

    <div style="padding:10px 28px;">
      <p style="font-size:11px;color:#bbb;">Conversation ID: ${conversationId} · RefineLab AEGIS</p>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"AEGIS Lead Notifier" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `🔔 新 Lead：${name}（${email}）`,
    html,
  });

  console.log(`📧 Email sent to ${process.env.EMAIL_TO}`);
}

module.exports = { sendLeadEmail };
