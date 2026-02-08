import { getSupabase } from '../supabase-client.js';

const BUCKET = 'onboarding-scans';

export async function uploadPaperScan(onboardingId, file) {
  const path = `${onboardingId}/${file.name}`;
  const { error } = await getSupabase()
    .storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });
  if (error) throw new Error('Failed to upload paper scan: ' + error.message);
  return path;
}

export async function getPaperScanUrl(scanPath) {
  if (!scanPath) return null;
  const { data, error } = await getSupabase()
    .storage
    .from(BUCKET)
    .createSignedUrl(scanPath, 300);
  if (error) throw new Error('Failed to get scan URL: ' + error.message);
  return data?.signedUrl || null;
}
