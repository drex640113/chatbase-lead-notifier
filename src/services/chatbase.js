const axios = require('axios');

/**
 * 從 Chatbase 拿指定 conversation 的對話紀錄
 * @param {string} chatbotId
 * @param {string} conversationId
 * @returns {Array} messages
 */
async function fetchConversation(chatbotId, conversationId) {
  try {
    const response = await axios.get('https://www.chatbase.co/api/v1/get-conversations', {
      headers: {
        Authorization: `Bearer ${process.env.CHATBASE_API_KEY}`,
      },
      params: {
        chatbot_id: chatbotId,
        conversation_id: conversationId,
      },
      timeout: 10000,
    });

    const data = response.data;
    
    // 找到對應的 conversation
    const conversation = Array.isArray(data.data)
      ? data.data.find(c => c.id === conversationId)
      : null;

    if (!conversation) {
      console.warn('⚠️ Conversation not found, returning empty messages');
      return [];
    }

    return conversation.messages || [];

  } catch (err) {
    console.error('❌ Chatbase API error:', err.response?.data || err.message);
    return []; // 失敗不中斷流程，空陣列繼續處理
  }
}

module.exports = { fetchConversation };
