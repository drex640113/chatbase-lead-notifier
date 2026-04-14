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
        model: 'MiniMax-M2.7',
        max_tokens: 200,
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
    console.log('🤖 MiniMax raw:', JSON.stringify(data).substring(0, 300));

    // 嘗試各種可能的回傳格式
    let text = null;

    // 格式1: Anthropic 標準格式 { content: [{type:'text', text:'...'}] }
    if (Array.isArray(data.content)) {
      const block = data.content.find(b => b.type === 'text' || b.text);
      text = block?.text;
    }
    // 格式2: 直接字串 { content: '...' }
    if (!text && typeof data.content === 'string') {
      text = data.content;
    }
    // 格式3: OpenAI 格式 { choices: [{message:{content:'...'}}] }
    if (!text && data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    }
    // 格式4: 直接 text 欄位
    if (!text && data.text) {
      text = data.text;
    }

    console.log('🤖 Extracted summary:', text);
    return text?.trim() || '（摘要生成失敗）';

  } catch (err) {
    console.error('❌ MiniMax error:', JSON.stringify(err.response?.data) || err.message);
    return '（AI 摘要暫時無法使用）';
  }
}

module.exports = { summarizeWithMinimax };
