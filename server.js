const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/static', express.static(path.join(__dirname, 'static')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});
app.get('/qr', (req, res) => {
  const qrPath = path.join(__dirname, '..', 'sessions', 'qr.png');
  if (!fs.existsSync(qrPath)) return res.status(404).send('QR not found. Start the bot to generate a pairing QR.');
  res.sendFile(qrPath);
});
app.get('/session', (req, res) => {
  const sess = path.join(__dirname, '..', 'sessions', 'auth_info.json');
  if (!fs.existsSync(sess)) return res.status(404).send('Session not found.');
  res.download(sess, 'auth_info.json');
});
app.listen(PORT, () => console.log('Web UI running on port', PORT));
