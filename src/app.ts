import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import commands from './commands';
import express from 'express';
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const client = new Client({
    restartOnAuthFail: true,
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2410.1.html',
    },
    puppeteer: {
        headless: true,
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
    },
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, {
        small: true
    });

});

client.on('ready', () => {
    console.log('Client is ready!');
    app.listen(3000, () => {
        console.log('Server is listening on port 3000');
    });
});

client.on('message', msg => {
    for (const command of commands) {
        command.handle(msg);
    }
});

client.initialize();