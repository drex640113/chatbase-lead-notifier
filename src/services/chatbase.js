const axios = require('axios');

async function fetchConversationById(chatbotId, conversationId) {
  if (!chatbotId || !conversationId) {
    console.warn('⚠️ Missing chatbotId or conversationId');
    return [];
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    const response = await axios.get(
      'https://www.chatbase.co/api/v1/get-conversations',
      {
        headers: { Authorization: `Bearer ${process.env.CHATBASE_API_KEY}` },
        params: { chatbotId, startDate: today, size: 100 },
        timeout: 15000,
      }
    );

    // 正確路徑：data.data
    const conversations = response.data?.data || [];
    console.log(`📋 Conversations fetched: ${conversations.length}`);

    const match = conversations.find(c => c.id === conversationId);

    if (!match) {
      console.warn(`⚠️ No match for conversationId: ${conversationId}`);
      if (conversations.length > 0) {
        console.log('Sample IDs:', conversations.slice(0, 3).map(c => c.id));
      }
      return [];
    }

    console.log(`✅ Found ${match.messages?.length || 0} messages`);
    return match.messages || [];

  } catch (err) {
    console.error('❌ Conversations API error:', err.response?.data || err.message);
    return [];
  }
}

module.exports = { fetchConversationById };
