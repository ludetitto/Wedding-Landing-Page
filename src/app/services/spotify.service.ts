// Minimal SpotifyService for PKCE auth, searching tracks and adding tracks to a playlist.
// Note: you must register your app in Spotify Dashboard and set redirect URI.

import { SPOTIFY_CLIENT_ID } from '../config/spotify-config';

export class SpotifyService {
  clientId = SPOTIFY_CLIENT_ID || 'REPLACE_WITH_CLIENT_ID';
  redirectUri = window.location.origin + '/spotify-callback.html'; // ensure this matches the registered redirect URI
  scopes = [
    'playlist-modify-public',
    'playlist-modify-private',
    'playlist-read-private',
    'user-read-private'
  ].join(' ');

  // Helpers: generate random string
  randomString(length = 128) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) result += chars[array[i] % chars.length];
    return result;
  }

  async sha256(plain: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hash);
  }

  base64UrlEncode(buffer: Uint8Array) {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(buffer[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async generateCodeChallenge(verifier: string) {
    const hashed = await this.sha256(verifier);
    return this.base64UrlEncode(hashed);
  }

  // Start PKCE login
  async startLogin() {
    const codeVerifier = this.randomString(64);
    localStorage.setItem('spotify_code_verifier', codeVerifier);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    // fetch client id from serverless function
    try {
      const cidRes = await fetch('/.netlify/functions/get-client-id');
      const cidJson = await cidRes.json();
      const clientId = cidJson.clientId || this.clientId;

      const url = new URL('https://accounts.spotify.com/authorize');
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('redirect_uri', this.redirectUri);
      url.searchParams.set('code_challenge_method', 'S256');
      url.searchParams.set('code_challenge', codeChallenge);
      url.searchParams.set('scope', this.scopes);
      window.location.href = url.toString();
    } catch (e) {
      console.error('Unable to fetch client id for Spotify login', e);
    }
  }

  // Exchange code for tokens (call this on redirect page)
  async exchangeCodeForToken(code: string) {
    const codeVerifier = localStorage.getItem('spotify_code_verifier') || '';
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: codeVerifier
    });

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    const json = await res.json();
    if (json.access_token) {
      localStorage.setItem('spotify_token', JSON.stringify(json));
    }
    return json;
  }

  // Refresh token
  async refreshToken() {
    const tokenJson = localStorage.getItem('spotify_token');
    if (!tokenJson) return null;
    const token = JSON.parse(tokenJson);
    if (!token.refresh_token) return null;

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
      client_id: this.clientId
    });

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    const json = await res.json();
    if (json.access_token) {
      // merge and store
      const merged = { ...token, ...json };
      localStorage.setItem('spotify_token', JSON.stringify(merged));
      return merged;
    }
    return null;
  }

  getAccessToken(): string | null {
    const tokenJson = localStorage.getItem('spotify_token');
    if (!tokenJson) return null;
    const token = JSON.parse(tokenJson);
    return token.access_token || null;
  }

  async searchTracks(query: string, limit = 10) {
    const token = this.getAccessToken();
    if (!token) throw new Error('No access token');
    const url = new URL('https://api.spotify.com/v1/search');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'track');
    url.searchParams.set('limit', String(limit));

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  }

  async addTracksToPlaylist(playlistId: string, uris: string[]) {
    const token = this.getAccessToken();
    if (!token) throw new Error('No access token');
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris, position: 0 })
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }
}
