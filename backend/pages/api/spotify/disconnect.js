// Backend Route - Spotify Disconnect API
// Place this in: backend/pages/api/spotify/disconnect.js (Next.js API route) or express route

import { getSessionFromReq } from '../../lib/auth'; // adapt to your auth middleware
import { db } from '../../lib/db'; // adapt: DB client used in aura-app
import { createClient } from '@supabase/supabase-js';

const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = await getSessionFromReq(req); // implement per your project
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const userId = user.id;

    // 1) Remove Spotify tokens from your app DB (example table: spotify_tokens)
    await db('spotify_tokens').where({ user_id: userId }).del();

    // 2) Optionally unlink a Supabase identity for provider 'spotify' if it's linked and allowed
    // NOTE: unlinkIdentity() must be called client-side as user, but admin can remove rows directly if you store mapping
    // If you stored provider info manually, remove it. Example:
    await db('user_providers').where({ user_id: userId, provider: 'spotify' }).del();

    // 3) Revoke Supabase sessions (Admin/management) - sign out all sessions
    // Use Management API to revoke sessions: POST /admin/users/{id}/logout - (example)
    // If supabase-management-js is available:
    // const mgmt = new SupabaseManagementAPI({ accessToken: process.env.SUPABASE_MANAGEMENT_KEY });
    // await mgmt.users.logout(userId); // adapt to your library
    
    // Fallback: call client SDK signOut via front-end/require user to sign out

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('spotify disconnect error', err);
    res.status(500).json({ error: 'disconnect_failed' });
  }
}
