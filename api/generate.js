module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider, body } = req.body;

    if (provider === 'openai') {
      const key = process.env.OPENAI_KEY;
      if (!key) return res.status(500).json({ error: 'OPENAI_KEY not set on server' });

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    }

    if (provider === 'fal') {
      const key = process.env.FAL_KEY;
      if (!key) return res.status(500).json({ error: 'FAL_KEY not set on server' });

      const response = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${key}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    }

    if (provider === 'fal-status') {
      const key = process.env.FAL_KEY;
      if (!key) return res.status(500).json({ error: 'FAL_KEY not set on server' });

      const { requestId } = body;
      const response = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}/status`, {
        headers: { 'Authorization': `Key ${key}` },
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    }

    if (provider === 'fal-result') {
      const key = process.env.FAL_KEY;
      if (!key) return res.status(500).json({ error: 'FAL_KEY not set on server' });

      const { requestId } = body;
      const response = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}`, {
        headers: { 'Authorization': `Key ${key}` },
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    }

    return res.status(400).json({ error: 'Unknown provider' });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
