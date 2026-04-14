const axios = require('axios');

async function summarizeWithMinimax(messages) {
  if (!messages || messages.length === 0) {
    return '（無對話紀錄可分析）';
  }

  const userMessages = messages
    .filter(m => m.role === 'user' && typeof m.content === 'string')
    .map(m => m.content.trim())
    .filter(Boolean)
    .join('\n');

  if (!userMessages) return '（對話中無用戶訊息）';

  const prompt = `以下是訪客在 AI 客服的發言：\n\n${userMessages}\n\n請用一句話（繁體中文，30字以內）總結這位訪客的主要需求或意圖。直接輸出這句話，不加任何前綴。`;

  try {
    const response = await axios.post(
      'https://api.minimax.io/anthropic/v1/messages',
      {
        model: 'MiniMax-M2.5',  // 改用 M2.5，沒有強制 thinking
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const data = response.data;
    console.log('🤖 blocks:', JSON.stringify(data.content?.map(b => b.type)));

    let text = null;
    if (Array.isArray(data.content)) {
      const textBlock = data.content.find(b => b.type === 'text');
      text = textBlock?.text;
    }
    if (!text && typeof data.content === 'string') text = data.content;

    console.log('🤖 Summary:', text);
    return text?.trim() || '（摘要生成失敗）';

  } catch (err) {
    console.error('❌ MiniMax error:', JSON.stringify(err.response?.data) || err.message);
    return '（AI 摘要暫時無法使用）';
  }
}

module.exports = { summarizeWithMinimax };
