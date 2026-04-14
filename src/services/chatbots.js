// Chatbot ID 對照表
const CHATBOT_MAP = {
  'Id8VKSqDV52fwAvuxaeUO': 'Zeon Pavilion Square',
  '7C0w-Fa-09mbTSvmz5dMm': 'The Conlay',
  'f60d_vFJxvzF3Awy0-2ca': 'Stark Tower',
  'n214uxtnn59XRn7OWahya': 'Queens Residences',
  'DubaoiHvt2A2B2nts8NB9': '啟端感覺統合',
  'bh6LCjHu--9uXxjwkXODc': '東盈AIXIA智能系統',
  'CjWnDRR4xrB1bfrWpIk3M': '精誠機構',
  'RMKy80Ma6hv-I7Cu5wX5o': '約瑟夫智匯',
  'BZob-istj1e2yAwBDNhqW': '貳家國際 AI智能助理',
  'J-av8tHTU8_aKQ_2RHUoC': 'SFH',
  'fNR3c7pjsiLWpOzF7kcIo': 'ASE',
};

function getChatbotName(chatbotId) {
  return CHATBOT_MAP[chatbotId] || `未知 Agent (${chatbotId})`;
}

module.exports = { getChatbotName };
