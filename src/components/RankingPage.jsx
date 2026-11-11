import UIIcon, { UIIconText } from './UIIcon';
import React, { useState, useEffect, useMemo } from 'react';
import { getPreTestResult } from '../utils/preTestResult';
import { useApp } from '../App';
import { getAllStudents } from '../utils/storage';
import { calculateRankScore, getRankingTier, getTotalStars } from '../utils/scoring';
import { loadRankingStudents } from '../utils/rankingData';

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
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState('all'); // 'all' or specific class name
  const [visibleCount, setVisibleCount] = useState(10);
  
  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedTierForModal, setSelectedTierForModal] = useState(null);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchStudents = async () => {
      setLoading(true);
      setLoadError(false);
      setStudents([]);
      try {
        const rows = await loadRankingStudents(student, options => getAllStudents({ ...options, forceRefresh: reload > 0 }));
        if (active) setStudents(rows);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchStudents();
    return () => { active = false; };
  }, [student?.id, student?.school_id, student?.isDemo, reload]);

  // Derive available rooms from student data
  const availableRooms = useMemo(() => {
    const rooms = [...new Set(students.map(s => s.class).filter(Boolean))].sort();
    return rooms;
  }, [students]);

  // Filtered students by selected room
  const filteredStudents = useMemo(() => {
    const rows = students.map(row => student?.avatar && row.id === student?.id && row.school_id === student?.school_id
      && Boolean(row.isDemo) === Boolean(student?.isDemo) ? { ...row, avatar: student.avatar } : row);
    if (selectedRoom === 'all') return rows;
    return rows.filter(s => s.class === selectedRoom);
  }, [students, selectedRoom, student?.id, student?.school_id, student?.isDemo, student?.avatar]);

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

      const rankScore = calculateRankScore(s);
      
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
        totalStars: getTotalStars(s.questProgress),
        skillScore,
        pre, post
      };
    });

    switch (activeTab) {
      case 'overall':
        list.sort((a, b) => b.rankScore - a.rankScore || b.totalStars - a.totalStars || b.totalAnswered - a.totalAnswered || b.accuracy - a.accuracy);
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

  const handleOpenTierInfo = (tierName = null, targetStudent = student) => {
    setSelectedTierForModal(tierName);
    setSelectedStudentForModal(targetStudent);
    setShowTierModal(true);
  };

  return (
    <main className="ranking-page" aria-label="อันดับการฝึกและผลการเรียนรู้">
      <div className="ranking-shell">
      
      {/* Header */}
      <header className="ranking-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(student?.role === 'teacher' ? 'teacher' : 'map')} className="ranking-back" aria-label="กลับหน้า Quest Map">
            <span className="text-xl"><UIIcon value={"←"} /></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="ranking-title-art">
              <span className="text-2xl drop-shadow-md"><UIIcon value={"🏆"} /></span>
            </div>
            <div>
              <h1>Leaderboard</h1>
              <p>
                <UIIconText value={selectedRoom === 'all' ? `ทั้งหมด ${students.length} คน` : `🏫 ${selectedRoom} · ${leaderboard.length} คน`} />
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="ranking-next" aria-label="ภารกิจเพิ่มอันดับ">
        <div>
          <span>ภารกิจแนะนำ</span>
          <strong>เล่นด่านถัดไปเพื่อสะสม XP</strong>
          <p>ทำภารกิจ ตอบให้ถูก และผ่านด่านเพื่อเลื่อน Tier</p>
        </div>
        <button type="button" className="eq-btn" onClick={() => navigate('map')}>เล่นด่านถัดไป <UIIcon value="→" /></button>
      </section>


      {/* Room Filter */}
      {availableRooms.length > 1 && (
        <div className="ranking-room-filter hide-scrollbar">
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
      <div className="ranking-tabs-wrap">
        <LeaderboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <p className="ranking-metric-note" role="status">
          {activeTab === 'overall' ? 'อันดับ XP แสดงการสะสมจากกิจกรรม ไม่ใช่ระดับความสามารถภาษาอังกฤษทั้งหมด'
            : activeTab === 'growth' ? 'Growth แสดงส่วนต่างคะแนนก่อน–หลังที่บันทึกไว้ ไม่ได้ยืนยันว่ากิจกรรมเป็นสาเหตุของพัฒนาการ'
            : activeTab === 'accuracy' ? 'Accuracy แสดงสัดส่วนการตอบถูกตามข้อมูลที่บันทึก โดยใช้เงื่อนไขการจัดอันดับเดิม'
            : 'อันดับนี้แสดงข้อมูลการฝึกเฉพาะด้าน ไม่ใช้สรุปความสามารถภาษาอังกฤษทั้งหมด'}
        </p>
        {student?.isDemo && <p className="ranking-source-note">ข้อมูลตัวอย่างสำหรับทดลอง ไม่ใช่อันดับนักเรียนจริง</p>}
      </div>


      {/* Skill Selector */}
      {activeTab === 'skill' && (
        <div className="ranking-skill-select">
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
      <div className="ranking-results" id="ranking-results" role="tabpanel" aria-labelledby={`ranking-tab-${activeTab}`} aria-busy={loading}>
        {loading ? (
          <div className="ranking-feedback" role="status">กำลังโหลดอันดับ…</div>
        ) : loadError ? (
          <div className="ranking-feedback" role="alert"><p>ยังโหลดอันดับไม่ได้ ไม่แสดงข้อมูลตัวอย่างแทนข้อมูลจริง</p><button type="button" className="eq-btn ghost" onClick={() => setReload(value => value + 1)}>ลองโหลดอันดับอีกครั้ง</button></div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center p-10 bg-white/5 rounded-2xl mx-4 border border-amber-200">
            <div className="text-4xl mb-3"><UIIcon value={"🤔"} /></div>
            <p className="text-slate-500 font-bold mb-1">ยังไม่มีผู้ติดอันดับ</p>
            {activeTab === 'accuracy' && <p className="text-xs text-slate-500">ต้องตอบอย่างน้อย 50 ข้อ และไม่กดเร็วกว่า 3 วิ</p>}
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <TopThreePodium topThree={topThree} activeTab={activeTab} onTierClick={handleOpenTierInfo} />

            <div className="ranking-board">
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
                onTierClick={handleOpenTierInfo}
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
          student={selectedStudentForModal || student}
          selectedTierName={selectedTierForModal} 
          onClose={() => { setShowTierModal(false); setSelectedStudentForModal(null); }}
        />
      )}
      </div>
    </main>
  );
}
