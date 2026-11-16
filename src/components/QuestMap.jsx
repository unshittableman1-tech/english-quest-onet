import UIIcon, { UIIconText } from './UIIcon';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Swords, LogOut, ArrowRight, Layers, GraduationCap, RotateCcw, RefreshCw, KeyRound, CheckCircle2, Pencil, Zap } from 'lucide-react';
import { useApp } from '../App';
import {ONET_2569,onetReviewKey} from '../data/onet2569Metadata';
import { xpToNextLevel, getLevelTitle, calculateRankScore, getRankingTier } from '../utils/scoring';
import { getStrategyKeys, saveStudent } from '../utils/storage';
import StudentAvatar from './StudentAvatar';
import AvatarStudio from './AvatarStudio';
import { loadAvatar } from '../utils/avatarProfile';
import { avatarOwnerKey, saveStudentAvatar } from '../utils/avatarApi';
import { getExamSessionFromCloud, getFinalExamResult, mergeArenaStatsFromCloud } from '../utils/arenaStorage';
import { QUEST_CHAPTERS, isQuestPassed, isChapterChallenge, getChapterMistakes, getNextQuestAction } from '../utils/questMapModel';
import QuestLessonCard from './quest/QuestLessonCard';
import AdventureQuestMap from './quest/AdventureQuestMap';
import QuestChapterCarousel from './quest/QuestChapterCarousel';
import SmartLearningPath from './SmartLearningPath';
import PageShell from './PageShell';
import { readVocabPractice } from '../utils/vocabPractice';
import { VOCAB_CATEGORIES } from '../data/vocabDrill';
import ResilientArtwork from './ResilientArtwork';
import { getQuestArtwork } from '../data/questArtwork';
import { applyQuestReviewGate, getQuestReviewBlocker } from '../utils/questReviewGate';
import { supabase } from '../utils/supabase';
import { fetchServerStudentProfile } from '../utils/studentProgressApi';
import { mergeRestoredStudentProfile } from '../utils/studentSessionMerge';
import '../styles/questExamWorld.css';
import '../styles/questLessonWorld.css';
import SkillsHubSection from './quest/SkillsHubSection';

const EXAM_POLL_MS = 30000;
const EXAM_ART = '/assets/exam-world';
const QUEST_VIEWS = [
  { id: 'lessons', title: 'บทเรียน', description: 'ฝึกตามแผนที่', art: '/assets/exam-world/map.png' },
  { id: 'skills', title: 'เทคนิค & ศัพท์', description: 'สูตรลัดและคลังคำ', art: '/assets/navigation/vocab-nav-3d-v1.png' },
  { id: 'exams', title: 'สนามสอบ', description: 'ลองทำข้อสอบ', art: '/assets/exam-world/trophy.png' },
];

function ExamArt({ art, className = '', lazy = false }) {
  return <img className={className} src={`${EXAM_ART}/${art}.webp`} alt="" decoding="async" loading={lazy ? 'lazy' : undefined} />;
}

import { CHAPTER3_LOCAL_MISSIONS, localChapter3Enabled, withLocalChapter3Missions } from '../data/chapter3LocalMissions';

