export async function handler(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { code, code_verifier, redirect_uri } = body;
    if (!code || !code_verifier || !redirect_uri) {
      return { statusCode: 400, body: JSON.stringify({ error: 'missing_params' }) };
    }

    const clientId = process.env.NETLIFY_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.NETLIFY_SPOTIFY_CLIENT_SECRET;

    // Fail early with a clear error if the server-side credentials are not set
    if (!clientId || !clientSecret) {
      console.error('exchange-token: missing NETLIFY_SPOTIFY_CLIENT_ID or NETLIFY_SPOTIFY_CLIENT_SECRET');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'server_missing_client_credentials', message: 'Server-side Spotify client_id/secret not configured' })
      };
    }
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirect_uri);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('code_verifier', code_verifier);

    // ensure we have a fetch implementation (global fetch on Node 18+ or fallback to node-fetch)
    let fetchImpl = global.fetch;
    if (!fetchImpl) {
      try {
        // lazy-require so that environments with global fetch don't need node-fetch
        // node-fetch v2 uses require; v3 is ESM-only.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        fetchImpl = require('node-fetch');
      } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: 'no_fetch_available' }) };
      }
    }

    console.log('exchange-token: contacting Spotify token endpoint', { redirect_uri: redirect_uri, hasClientId: !!clientId });

    const res = await fetchImpl('https://accounts.spotify.com/api/token', {
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
