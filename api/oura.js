export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, start_date, end_date, token } = req.query;
  if (!endpoint || !token) return res.status(400).json({ error: 'Missing endpoint or token' });

  try {
    const url = `https://api.ouraring.com/v2/usercollection/${endpoint}?start_date=${start_date || '2024-01-01'}&end_date=${end_date || new Date().toISOString().slice(0, 10)}`;
    const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