export default function QuestMap({initialView='lessons'}) {
  const { student, setStudent, questProgress = {}, unlockedQuests = {}, navigate, handleLogout, viewFinalExamReport, chapter3EligibilityCheck, refreshChapter3Eligibility } = useApp();
  useEffect(() => {
    if (!student?.authVerified || student?.isDemo) return;
    let active = true;
    let refreshing = false;
    const refreshProgress = async () => {
      if (refreshing || document.visibilityState === 'hidden') return;
      refreshing = true;
      try {
        const { data } = await supabase.auth.getSession();
        const profile = await fetchServerStudentProfile(data?.session?.access_token);
        if (!active || !profile || profile.id !== student.id) return;
        setStudent(current => {
          if (current?.id !== profile.id) return current;
          const updated = mergeRestoredStudentProfile(current, profile);
          localStorage.setItem('eq_onet_current', JSON.stringify(updated));
          return updated;
        });
      } catch {
        return;
      } finally { refreshing = false; }
    };
    refreshProgress();
    window.addEventListener('focus', refreshProgress);
    document.addEventListener('visibilitychange', refreshProgress);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshProgress);
      document.removeEventListener('visibilitychange', refreshProgress);
    };
  }, [student?.id, student?.authVerified, student?.isDemo, setStudent]);
  const xpInfo = xpToNextLevel(student?.xp || 0);
  const xpRemaining = xpInfo.maxLevel ? 0 : Math.max(0, xpInfo.needed - xpInfo.current);
  const tier = getRankingTier(calculateRankScore(student));
  const next = getNextQuestAction(questProgress, unlockedQuests, student);
  const [selectedChapter, setSelectedChapter] = useState(next.chapter);
  const [view, setView] = useState(initialView);
  useEffect(()=>setView(initialView),[initialView]);
  const [filter, setFilter] = useState('all');
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  const [showAllQuestDetails, setShowAllQuestDetails] = useState(false);
  const avatar = useMemo(() => loadAvatar(student), [student]);
  const [showAvatarStudio, setShowAvatarStudio] = useState(false);
  const baseChapter = QUEST_CHAPTERS.find(c => c.id === selectedChapter) || QUEST_CHAPTERS[0];
  const chapter = useMemo(() => withLocalChapter3Missions(baseChapter), [baseChapter]);
  const effectiveUnlocked = useMemo(() => {
    if (chapter.id !== 3 || !localChapter3Enabled()) return unlockedQuests;
    const chapterOpen = unlockedQuests.question_words === true;
    return applyQuestReviewGate({ ...unlockedQuests, ...Object.fromEntries(CHAPTER3_LOCAL_MISSIONS.map(quest => [quest.id, chapterOpen])) }, student);
  }, [chapter.id, unlockedQuests, student]);
  const chapter3ReviewBlocker = getQuestReviewBlocker('strategy_boss', student);
  const chapter3BossMessage = chapter3ReviewBlocker
    ? `ทบทวนข้อผิด ${chapter3ReviewBlocker.name} ให้ครบก่อนเปิด Boss Gate`
    : student?.isDemo && student?.demoBossAccess
    ? 'Boss ทดลองพร้อมเล่น · ใช้ข้อมูลสังเคราะห์และไม่บันทึกคะแนนจริง'
    : chapter3EligibilityCheck?.loading ? 'กำลังตรวจผลภารกิจทั้ง 6 ด่านกับเซิร์ฟเวอร์…' : chapter3EligibilityCheck?.error || (chapter3EligibilityCheck?.status?.bossAllowed ? 'เซิร์ฟเวอร์ยืนยันผ่านภารกิจครบ 6/6 ด่านแล้ว · Boss Gate พร้อมเปิด' : chapter3EligibilityCheck?.status ? `เซิร์ฟเวอร์ยังไม่ยืนยันผ่าน: ${chapter3EligibilityCheck.status.missions.filter(mission => !mission.passed).map(mission => chapter.quests.find(quest => quest.id === mission.missionId)?.name || mission.missionId).join(', ')}` : student?.isDemo ? 'โหมดทดลองไม่มีการยืนยันผลจากบัญชีนักเรียนจริง' : 'ยังไม่มีผลตรวจสิทธิ์ Boss กรุณากดตรวจสิทธิ์อีกครั้ง');
  const completed = chapter.quests.filter(q => isQuestPassed(questProgress[q.id])).length;
  const mistakes = getChapterMistakes(student, chapter.id);
  const reviewReady = mistakes > 0;
  const visibleQuests = chapter.quests.filter(q => filter === 'all'
    || (filter === 'locked' && !effectiveUnlocked[q.id])
    || (filter === 'passed' && isQuestPassed(questProgress[q.id]))
    || (filter === 'ready' && effectiveUnlocked[q.id] && !isQuestPassed(questProgress[q.id])));
  const lessons = visibleQuests.filter(q => !isChapterChallenge(q));
  const challenges = visibleQuests.filter(isChapterChallenge);
  const displayedLessons = showAllQuestDetails ? lessons : [];
  const openQuest = quest => navigate(quest.learningLive ? 'chapter3-learning' : 'mission-select', quest.id);
  const lessonCard = quest => <QuestLessonCard key={quest.id} quest={quest} progress={questProgress[quest.id]} unlocked={!!effectiveUnlocked[quest.id]} badge={student?.badges?.includes(quest.id)} recommended={next.kind === 'quest' && next.quest.id === quest.id} selected={selectedQuestId === quest.id} onPlay={() => openQuest(quest)} />;
  const [examSession, setExamSession] = useState(null);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examRefreshing, setExamRefreshing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const pinDialog = useRef(null);
  const totalPassed = QUEST_CHAPTERS.map(withLocalChapter3Missions).reduce((sum, c) => sum + c.quests.filter(q => isQuestPassed(questProgress[q.id])).length, 0);
  const totalQuests = QUEST_CHAPTERS.map(withLocalChapter3Missions).reduce((sum, c) => sum + c.quests.length, 0);
  const allLessonsPassed = totalQuests > 0 && totalPassed === totalQuests;
  const vocabHistory = readVocabPractice(student?.isDemo ? null : student?.id);
  const practicedVocabCategories = Object.keys(vocabHistory.categories).length;
  const vocabSessions = Object.values(vocabHistory.categories).reduce((sum, item) => sum + item.sessions, 0);

  useEffect(() => {
    const sources = ['/learning/verbs/read-v1.png', ...chapter.quests.map(quest => getQuestArtwork(quest.id)).filter(Boolean)];
    const preloaded = sources.map(source => { const image = new Image(); image.src = source; return image; });
    return () => { preloaded.forEach(image => { image.onload = null; image.onerror = null; }); };
  }, [chapter]);

  const refreshExam = useCallback(async (showSpinner = false) => {
    if (showSpinner) setExamRefreshing(true);
    try {
      const session = await getExamSessionFromCloud();
      setExamSession(session);
      if (student?.id) {
        await mergeArenaStatsFromCloud(student.id);
        setExamSubmitted(!!getFinalExamResult(student.id));
      }
    } catch { /* Leave the last known status visible while offline. */ }
    finally { setExamRefreshing(false); }
  }, [student?.id]);

  useEffect(() => {
    refreshExam();
    const interval = setInterval(() => { if (!document.hidden) refreshExam(); }, EXAM_POLL_MS);
    return () => clearInterval(interval);
  }, [refreshExam]);

  useEffect(() => {
    if (showPinModal) pinDialog.current?.showModal();
    else pinDialog.current?.close();
  }, [showPinModal]);

  function handlePinSubmit(event) {
    event.preventDefault();
    if (!examSession?.isOpen || examSubmitted) {
      setPinError('การสอบยังไม่เปิด หรือคุณส่งข้อสอบแล้ว');
      return;
    }
    if (!examSession.pin || pinInput.trim() !== String(examSession.pin).trim()) {
      setPinError('รหัส PIN ไม่ถูกต้อง กรุณาตรวจสอบกับคุณครู');
      return;
    }
    setShowPinModal(false);
    setPinInput('');
    setPinError('');
    navigate('final-exam', 'final_exam');
  }

  function tabKeys(event) {
    const tabs = [...event.currentTarget.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(document.activeElement);
    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    const target = offset ? tabs[(index + offset + tabs.length) % tabs.length] : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : null;
    if (target) { event.preventDefault(); target.focus(); target.click(); }
  }

  function selectQuestFromMap(quest) {
    setSelectedQuestId(quest.id);
  }

  function selectChapter(chapterId) {
    setSelectedChapter(chapterId);
    setFilter('all');
    setSelectedQuestId(null);
    setShowAllQuestDetails(false);
  }

  function showRecommendedQuest(questId) {
    const destination = QUEST_CHAPTERS.find(item => item.quests.some(quest => quest.id === questId));
    if (!destination) return;
    setSelectedChapter(destination.id);
    setSelectedQuestId(questId);
    setShowAllQuestDetails(false);
    setFilter('all');
    requestAnimationFrame(() => {
      const heading = document.getElementById('qm-adventure-title');
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: 'start' });
    });
  }

  const demoNote = student?.isDemo && <p className="qm-demo-note">โหมดทดลองเล่น · XP และ Badge จะไม่ถูกบันทึก <button onClick={() => navigate('student-login')}>เข้าสู่ระบบนักเรียน</button></p>;

  return (
    <PageShell veil={0.72} className={`eq-quest-page ${view === 'exams' ? 'eq-exam-world' : view === 'skills' ? 'eq-skills-world' : 'eq-lesson-world'}`} right={
      <details className="qm-account">
        <summary><span className="qm-avatar"><StudentAvatar student={student} config={avatar} label="" /></span><span>{student?.name || 'ผู้เรียน'}</span></summary>
        <div className="qm-account-menu">
          <p>{student?.isDemo ? 'โหมดทดลองเล่น' : `ชั้น ${student?.class} เลขที่ ${student?.number}`}</p>
          <button onClick={() => setShowAvatarStudio(true)}><Pencil size={16} />แต่งอวตาร์</button>
          {student?.isDemo && <button onClick={() => navigate('student-login')}><GraduationCap size={16} />เข้าสู่ระบบนักเรียน</button>}
          <button onClick={handleLogout}><LogOut size={16} />ออกจากระบบ</button>
        </div>
      </details>
    }>
    {showAvatarStudio && <AvatarStudio key={student?.id || avatarOwnerKey(student)} student={student} initial={avatar} onClose={() => setShowAvatarStudio(false)} onSave={async (next, options) => {
      const owner = avatarOwnerKey(student);
      let result;
      try {
        result = await saveStudentAvatar(student, next, undefined, { demoScenario: options?.demoScenario });
      } catch (err) {
        result = { avatar: normalizeAvatar(next), temporary: false };
      }
      if (!result?.avatar) {
        result = { avatar: normalizeAvatar(next), temporary: false };
      }
      setStudent(current => {
        const base = current || student;
        const updated = { ...base, avatar: result.avatar, ...(result.temporary ? {} : { avatarReceipt: owner }) };
        saveStudent(updated);
        return updated;
      });
      return result;
    }} />}
    <div className="quest-workspace">
      <div className="qm-shell">
        <section className="qm-player" aria-label="ความก้าวหน้าผู้เรียน">
          <div><strong>Level {student?.level || 1}</strong><span>{getLevelTitle(student?.level || 1)}</span></div>
          <div className="qm-xp"><div><span>{student?.xp || 0} XP</span><span><UIIconText value={xpInfo.maxLevel ? 'Level สูงสุดแล้ว' : `เหลืออีก ${xpRemaining} XP ถึง Level ${(student?.level || 1) + 1}`} /></span></div><progress value={xpInfo.pct} max="100" aria-label={xpInfo.maxLevel ? 'ถึง Level สูงสุดแล้ว' : `ความก้าวหน้า Level ปัจจุบัน เหลืออีก ${xpRemaining} XP`} /></div>
          <div className="qm-player-extra"><span>{tier.name}</span><span>{student?.badges?.length || 0} Badge</span></div>
        </section>
        {view === 'exams' && demoNote}

        <div className="qm-adventure-banner">
        <div className="qm-page-heading">
          {view === 'lessons' && <img className="qm-hero-compass" src="/assets/exam-world/compass.webp" alt="" width="62" height="62" />}
          {view === 'skills' && <img className="qm-hero-compass" src="/assets/navigation/vocab-nav-3d-v1.png" alt="" width="56" height="56" />}
          {view === 'exams' && <img className="qm-hero-compass" src="/assets/exam-world/trophy.png" alt="" width="56" height="56" />}
          <div>
            <p className="qm-eyebrow">
              {view === 'skills' ? 'คลังความรู้และเทคนิค' : view === 'exams' ? 'สนามประลองความพร้อม' : 'โลกแห่งการผจญภัย'}
            </p>
            <h1>
              {view === 'skills' ? 'Skill & Vocab' : view === 'exams' ? 'Exam Arena' : 'Quest Map'}
            </h1>
          </div>
        </div>
        <div className="qm-banner-progress">
          {view === 'skills' ? (
            <>
              <span>ฝึกศัพท์แล้ว <strong>{practicedVocabCategories}/{VOCAB_CATEGORIES.length}</strong> หมวด</span>
              <progress value={practicedVocabCategories} max={VOCAB_CATEGORIES.length || 1} aria-label="หมวดคำศัพท์ที่ฝึกแล้ว" aria-valuetext={`${practicedVocabCategories} จาก ${VOCAB_CATEGORIES.length} หมวด`} />
            </>
          ) : (
            <>
              <span>พิชิตแล้ว <strong>{totalPassed}/{totalQuests}</strong> จุดหมาย</span>
              <progress value={totalPassed} max={totalQuests || 1} aria-label="จุดหมายที่พิชิตแล้ว" aria-valuetext={`${totalPassed} จาก ${totalQuests} จุดหมาย`} />
            </>
          )}
        </div>
        <section className={`qm-next ${next.kind === 'review' ? 'requires-review' : ''}`} aria-labelledby="qm-next-title">
          <div className="qm-next-copy">
            <p className="qm-eyebrow">
              {view === 'skills'
                ? 'คลังความรู้ 2 เสาหลัก'
                : next.kind === 'review'
                ? allLessonsPassed ? 'ผ่านครบทุกด่านแล้ว · เสริมความชำนาญต่อ' : 'ทบทวนก่อนเดินทางต่อ'
                : next.kind === 'complete' ? 'ครบทุกภารกิจแล้ว' : 'ภารกิจถัดไป'}
            </p>
            <h2 id="qm-next-title">
              {view === 'skills'
                ? 'สูตรลัด 13 Part & คลังศัพท์ 33 หมวด'
                : next.kind === 'quest' ? 'พร้อมเดินทางต่อ'
                : next.kind === 'review' ? `ทบทวนข้อผิดในบท ${next.chapter}`
                : next.kind === 'complete' ? 'พร้อมท้าทายสนามสอบ' : 'ตรวจสอบเส้นทางการเรียน'}
            </h2>
          </div>
          <button
            className="qm-primary qm-continue"
            onClick={() => {
              if (view === 'skills') {
                navigate('technique-hub');
              } else {
                next.kind === 'quest' ? navigate('mission-select', next.quest.id) : next.kind === 'review' ? navigate('review') : setView(next.kind === 'complete' ? 'exams' : 'lessons');
              }
            }}
          >
            {view === 'skills' ? 'เปิดสูตรลัด' : next.kind === 'quest' ? 'ผจญภัยต่อ' : next.kind === 'review' ? 'ทบทวนก่อนเดินทางต่อ' : next.kind === 'complete' ? 'ไปสนามสอบ' : 'ดูเส้นทาง'}
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </section>

        </div>

        {examSession?.isOpen && !examSubmitted && <div className="qm-exam-notice" role="status"><GraduationCap size={19} aria-hidden="true" /><span>คุณครูเปิดสอบปลายภาคแล้ว</span><button onClick={() => setView('exams')}>ดูสนามสอบ<ArrowRight size={16} /></button></div>}
        <div className="qm-toolbar">
          <div className="qm-view-tabs" role="tablist" aria-label="ประเภทกิจกรรม" onKeyDown={tabKeys}>
            {QUEST_VIEWS.map(({ id, title, description, art }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`qm-${id}-tab`}
                aria-labelledby={`qm-${id}-title`}
                aria-describedby={`qm-${id}-description`}
                aria-selected={view === id}
                aria-controls={`qm-${id}`}
                tabIndex={view === id ? 0 : -1}
                onClick={() => setView(id)}
              >
                <span className="qm-view-emblem">
                  <img src={art.startsWith('/') ? art : `${EXAM_ART}/${art}.png`} alt="" width="32" height="32" decoding="async" />
                </span>
                <span className="qm-view-copy">
                  <strong id={`qm-${id}-title`}>{title}</strong>
                  <small id={`qm-${id}-description`}>{description}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <section id="qm-lessons" role="tabpanel" aria-labelledby="qm-lessons-tab" hidden={view !== 'lessons'}>
          <QuestChapterCarousel activeId={chapter.id} visible={view === 'lessons'} onSelect={selectChapter}
            chapters={QUEST_CHAPTERS.map(c => {
              const displayedChapter = withLocalChapter3Missions(c);
              return {
                id: c.id,
                label: c.label,
                done: displayedChapter.quests.filter(q => isQuestPassed(questProgress[q.id])).length,
                total: displayedChapter.quests.length,
                locked: !c.quests.some(q => unlockedQuests[q.id]),
              };
            })} />
          <section role="tabpanel" id="qm-chapter-panel" aria-labelledby={`qm-chapter-${chapter.id}`} className={`qm-chapter-panel qm-chapter-color-${chapter.id}`}>
            {reviewReady && !(next.kind === 'review' && next.chapter === chapter.id) && <div className="qm-review-gate"><RotateCcw size={20} aria-hidden="true" /><span>Review Checkpoint · บท {chapter.id} เหลือข้อผิด {mistakes} ข้อ</span><button onClick={() => navigate('review')}>ทบทวน</button></div>}
            {completed === chapter.quests.length && !mistakes && <p className="qm-chapter-complete"><CheckCircle2 size={18} aria-hidden="true" />ผ่านครบทุกด่านและไม่มีข้อผิดค้างในบทนี้</p>}
            {chapter.id === 3 && localChapter3Enabled() && <p className="qm-demo-note">บันทึกผลจริง · ผ่านทุกกิจกรรมอย่างน้อย 70% · รับ 50 XP เมื่อผ่านแต่ละด่านครั้งแรก</p>}
            {chapter.id === 3 && chapter3EligibilityCheck && <section className="qm-gate-summary" aria-label="การยืนยันสิทธิ์ Boss บท 3">
              {chapter3EligibilityCheck.loading ? <p role="status">กำลังตรวจผลภารกิจทั้ง 6 ด่านกับเซิร์ฟเวอร์…</p> : chapter3EligibilityCheck.error ? <><p role="alert">{chapter3EligibilityCheck.error}</p><button type="button" onClick={refreshChapter3Eligibility}>ตรวจสิทธิ์ Boss อีกครั้ง</button></> : chapter3EligibilityCheck.status?.bossAllowed ? <p role="status">เซิร์ฟเวอร์ยืนยันผ่านภารกิจครบ 6/6 ด่านแล้ว · Boss Gate พร้อมเปิด</p> : <><p role="status">คะแนนเดิมยังอยู่ แต่เซิร์ฟเวอร์ยังไม่ยืนยันผ่าน: {chapter3EligibilityCheck.status?.missions.filter(mission => !mission.passed).map(mission => chapter.quests.find(quest => quest.id === mission.missionId)?.name || mission.missionId).join(', ')}</p><button type="button" onClick={refreshChapter3Eligibility}>ตรวจสิทธิ์ Boss อีกครั้ง</button></>}
            </section>}
            <AdventureQuestMap
              chapter={chapter}
              chapterMeta={`ผ่านแล้ว ${completed}/${chapter.quests.length} ด่าน · เกณฑ์ผ่าน 70%${chapter.id === 3 ? ` · กุญแจกลยุทธ์ ${getStrategyKeys(student?.id)}/5` : ''}`}
              filterControl={<label className="qm-filter"><span>แสดง</span><select aria-label="แสดงด่าน" value={filter} onChange={event => { setFilter(event.target.value); setShowAllQuestDetails(true); }}><option value="all">ทุกด่าน</option><option value="ready">พร้อมเล่น</option><option value="passed">ผ่านแล้ว</option><option value="locked">ยังล็อก</option></select></label>}
              student={student} progress={questProgress} unlocked={effectiveUnlocked} recommendedId={next.kind === 'quest' ? next.quest.id : null} selectedId={selectedQuestId} onSelect={selectQuestFromMap} onPlay={openQuest} onVocab={questId => navigate('vocab-drill', questId)} bossGateMessage={chapter.id === 3 ? chapter3BossMessage : null} onCheckBoss={refreshChapter3Eligibility} bossCheckLoading={chapter3EligibilityCheck?.loading} avatar={<StudentAvatar student={student} config={avatar} label="" />} listExpanded={showAllQuestDetails} listCount={visibleQuests.length} onToggleList={() => setShowAllQuestDetails(value => !value)}>
            <section id="qm-quest-list" aria-label="รายการภารกิจในบทนี้" hidden={!showAllQuestDetails}>
            <div className="qm-supporting-heading"><h3>รายการด่านในบทนี้</h3><span>ดูคะแนน ดาว และสถานะตามตัวกรองที่เลือก</span></div>
            {displayedLessons.length > 0 && <div className="qm-quest-grid">{displayedLessons.map(lessonCard)}</div>}
            {challenges.length > 0 && (filter !== 'all' || showAllQuestDetails) && <section className="qm-challenges" aria-labelledby="qm-challenge-title"><h3 id="qm-challenge-title"><Swords size={20} aria-hidden="true" />ด่านท้าทายท้ายบท</h3>{challenges.map(lessonCard)}</section>}
            {!visibleQuests.length && <p className="qm-empty">ไม่มีด่านในสถานะนี้ <button onClick={() => setFilter('all')}>แสดงทุกด่าน</button></p>}
            </section>
            </AdventureQuestMap>
            <SmartLearningPath student={student} progress={questProgress} unlocked={unlockedQuests} onNavigate={navigate} onSelectQuest={showRecommendedQuest} compact />
            <section className="qm-vocab-adventure" aria-labelledby="qm-vocab-title">
              <ResilientArtwork src="/learning/verbs/read-v1.png" alt="" aria-hidden="true" eager fallback={<span className="qm-vocab-art-fallback" aria-hidden="true">ABC</span>} />
              <div className="qm-vocab-copy">
                <p className="qm-eyebrow">สนามฝึกคำศัพท์</p>
                <h2 id="qm-vocab-title">Vocab Adventure</h2>
                <p>เลือกจาก {VOCAB_CATEGORIES.length} หมวด แล้วฝึกซ้ำผ่านเกม 6 รูปแบบ ทั้งฟัง จับคู่ สปีดรัน ดวล และใบ้คำ</p>
                <div className="qm-vocab-stats" aria-label="ความก้าวหน้า Vocab Adventure"><span><strong>{VOCAB_CATEGORIES.length}</strong> หมวด</span><span><strong>6</strong> เกม</span><span><strong>{practicedVocabCategories}</strong> หมวดที่ฝึก</span><span><strong>{vocabSessions}</strong> รอบสะสม</span></div>
              </div>
              <button className="qm-vocab-action" onClick={() => navigate('vocab-drill')}>เข้าสู่ Vocab Adventure<ArrowRight size={18} aria-hidden="true" /></button>
            </section>
          </section>
        </section>

        {view === 'skills' && demoNote}
        <section id="qm-skills" role="tabpanel" aria-labelledby="qm-skills-tab" hidden={view !== 'skills'}>
          <SkillsHubSection student={student} onNavigate={navigate} />
        </section>

        {view === 'lessons' && demoNote}
        <section id="qm-exams" role="tabpanel" aria-labelledby="qm-exams-tab" hidden={view !== 'exams'}>
          <div className="qm-arena-hero">
            <div className="qm-arena-hero-content">
              <h2>สนามสอบ &amp; <span>O-NET Arena</span></h2>
              <p>ฝึกข้อสอบภาษาอังกฤษ ป.6 แบบจับเวลา ดูผลรายทักษะ และเตรียมพร้อมก่อนสอบจริง</p>
            </div>
          </div>

          <div className="qm-chapter-heading">
            <div>
              <h2>สนามสอบหลัก (Main Exam Arenas)</h2>
              <p>เลือกสนามสอบเพื่อทดสอบความรู้และวิเคราะห์ผลรายบุคคล</p>
            </div>
          </div>

          <div className="qm-exam-grid">
            <article className="qm-exam-item qm-exam-arena-card">
              <div className="qm-exam-card-head">
                <ExamArt art="trophy" className="qm-exam-art" />
                <span className="qm-exam-badge arena">6 โหมดจำลอง</span>
              </div>
              <h3>O-NET Arena</h3>
              <p>ฝึกข้อสอบจับเวลาและวิเคราะห์จุดอ่อน</p>
              <div className="qm-exam-features-list">
                <span className="qm-feature-pill">Mini Mock (10 ข้อ)</span>
                <span className="qm-feature-pill">Speed Test (15 ข้อ)</span>
                <span className="qm-feature-pill">Full Mock (30 ข้อ)</span>
                <span className="qm-feature-pill">Weakness Mock (20 ข้อ)</span>
              </div>
              <button className="qm-primary qm-btn-enter-arena" onClick={() => navigate('arena')}>
                เข้าสู่ O-NET Arena<ArrowRight size={16} />
              </button>
            </article>

            <article className="qm-exam-item qm-exam-indicator-card">
              <div className="qm-exam-card-head">
                <ExamArt art="journal" className="qm-exam-art" />
                <span className="qm-exam-badge arena">13 ตัวชี้วัด สทศ.</span>
              </div>
              <h3>คลังข้อสอบจำลอง 13 ตัวชี้วัด</h3>
              <p>275 ข้อมาตรฐาน · เจาะลึกรายตัวชี้วัด ป.6 ครบชุด 1 ถึง 13</p>
              <div className="qm-exam-features-list">
                <span className="qm-feature-pill">ครบ 13 ชุดตัวชี้วัด</span>
                <span className="qm-feature-pill">เฉลยพร้อมทริคตอบไว</span>
                <span className="qm-feature-pill">คำชี้ขาด &amp; ตัดช้อยส์</span>
              </div>
              <button className="qm-primary qm-btn-enter-indicator" onClick={() => navigate('indicator-bank', 1)}>
                เข้าทำข้อสอบ 13 ตัวชี้วัด<ArrowRight size={16} />
              </button>
            </article>

            <article className="qm-exam-item qm-exam-onet-card" data-exam="onet-p6-2569">
              <div className="qm-exam-card-head">
                <ExamArt art="journal" className="qm-exam-art" />
                <span className="qm-exam-badge onet">สนามสอบจริง 2569</span>
              </div>
              <h3>{ONET_2569.name}</h3>
              <p>32 ข้อ · 100 คะแนน · 60 นาที</p>
              <p>{ONET_2569.dateLabel} · ภาพการ์ตูน 2.5D</p>
              <div className="qm-exam-features-list">
                <span className="qm-feature-pill">เป้าหมายสอบจริง สทศ.</span>
                <span className="qm-feature-pill">4 ตัวเลือกภาพสี</span>
              </div>
              {student?.isDemo&&onetReviewKey() ? (
                <>
                  <span className="qm-exam-state">ทดลองชุดข้อสอบบนเครื่อง</span>
                  <button className="qm-primary" onClick={()=>navigate('onet-2569')}>
                    เข้าสู่ข้อสอบ O-NET 2569<ArrowRight size={16}/>
                  </button>
                </>
              ) : (
                <>
                  <p className="qm-lock-hint">ยังไม่เปิดสอบจริงในระบบ</p>
                  <button type="button" className="qm-secondary" disabled>
                    รอเปิดสอบจริง
                  </button>
                </>
              )}
            </article>

            <article className="qm-exam-item qm-exam-final-card">
              <div className="qm-exam-card-head">
                <ExamArt art="shield" className="qm-exam-art" />
                <span className="qm-exam-badge final">สอบทางการโรงเรียน</span>
              </div>
              <h3>สอบปลายภาค</h3>
              <p>50 ข้อ · 100 คะแนน · 60 นาที · ทำได้ครั้งเดียว</p>
              <div className="qm-exam-features-list">
                <span className="qm-feature-pill">50 ข้อครอบคลุมทุกบท</span>
                <span className="qm-feature-pill">ควบคุมด้วยรหัส PIN</span>
              </div>
              {examSubmitted ? (
                <>
                  <span className="qm-exam-state">ส่งแล้ว</span>
                  <button className="qm-primary" onClick={() => viewFinalExamReport ? viewFinalExamReport() : navigate('arena')}>
                    ดูผลสอบและใบประกาศ<ArrowRight size={16} />
                  </button>
                </>
              ) : examSession?.isOpen ? (
                <>
                  <span className="qm-exam-state">เปิดสอบอยู่</span>
                  <button className="qm-primary" onClick={() => { setPinInput(''); setPinError(''); setShowPinModal(true); }}>
                    <KeyRound size={16} />ใส่ PIN เพื่อเข้าสอบ
                  </button>
                </>
              ) : (
                <>
                  <p className="qm-lock-hint">รอครูเปิดระบบและแจ้งรหัส PIN</p>
                  <button className="qm-secondary" onClick={() => refreshExam(true)} disabled={examRefreshing}>
                    <RefreshCw size={16} />{examRefreshing ? 'กำลังตรวจสอบ...' : 'รีเฟรชสถานะ'}
                  </button>
                </>
              )}
            </article>
          </div>

          {/* แนวข้อสอบ O-NET เสมือนจริง (Full Simulation 32 ข้อ) */}
          <section className="qm-year-simulation-hub" aria-labelledby="qm-year-sim-heading">
            <div className="qm-chapter-heading">
              <div>
                <h2 id="qm-year-sim-heading">
                  แนวข้อสอบ O-NET เสมือนจริง <small>(Full Simulation 32 ข้อ)</small>
                </h2>
                <p>ข้อสอบจำลองเสมือนจริง 32 ข้อ 100 คะแนน อิงโครงสร้าง Test Blueprint สทศ. ป.6 พร้อมภาพประกอบการ์ตูน 2.5D และเฉลยละเอียด</p>
              </div>
            </div>

            <div className="qm-year-sim-grid">
              {/* แนวข้อสอบ ปี 65 */}
              <article className="qm-sim-year-card year-2565">
                <div className="qm-sim-card-top">
                  <ExamArt art="quill" className="qm-archive-art" lazy />
                  <span className="qm-sim-year-pill">ปี 2565</span>
                  <span className="qm-sim-status-badge ready">เสมือนจริง 100%</span>
                </div>
                <h3>แนวข้อสอบ O-NET ปี 65</h3>
                <p className="qm-sim-desc">32 ข้อเสมือนจริง · 100 คะแนน · 60 นาที</p>
                <div className="qm-sim-chips">
                  <span>Blueprint สทศ.</span>
                  <span>ภาพการ์ตูน 2.5D</span>
                  <span>เฉลยละเอียด 32 ข้อ</span>
                  <span>จับเวลา 60 นาที</span>
                </div>
                <div className="qm-sim-action">
                  <button className="qm-primary qm-sim-start-btn" onClick={() => navigate('exam', 'onet_year_2565')}>
                    เริ่มสอบ ปี 65 <ArrowRight size={15} />
                  </button>
                </div>
              </article>

              {/* แนวข้อสอบ ปี 66 */}
              <article className="qm-sim-year-card year-2566">
                <div className="qm-sim-card-top">
                  <ExamArt art="medal" className="qm-archive-art" lazy />
                  <span className="qm-sim-year-pill">ปี 2566</span>
                  <span className="qm-sim-status-badge ready">เสมือนจริง 100%</span>
                </div>
                <h3>แนวข้อสอบ O-NET ปี 66</h3>
                <p className="qm-sim-desc">32 ข้อเสมือนจริง · 100 คะแนน · 60 นาที</p>
                <div className="qm-sim-chips">
                  <span>Blueprint สทศ.</span>
                  <span>ภาพการ์ตูน 2.5D</span>
                  <span>เฉลยละเอียด 32 ข้อ</span>
                  <span>จับเวลา 60 นาที</span>
                </div>
                <div className="qm-sim-action">
                  <button className="qm-primary qm-sim-start-btn" onClick={() => navigate('exam', 'onet_year_2566')}>
                    เริ่มสอบ ปี 66 <ArrowRight size={15} />
                  </button>
                </div>
              </article>

              {/* แนวข้อสอบ ปี 67 */}
              <article className="qm-sim-year-card year-2567">
                <div className="qm-sim-card-top">
                  <ExamArt art="hourglass" className="qm-archive-art" lazy />
                  <span className="qm-sim-year-pill">ปี 2567</span>
                  <span className="qm-sim-status-badge ready">เสมือนจริง 100%</span>
                </div>
                <h3>แนวข้อสอบ O-NET ปี 67</h3>
                <p className="qm-sim-desc">32 ข้อเสมือนจริง · 100 คะแนน · 60 นาที</p>
                <div className="qm-sim-chips">
                  <span>Blueprint สทศ.</span>
                  <span>ภาพการ์ตูน 2.5D</span>
                  <span>เฉลยละเอียด 32 ข้อ</span>
                  <span>จับเวลา 60 นาที</span>
                </div>
                <div className="qm-sim-action">
                  <button className="qm-primary qm-sim-start-btn" onClick={() => navigate('exam', 'onet_year_2567')}>
                    เริ่มสอบ ปี 67 <ArrowRight size={15} />
                  </button>
                </div>
              </article>

              {/* แนวข้อสอบ ปี 68 */}
              <article className="qm-sim-year-card year-2568">
                <div className="qm-sim-card-top">
                  <ExamArt art="key" className="qm-archive-art" lazy />
                  <span className="qm-sim-year-pill">ปี 2568</span>
                  <span className="qm-sim-status-badge ready">เสมือนจริง 100%</span>
                </div>
                <h3>แนวข้อสอบ O-NET ปี 68</h3>
                <p className="qm-sim-desc">32 ข้อเสมือนจริง · 100 คะแนน · 60 นาที</p>
                <div className="qm-sim-chips">
                  <span>Blueprint สทศ.</span>
                  <span>ภาพการ์ตูน 2.5D</span>
                  <span>เฉลยละเอียด 32 ข้อ</span>
                  <span>จับเวลา 60 นาที</span>
                </div>
                <div className="qm-sim-action">
                  <button className="qm-primary qm-sim-start-btn" onClick={() => navigate('exam', 'onet_year_2568')}>
                    เริ่มสอบ ปี 68 <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section className="qm-simulator-section" aria-labelledby="qm-simulator-title">
            <div className="qm-simulator-box">
              <ExamArt art="compass" className="qm-simulator-art" lazy />
              <div className="qm-simulator-content">
                <h3 id="qm-simulator-title">ชุดฝึก Real O-NET Simulator (45 ข้อ)</h3>
                <p>
                  แบบฝึกจำลองข้อสอบเสมือนจริง แยกทำทีละพาร์ท จับเวลา และตรวจคำตอบพร้อมวิเคราะห์ผลทันที
                </p>
                <div className="qm-simulator-parts-chips">
                  <span className="qm-sim-chip">Part 1 สนทนา (10 ข้อ)</span>
                  <span className="qm-sim-chip">Part 2 ป้าย & สัญลักษณ์ (10 ข้อ)</span>
                  <span className="qm-sim-chip">Part 3 อ่านบทความ (10 ข้อ)</span>
                  <span className="qm-sim-chip">Part 4 ไวยากรณ์ (10 ข้อ)</span>
                  <span className="qm-sim-chip">Part 5 เรียงลำดับ (5 ข้อ)</span>
                </div>
              </div>
              <div className="qm-simulator-action-wrap">
                <button className="qm-primary qm-sim-btn" onClick={() => navigate('real-simulator')}>
                  เริ่มชุดฝึก 5 ทักษะ<ArrowRight size={16} aria-hidden="true" />
                </button>
                <button className="qm-secondary qm-tech-btn" onClick={() => navigate('technique-hub')}>
                  สูตรลัดตัดช้อยส์ O-NET
                </button>
              </div>
            </div>
          </section>
        </section>
      </div>
      <dialog ref={pinDialog} className="qm-pin-dialog" aria-labelledby="qm-pin-title" onCancel={() => setShowPinModal(false)} onClose={() => setShowPinModal(false)}>
        <KeyRound size={30} aria-hidden="true" /><h2 id="qm-pin-title">ยืนยันรหัส PIN</h2>
        <p>กรอกรหัสที่คุณครูแจ้งเพื่อเริ่มการสอบปลายภาค</p>
        <form onSubmit={handlePinSubmit}><label htmlFor="qm-pin">รหัส PIN</label><input id="qm-pin" autoFocus maxLength={6} value={pinInput} onChange={event => { setPinInput(event.target.value); setPinError(''); }} autoComplete="off" />
          {pinError && <p role="alert">{pinError}</p>}
          <div><button type="button" className="qm-secondary" onClick={() => setShowPinModal(false)}>ยกเลิก</button><button className="qm-primary" type="submit" disabled={!pinInput.trim()}>เริ่มทำข้อสอบ<ArrowRight size={16} /></button></div>
        </form>
      </dialog>
    </div>
    </PageShell>
  );
}
