import { supabase } from '../config/supabase';
import { supabaseConfig } from '../config/runtimeMode';
import { getAICompanionIssue } from './aiCompanionErrors';

export async function requestMistakeExplanation({ questId, questionId }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('กรุณาเข้าสู่ระบบนักเรียนอีกครั้ง');
  const response = await fetch(`${supabaseConfig.url}/functions/v1/explain-mistake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ questId, questionId }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok && !payload.explanation) {
    const issue = getAICompanionIssue(payload.error);
    const error = new Error(issue.message);
    error.code = payload.error || 'unknown';
    error.kind = issue.kind;
    throw error;
  }
  return payload;
}
