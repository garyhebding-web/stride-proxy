export default async function handler(req, res) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  try {
    // ── Token Refresh ──
    if (action === 'token') {
      const { client_id, client_secret, refresh_token } = req.body || {};
      const r = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id,
          client_secret,
          refresh_token,
          grant_type: 'refresh_token'
        })
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    // ── Proxy Activities ──
    if (action === 'activities') {
      const token = req.headers.authorization;
      const page = req.query.page || 1;
      const r = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=100&page=${page}`,
        { headers: { Authorization: token } }
      );
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    return res.status(400).json({ error: 'Unknown action. Use ?action=token or ?action=activities' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
