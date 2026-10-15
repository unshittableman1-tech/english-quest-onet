import UIIcon, { UIIconText } from './UIIcon';
import React, { useState, useEffect, useMemo } from 'react';
import { getPreTestResult } from '../utils/preTestResult';
import { useApp } from '../App';
import { getAllStudents } from '../utils/storage';
import { calculateRankScore, getRankingTier } from '../utils/scoring';

// New Components
import LeaderboardTabs from './ranking/LeaderboardTabs';
import TopThreePodium from './ranking/TopThreePodium';
import MyRankCard from './ranking/MyRankCard';
import LeaderboardList from './ranking/LeaderboardList';
import RankingTips from './ranking/RankingTips';
import TierInfoModal from './ranking/TierInfoModal';

const SKILLS = [
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'signs', label: 'Signs' },
  { id: 'directions', label: 'Directions' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'reading', label: 'Reading' },
  { id: 'grammar', label: 'Grammar' }
];

export default function RankingPage() {
  const { student, navigate } = useApp();
  const [activeTab, setActiveTab] = useState('overall');
  const [activeSkill, setActiveSkill] = useState('vocabulary');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState('all'); // 'all' or specific class name
  const [visibleCount, setVisibleCount] = useState(10);
  
  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedTierForModal, setSelectedTierForModal] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const allStudents = await getAllStudents();
      // Filter out teachers/demo
      const validStudents = allStudents.filter(s => s.role !== 'teacher' && !s.isDemo);
      
      let listToUse = validStudents;
      if (listToUse.length < 3) {
        const demoData = [
          { id: 'demo1', name: 'ฟาตีมะ', avatar: '', xp: 2000, level: 7, class: 'ป.6/1', isDemo: true, rankingStats: { totalAnswered: 100, totalCorrect: 95, averageTimePerQuestion: 4 }, badgeStats: { pretestScore: 40, posttestScore: 80, streakDays: 5, mistakesFixed: 20, correctBySkill: { vocabulary: 15 } } },
          { id: 'demo2', name: 'อาหมัด', avatar: '', xp: 1800, level: 6, class: 'ป.6/2', isDemo: true, rankingStats: { totalAnswered: 80, totalCorrect: 70, averageTimePerQuestion: 5 }, badgeStats: { pretestScore: 30, posttestScore: 60, streakDays: 3, mistakesFixed: 10, correctBySkill: { vocabulary: 10 } } },
          { id: 'demo3', name: 'อาดีล', avatar: '', xp: 1500, level: 6, class: 'ป.6/1', isDemo: true, rankingStats: { totalAnswered: 60, totalCorrect: 40, averageTimePerQuestion: 6 }, badgeStats: { pretestScore: 20, posttestScore: 40, streakDays: 1, mistakesFixed: 5, correctBySkill: { vocabulary: 5 } } },
        ];
        listToUse = [...listToUse, ...demoData.slice(listToUse.length)];
      }

      setStudents(listToUse);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  // Derive available rooms from student data
  const availableRooms = useMemo(() => {
    const rooms = [...new Set(students.map(s => s.class).filter(Boolean))].sort();
    return rooms;
  }, [students]);

  // Filtered students by selected room
  const filteredStudents = useMemo(() => {
    if (selectedRoom === 'all') return students;
    return students.filter(s => s.class === selectedRoom);
  }, [students, selectedRoom]);

  // Prepare leaderboard data
  const leaderboard = useMemo(() => {
    if (!filteredStudents.length) return [];
    let list = [...filteredStudents];

    list = list.map(s => {
      const bStats = s.badgeStats || {};
      const rStats = s.rankingStats || {};
      const rawFastGuess = rStats.fastGuessCount || 0;
      const mistakesFromBank = Object.values(s.mistakeBank || {}).reduce((acc, m) => {
        const count = (m.correctInReview || 0) + (m.mastered ? 2 : 0);
        return acc + count;
      }, 0);
      const mistakesFixed = Math.max(bStats.mistakesFixed || 0, mistakesFromBank);
      const fastGuessCount = Math.max(0, rawFastGuess - (mistakesFromBank * 5));
      const adjustedRankingStats = { ...rStats, fastGuessCount };

      const rankScore = s.isDemo ? s.xp : calculateRankScore({ ...s, rankingStats: adjustedRankingStats }, rawFastGuess);
      
      const pre = getPreTestResult(s).percent;
      const post = bStats.posttestScore || 0;
      const growthScore = pre === null ? 0 : Math.max(0, post - pre);

      const totalCorrect = rStats.totalCorrect || 0;
      const totalAnswered = rStats.totalAnswered || 0;
      const accuracy = totalAnswered >= 50 && rStats.averageTimePerQuestion >= 3 
        ? Math.round((totalCorrect / totalAnswered) * 100) 
        : (s.isDemo ? Math.round((totalCorrect/totalAnswered)*100) : 0);

      const streakDays = bStats.streakDays || 0;

      let skillScore = 0;
      if (activeTab === 'skill') {
        skillScore = bStats.correctBySkill?.[activeSkill] || 0;
      }

      return {
        ...s,
        rankingStats: adjustedRankingStats,
        rankScore,
        growthScore,
        accuracy,
        totalAnswered,
        avgTime: rStats.averageTimePerQuestion || 0,
        streakDays,
        mistakesFixed,
        skillScore,
        pre, post
      };
    });

    switch (activeTab) {
      case 'overall':
        list.sort((a, b) => b.rankScore - a.rankScore);
        break;
      case 'growth':
        list = list.filter(a => a.pre !== null && a.post > 0 || a.isDemo);
        list.sort((a, b) => b.growthScore - a.growthScore);
        break;
      case 'accuracy':
        list = list.filter(a => (a.totalAnswered >= 50 && a.avgTime >= 3) || a.isDemo);
        list.sort((a, b) => b.accuracy - a.accuracy);
        break;
      case 'streak':
        list = list.filter(a => a.streakDays > 0);
        list.sort((a, b) => b.streakDays - a.streakDays);
        break;
      case 'mistakes':
        list = list.filter(a => a.mistakesFixed > 0);
        list.sort((a, b) => a.mistakesFixed - b.mistakesFixed); // Ascending sort: smallest number = Rank 1!
        break;
      case 'skill':
        list = list.filter(a => a.skillScore > 0);
        list.sort((a, b) => b.skillScore - a.skillScore);
        break;
      case 'fastguess':
        list = list.filter(a => (a.rankingStats?.fastGuessCount || 0) > 0);
        list.sort((a, b) => (b.rankingStats?.fastGuessCount || 0) - (a.rankingStats?.fastGuessCount || 0));
        break;
      default: break;
    }

    return list;
  }, [filteredStudents, activeTab, activeSkill]);


  const myRankIndex = leaderboard.findIndex(s => s.id === student?.id);
  const myData = myRankIndex >= 0 ? leaderboard[myRankIndex] : null;

  const topThree = leaderboard.slice(0, 3);

  useEffect(() => { setVisibleCount(10); }, [activeTab, activeSkill, selectedRoom]);

  const handleOpenTierInfo = (tierName = null) => {
    setSelectedTierForModal(tierName);
    setShowTierModal(true);
  };

  return (
    <div className="ranking-page min-h-screen text-white overflow-x-hidden font-sans pb-16">
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(student?.role === 'teacher' ? 'teacher' : 'map')} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <span className="text-xl"><UIIcon value={"←"} /></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.5)]">
              <span className="text-2xl drop-shadow-md"><UIIcon value={"🏆"} /></span>
            </div>
            <div>
              <h1 className="text-2xl font-black drop-shadow-md leading-tight">Leaderboard</h1>
              <p className="text-xs text-slate-500">
                <UIIconText value={selectedRoom === 'all' ? `ทั้งหมด ${students.length} คน` : `🏫 ${selectedRoom} · ${leaderboard.length} คน`} />
              </p>
            </div>
          </div>
        </div>
      </header>


      {/* Room Filter */}
      {availableRooms.length > 1 && (
        <div className="relative z-10 flex gap-2 overflow-x-auto pb-2 px-4 mb-2 hide-scrollbar">
          <button
            onClick={() => setSelectedRoom('all')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
              selectedRoom === 'all'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-white/10 text-slate-600 border-amber-200 hover:bg-white/20'
            }`}
          >
            <UIIcon value={"🌐"} /> ทั้งหมด ({students.length})
          </button>
          {availableRooms.map(room => {
            const count = students.filter(s => s.class === room).length;
            return (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  selectedRoom === room
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-fuchsia-400/50 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'bg-white/10 text-slate-600 border-amber-200 hover:bg-white/20'
                }`}
              >
                <UIIcon value={"🏫"} /> {room} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="relative z-10">
        <LeaderboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>


      {/* Skill Selector */}
      {activeTab === 'skill' && (
        <div className="relative z-10 px-3 mb-4">
          <select 
            className="w-full bg-white/10 border border-amber-300 rounded-xl px-4 py-2 text-white font-bold outline-none focus:border-violet-400"
            value={activeSkill}
            onChange={e => setActiveSkill(e.target.value)}
          >
            {SKILLS.map(s => <option key={s.id} value={s.id} className="text-slate-800">{s.label}</option>)}
          </select>
        </div>
      )}

      {/* Error / Empty States */}
      <div className="relative z-10">
        {loading ? (
          <div className="flex justify-center p-10"><div className="w-10 h-10 border-4 border-amber-300 border-t-amber-400 rounded-full animate-spin" /></div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center p-10 bg-white/5 rounded-2xl mx-4 border border-amber-200">
            <div className="text-4xl mb-3"><UIIcon value={"🤔"} /></div>
            <p className="text-slate-500 font-bold mb-1">ยังไม่มีผู้ติดอันดับ</p>
            {activeTab === 'accuracy' && <p className="text-xs text-slate-500">ต้องตอบอย่างน้อย 50 ข้อ และไม่กดเร็วกว่า 3 วิ</p>}
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <TopThreePodium topThree={topThree} activeTab={activeTab} />

            <div className="bg-[#F8F9FA] rounded-t-[32px] pt-6 min-h-screen">
              {/* My Rank Card */}
              {student && !student.isDemo && myData && (
                <MyRankCard 
                  student={myData} 
                  rankIndex={myRankIndex} 
                  activeTab={activeTab}
                  leaderboardLength={leaderboard.length}
                  onTierClick={() => handleOpenTierInfo(getRankingTier(myData.rankScore).name)}
                />
              )}

              {/* Leaderboard List (Rank 4-10) */}
              <LeaderboardList 
                students={leaderboard.slice(0, visibleCount)} 
                startIndex={3} 
                activeTab={activeTab} 
                onTierClick={(tierName) => handleOpenTierInfo(tierName)} 
              />
              {visibleCount < leaderboard.length && <div className="ranking-more-wrap"><button type="button" className="eq-btn" onClick={() => setVisibleCount(count => count + 10)}>ดูอันดับถัดไปอีก 10 คน</button></div>}

              {/* Tips */}
              <RankingTips onOpenModal={(tierName) => handleOpenTierInfo(tierName)} />
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showTierModal && (
        <TierInfoModal 
          student={student} 
          selectedTierName={selectedTierForModal} 
          onClose={() => setShowTierModal(false)} 
        />
      )}
      
    </div>
  );
}
