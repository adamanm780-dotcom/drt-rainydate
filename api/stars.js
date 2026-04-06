// Vercel serverless proxy — leitet alle Anfragen an n8n weiter
// Kein CORS-Problem mehr: Browser → /api/proxy (gleiche Domain) → n8n (server-to-server)

const N8N_WEBHOOK = 'https://adaman780.app.n8n.cloud/webhook/rainydate-stars';

module.exports = async function handler(req, res) {
  // CORS-Header setzen (für alle Origins erlaubt)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const upstream = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });

    const text = await upstream.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: 'Ungültige Antwort von n8n', raw: text.slice(0, 200) });
    }

    return res.status(upstream.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: err.message || 'Proxy-Fehler' });
  }
};
