const path = require('path');
const fs = require('fs');

function getChatbotName(chatbotId) {
  try {
    const jsonPath = path.join(__dirname, '../../chatbots.json');
    const map = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    return map[chatbotId] || `未知 Agent (${chatbotId})`;
  } catch (err) {
    console.error('❌ Failed to load chatbots.json:', err.message);
    return `Agent (${chatbotId})`;
  }
}

module.exports = { getChatbotName };
