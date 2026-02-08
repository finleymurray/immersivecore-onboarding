import { getSupabase } from '../supabase-client.js';

export async function fetchAllOnboarding() {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('onboarding_records')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchOnboarding(id) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('onboarding_records')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createOnboarding(record) {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  const payload = { ...record, created_by: user.id };

  const { data, error } = await sb
    .from('onboarding_records')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOnboarding(id, updates) {
  const sb = getSupabase();
  updates.updated_at = new Date().toISOString();
  const { data, error } = await sb
    .from('onboarding_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Create a partial RTW record linked to this onboarding record.
 * This inserts into the shared rtw_records table.
 */
export async function createLinkedRTWRecord(onboardingId, fullName, dateOfBirth) {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();

  const { data, error } = await sb
    .from('rtw_records')
    .insert({
      person_name: fullName,
      date_of_birth: dateOfBirth,
      onboarding_id: onboardingId,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
