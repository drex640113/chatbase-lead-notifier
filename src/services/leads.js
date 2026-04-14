const axios = require('axios');

async function fetchRecentLeads(chatbotId, minutes = 65) {
  try {
    const now = new Date();
    const since = new Date(now.getTime() - minutes * 60 * 1000);
    const startDate = since.toISOString().split('T')[0];

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

    // 正確欄位是 collectedCustomers
    const leads = response.data?.collectedCustomers || [];
    console.log(`📋 Total leads fetched: ${leads.length}`);
    if (leads.length > 0) {
      console.log('📋 First lead sample:', JSON.stringify(leads[0], null, 2));
    }

    const recentLeads = leads.filter(lead => {
      const createdAt = new Date(lead.created_at);
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
