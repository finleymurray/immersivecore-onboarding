import { getSupabase } from '../supabase-client.js';
import { SUPABASE_URL } from '../../config.js';

/**
 * Helper: call an Edge Function with the current user's JWT.
 * Uses raw fetch so we get proper error messages from the function.
 */
async function callEdgeFunction(functionName, body) {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

/**
 * Create a new user via the create-user Edge Function.
 * Only callable by managers.
 */
export async function createUser({ email, full_name, role, password }) {
  return callEdgeFunction('create-user', { email, full_name, role, password });
}

/**
 * Update a user's role via the manage-user Edge Function.
 * Only callable by managers. Cannot modify own account.
 */
export async function updateUserRole(userId, role) {
  return callEdgeFunction('manage-user', { action: 'update_role', user_id: userId, role });
}

/**
 * Delete a user via the manage-user Edge Function.
 * Only callable by managers. Cannot delete own account.
 */
export async function deleteUser(userId) {
  return callEdgeFunction('manage-user', { action: 'delete', user_id: userId });
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
