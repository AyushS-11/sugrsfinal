require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');

require('./db'); // init + seed

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();
wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
});

global.broadcast = (data) => {
    const msg = JSON.stringify(data);
    clients.forEach(c => { if (c.readyState === 1) c.send(msg); });
};

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/officers', require('./routes/officers'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/analytics', require('./routes/analytics'));             // 📊 Accountability + Overview
app.use('/api/civic', require('./routes/civic'));                     // 🌟 Citizen Community Hub
app.use('/api/notifications', require('./routes/notifications'));     // 🔔 Notification Intelligence
app.use('/api/feedback', require('./routes/feedback'));               // ⭐ Citizen Feedback
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`\n🏛️  SUGRS Backend → http://localhost:${PORT}`);
    console.log(`📡 WebSocket ready`);
    console.log(`🤖 Gemini: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY' ? 'Configured ✅' : 'Using keyword fallback'}\n`);
});
