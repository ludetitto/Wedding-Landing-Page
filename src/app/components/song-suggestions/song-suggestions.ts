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
    // On load, check if we have a token and get user info
    const userEl = document.getElementById('spotify-user') as HTMLElement | null;
    const feedbackEl = document.getElementById('suggest-feedback') as HTMLElement | null;

    const fetchMeAndUpdate = async (token: string | null) => {
      if (!token) {
        if (userEl) {
          userEl.textContent = '(no autenticado)';
          userEl.className = '';
        }
        if (feedbackEl) { feedbackEl.textContent = 'Para buscar y agregar canciones necesitás iniciar sesión con Spotify.'; feedbackEl.hidden = false; }
        setAuthenticatedUI(false);
        return false;
      }
      try {
        const res = await fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          if (feedbackEl) { feedbackEl.textContent = 'Token inválido o expirado. Pega un token nuevo o reiniciá login.'; feedbackEl.hidden = false; }
          if (userEl) { userEl.textContent = '(token inválido)'; userEl.className = ''; }
          setAuthenticatedUI(false);
          return false;
        }
        const me = await res.json();
        if (userEl) { userEl.textContent = `${me.display_name || me.id}`; userEl.className = 'spotify-badge'; }
        if (feedbackEl) { feedbackEl.hidden = true; }
        setAuthenticatedUI(true);
        return true;
      } catch (e) {
        if (feedbackEl) { feedbackEl.textContent = 'Error al verificar usuario.'; feedbackEl.hidden = false; }
        if (userEl) { userEl.textContent = '(error)'; userEl.className = ''; }
        setAuthenticatedUI(false);
        return false;
      }
    };

    // run initial check
    (async () => {
      const token = this.spotify.getAccessToken();
      await fetchMeAndUpdate(token);
    })();
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

    // Login button and toggleable UI
    const loginBtn = document.getElementById('spotify-login');
    const searchContainer = document.querySelector('.spotify-search') as HTMLElement | null;
    const selectedContainer = document.getElementById('spotify-selected') as HTMLElement | null;

    const setAuthenticatedUI = (authed: boolean) => {
      // when not authenticated show only the login button
      if (loginBtn) loginBtn.style.display = authed ? 'none' : '';
      if (searchContainer) searchContainer.style.display = authed ? '' : 'none';
      if (selectedContainer) selectedContainer.style.display = authed ? '' : 'none';
    };

    // initialize UI based on current token
    const initialToken = this.spotify.getAccessToken();
    setAuthenticatedUI(!!initialToken);

    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.spotify.startLogin());
    }

    // Search
    const autocompleteInput = document.getElementById('spotify-autocomplete') as HTMLInputElement | null;
    const autocompleteResults = document.getElementById('spotify-autocomplete-results') as HTMLElement | null;
    const selectedNameEl = document.getElementById('spotify-selected-name') as HTMLElement | null;
    const addSelectedBtn = document.getElementById('spotify-add-selected') as HTMLButtonElement | null;
    let debounceTimer: any = null;
    let currentTracks: any[] = [];
    let selectedTrackUri: string | null = null;
    let selectedIndex: number = -1; // for keyboard navigation

    const highlightSelected = () => {
      if (!autocompleteResults) return;
      const items = Array.from(autocompleteResults.querySelectorAll('.ac-item')) as HTMLElement[];
      items.forEach((it, i) => {
        if (i === selectedIndex) it.classList.add('ac-selected'); else it.classList.remove('ac-selected');
      });
      // ensure highlighted item is visible
      if (selectedIndex >= 0 && items[selectedIndex]) {
        try { items[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { /* ignore in old browsers */ }
      }
      const track = currentTracks[selectedIndex];
      if (track) {
        selectedTrackUri = track.uri;
        if (selectedNameEl) selectedNameEl.textContent = `${track.name} — ${track.artists.map((a:any)=>a.name).join(', ')}`;
        if (addSelectedBtn) addSelectedBtn.disabled = false;
      } else {
        selectedTrackUri = null;
        if (selectedNameEl) selectedNameEl.textContent = '';
        if (addSelectedBtn) addSelectedBtn.disabled = true;
      }
    };

    const clearResults = () => {
      if (autocompleteResults) autocompleteResults.innerHTML = '';
      currentTracks = [];
      selectedTrackUri = null;
      if (selectedNameEl) selectedNameEl.textContent = '';
      if (addSelectedBtn) addSelectedBtn.disabled = true;
    };

    if (autocompleteInput) {
      autocompleteInput.addEventListener('input', () => {
        const q = autocompleteInput.value.trim();
        if (debounceTimer) clearTimeout(debounceTimer);
        if (!q) { clearResults(); return; }
        debounceTimer = setTimeout(async () => {
          try {
            const data = await this.spotify.searchTracks(q, 8);
            const tracks = data.tracks.items || [];
            currentTracks = tracks;
            if (autocompleteResults) {
              // reset any previous keyboard selection
              selectedIndex = -1;
              autocompleteResults.innerHTML = tracks.map((t: any, idx: number) => {
                const thumb = t.album?.images && (t.album.images[1]?.url || t.album.images[2]?.url || '');
                const artists = t.artists.map((a:any)=>a.name).join(', ');
                return `
                  <div class="ac-item" data-idx="${idx}" role="option">
                    <img src="${thumb}" alt="Album art" class="ac-thumb" />
                    <div class="ac-meta">
                      <div class="ac-title">${t.name}</div>
                      <div class="ac-sub">${artists}</div>
                    </div>
                  </div>
                `;
              }).join('');

              // attach handlers
              autocompleteResults.querySelectorAll('.ac-item').forEach((el: Element) => {
                el.addEventListener('click', () => {
                  const idx = parseInt((el as HTMLElement).getAttribute('data-idx') || '0', 10);
                  const track = currentTracks[idx];
                  if (!track) return;
                  selectedTrackUri = track.uri;
                  if (selectedNameEl) selectedNameEl.textContent = `${track.name} — ${track.artists.map((a:any)=>a.name).join(', ')}`;
                  if (addSelectedBtn) addSelectedBtn.disabled = false;
                });
                el.addEventListener('mouseover', () => {
                  const idx = parseInt((el as HTMLElement).getAttribute('data-idx') || '0', 10);
                  selectedIndex = idx;
                  highlightSelected();
                });
              });
            }
          } catch (e: any) {
            const feedbackEl = document.getElementById('suggest-feedback') as HTMLElement | null;
            if (feedbackEl) { feedbackEl.textContent = `Error de búsqueda: ${e.message || e}`; feedbackEl.hidden = false; }
          }
        }, 300);
      });

      // keyboard navigation: ArrowUp, ArrowDown, Enter, Escape
      autocompleteInput.addEventListener('keydown', (ev: KeyboardEvent) => {
        if (!autocompleteResults) return;
        const maxIndex = Math.max(0, currentTracks.length - 1);
        if (ev.key === 'ArrowDown') {
          ev.preventDefault();
          selectedIndex = Math.min(maxIndex, selectedIndex + 1);
          highlightSelected();
        } else if (ev.key === 'ArrowUp') {
          ev.preventDefault();
          selectedIndex = Math.max(-1, selectedIndex - 1);
          highlightSelected();
        } else if (ev.key === 'Enter') {
          ev.preventDefault();
          if (selectedIndex >= 0 && currentTracks[selectedIndex]) {
            const track = currentTracks[selectedIndex];
            selectedTrackUri = track.uri;
            if (selectedNameEl) selectedNameEl.textContent = `${track.name} — ${track.artists.map((a:any)=>a.name).join(', ')}`;
            if (addSelectedBtn) addSelectedBtn.disabled = false;
            // optionally clear input
            // autocompleteInput.value = '';
          }
        } else if (ev.key === 'Escape') {
          ev.preventDefault();
          clearResults();
        }
      });
    }

    if (addSelectedBtn) {
      addSelectedBtn.addEventListener('click', async () => {
        const feedbackEl = document.getElementById('suggest-feedback') as HTMLElement | null;
        if (!selectedTrackUri) {
          if (feedbackEl) { feedbackEl.textContent = 'Seleccioná una pista primero.'; feedbackEl.hidden = false; }
          return;
        }
        try {
          await this.spotify.addTracksToPlaylist(this.playlistId, [selectedTrackUri]);
          if (feedbackEl) { feedbackEl.textContent = '¡Canción agregada a la playlist!'; feedbackEl.hidden = false; }
          // reset selection
          if (autocompleteInput) autocompleteInput.value = '';
          clearResults();
        } catch (err: any) {
          if (feedbackEl) { feedbackEl.textContent = `Error al agregar: ${err.error?.message || err.message || err}`; feedbackEl.hidden = false; }
        }
      });
    }

    // Quick paste token for testing
    const tokenSetBtn = document.getElementById('spotify-token-set');
    if (tokenSetBtn) {
      tokenSetBtn.addEventListener('click', async () => {
        const token = prompt('Pega aquí el access_token de Spotify:');
        if (token) {
          const existing = { access_token: token };
          localStorage.setItem('spotify_token', JSON.stringify(existing));
          alert('Token guardado en localStorage bajo "spotify_token". Puedes usar búsqueda/Agregar ahora.');
          // update UI to authenticated state
          setAuthenticatedUI(true);
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
