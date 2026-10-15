import UIIcon, { UIIconText } from './UIIcon';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Swords, LogOut, ArrowRight, BookOpen, Trophy, Brain, Layers, GraduationCap, RotateCcw, RefreshCw, LockKeyhole, KeyRound, CheckCircle2 } from 'lucide-react';
import { useApp } from '../App';
import { xpToNextLevel, getLevelTitle, calculateRankScore, getRankingTier } from '../utils/scoring';
import { getStrategyKeys } from '../utils/storage';
import { getAvatarUrl } from '../utils/avatar';
import { getExamSessionFromCloud, getFinalExamResult, mergeArenaStatsFromCloud } from '../utils/arenaStorage';
import { QUEST_CHAPTERS, isQuestPassed, isChapterChallenge, getChapterMistakes, getNextQuestAction } from '../utils/questMapModel';
import QuestLessonCard from './quest/QuestLessonCard';
import PageShell from './PageShell';

const EXAM_POLL_MS = 30000;
const SHORTCUTS = [
  { page: 'technique-hub', name: 'สูตรลัด O-NET', Icon: Brain },
  { page: 'vocab-drill', name: 'คลังคำศัพท์', Icon: Layers },
  { page: 'real-simulator', name: 'ชุดฝึก 5 ส่วน', Icon: Trophy },
];

