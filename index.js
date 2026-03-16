const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});
client.on('qr', (qr) => {
    console.log('Scan this QR with WhatsApp');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('WhatsApp Bot Ready!');
});

client.initialize();

app.get('/send', async (req,res)=>{
    const number = req.query.number;
    const msg = req.query.msg;

    const chatId = number + "@c.us";

    await client.sendMessage(chatId, msg);

    res.send("Message Sent");
});

app.listen(port, ()=>{
    console.log("Server running on port " + port);
});
