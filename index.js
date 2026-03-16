const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const port = process.env.PORT || 10000;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
    headless: true
  }
});

client.on('qr', (qr) => {
  console.log('=== Scan this QR code with WhatsApp ===');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Bot Ready!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Auth failed:', msg);
});

client.on('disconnected', (reason) => {
  console.log('⚠️ Disconnected:', reason);
});

client.initialize().catch(err => {
  console.error('❌ Client init error:', err.message);
});

// Health check
app.get('/', (req, res) => {
  res.send('WhatsApp Bot is running 🚀');
});

// Send message API
// Usage: /send?number=919876543210&msg=Hello
app.get('/send', async (req, res) => {
  try {
    const { number, msg } = req.query;

    if (!number || !msg) {
      return res.status(400).json({ error: 'number aur msg query params required hain' });
    }

    const chatId = number + '@c.us';
    await client.sendMessage(chatId, msg);

    console.log(`✅ Message sent to ${number}: ${msg}`);
    res.json({ success: true, message: 'Message sent!', to: number });

  } catch (err) {
    console.error('❌ Send error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
