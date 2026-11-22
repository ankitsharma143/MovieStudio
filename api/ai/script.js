export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'NOT CONNECTED: Add GEMINI_API_KEY in Vercel Project Settings > Environment Variables' });
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
    res.status(200).json({ status: 'ok', script: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
