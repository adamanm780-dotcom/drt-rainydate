const N8N_WEBHOOK = 'https://adaman780.app.n8n.cloud/webhook/rainydate-stars';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Body kann als String (text/plain) oder als Objekt (json) kommen
    let body;
    if (typeof req.body === 'string') {
      body = req.body;
    } else if (typeof req.body === 'object' && req.body !== null) {
      body = JSON.stringify(req.body);
    } else {
      // Lese raw body
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks).toString();
    }

    const upstream = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });

    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch {
      return res.status(502).json({ error: 'Ungültige Antwort von n8n', raw: text.slice(0, 200) });
    }
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Proxy-Fehler' });
  }
};
