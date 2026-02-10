import { getSupabase } from '../supabase-client.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config.js';

/**
 * Create a new user via the create-user Edge Function.
 * Only callable by managers.
 */
export async function createUser({ email, full_name, role, password }) {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();

  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, full_name, role, password }),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to create user');
  return body;
}

/**
 * Update a user's role via the manage-user Edge Function.
 * Only callable by managers. Cannot modify own account.
 */
export async function updateUserRole(userId, role) {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action: 'update_role', user_id: userId, role }),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to update user role');
  return body;
}

/**
 * Delete a user via the manage-user Edge Function.
 * Only callable by managers. Cannot delete own account.
 */
export async function deleteUser(userId) {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action: 'delete', user_id: userId }),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to delete user');
  return body;
}

/**
 * Fetch all user profiles (managers only — RLS enforced).
 */
export async function fetchAllProfiles() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}
