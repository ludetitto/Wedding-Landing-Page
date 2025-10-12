import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-song-suggestions',
  templateUrl: './song-suggestions.html',
  styleUrls: ['./song-suggestions.css']
})
export class SongSuggestionsComponent implements OnInit {
  feedback: string | null = null;
  loading: boolean = false;

  // Playlist where suggestions will be added
  playlistId: string = '1wTn5OtC3L7fLqO0203yla';

  spotify = new SpotifyService();

  ngOnInit(): void {
    // Attach handlers to plain DOM elements to avoid requiring FormsModule
    const submitBtn = document.getElementById('suggest-submit');
    const form = document.getElementById('song-suggest-form');
    if (submitBtn && form) {
      submitBtn.addEventListener('click', async () => {
        const nameEl = document.getElementById('suggest-name') as HTMLInputElement | null;
        const inputEl = document.getElementById('suggest-input') as HTMLInputElement | null;
        const feedbackEl = document.getElementById('suggest-feedback') as HTMLElement | null;
        const submitBtnEl = submitBtn as HTMLButtonElement;

        const name = nameEl?.value || '';
        const suggestion = inputEl?.value || '';

        if (!suggestion) {
          if (feedbackEl) { feedbackEl.textContent = 'Por favor escribe una sugerencia.'; feedbackEl.hidden = false; }
          return;
        }

        const trackUri = this.normalizeToTrackUri(suggestion.trim());
        if (!trackUri) {
          if (feedbackEl) { feedbackEl.textContent = 'Ingresa un enlace o URI de pista válido.'; feedbackEl.hidden = false; }
          return;
        }

        const accessToken = this.spotify.getAccessToken();
        if (!accessToken) {
          if (feedbackEl) { feedbackEl.textContent = 'No hay token de Spotify. Iniciá sesión con Spotify primero.'; feedbackEl.hidden = false; }
          return;
        }

        submitBtnEl.disabled = true;
        submitBtnEl.textContent = 'Enviando...';
        if (feedbackEl) { feedbackEl.hidden = true; }

        try {
          const res = await fetch(`https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uris: [trackUri], position: 0 })
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = `Error al agregar la canción: ${res.status} ${res.statusText} ${err.error?.message || ''}`;
            if (feedbackEl) { feedbackEl.textContent = msg; feedbackEl.hidden = false; }
          } else {
            if (feedbackEl) { feedbackEl.textContent = '¡Gracias! La canción fue enviada.'; feedbackEl.hidden = false; }
            if (nameEl) nameEl.value = '';
            if (inputEl) inputEl.value = '';
          }
        } catch (e) {
          if (feedbackEl) { feedbackEl.textContent = 'Error de red al contactar Spotify.'; feedbackEl.hidden = false; }
        } finally {
          submitBtnEl.disabled = false;
          submitBtnEl.textContent = 'Enviar';
        }
      });
    }

    // Login button
    const loginBtn = document.getElementById('spotify-login');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.spotify.startLogin());
    }

    // Search
    const searchBtn = document.getElementById('spotify-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', async () => {
        const qEl = document.getElementById('spotify-search') as HTMLInputElement | null;
        const resultsEl = document.getElementById('spotify-results') as HTMLElement | null;
        const feedbackEl = document.getElementById('suggest-feedback') as HTMLElement | null;
        const q = qEl?.value || '';
        if (!q) return;
        try {
          const data = await this.spotify.searchTracks(q, 10);
          const tracks = data.tracks.items || [];
          if (resultsEl) {
            resultsEl.innerHTML = tracks.map((t: any) => `
              <div class="track-item">
                <img src="${t.album.images[2]?.url || ''}" alt="" />
                <div class="info">${t.name} — ${t.artists.map((a: any) => a.name).join(', ')}</div>
                <button data-uri="${t.uri}" class="add-track">Agregar</button>
              </div>
            `).join('');

            // attach add handlers
            resultsEl.querySelectorAll('.add-track').forEach((btn: Element) => {
              btn.addEventListener('click', async (ev) => {
                const uri = (btn as HTMLElement).getAttribute('data-uri') || '';
                try {
                  await this.spotify.addTracksToPlaylist(this.playlistId, [uri]);
                  if (feedbackEl) { feedbackEl.textContent = '¡Canción agregada!'; feedbackEl.hidden = false; }
                } catch (err: any) {
                  if (feedbackEl) { feedbackEl.textContent = `Error: ${err.error?.message || err.message || err}`; feedbackEl.hidden = false; }
                }
              });
            });
          }
        } catch (e: any) {
          if (feedbackEl) { feedbackEl.textContent = `Error de búsqueda: ${e.message || e}`; feedbackEl.hidden = false; }
        }
      });
    }
  }

  normalizeToTrackUri(input: string): string | null {
    const uriMatch = input.match(/spotify:track:[A-Za-z0-9]+/);
    if (uriMatch) return uriMatch[0];

    const urlMatch = input.match(/(?:open\.spotify\.com\/track\/|spotify\.com\/track\/)([A-Za-z0-9]+)/);
    if (urlMatch && urlMatch[1]) return `spotify:track:${urlMatch[1]}`;

    return null;
  }
}
