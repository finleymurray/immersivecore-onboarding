import { getSupabase } from '../supabase-client.js';

/**
 * Create a new user via the create-user Edge Function.
 * Only callable by managers.
 */
export async function createUser({ email, full_name, role, password }) {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await sb.functions.invoke('create-user', {
    body: { email, full_name, role, password },
  });

  if (error) throw new Error(error.message || 'Failed to create user');
  if (data?.error) throw new Error(data.error);
  return data;
}

/**
 * Update a user's role via the manage-user Edge Function.
 * Only callable by managers. Cannot modify own account.
 */
export async function updateUserRole(userId, role) {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await sb.functions.invoke('manage-user', {
    body: { action: 'update_role', user_id: userId, role },
  });

  if (error) throw new Error(error.message || 'Failed to update user role');
  if (data?.error) throw new Error(data.error);
  return data;
}

/**
 * Delete a user via the manage-user Edge Function.
 * Only callable by managers. Cannot delete own account.
 */
export async function deleteUser(userId) {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await sb.functions.invoke('manage-user', {
    body: { action: 'delete', user_id: userId },
  });

  if (error) throw new Error(error.message || 'Failed to delete user');
  if (data?.error) throw new Error(data.error);
  return data;
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
