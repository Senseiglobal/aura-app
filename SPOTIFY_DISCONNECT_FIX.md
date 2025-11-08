# Spotify Disconnect Fix Implementation

This directory contains the implementation for fixing the Spotify disconnect issue in aura-app.

## Problem

Spotify is not disconnecting properly after a user connects. After clicking "Disconnect Spotify", the user remains connected due to:

1. Deleting app-side tokens ≠ logging out of Spotify
2. Supabase signOut limitations (JWTs remain valid until expiry)
3. Spotify Web Playback SDK sessions persist
4. OAuth provider identity linked in Supabase

## Implementation Files

### Frontend
- **`frontend/src/lib/spotifyLogout.js`** - Complete disconnect flow including:
  - Backend API call to delete tokens
  - Web Playback SDK disconnection  
  - Supabase signOut
  - Local storage and cookie cleanup
  - Spotify logout popup

### Backend
- **`backend/pages/api/spotify/disconnect.js`** - API endpoint that:
  - Verifies user authentication
  - Deletes Spotify tokens from database
  - Removes provider associations
  - Handles session revocation

## Quick Start

### Usage Example

```javascript
import { disconnectSpotifyFlow } from './lib/spotifyLogout';

function DisconnectButton({ spotifyPlayer }) {
  const handleDisconnect = async () => {
    await disconnectSpotifyFlow({ player: spotifyPlayer });
  };

  return (
    <button onClick={handleDisconnect}>
      Disconnect Spotify
    </button>
  );
}
```

## Configuration Required

Before using, you must:

1. **Update database table names** in `disconnect.js`:
   - `spotify_tokens` → your actual token table
   - `user_providers` → your actual provider table

2. **Implement authentication middleware**:
   - Update `getSessionFromReq` import path
   - Update `db` import path

3. **Set environment variables**:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Implementation Checklist

- [ ] Adapt database table names to your schema
- [ ] Implement auth middleware (`getSessionFromReq`)
- [ ] Configure environment variables
- [ ] Test disconnect flow
- [ ] Verify tokens are deleted from database
- [ ] Verify localStorage/cookies are cleared
- [ ] Check that Spotify API calls fail after disconnect
- [ ] Ensure background token refresh jobs stop

## Testing

### Before Fix
1. Connect Spotify
2. Click Disconnect
3. **Problem**: Tokens still work, user still connected

### After Fix
1. Connect Spotify
2. Click Disconnect  
3. **Expected**: Tokens deleted, player stopped, session cleared, API calls fail

## Troubleshooting

**Tokens still work after disconnect?**
- Check if background job is refreshing tokens
- Verify database deletion is working
- Check if tokens are cached elsewhere

**Player still active?**
- Ensure `player.disconnect()` is called
- Check browser console for errors

**User still logged into Spotify?**
- Verify Spotify logout popup opens
- Check if popup is blocked by browser
- Try `https://accounts.spotify.com/en/logout`

## Resources

- [Full Implementation Guide (Gist)](https://gist.github.com/Senseiglobal/e7548fb871f967397c95912e6d64e972)
- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api/)
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase unlinkIdentity](https://supabase.com/docs/reference/javascript/auth-unlinkidentity)

## Important Notes

### Spotify Token Revocation
Spotify does not provide a straightforward token revocation endpoint. The solution:
- Delete app's stored refresh tokens
- Open Spotify logout page in popup to clear browser cookies

### Supabase signOut Behavior  
- `scope: 'local'` - ends only current session
- `scope: 'global'` - ends all sessions
- Note: Access JWTs remain valid until expiry

---

**Implementation Date**: November 8, 2025  
**Based on**: ChatGPT conversation analysis
**Full Guide**: https://gist.github.com/Senseiglobal/e7548fb871f967397c95912e6d64e972
