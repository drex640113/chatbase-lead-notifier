const axios = require('axios');

/**
 * 用 chatbotId 拿所有對話，再用 conversationId 比對取出訊息
 * 根據官方文件：GET /api/v1/get-conversations?chatbotId=xxx
 * 回傳：{ data: [{ id, chatbot_id, messages: [{role, content}] }] }
 */
async function fetchConversationById(chatbotId, conversationId) {
  if (!chatbotId || !conversationId) {
    console.warn('⚠️ Missing chatbotId or conversationId');
    return [];
  }

  try {
    // 取今天的對話（避免拉太多）
    const today = new Date().toISOString().split('T')[0];

    const response = await axios.get(
      'https://www.chatbase.co/api/v1/get-conversations',
      {
        headers: {
          Authorization: `Bearer ${process.env.CHATBASE_API_KEY}`,
        },
        params: {
          chatbotId,
          startDate: today,
          size: 100,
        },
        timeout: 15000,
      }
    );

    const conversations = response.data?.data || [];
    console.log(`📋 Conversations fetched: ${conversations.length}`);

    // 比對 conversationId
    const match = conversations.find(c => c.id === conversationId);

    if (!match) {
      console.warn(`⚠️ conversationId ${conversationId} not found`);
      // Log 前幾個 id 幫助 debug
      if (conversations.length > 0) {
        console.log('Available IDs:', conversations.slice(0, 3).map(c => c.id));
      }
      return [];
    }

    console.log(`✅ Found conversation with ${match.messages?.length || 0} messages`);
    return match.messages || [];

  } catch (err) {
    console.error('❌ Chatbase API error:', err.response?.data || err.message);
    return [];
  }
}

module.exports = { fetchConversationById };
