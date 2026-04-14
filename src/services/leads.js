const axios = require('axios');

async function fetchRecentLeads(chatbotId, minutes = 65) {
  try {
    const now = new Date();
    const since = new Date(now.getTime() - minutes * 60 * 1000);
    const startDate = since.toISOString().split('T')[0];

    const response = await axios.get(
      'https://www.chatbase.co/api/v1/get-leads',
      {
        headers: { Authorization: `Bearer ${process.env.CHATBASE_API_KEY}` },
        params: { chatbotId, startDate, size: 100 },
        timeout: 10000,
      }
    );

    // 正確路徑：collectedCustomers.data
    const leads = response.data?.collectedCustomers?.data || [];
    console.log(`📋 Total leads: ${leads.length}`);

    const recentLeads = leads.filter(lead => {
      return new Date(lead.created_at) >= since;
    });

    console.log(`⏰ Recent leads (${minutes}min): ${recentLeads.length}`);
    return recentLeads;

  } catch (err) {
    console.error('❌ Leads API error:', err.response?.data || err.message);
    return [];
  }
}

module.exports = { fetchRecentLeads };
