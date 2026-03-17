const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const port = process.env.PORT || 10000;

// Render pe Chromium paths - ek ke baad ek try karega
const findChrome = () => {
  const paths = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ].filter(Boolean);

  const fs = require('fs');
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        console.log('✅ Chrome found at:', p);
        return p;
      }
    } catch (_) {}
  }
  console.error('❌ Chrome not found in any known path!');
  return null;
};

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: findChrome(),
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
  client.initialize();
});

client.initialize().catch(err => {
  console.error('❌ Client init error:', err.message);
});

app.get('/', (req, res) => {
  res.send('WhatsApp Bot is running 🚀');
});

// Usage: /send?number=919876543210&msg=Hello
app.get('/send', async (req, res) => {
  try {
    const { number, msg } = req.query;
    if (!number || !msg) {
      return res.status(400).json({ error: 'number aur msg required hai' });
    }
    const chatId = number + '@c.us';
    await client.sendMessage(chatId, msg);
    console.log(`✅ Sent to ${number}: ${msg}`);
    res.json({ success: true, to: number, message: msg });
  } catch (err) {
    console.error('❌ Send error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
