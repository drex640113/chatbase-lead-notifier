const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const webhookRouter = require('./routes/webhook');
app.use('/webhook', webhookRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'AEGIS Lead Notifier', version: '3.0.0' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
