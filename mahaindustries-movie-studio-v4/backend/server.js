/**
 * MAHAINDUSTRIES MOVIE STUDIO V4 — Secure AI Proxy Backend
 * Keeps all third-party AI API keys strictly on the server (.env).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, '..')));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '4.0.0',
    providers: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
      runway: Boolean(process.env.RUNWAY_API_KEY)
    }
  });
});

app.post('/api/ai/image', async (req, res) => {
  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'NOT CONNECTED: Configure OPENAI_API_KEY or GEMINI_API_KEY in backend/.env' });
  }
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Prompt required' });
  res.json({ status: 'ready', message: 'Forward prompt to configured Image Generation provider from server.js', prompt });
});

app.post('/api/ai/video', async (req, res) => {
  if (!process.env.RUNWAY_API_KEY) {
    return res.status(503).json({ error: 'NOT CONNECTED: Configure RUNWAY_API_KEY in backend/.env' });
  }
  res.json({ status: 'ready', message: 'Forward video generation request to Runway/Veo provider from server.js' });
});

app.post('/api/ai/voice', async (req, res) => {
  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(503).json({ error: 'NOT CONNECTED: Configure ELEVENLABS_API_KEY in backend/.env' });
  }
  res.json({ status: 'ready', message: 'Forward TTS request to ElevenLabs provider from server.js' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`MAHAINDUSTRIES V4 Backend Proxy listening on http://localhost:${PORT}`));
