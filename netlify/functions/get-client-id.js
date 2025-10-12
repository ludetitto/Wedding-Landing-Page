export async function handler() {
  const clientId = process.env.NETLIFY_SPOTIFY_CLIENT_ID || '';
  return {
    statusCode: 200,
    body: JSON.stringify({ clientId })
  };
}
