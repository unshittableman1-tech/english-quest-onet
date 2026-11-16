import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createVocabularyCreditsClient, currentCreditStudentFixture } from '../utils/vocabularyCreditsPilot';

export default function useVocabularyCreditAccount({ enabled = true, fixture = currentCreditStudentFixture() } = {}) {
  const client = useMemo(() => createVocabularyCreditsClient(fixture), [fixture]);
  const [state, setState] = useState(null);
  const [roster, setRoster] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(enabled);
  const teacher = fixture.startsWith('teacher_');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const ticket = generation.current;
    await client.connect();
    const value = await client.call(teacher ? 'roster' : 'state');
    if (ticket === generation.current) { if (teacher) setRoster(value); else setState(value); }
    return value;
  }, [client, teacher]);
  useEffect(() => {
    if (!enabled) return;
    generation.current++;
    let active = true;
    setLoading(true); setError(''); setState(null); setRoster([]);
    (async () => {
      await client.connect(); const value = await client.call(teacher ? 'roster' : 'state');
      if (!active) return;
      if (teacher) setRoster(value); else setState(value);
    })().catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    const update = () => { refresh().catch(err => { if (active) setError(err.message); }); };
    window.addEventListener('vocabulary-credits-updated', update);
    window.addEventListener('online', update);
    return () => { active = false; generation.current++; window.removeEventListener('vocabulary-credits-updated', update); window.removeEventListener('online', update); };
  }, [enabled, client, teacher, refresh]);
  return { client, state, setState, roster, setRoster, loading, error, setError, refresh };
}
