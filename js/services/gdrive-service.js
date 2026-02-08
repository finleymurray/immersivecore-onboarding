import { getSupabase } from '../supabase-client.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config.js';

export async function uploadToGoogleDrive({ employeeName, fileName, fileBase64, mimeType, subfolder, sourceApp }) {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/gdrive-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      employee_name: employeeName,
      file_name: fileName,
      file_base64: fileBase64,
      mime_type: mimeType || 'application/pdf',
      subfolder: subfolder || 'Onboarding',
      source_app: sourceApp || 'onboarding',
    }),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to upload to Google Drive');
  return body;
}
