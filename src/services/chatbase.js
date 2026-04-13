const axios = require('axios');

async function fetchConversation(chatbotId, conversationId) {
  if (!conversationId || !chatbotId) {
    console.warn('⚠️ Missing chatbotId or conversationId');
    return [];
  }

  try {
    const response = await axios.get(
      `https://www.chatbase.co/api/v1/get-conversations`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHATBASE_API_KEY}`,
        },
        params: {
          chatbotId: chatbotId,
          size: 1,
        },
        timeout: 10000,
      }
    );

    const conversations = response.data?.data || [];
    const conversation = conversations.find(c => c.id === conversationId);

    if (!conversation) {
      console.warn(`⚠️ Conversation ${conversationId} not found`);
      return [];
    }

    return conversation.messages || [];

  } catch (err) {
    console.error('❌ Chatbase API error:', err.response?.data || err.message);
    return [];
  }
}

module.exports = { fetchConversation };
