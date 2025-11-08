// Frontend Spotify Logout Helper (React/Next.js)
// Place this in: frontend/src/lib/spotifyLogout.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function disconnectSpotifyFlow({ player } = {}) {
  try {
    // 1. Call backend to delete tokens / unlink provider
    await fetch('/api/spotify/disconnect', {
      method: 'POST',
      credentials: 'include'
    });

    // 2. If you have a Spotify Web Playback SDK player instance, disconnect it
    if (player && typeof player.pause === 'function') {
      try { await player.pause(); } catch (e) { /* ignore */ }
      try { player.disconnect(); } catch (e) { /* ignore */ }
    }

    // 3. Sign out locally from Supabase (revokes refresh tokens)
    // Use global scope to end all sessions or 'local' to only end this session
    await supabase.auth.signOut({ scope: 'local' });

    // 4. Remove any client-side tokens and cookies (best-effort)
    localStorage.removeItem('sb-access-token');
    localStorage.removeItem('sb-refresh-token');
    
    // cookie deletion (if using cookies)
    document.cookie = 'sb-access-token=; max-age=0; path=/';
    document.cookie = 'sb-refresh-token=; max-age=0; path=/';

    // 5. Open Spotify logout page in a small popup to clear Spotify cookies
    const popup = window.open(
      'https://www.spotify.com/logout/',
      'spotify_logout',
      'width=600,height=600'
    );
    setTimeout(() => {
      try { popup?.close(); } catch (e) {}
    }, 1800);

    // 6. Refresh the app UI (or navigate)
    window.location.reload();
  } catch (err) {
    console.error('Disconnect flow error', err);
    // fallback UX
  }
}
