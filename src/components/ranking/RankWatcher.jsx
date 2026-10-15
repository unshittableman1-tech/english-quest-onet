import { useEffect, useRef } from 'react';
import { getAllStudents } from '../../utils/storage';
import { calculateRankScore } from '../../utils/scoring';

const RANK_KEY = 'onet_prev_class_rank';

export default function RankWatcher({ student, onLoginRank, onRankShift }) {
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!student || student.role === 'teacher' || student.isDemo) {
      isFirstLoad.current = true; // Reset on logout
      return;
    }

    const checkRank = async () => {
      try {
        // Fetch all students (this uses the 5-min cache)
        const allStudents = await getAllStudents();
        
        // Filter to same class and exclude teachers/demo
        let classStudents = allStudents.filter(s => s.role !== 'teacher' && !s.isDemo && s.class === student.class);
        
        // If the current student is not in the list (e.g. just registered and cache is stale), add them
        if (!classStudents.find(s => s.id === student.id)) {
          classStudents.push(student);
        } else {
          // Update the list with the current student's latest data to ensure accurate ranking for themselves
          classStudents = classStudents.map(s => s.id === student.id ? student : s);
        }

        // Calculate scores and sort
        const withScores = classStudents.map(s => ({
          ...s,
          rankScore: calculateRankScore(s)
        })).sort((a, b) => b.rankScore - a.rankScore);

        // Find current rank
        const currentRankIndex = withScores.findIndex(s => s.id === student.id);
        const currentRank = currentRankIndex + 1;
        const totalInClass = withScores.length;

        // Get previous rank from localStorage
        const prevRankRaw = localStorage.getItem(RANK_KEY);
        const previousRank = prevRankRaw ? parseInt(prevRankRaw, 10) : null;

        if (isFirstLoad.current) {
          // On login (first mount with a student)
          if (currentRank > 0) {
            onLoginRank({ rank: currentRank, total: totalInClass });
            localStorage.setItem(RANK_KEY, currentRank.toString());
          }
          isFirstLoad.current = false;
        } else {
          // Subsequent updates (XP or score changed during gameplay)
          if (previousRank && currentRank > 0 && currentRank !== previousRank) {
            // Rank changed!
            const direction = currentRank < previousRank ? 'up' : 'down';
            onRankShift({ direction, newRank: currentRank, oldRank: previousRank });
            localStorage.setItem(RANK_KEY, currentRank.toString());
          } else if (!previousRank && currentRank > 0) {
            // Edge case: no prev rank but it's an update, just set it
            localStorage.setItem(RANK_KEY, currentRank.toString());
          }
        }
      } catch (err) {
        console.error("RankWatcher error:", err);
      }
    };

    checkRank();

  }, [
    student?.id, 
    student?.xp, 
    student?.badges?.length, 
    student?.badgeStats?.mistakesFixed, 
    student?.questProgress 
    // We only trigger when score-related fields change
  ]);

  return null; // Background component, no UI
}
