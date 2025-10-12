import fetch from 'node-fetch';

export async function handler(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { code, code_verifier, redirect_uri } = body;
    if (!code || !code_verifier || !redirect_uri) {
      return { statusCode: 400, body: JSON.stringify({ error: 'missing_params' }) };
    }

    const clientId = process.env.NETLIFY_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.NETLIFY_SPOTIFY_CLIENT_SECRET;
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirect_uri);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('code_verifier', code_verifier);

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const json = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify(json) };
    }

    return { statusCode: 200, body: JSON.stringify(json) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