export default function QuestMap() {
  const { student, questProgress = {}, unlockedQuests = {}, navigate, handleLogout, viewFinalExamReport } = useApp();
  const xpInfo = xpToNextLevel(student?.xp || 0);
  const tier = getRankingTier(calculateRankScore(student));
  const next = getNextQuestAction(questProgress, unlockedQuests, student);
  const [selectedChapter, setSelectedChapter] = useState(next.chapter);
  const [view, setView] = useState('lessons');
  const [filter, setFilter] = useState('all');
  const [avatarFailed, setAvatarFailed] = useState(false);
  const chapter = QUEST_CHAPTERS.find(c => c.id === selectedChapter) || QUEST_CHAPTERS[0];
  const completed = chapter.quests.filter(q => isQuestPassed(questProgress[q.id])).length;
  const mistakes = getChapterMistakes(student, chapter.id);
  const reviewReady = completed === chapter.quests.length && mistakes > 0;
  const visibleQuests = chapter.quests.filter(q => filter === 'all'
    || (filter === 'locked' && !unlockedQuests[q.id])
    || (filter === 'passed' && isQuestPassed(questProgress[q.id]))
    || (filter === 'ready' && unlockedQuests[q.id] && !isQuestPassed(questProgress[q.id])));
  const lessons = visibleQuests.filter(q => !isChapterChallenge(q));
  const challenges = visibleQuests.filter(isChapterChallenge);
  const lessonCard = quest => <QuestLessonCard key={quest.id} quest={quest} progress={questProgress[quest.id]} unlocked={!!unlockedQuests[quest.id]} badge={student?.badges?.includes(quest.id)} recommended={next.kind === 'quest' && next.quest.id === quest.id} onPlay={() => navigate('mission-select', quest.id)} />;
  const [examSession, setExamSession] = useState(null);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examRefreshing, setExamRefreshing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const pinDialog = useRef(null);
  const totalPassed = QUEST_CHAPTERS.reduce((sum, c) => sum + c.quests.filter(q => isQuestPassed(questProgress[q.id])).length, 0);
  const totalQuests = QUEST_CHAPTERS.reduce((sum, c) => sum + c.quests.length, 0);
  const allLessonsPassed = totalQuests > 0 && totalPassed === totalQuests;

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

  return (
    <PageShell veil={0.72} className="eq-quest-page" right={
      <details className="qm-account">
        <summary><span className="qm-avatar">{avatarFailed ? (student?.name || '?').slice(0, 1) : <img src={getAvatarUrl(student?.name)} alt="" onError={() => setAvatarFailed(true)} />}</span><span>{student?.name || 'ผู้เรียน'}</span></summary>
        <div className="qm-account-menu">
          <p>{student?.isDemo ? 'โหมดทดลองเล่น' : `ชั้น ${student?.class} เลขที่ ${student?.number}`}</p>
          {student?.isDemo && <button onClick={() => navigate('student-login')}><GraduationCap size={16} />เข้าสู่ระบบนักเรียน</button>}
          <button onClick={handleLogout}><LogOut size={16} />ออกจากระบบ</button>
        </div>
      </details>
    }>
    <div className="quest-workspace">
      <div className="qm-shell">
        <section className="qm-player" aria-label="ความก้าวหน้าผู้เรียน">
          <div><strong>Level {student?.level || 1}</strong><span>{getLevelTitle(student?.level || 1)}</span></div>
          <div className="qm-xp"><div><span>{student?.xp || 0} XP</span><span><UIIconText value={xpInfo.maxLevel ? 'Level สูงสุดแล้ว' : `${xpInfo.current}/${xpInfo.needed} XP → Level ${(student?.level || 1) + 1}`} /></span></div><progress value={xpInfo.pct} max="100" aria-label="XP ของ Level ปัจจุบัน" /></div>
          <div className="qm-player-extra"><span>{tier.name}</span><span>{student?.badges?.length || 0} Badge</span></div>
        </section>
        {student?.isDemo && <p className="qm-demo-note">โหมดทดลองเล่น · XP และ Badge จะไม่ถูกบันทึก <button onClick={() => navigate('student-login')}>เข้าสู่ระบบนักเรียน</button></p>}

        <div className="qm-page-heading"><div><p className="qm-eyebrow">เส้นทางการเรียนรู้</p><h1>Quest Map</h1></div><span>ผ่านแล้ว {totalPassed}/{totalQuests} ด่าน</span></div>
        <section className="qm-next" aria-labelledby="qm-next-title">
          <div className="qm-next-copy">
            <p className="qm-eyebrow">{next.kind === 'review' ? allLessonsPassed ? 'ผ่านครบทุกด่านแล้ว · เสริมความชำนาญต่อ' : 'ทบทวนก่อนเดินทางต่อ' : next.kind === 'complete' ? 'ครบทุกภารกิจแล้ว' : 'ภารกิจถัดไป'}</p>
            <h2 id="qm-next-title">{next.kind === 'quest' ? next.quest.name : next.kind === 'review' ? `ทบทวนข้อผิดในบท ${next.chapter}` : next.kind === 'complete' ? 'พร้อมท้าทายสนามสอบ' : 'ตรวจสอบเส้นทางการเรียน'}</h2>
            <p>{next.kind === 'quest' ? next.quest.description : next.kind === 'review' ? `บท ${next.chapter} ยังมี ${next.mistakes} ข้อที่ต้องทบทวนเพื่อเสริมความชำนาญ` : next.kind === 'complete' ? 'กลับไปฝึกซ้ำ หรือเลือกข้อสอบในสนามสอบ' : 'ดูเงื่อนไขปลดล็อกของแต่ละบท'}</p>
          </div>
          <button className="qm-primary" onClick={() => next.kind === 'quest' ? navigate('mission-select', next.quest.id) : next.kind === 'review' ? navigate('review') : setView(next.kind === 'complete' ? 'exams' : 'lessons')}>{next.kind === 'quest' ? 'เล่นด่านถัดไป' : next.kind === 'review' ? 'ทบทวนข้อผิด' : next.kind === 'complete' ? 'ไปสนามสอบ' : 'ดูบทเรียน'}<ArrowRight size={18} aria-hidden="true" /></button>
        </section>

        {examSession?.isOpen && !examSubmitted && <div className="qm-exam-notice" role="status"><GraduationCap size={19} aria-hidden="true" /><span>คุณครูเปิดสอบปลายภาคแล้ว</span><button onClick={() => setView('exams')}>ดูสนามสอบ<ArrowRight size={16} /></button></div>}
        <div className="qm-toolbar">
          <div className="qm-view-tabs" role="tablist" aria-label="ประเภทกิจกรรม" onKeyDown={tabKeys}>
            <button role="tab" id="qm-lessons-tab" aria-selected={view === 'lessons'} aria-controls="qm-lessons" tabIndex={view === 'lessons' ? 0 : -1} onClick={() => setView('lessons')}><BookOpen size={18} />บทเรียน</button>
            <button role="tab" id="qm-exams-tab" aria-selected={view === 'exams'} aria-controls="qm-exams" tabIndex={view === 'exams' ? 0 : -1} onClick={() => setView('exams')}><Trophy size={18} />สนามสอบ</button>
          </div>
          <div className="qm-shortcuts">{SHORTCUTS.map(({ page, name, Icon }) => <button key={page} onClick={() => navigate(page)}><Icon size={16} aria-hidden="true" />{name}</button>)}</div>
        </div>

        <section id="qm-lessons" role="tabpanel" aria-labelledby="qm-lessons-tab" hidden={view !== 'lessons'}>
          <div className="qm-chapter-tabs" role="tablist" aria-label="บทเรียน" onKeyDown={tabKeys}>
            {QUEST_CHAPTERS.map(c => {
              const done = c.quests.filter(q => isQuestPassed(questProgress[q.id])).length;
              const locked = !c.quests.some(q => unlockedQuests[q.id]);
              return <button key={c.id} id={`qm-chapter-${c.id}`} role="tab" aria-selected={chapter.id === c.id} aria-controls="qm-chapter-panel" tabIndex={chapter.id === c.id ? 0 : -1} onClick={() => { setSelectedChapter(c.id); setFilter('all'); }}><span>บท {c.id}{locked && <LockKeyhole size={13} aria-label="ยังล็อก" />}</span><strong>{c.label}</strong><small>ผ่าน {done}/{c.quests.length} ด่าน</small></button>;
            })}
          </div>
          <section role="tabpanel" id="qm-chapter-panel" aria-labelledby={`qm-chapter-${chapter.id}`} className={`qm-chapter-panel qm-chapter-color-${chapter.id}`}>
            <div className="qm-chapter-heading"><div><h2>Chapter {chapter.id} — {chapter.name}</h2><p>ผ่านแล้ว {completed}/{chapter.quests.length} ด่าน · เกณฑ์ผ่าน 70%{chapter.id === 3 ? ` · กุญแจกลยุทธ์ ${getStrategyKeys(student?.id)}/5` : ''}</p></div>
              <label className="qm-filter">แสดง<select aria-label="แสดงด่าน" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">ทุกด่าน</option><option value="ready">พร้อมเล่น</option><option value="passed">ผ่านแล้ว</option><option value="locked">ยังล็อก</option></select></label>
            </div>
            {reviewReady && !(next.kind === 'review' && next.chapter === chapter.id) && <div className="qm-review-gate"><RotateCcw size={20} aria-hidden="true" /><span>Review Checkpoint · บท {chapter.id} เหลือข้อผิด {mistakes} ข้อ</span><button onClick={() => navigate('review')}>ทบทวน</button></div>}
            {completed === chapter.quests.length && !mistakes && <p className="qm-chapter-complete"><CheckCircle2 size={18} aria-hidden="true" />ผ่านครบทุกด่านและไม่มีข้อผิดค้างในบทนี้</p>}
            {lessons.length > 0 && <div className="qm-quest-grid">{lessons.map(lessonCard)}</div>}
            {challenges.length > 0 && <section className="qm-challenges" aria-labelledby="qm-challenge-title"><h3 id="qm-challenge-title"><Swords size={20} aria-hidden="true" />ด่านท้าทายท้ายบท</h3>{challenges.map(lessonCard)}</section>}
            {!visibleQuests.length && <p className="qm-empty">ไม่มีด่านในสถานะนี้ <button onClick={() => setFilter('all')}>แสดงทุกด่าน</button></p>}
          </section>
        </section>

        <section id="qm-exams" role="tabpanel" aria-labelledby="qm-exams-tab" hidden={view !== 'exams'}>
          <div className="qm-chapter-heading"><div><h2>สนามสอบ</h2><p>ฝึกซ้อม ประลองทีม และสอบปลายภาค</p></div></div>
          <div className="qm-exam-grid">
            <article className="qm-exam-item"><Trophy size={28} aria-hidden="true" /><h3>O-NET Arena</h3><p>ฝึกข้อสอบจับเวลาและวิเคราะห์จุดอ่อน</p>{unlockedQuests.chapter4_unlocked ? <button className="qm-primary" onClick={() => navigate('arena')}>เข้าสู่ O-NET Arena<ArrowRight size={16} /></button> : <p className="qm-lock-hint"><LockKeyhole size={16} />ผ่านบท 4 และทบทวนข้อผิดให้ครบก่อน</p>}</article>
            <article className="qm-exam-item"><Swords size={28} aria-hidden="true" /><h3>World Boss Raid</h3><p>ร่วมทีมกับเพื่อนในห้องเพื่อท้าทายบอส</p>{unlockedQuests.chapter4_unlocked ? <button className="qm-primary" onClick={() => navigate('multiplayer-arena')}>เข้าประลอง<ArrowRight size={16} /></button> : <p className="qm-lock-hint"><LockKeyhole size={16} />ผ่านบท 4 และทบทวนข้อผิดให้ครบก่อน</p>}</article>
            <article className="qm-exam-item"><GraduationCap size={28} aria-hidden="true" /><h3>สอบปลายภาค</h3><p>50 ข้อ · 100 คะแนน · 60 นาที · ทำได้ครั้งเดียว</p>
              {examSubmitted ? <><span className="qm-exam-state">ส่งแล้ว</span><button className="qm-primary" onClick={() => viewFinalExamReport ? viewFinalExamReport() : navigate('arena')}>ดูผลสอบและใบประกาศ<ArrowRight size={16} /></button></> : examSession?.isOpen ? <><span className="qm-exam-state">เปิดสอบอยู่</span><button className="qm-primary" onClick={() => { setPinInput(''); setPinError(''); setShowPinModal(true); }}><KeyRound size={16} />ใส่ PIN เพื่อเข้าสอบ</button></> : <><p className="qm-lock-hint">รอครูเปิดระบบและแจ้งรหัส PIN</p><button className="qm-secondary" onClick={() => refreshExam(true)} disabled={examRefreshing}><RefreshCw size={16} />{examRefreshing ? 'กำลังตรวจสอบ...' : 'รีเฟรชสถานะ'}</button></>}
            </article>
          </div>
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
