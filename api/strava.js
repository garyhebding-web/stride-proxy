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
      const body = req.body || {};
      const params = new URLSearchParams();
      params.append('client_id', body.client_id || req.query.client_id || '');
      params.append('client_secret', body.client_secret || req.query.client_secret || '');
      params.append('refresh_token', body.refresh_token || req.query.refresh_token || '');
      params.append('grant_type', 'refresh_token');

      const r = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
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
