import { useCallback, useEffect, useMemo, useState } from 'react';
import { getQuestionStimuli, inspectQuestionMedia, preloadQuestionMedia } from '../utils/questionMedia';

export default function useQuestionMedia(questions) {
  const key = JSON.stringify(questions.map(q => [q.id, q.itemVersion, q.reviewStatus, q.approvedModes, inspectQuestionMedia(q).status, getQuestionStimuli(q)]));
  const [check, setCheck] = useState({ key: null, status: 'loading' });
  const snapshot = useMemo(() => questions, [key]);
  useEffect(() => {
    let active = true;
    preloadQuestionMedia(snapshot).then(() => {
      if (active) setCheck({ key, status: 'ready' });
    }, () => {
      if (active) setCheck({ key, status: 'error' });
    });
    return () => { active = false; };
  }, [key, snapshot]);
  const onMediaFailure = useCallback(() => setCheck({ key, status: 'error' }), [key]);
  return { mediaStatus: check.key === key ? check.status : 'loading', onMediaFailure };
}
