const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

const webhookRouter = require('./routes/webhook');
app.use('/webhook', webhookRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Chatbase Lead Notifier', version: '1.0.0' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
