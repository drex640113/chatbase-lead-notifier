const axios = require('axios');

/**
 * 拿最近 N 分鐘內的所有 Leads
 */
async function fetchRecentLeads(chatbotId, minutes = 65) {
  try {
    const now = new Date();
    const since = new Date(now.getTime() - minutes * 60 * 1000);
    const startDate = since.toISOString().split('T')[0]; // YYYY-MM-DD

    const response = await axios.get(
      'https://www.chatbase.co/api/v1/get-leads',
      {
        headers: {
          Authorization: `Bearer ${process.env.CHATBASE_API_KEY}`,
        },
        params: {
          chatbotId,
          startDate,
          size: 100,
        },
        timeout: 10000,
      }
    );

    const leads = response.data?.data || [];
    console.log(`📋 Total leads fetched: ${leads.length}`);

    // 過濾出真正在這個小時內的
    const recentLeads = leads.filter(lead => {
      const createdAt = new Date(lead.created_at || lead.createdAt);
      return createdAt >= since;
    });

    console.log(`⏰ Leads in last ${minutes} mins: ${recentLeads.length}`);
    return recentLeads;

  } catch (err) {
    console.error('❌ Leads API error:', err.response?.data || err.message);
    return [];
  }
}

module.exports = { fetchRecentLeads };
