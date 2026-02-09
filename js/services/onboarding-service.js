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
 * Sync employment end date from onboarding to the linked RTW record.
 * RTW uses a 2-year retention period (vs 6-year for onboarding).
 */
export async function syncEndDateToRTW(rtwRecordId, employmentEndDate) {
  const sb = getSupabase();
  let deletionDueDate = null;
  if (employmentEndDate) {
    const d = new Date(employmentEndDate + 'T00:00:00');
    d.setFullYear(d.getFullYear() + 2);
    deletionDueDate = d.toISOString().slice(0, 10);
  }
  const { error } = await sb
    .from('rtw_records')
    .update({
      employment_end_date: employmentEndDate,
      deletion_due_date: deletionDueDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rtwRecordId);
  if (error) throw error;
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

  // Create a notification for the pending RTW check
  try {
    await sb.from('notifications').insert({
      source_app: 'rtw-checker',
      severity: 'warning',
      title: 'Pending Onboarding RTW: ' + fullName,
      message: fullName + ' has been onboarded and requires a right to work check.',
      action_url: 'https://rtw.immersivecore.network/#/record/' + data.id + '/edit',
      record_id: data.id,
    });
  } catch (_) { /* non-blocking */ }

  return data;
}
