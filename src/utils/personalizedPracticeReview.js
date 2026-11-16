import { supabase } from './supabase';

async function invoke(action, body = {}) {
  const { data, error } = await supabase.functions.invoke('review-personalized-practice', { body: { action, ...body } });
  if (error) throw new Error(error.message || 'teacher_review_unavailable');
  return data;
}

export const listPracticeDrafts = schoolId => invoke('list', { schoolId });
export const reviewPracticeDraft = (schoolId, draftId, decision, reason = '') => invoke('review', { schoolId, draftId, decision, reason });
