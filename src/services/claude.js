const axios = require('axios');

/**
 * 用 Claude API 對對話紀錄做一句話摘要
 * @param {Array} messages - Chatbase messages array
 * @returns {string} summary
 */
async function summarizeWithClaude(messages) {
  if (!messages || messages.length === 0) {
    return '（無法取得對話紀錄，無法生成摘要）';
  }

  // 只取 user 的訊息來摘要，過濾掉 AI 回覆
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n');

  if (!userMessages.trim()) {
    return '（對話紀錄中無用戶訊息）';
  }

  const prompt = `以下是一位訪客在 AI 客服聊天機器人上的對話內容（僅用戶發言）：

${userMessages}

請用一句話（繁體中文，30字以內）總結這位訪客的主要需求或意圖，供業務人員快速判斷優先級。
格式：直接輸出這句話，不要加任何前綴或解釋。`;

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    return response.data.content?.[0]?.text?.trim() || '（摘要生成失敗）';

  } catch (err) {
    console.error('❌ Claude API error:', err.response?.data || err.message);
    return '（AI 摘要服務暫時無法使用）';
  }
}

module.exports = { summarizeWithClaude };
