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
    return '<p style="color:#888;">（無對話紀錄）</p>';
  }
  return messages.map(m => {
    const isUser = m.role === 'user';
    const bgColor = isUser ? '#EBF5FB' : '#F0F0F0';
    const label = isUser ? '👤 訪客' : '🤖 AI';
    const align = isUser ? 'left' : 'right';
    return `
      <div style="margin:6px 0;text-align:${align};">
        <span style="font-size:11px;color:#888;">${label}</span>
        <div style="display:inline-block;background:${bgColor};border-radius:8px;padding:7px 11px;max-width:80%;text-align:left;font-size:13px;line-height:1.6;">
          ${m.content}
        </div>
      </div>`;
  }).join('');
}

/**
 * 發送每小時彙整 Email（多筆 Lead）
 */
async function sendHourlyEmail(leadsData, periodLabel) {
  if (!leadsData || leadsData.length === 0) {
    console.log('📭 No leads this hour, skipping email');
    return;
  }

  const leadsHtml = leadsData.map((item, index) => `
    <div style="border:1px solid #e0e0e0;border-radius:10px;margin-bottom:24px;overflow:hidden;">
      
      <!-- Lead Header -->
      <div style="background:#1a1a2e;padding:14px 20px;">
        <span style="color:#fff;font-weight:bold;font-size:15px;">Lead #${index + 1}：${item.name}</span>
        <span style="color:#aaa;font-size:12px;margin-left:12px;">${item.timestamp}</span>
      </div>

      <!-- Lead Info -->
      <div style="padding:16px 20px;background:#fff;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#888;padding:4px 0;width:60px;">Email</td><td><a href="mailto:${item.email}" style="color:#2980B9;">${item.email}</a></td></tr>
          <tr><td style="color:#888;padding:4px 0;">電話</td><td>${item.phone}</td></tr>
        </table>
      </div>

      <!-- AI Summary -->
      <div style="padding:14px 20px;background:#FDF9E7;border-top:1px solid #f0e090;">
        <div style="font-size:12px;color:#7D6608;margin-bottom:6px;">🤖 AI 意圖分析</div>
        <div style="font-size:15px;font-weight:bold;color:#333;">${item.aiSummary}</div>
      </div>

      <!-- Conversation -->
      <div style="padding:16px 20px;background:#fafafa;border-top:1px solid #eee;">
        <div style="font-size:12px;color:#888;margin-bottom:10px;">💬 對話紀錄</div>
        ${formatMessagesHtml(item.messages)}
      </div>

    </div>
  `).join('');

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#333;">
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:24px 32px;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:20px;">📊 Lead 彙整報告</h1>
      <p style="color:#aaa;margin:6px 0 0;font-size:13px;">${periodLabel} · 共 ${leadsData.length} 筆新 Lead</p>
    </div>
    <div style="padding:24px 0;">
      ${leadsHtml}
    </div>
    <div style="background:#f7f7f7;padding:14px 32px;border-radius:0 0 12px 12px;border:1px solid #eee;border-top:none;">
      <p style="margin:0;font-size:12px;color:#aaa;">RefineLab AEGIS Lead Notifier · 自動彙整</p>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"AEGIS Lead Notifier" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `📊 Lead 彙整：${leadsData.length} 筆新 Lead（${periodLabel}）`,
    html,
  });

  console.log(`📧 Hourly email sent: ${leadsData.length} leads`);
}

module.exports = { sendHourlyEmail };
