import { useEffect, useRef } from 'react';
import { getAllStudents } from '../../utils/storage';
import { getTotalStars } from '../../utils/scoring';
import { supabase } from '../../config/supabase';

export default function RankWatcher({ student, onLoginRank, onRankShift, refreshToken = 0 }) {
  const previous = useRef({ id: null, rank: null });
  useEffect(() => {
    let active = true;
    if (!student || student.role === 'teacher' || student.isDemo) return;
    const checkRank = async () => {
      onLoginRank({ loading: true });
      try {
        let currentRank; let total;
        if (student.authVerified) {
          const { data, error } = await supabase.rpc('student_class_rank');
          if (error) throw error;
          currentRank = data?.rank; total = data?.total;
        } else {
          const rows = await getAllStudents({ throwOnError: true });
          const peers = rows.filter(s => !s.isDemo && (!s.role || s.role === 'student')
            && s.school_id === student.school_id && s.class === student.class && s.id !== student.id);
          peers.push(student);
          peers.sort((a,b) => (Number(b.xp)||0)-(Number(a.xp)||0) || getTotalStars(b.questProgress)-getTotalStars(a.questProgress));
          currentRank = peers.findIndex(s => s.id === student.id)+1; total = peers.length;
        }
        if (!active) return;
        if (!Number.isInteger(currentRank) || currentRank < 1 || !Number.isInteger(total) || total < currentRank) {
          onLoginRank(null); return;
        }
        onLoginRank({ rank: currentRank, total });
        if (previous.current.id === student.id && previous.current.rank && previous.current.rank !== currentRank) {
          onRankShift({ direction: currentRank < previous.current.rank ? 'up' : 'down', newRank: currentRank, oldRank: previous.current.rank });
        }
        previous.current = { id: student.id, rank: currentRank };
      } catch {
        if (active) onLoginRank(null);
      }
    };
    checkRank();
    return () => { active = false; };
  }, [student?.id, student?.school_id, student?.class, student?.xp, student?.questProgress, student?.authVerified, student?.isDemo, onLoginRank, onRankShift, refreshToken]);
  return null;
}
