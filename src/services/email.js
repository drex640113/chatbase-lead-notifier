const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // 也可換成 SMTP，設定見 .env
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail 建議用 App Password
  },
});

/**
 * 格式化對話紀錄為 HTML
 */
function formatMessagesHtml(messages) {
  if (!messages || messages.length === 0) {
    return '<p style="color:#888;">（無法取得對話紀錄）</p>';
  }

  return messages.map(m => {
    const isUser = m.role === 'user';
    const bgColor = isUser ? '#EBF5FB' : '#F0F0F0';
    const label = isUser ? '👤 訪客' : '🤖 AI';
    const align = isUser ? 'left' : 'right';

    return `
      <div style="margin: 8px 0; text-align: ${align};">
        <span style="font-size:11px; color:#888;">${label}</span>
        <div style="display:inline-block; background:${bgColor}; border-radius:8px; padding:8px 12px; max-width:80%; text-align:left; font-size:14px; line-height:1.6;">
          ${m.content}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 發送 Email 通知
 */
async function sendEmail(data) {
  const { name, email, phone, conversation_id, aiSummary, messages, timestamp } = data;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #333;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 24px 32px; border-radius: 12px 12px 0 0;">
      <h1 style="color: #fff; margin: 0; font-size: 22px;">🔔 新 Lead 通知</h1>
      <p style="color: #aaa; margin: 6px 0 0 0; font-size: 13px;">AEGIS Chatbot Lead Capture · ${timestamp}</p>
    </div>

    <!-- Lead Info -->
    <div style="background: #fff; padding: 28px 32px; border-left: 1px solid #eee; border-right: 1px solid #eee;">
      <h2 style="margin: 0 0 16px 0; font-size: 16px; color: #1a1a2e;">訪客資訊</h2>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color:#888; width:80px;">姓名</td><td style="font-weight:bold;">${name}</td></tr>
        <tr><td style="padding: 8px 0; color:#888;">Email</td><td><a href="mailto:${email}" style="color:#2980B9;">${email}</a></td></tr>
        <tr><td style="padding: 8px 0; color:#888;">電話</td><td>${phone}</td></tr>
      </table>
    </div>

    <!-- AI Summary -->
    <div style="background: #FDF9E7; padding: 20px 32px; border-left: 1px solid #eee; border-right: 1px solid #eee; border-top: 1px solid #f0e090;">
      <h2 style="margin: 0 0 10px 0; font-size: 15px; color: #7D6608;">🤖 AI 分析：訪客意圖</h2>
      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #333; line-height: 1.7;">${aiSummary}</p>
    </div>

    <!-- Conversation -->
    <div style="background: #fff; padding: 24px 32px; border-left: 1px solid #eee; border-right: 1px solid #eee; border-top: 1px solid #eee;">
      <h2 style="margin: 0 0 16px 0; font-size: 15px; color: #1a1a2e;">💬 留 Lead 前的完整對話</h2>
      ${formatMessagesHtml(messages)}
    </div>

    <!-- Footer -->
    <div style="background: #f7f7f7; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #eee; border-top: none;">
      <p style="margin: 0; font-size: 12px; color: #aaa;">Conversation ID: ${conversation_id} · RefineLab AEGIS System</p>
    </div>

  </div>
  `;

  await transporter.sendMail({
    from: `"AEGIS Lead Notifier" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO, // 收件人，可設多個用逗號分隔
    subject: `🔔 新 Lead：${name}（${email}）`,
    html,
  });

  console.log(`📧 Email sent to ${process.env.EMAIL_TO}`);
}

module.exports = { sendEmail };
