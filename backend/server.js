/**
 * MAHAINDUSTRIES MOVIE STUDIO V4 — Secure AI Proxy Backend (Live Gemini API + Static Studio)
 * Keeps all third-party AI API keys strictly on the server (.env / Render Environment).
 */
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '4.1.0',
    providers: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
      runway: Boolean(process.env.RUNWAY_API_KEY)
    }
  });
});

// Live Google Gemini API Script & Scene Breakdown Generator
app.post('/api/ai/script', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'NOT CONNECTED: Add GEMINI_API_KEY in Render Environment Variables or backend/.env' });
  }
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Prompt required' });
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const body = {
      contents: [{
        parts: [{
          text: `Write a short 3-scene cinematic movie script in Hindi and English based on this idea: "${prompt}". Format each scene starting with "SCENE 1 - ...", "SCENE 2 - ...", "SCENE 3 - ..." with visual cues (temple/galaxy/horror/battle/fire) and short dramatic dialogues.`
        }]
      }]
    };
    const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || 'Gemini API error' });
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ status: 'ok', script: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/image', async (req, res) => {
  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'NOT CONNECTED: Configure OPENAI_API_KEY or GEMINI_API_KEY in backend/.env' });
  }
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Prompt required' });
  res.json({ status: 'ready', message: 'Image prompt received by backend proxy', prompt });
});

app.post('/api/ai/video', async (req, res) => {
  if (!process.env.RUNWAY_API_KEY) {
    return res.status(503).json({ error: 'NOT CONNECTED: Configure RUNWAY_API_KEY in backend/.env' });
  }
  res.json({ status: 'ready', message: 'Video generation request received by backend proxy' });
});

app.post('/api/ai/voice', async (req, res) => {
  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(503).json({ error: 'NOT CONNECTED: Configure ELEVENLABS_API_KEY in backend/.env' });
  }
  res.json({ status: 'ready', message: 'Voice generation request received by backend proxy' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`MAHAINDUSTRIES V4.1 Backend Proxy listening on port ${PORT}`));
