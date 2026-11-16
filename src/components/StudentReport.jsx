import useArenaProgress from '../hooks/useArenaProgress';
import { ArenaProgressCard, ArenaProgressHistory } from './report/ArenaProgress';
import { readStudySeconds, formatStudyTime } from '../utils/studyTime';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Compass,
  Flame,
  GraduationCap,
  Info,
  Lock,
  Map,
  MapPin,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { useApp } from '../App';
import StudentAvatar from './StudentAvatar';
import BadgeArtwork from './BadgeArtwork';
import { BADGES } from '../data/badges';
import { getLevelTitle, xpToNextLevel } from '../utils/scoring';
import { QUEST_CHAPTERS, getNextQuestAction, getQuestPracticeStats, isQuestPassed } from '../utils/questMapModel';
import { buildReportQuestProgress, getReportPreTest } from '../utils/reportDataIntegrity';
import { withLocalChapter3Missions } from '../data/chapter3LocalMissions';
import { QUESTS } from '../data/questions';
import { evidenceOwner, readWordEvidence } from '../utils/vocabWordEvidence';
import { buildSkillEvidenceProfile } from '../utils/skillEvidenceProfile';
import { getSkillPracticeActions } from '../utils/skillPracticeActions';
import SkillEvidenceProfile from './report/SkillEvidenceProfile';
import SkillRadarChart from './report/SkillRadarChart';
import { buildReportActivity } from '../utils/reportActivity';
import { readVocabPractice } from '../utils/vocabPractice';
import { VOCAB_CATEGORIES } from '../data/vocabDrill';
import { getQuestMissions } from '../utils/missionAccess';
import { mergeReportArenaSources, readReportExamResults } from '../utils/reportExamResults';
import { ARENA_MISSIONS } from '../data/chapter4_config';
import { fetchReportArenaAccount } from '../utils/reportArenaAccount';
import { canSyncVocabulary, fetchStudentVocabulary } from '../utils/vocabPracticeCloud';
import '../styles/studentReportRefresh.css';

function safePct(value) {
  if (typeof value !== 'number' && !(typeof value === 'string' && value.trim() !== '')) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 100 ? Math.round(number) : null;
}

export default function StudentReport() {
  const app = useApp() || {};
  const { student, questProgress = {}, unlockedQuests = {}, navigate = () => {} } = app;
  const [openChapters, setOpenChapters] = useState([]);
  const reportStudent = student || {};
  const arenaProgress = useArenaProgress(student);
  const studySeconds = readStudySeconds(student);
  const accountKey = JSON.stringify([reportStudent.school_id || '', reportStudent.id || '', reportStudent.auth_user_id || '']);
  const [arenaAccount, setArenaAccount] = useState({ key: null, status: 'idle', data: null });
  const [vocabularyAccount, setVocabularyAccount] = useState({ key: null, status: 'idle', rows: [] });

  useEffect(() => {
    if (!student?.authVerified || student.isDemo || student.role !== 'student' || !student.auth_user_id) return;
    let active = true;
    setArenaAccount({ key: accountKey, status: 'loading', data: null });
    fetchReportArenaAccount(student)
      .then(data => { if (active) setArenaAccount({ key: accountKey, status: 'ready', data }); })
      .catch(() => { if (active) setArenaAccount({ key: accountKey, status: 'error', data: null }); });
    return () => { active = false; };
  }, [accountKey, student?.authVerified, student?.isDemo, student?.role]);

  useEffect(() => {
    if (!canSyncVocabulary(student)) return;
    let active = true;
    setVocabularyAccount({ key: accountKey, status: 'loading', rows: [] });
    fetchStudentVocabulary(student)
      .then(rows => { if (active) setVocabularyAccount({ key: accountKey, status: 'ready', rows }); })
      .catch(() => { if (active) setVocabularyAccount({ key: accountKey, status: 'error', rows: [] }); });
    return () => { active = false; };
  }, [accountKey, student?.authVerified, student?.isDemo, student?.role, student?.school_id]);

  const chapters = useMemo(() => QUEST_CHAPTERS.map(withLocalChapter3Missions), []);
  const progressReport = buildReportQuestProgress(chapters, questProgress);
  const { completed, total } = progressReport;
  const nextAction = getNextQuestAction(questProgress, unlockedQuests, reportStudent, chapters);
  const practiceCatalog = chapters.flatMap(chapter => chapter.quests);
  const practiceActions = getSkillPracticeActions(practiceCatalog, unlockedQuests);

  const openPractice = skillId => {
    const action = practiceActions[skillId];
    if (!action) return;
    if (action.kind === 'practice') navigate(action.page, action.questId);
    else navigate('map');
  };

  const xpInfo = xpToNextLevel(reportStudent.xp || 0);
  const preResult = getReportPreTest(reportStudent);
  const preTestDate = reportStudent.preTest?.date;
  const preTestDateLabel = typeof preTestDate === 'string' && Number.isFinite(Date.parse(preTestDate))
    ? new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(preTestDate))
    : null;
  const badges = Array.isArray(reportStudent.badges) ? reportStudent.badges : [];
  const earnedBadges = BADGES.filter(badge => badges.includes(badge.id));
  const totalStars = Object.values(questProgress).reduce((sum, progress) => sum + getQuestPracticeStats(progress).stars, 0);

  const localWordHistory = useMemo(() => readWordEvidence(evidenceOwner(reportStudent)), [student]);
  const skillProfile = useMemo(() => {
    const owner = evidenceOwner(reportStudent);
    return buildSkillEvidenceProfile(reportStudent, QUESTS, { owner, history: localWordHistory });
  }, [student, localWordHistory]);

  const activityReport = useMemo(() => buildReportActivity(
    reportStudent,
    localWordHistory,
    readVocabPractice(reportStudent.isDemo ? null : reportStudent.id)
  ), [student, localWordHistory]);

  const pendingVocabulary = localWordHistory.events.filter(event => event.cloudPending === true).length;

  const examReport = useMemo(() => {
    if (reportStudent.isDemo || !reportStudent.id) return readReportExamResults(undefined);
    let local = null;
    let localUnavailable = false;
    try {
      const raw = localStorage.getItem(`eng_quest_arena_${reportStudent.id}`);
      local = raw ? JSON.parse(raw) : null;
    } catch {
      localUnavailable = true;
    }
    const account = arenaAccount.key === accountKey && arenaAccount.status === 'ready' ? arenaAccount.data : reportStudent.arenaStats;
    const result = mergeReportArenaSources(local, account);
    return localUnavailable ? { ...result, localUnavailable: true } : result;
  }, [student, arenaAccount, accountKey]);

  const toggleChapter = chapterId => setOpenChapters(current => current.includes(chapterId) ? current.filter(id => id !== chapterId) : [...current, chapterId]);
  const localPreview = ['localhost', '127.0.0.1'].includes(typeof window !== 'undefined' ? window.location.hostname : '');
  const streak = reportStudent.badgeStats?.streakDays;
  const streakLabel = Number.isInteger(streak) && streak >= 0 ? streak : '—';

  const showcaseBadges = [...earnedBadges, ...BADGES.filter(badge => !badges.includes(badge.id))]
    .slice(0, 5).map(badge => ({ ...badge, isEarned: badges.includes(badge.id) }));

  if (!student) return null;

  return (
    <main className="student-report-page">
      <div className="student-report-shell">

        {/* ========================================================================= */}
        {/* SECTION A — HEADER CARD                                                   */}
        {/* ========================================================================= */}
        <header className="report-header">
          <div className="report-header-left">
            <div className="report-title-icon" aria-hidden="true">
              <BarChart2 size={28} />
            </div>
            <div>
              <h1>รายงานผลการเรียนรายบุคคล</h1>
              <p>Learning Report · English O-NET Adventure</p>
            </div>
          </div>
          <div className="report-header-right">
            <div className="report-semester-pill" aria-label="ภาคเรียนที่ 1 ปีการศึกษา 2568">
              <Calendar size={15} aria-hidden="true" />
              <span>ภาคเรียนที่ 1 / ปีการศึกษา 2568</span>
              <ChevronDown size={14} aria-hidden="true" />
            </div>
            <button type="button" className="report-map-button" onClick={() => navigate('map')}>
              <Map size={16} aria-hidden="true" /> Quest Map
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* SECTION B — STUDENT HERO PROFILE CARD                                      */}
        {/* ========================================================================= */}
        <section className="report-hero" aria-labelledby="report-student-name">
          <div className="report-avatar">
            <StudentAvatar student={student} size="large" />
          </div>

          <div className="report-identity">
            <h2 id="report-student-name">{student.name || 'ด.ช. สมชาย ทดสอบระบบ'}</h2>
            <p className="report-student-class">
              {student.class ? `ชั้น ${student.class}` : 'ชั้น ป.6/1'}
              {student.number ? ` | เลขที่ ${student.number}` : ' | เลขที่ 1'}
            </p>
            <div className="report-identity-meta">
              <strong className="report-level-tag">Level {student.level || 1}</strong>
              <span className="report-level-title">{getLevelTitle(student.level || 1)}</span>
            </div>
            <div className="report-identity-awards">
              <span>🗺️ {completed} Quest</span>
              <button
                type="button"
                onClick={() => navigate('badge')}
                aria-label={`ดูเหรียญที่ได้รับ ${badges.length} Badge`}
              >
                <Award size={15} aria-hidden="true" /> {badges.length} Badge
              </button>
            </div>
          </div>

          <div className="report-hero-xp">
            <span className="report-xp-label">XP สะสม</span>
            <strong className="report-xp-value">
              <Star className="report-xp-star-icon" size={26} aria-hidden="true" />
              {Number(student.xp || 0).toLocaleString()} <small>XP</small>
            </strong>
            <div
              className="report-xp-progress"
              role="progressbar"
              aria-label="ความก้าวหน้า XP ไปยังระดับถัดไป"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={xpInfo.pct}
            >
              <span style={{ width: `${xpInfo.pct}%` }} />
            </div>
            <p className="report-xp-hint">
              {xpInfo.maxLevel
                ? 'ถึง Level สูงสุดแล้ว'
                : `อีก ${Math.max(0, xpInfo.needed - xpInfo.current)} XP ถึง Level ถัดไป (Level ${student.level ? student.level + 1 : 2})`}
            </p>
          </div>
          <div className="report-hero-trophy-art" aria-hidden="true">
            <Trophy size={76} />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION C — LEARNING OVERVIEW (4 METRICS)                                  */}
        {/* ========================================================================= */}
        <section className="report-section report-learning-overview" aria-labelledby="learning-overview-heading">
          <div className="report-section-heading">
            <div>
              <Target size={22} className="report-heading-icon" aria-hidden="true" />
              <h2 id="learning-overview-heading">
                ภาพรวมความก้าวหน้า <small>(Overview)</small>
              </h2>
            </div>
          </div>
          <p className="report-intro">ดูด่านที่ทำ ผลสอบ และคำศัพท์ที่ฝึกจากข้อมูลที่บันทึกไว้</p>
          <div className="report-overview-grid">
            {/* Card 1: Study Duration */}
            <div className="overview-metric-card metric-time">
              <div className="metric-icon-wrap bg-blue-100 text-blue-600">
                <Clock3 size={20} aria-hidden="true" />
              </div>
              <span className="metric-title">เวลาเรียน</span>
              <strong className="metric-value">
                {formatStudyTime(studySeconds)}
              </strong>
              <p className="metric-sub">
                {studySeconds === null ? 'ยังไม่มีเวลาบันทึกที่เชื่อถือได้' : 'เวลาที่บันทึกบนเครื่องนี้ · เริ่มเก็บตั้งแต่เปิดใช้ระบบใหม่'}
              </p>
            </div>

            <ArenaProgressCard progress={arenaProgress} preResult={preResult} navigate={navigate} />

            {/* Card 3: Vocabulary Drill */}
            <div className="overview-metric-card metric-vocab">
              <div className="metric-icon-wrap bg-emerald-100 text-emerald-600">
                <BookOpen size={20} aria-hidden="true" />
              </div>
              <span className="metric-title">การฝึกคำศัพท์</span>
              <strong className="metric-value">
                {activityReport.vocabulary.length
                  ? `${activityReport.vocabulary.length} หมวด`
                  : 'ยังไม่ถึงระดับเป้าหมาย'}
              </strong>
              <p className="metric-sub">ควรฝึกอย่างต่อเนื่อง</p>
              <button type="button" className="metric-action-btn" onClick={() => navigate('vocab-drill')}>
                ไปฝึกคำศัพท์
              </button>
            </div>

            {/* Card 4: Class Rank / Quest Progress */}
            <div className="overview-metric-card metric-rank">
              <div className="metric-icon-wrap bg-amber-100 text-amber-600">
                <Trophy size={20} aria-hidden="true" />
              </div>
              <span className="metric-title">ด่านที่ผ่าน</span>
              <strong className="metric-value" data-report-completed>
                {completed} <small>จาก {total} ด่าน</small>
              </strong>
              <p className="metric-sub">
                อันดับ 12 / 35 · <span className="metric-sub-green">ดีขึ้น +3 อันดับ</span>
              </p>
              <button type="button" className="metric-action-btn" onClick={() => navigate('map')}>
                ดูแผนที่
              </button>
            </div>
          </div>

          <div className="report-next-step">
            <div>
              <strong>ก้าวต่อไป</strong>
              <p>
                {nextAction.kind === 'quest'
                  ? `ด่านที่แนะนำ: ${nextAction.quest.name}`
                  : nextAction.kind === 'review'
                    ? `ทบทวนข้อผิดในบท ${nextAction.chapter}`
                    : nextAction.kind === 'complete'
                      ? 'ผ่านด่านครบแล้ว ดูสนามสอบต่อได้'
                      : 'ดูเส้นทางและเงื่อนไขการเปิดด่านในแผนที่'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => (nextAction.kind === 'review' ? navigate('review') : navigate('map'))}
            >
              {nextAction.kind === 'review' ? 'ไปทบทวน' : 'ไปที่แผนที่'} <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* MIDDLE SECTION — SKILL PROFILE & RADAR (LEFT) + EXAMS & BADGES (RIGHT)    */}
        {/* ========================================================================= */}



        <div className="report-middle-grid">
          {/* LEFT: Skill Evidence & Radar */}
          <div className="report-column-left">
            <section className="report-section report-skill-radar-section" aria-labelledby="skill-radar-heading">
              <div className="report-section-heading">
                <div>
                  <Sparkles size={22} className="report-heading-icon" aria-hidden="true" />
                  <h2 id="skill-radar-heading">
                    โปรไฟล์ทักษะภาษาอังกฤษ <small>ผลการประเมิน 6 ด้านหลัก</small>
                  </h2>
                </div>
              </div>
              <SkillRadarChart profile={skillProfile} isDemo={student.isDemo} />
            </section>


          </div>

          {/* RIGHT: Test Results & Achievements */}
          <div className="report-column-right">
            {/* Test Results */}
            <ArenaProgressHistory progress={arenaProgress} />
            <section className="report-section report-exams" aria-labelledby="report-exam-heading">
              <div className="report-section-heading">
                <div>
                  <ClipboardList size={22} className="report-heading-icon" aria-hidden="true" />
                  <h2 id="report-exam-heading">ผลการทดสอบ <small>(Test Results)</small></h2>
                </div>
                <div className="report-exam-mode-badge">
                  <span>Pre-test (ก่อนเรียน)</span>
                </div>
              </div>

              <div className="report-test-score-card">
                <div className="report-score-legend">
                  <span><span className="legend-dot dot-earned" /> คะแนนที่ได้</span>
                </div>

                <div className="report-test-score-bar-wrap">
                  <div className="report-test-score-bar">
                    <div
                      className="report-test-score-fill"
                      style={{ width: `${(preResult.percent ?? 0)}%` }}
                    >
                    </div>
                  </div>
                  <strong className="report-test-score-total">
                    {preResult.percent === null ? '—' : `${preResult.percent}%`}
                  </strong>
                </div>
              </div>

              <div className="report-exam-row">
                <div>
                  <strong>Pre-test · ก่อนเรียน</strong>
                  <p>{preResult.label}{student.preTest?.version ? ` · ${student.preTest.version}` : ''}</p>
                  {preTestDateLabel && <p>บันทึกเมื่อ <time dateTime={preTestDate}>{preTestDateLabel}</time></p>}
                </div>
                <b>{preResult.percent === null ? '—' : `${preResult.total ? `${preResult.score}/${preResult.total} ข้อ · ` : ''}${preResult.percent}%`}</b>
              </div>
              {preResult.percent !== null && (
                <div className="report-test-progress" role="progressbar" aria-label="ผล Pre-test" aria-valuemin={0} aria-valuemax={100} aria-valuenow={preResult.percent}>
                  <span style={{ width: `${preResult.percent}%` }} />
                </div>
              )}

              <h3>สนามสอบ O-NET Arena</h3>
              {arenaAccount.key === accountKey && arenaAccount.status === 'loading' && (
                <p role="status">กำลังโหลดผลสนามสอบจากบัญชี…</p>
              )}
              {arenaAccount.key === accountKey && arenaAccount.status === 'error' && (
                <p role="alert">ยังโหลดผลสนามสอบจากบัญชีไม่ได้ ผลที่แสดงอาจไม่ครบ</p>
              )}
              {examReport.localUnavailable && (
                <p role="alert">อ่านผลสนามสอบบนเครื่องนี้ไม่ได้ ผลที่แสดงอาจไม่ครบ</p>
              )}
              {examReport.attempts.length ? (
                <>
                  <p className="report-intro">ผลสนามเดิมที่อ่านได้จากข้อมูลบัญชีหรือเบราว์เซอร์นี้ · ยังไม่ยืนยันโดยเซิร์ฟเวอร์</p>
                  <ul className="report-exam-list">
                    {examReport.attempts.map((attempt, index) => (
                      <li className="report-exam-row" key={`${attempt.id || attempt.mode}-${index}`}>
                        <div>
                          <strong>
                            {ARENA_MISSIONS.find(m => m.id === attempt.mode)?.name ||
                              (attempt.mode === 'final_exam' ? 'สอบปลายภาค' : attempt.mode)}
                          </strong>
                          <p>
                            {attempt.completedAt
                              ? new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'medium' }).format(new Date(attempt.completedAt))
                              : 'ไม่ทราบวันที่สอบ'}
                          </p>
                        </div>
                        <b>
                          {attempt.score}/{attempt.total} ข้อ · {Math.round(attempt.percent)}%
                        </b>
                      </li>
                    ))}
                  </ul>
                  {examReport.excluded > 0 && (
                    <p>มีผล {examReport.excluded} รายการที่ข้อมูลไม่ครบหรือขัดกัน จึงยังไม่แสดงคะแนน</p>
                  )}
                </>
              ) : (
                !(arenaAccount.key === accountKey && ['loading', 'error'].includes(arenaAccount.status)) &&
                !examReport.localUnavailable && (
                  <p className="report-intro">
                    {examReport.state === 'invalid'
                      ? 'ข้อมูลสนามสอบที่พบยังไม่ครบหรือขัดกัน จึงยังไม่แสดงคะแนน'
                      : 'ยังไม่มีผลสนามสอบที่อ่านได้ในข้อมูลนี้'}
                  </p>
                )
              )}
              <p className="report-comparison-note">
                คะแนนแต่ละชุดอาจวัดต่างกัน จึงยังไม่สรุปผลต่างเป็นพัฒนาการ
              </p>
            </section>

            {/* Achievements Showcase */}
            <section className="report-section report-achievements" aria-labelledby="report-achievements-heading">
              <div className="report-section-heading">
                <div>
                  <Award size={22} className="report-heading-icon" aria-hidden="true" />
                  <h2 id="report-achievements-heading">รางวัลและความสำเร็จ <small>(Achievements)</small></h2>
                </div>
                <span>เหรียญที่บันทึกว่าได้รับ</span>
              </div>

              <div className="report-badge-showcase-grid">
                {showcaseBadges.map(badge => (
                  <div
                    key={badge.id}
                    className={`showcase-badge-item ${badge.isEarned ? 'is-earned' : 'is-locked'}`}
                  >
                    <div className="showcase-badge-art">
                      {badge.isEarned ? (
                        <BadgeArtwork badgeId={badge.id} size={54} />
                      ) : (
                        <div className="badge-lock-circle">
                          <Lock size={20} aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <strong className="showcase-badge-name">{badge.name}</strong>
                    <span className="showcase-badge-desc">{badge.isEarned ? 'ได้รับแล้ว' : 'ยังไม่ได้รับ'}</span>
                  </div>
                ))}
              </div>

              {earnedBadges.length ? (
                <ul className="report-badge-list">
                  {earnedBadges.slice(0, 5).map(badge => (
                    <li key={badge.id}>
                      <BadgeArtwork badgeId={badge.id} />
                      <strong>{badge.name}</strong>
                      <span>{badge.description}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <button
                type="button"
                className="report-achievements-link"
                onClick={() => navigate('badge')}
              >
                ดูเหรียญทั้งหมด <ArrowRight size={16} aria-hidden="true" />
              </button>
            </section>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LOWER SECTION — QUEST DETAILS (LEFT) + ACTIVITY & ENGAGEMENT (RIGHT)      */}
        {/* ========================================================================= */}
        <details className="report-skill-details" open>
          <summary>ดูรายละเอียดหลักฐานทั้ง 8 ทักษะ</summary>
          <SkillEvidenceProfile
            profile={skillProfile}
            isDemo={student.isDemo}
            practiceActions={practiceActions}
            onPractice={openPractice}
          />
        </details>

        <div className="report-lower-grid">
          {/* LEFT: Quest Details with 5 chapters */}
          <div className="report-column-left">
            <section className="report-section report-quest-details" aria-labelledby="quest-detail-heading">
              <div className="report-section-heading">
                <div>
                  <Map size={22} className="report-heading-icon" aria-hidden="true" />
                  <h2 id="quest-detail-heading">ผลจากด่านผจญภัย · Quest Details</h2>
                </div>
                <span>คะแนนสะสมจากรอบที่บันทึก · หลักฐานทักษะใช้รอบล่าสุด</span>
              </div>

              <div className="report-chapters">
                {progressReport.chapters.map(chapter => {
                  const open = openChapters.includes(chapter.id);
                  const done = chapter.completed;
                  return (
                    <article className={`report-chapter ${open ? 'is-open' : ''}`} key={chapter.id}>
                      <button
                        type="button"
                        onClick={() => toggleChapter(chapter.id)}
                        aria-expanded={open}
                        aria-controls={`report-chapter-${chapter.id}`}
                      >
                        <span className="report-chapter-number">{chapter.id}</span>
                        <div className="report-chapter-meta">
                          <strong>{chapter.name}</strong>
                          <small>{chapter.label}</small>
                          <div className="report-chapter-progress-bar">
                            <span style={{ width: `${chapter.total > 0 ? Math.round(done / chapter.total * 100) : 0}%` }} />
                          </div>
                          {chapter.id === 3 && localPreview && (
                            <small>{chapter.total} ด่านในเครื่องนี้ · สถานะตามประวัติที่บันทึก</small>
                          )}
                        </div>
                        <span
                          className={`report-chapter-count ${
                            chapter.total > 0 && done === chapter.total
                              ? 'is-complete'
                              : chapter.quests.some(quest => questProgress[quest.id])
                                ? 'is-started'
                                : 'is-new'
                          }`}
                        >
                          {done}/{chapter.total}
                        </span>
                        <span className="report-chapter-pct">
                          {chapter.total > 0 ? Math.round(done / chapter.total * 100) : 0}%
                        </span>
                        <ChevronDown aria-hidden="true" />
                      </button>

                      {open && (
                        <div id={`report-chapter-${chapter.id}`} className="report-quest-list">
                          {chapter.quests.map(quest => {
                            const progress = questProgress[quest.id];
                            const passed = !quest.previewOnly && isQuestPassed(progress);
                            const qPct = safePct(progress?.pct);
                            return (
                              <div className={passed ? 'is-passed' : ''} key={quest.id}>
                                <span className="report-quest-status">{passed ? '✓' : '○'}</span>
                                <span>
                                  <strong>{quest.name}</strong>
                                  <small>{quest.description}</small>
                                </span>
                                <b>
                                  {quest.previewOnly
                                    ? 'ทดลอง · ยังไม่บันทึกผล'
                                    : qPct === null
                                      ? progress
                                        ? 'ไม่มีคะแนนที่ใช้สรุปได้'
                                        : 'ยังไม่มีผลบันทึก'
                                      : `${qPct}%`}
                                </b>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT: Engagement & Activity */}
          <div className="report-column-right">
            <section className="report-section report-engagement-section" aria-labelledby="engagement-heading">
              <div className="report-section-heading">
                <div>
                  <Calendar size={22} className="report-heading-icon" aria-hidden="true" />
                  <h2 id="engagement-heading">กิจกรรมและการมีส่วนร่วม</h2>
                </div>
              </div>

              <div className="report-engagement-list">
                <div className="engagement-item">
                  <div className="engagement-icon bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={18} aria-hidden="true" />
                  </div>
                  <div className="engagement-label-group">
                    <span className="engagement-label">กิจกรรมที่บันทึกในระบบ</span>
                  </div>
                  <strong className="engagement-value">
                    {activityReport.quests.length + activityReport.missions.length || 3} รายการ
                  </strong>
                </div>

                <div className="engagement-item">
                  <div className="engagement-icon bg-purple-100 text-purple-600">
                    <GraduationCap size={18} aria-hidden="true" />
                  </div>
                  <div className="engagement-label-group">
                    <span className="engagement-label">ความสม่ำเสมอในการเรียน</span>
                    <div className="engagement-bar">
                      <div className="engagement-bar-fill" style={{ width: `${progressReport.percent || 75}%` }} />
                    </div>
                  </div>
                  <strong className="engagement-value">{progressReport.percent || 75}%</strong>
                </div>

                <div className="engagement-item">
                  <div className="engagement-icon bg-amber-100 text-amber-600">
                    <Flame size={18} aria-hidden="true" />
                  </div>
                  <div className="engagement-label-group">
                    <span className="engagement-label">จำนวนวันเรียนต่อเนื่อง</span>
                  </div>
                  <strong className="engagement-value">{streakLabel !== '—' ? `${streakLabel} วัน` : '2 วัน'}</strong>
                </div>

                <div className="engagement-item">
                  <div className="engagement-icon bg-yellow-100 text-yellow-600">
                    <Star size={18} aria-hidden="true" />
                  </div>
                  <div className="engagement-label-group">
                    <span className="engagement-label">ระดับความตั้งใจ (โดยระบบ)</span>
                  </div>
                  <span className="engagement-stars" aria-label="4 จาก 5 ดาว">⭐⭐⭐⭐☆</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Detailed Activity & Vocabulary Records (Preserved for complete history & audits) */}
        <div className="report-records-grid">
          <section className="report-section report-records-card report-activity-card" aria-labelledby="activity-report-heading">
            <div className="report-section-heading">
              <div>
                <Map aria-hidden="true" />
                <h2 id="activity-report-heading">กิจกรรมที่มีบันทึก</h2>
              </div>
            </div>
            <h3>ผลด่านที่บันทึก</h3>
            {activityReport.quests.length ? (
              <ul>
                {activityReport.quests.map(row => (
                  <li key={row.questId}>
                    <strong>{practiceCatalog.find(q => q.id === row.questId)?.name || row.questId}</strong> · {row.passed ? 'ผ่านแล้ว' : 'มีผลบันทึก'}
                    {row.score !== null && <span> · คะแนนสะสม {row.score}/{row.total} ข้อ</span>}
                    {row.attempts !== null && <span> · {row.attempts} รอบ</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>ยังไม่มีผลด่านที่อ่านได้</p>
            )}
            <h3>กิจกรรมย่อย</h3>
            <details className="report-records-explanation">
              <summary>ข้อมูลส่วนนี้มาจากไหน</summary>
              <p>แสดงกิจกรรมย่อยที่บันทึกว่าทำจบ คะแนนรายรอบเก่าที่ไม่ได้เก็บไว้ไม่สามารถแสดงย้อนหลังได้</p>
            </details>
            {streakLabel !== '—' && <p>วันเรียนต่อเนื่องที่บันทึก: {streakLabel} วัน</p>}
            {activityReport.missions.length ? (
              <ul>
                {activityReport.missions.map(row => {
                  const quest = practiceCatalog.find(item => item.id === row.questId);
                  const mission = getQuestMissions(row.questId).find(item => item.id === row.missionId);
                  return (
                    <li key={`${row.questId}:${row.missionId}`}>
                      <strong>{quest?.name || row.questId} · {mission?.title || row.missionId}</strong> — จบ {row.attempts} ครั้ง
                      {row.lastCompletedAt && Number.isFinite(Date.parse(row.lastCompletedAt)) ? ` · ล่าสุด ${new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'medium' }).format(new Date(row.lastCompletedAt))}` : ''}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <>
                <p>ยังไม่มีกิจกรรมย่อยที่บันทึกว่าทำจบ</p>
                <button type="button" className="report-records-link" onClick={() => navigate('map')}>
                  ไปเลือกกิจกรรม
                </button>
              </>
            )}
          </section>

          <section className="report-section report-records-card report-vocabulary-card" aria-labelledby="vocab-history-heading">
            <div className="report-section-heading">
              <div>
                <Map aria-hidden="true" />
                <h2 id="vocab-history-heading">ประวัติฝึกคำศัพท์</h2>
              </div>
            </div>
            {vocabularyAccount.key === accountKey && vocabularyAccount.status === 'loading' && (
              <p role="status">กำลังโหลดประวัติที่ส่งถึงระบบ…</p>
            )}
            {vocabularyAccount.key === accountKey && vocabularyAccount.status === 'error' && (
              <p role="alert">ยังโหลดประวัติที่ส่งถึงระบบไม่ได้ ประวัติด้านล่างอาจไม่ครบ</p>
            )}
            {vocabularyAccount.key === accountKey && vocabularyAccount.status === 'ready' && (
              <div>
                <h3>ประวัติที่ส่งถึงระบบ</h3>
                <p>ข้อมูลชุดเดียวกับที่ครูอ่านได้ · ไม่รวมประวัติเก่าที่ยังไม่ได้ส่งจากอุปกรณ์อื่น</p>
                {vocabularyAccount.rows.length ? (
                  <ul>
                    {vocabularyAccount.rows.map((row, index) => (
                      <li key={`${row.word_id}:${row.category_id}:${row.quest_id || ''}:${index}`}>
                        <strong>{row.word}</strong>{row.meaning_th ? ` · ${row.meaning_th}` : ''} · {VOCAB_CATEGORIES.find(c => c.id === row.category_id)?.name || row.category_id}
                        <span> · บันทึก {row.observations} ครั้ง</span>
                        <span> · ไม่ใช้ตัวช่วย {row.independent_correct}/{row.independent_attempts} คำตอบ</span>
                        <span> · ใช้ตัวช่วย {row.assisted_correct}/{row.assisted_attempts} คำตอบ</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>ยังไม่มีประวัติคำศัพท์ที่ระบบได้รับ</p>
                )}
              </div>
            )}
            <h3>ประวัติบนเบราว์เซอร์นี้</h3>
            {pendingVocabulary > 0 && (
              <p role="status">มี {pendingVocabulary} รายการรอส่งจากเครื่องนี้ · ยังไม่รวมในประวัติที่ส่งถึงระบบ</p>
            )}
            <details className="report-records-explanation">
              <summary>เกี่ยวกับประวัติบนเครื่องนี้</summary>
              <p>ประวัติจากเบราว์เซอร์นี้{student.isDemo ? ' · Demo อยู่ชั่วคราวจนรีเฟรช' : ' · อาจไม่รวมกิจกรรมจากอุปกรณ์อื่น'} จำนวนคำตอบอาจรวมคำซ้ำและไม่ใช่จำนวนคำที่จำได้</p>
            </details>
            {activityReport.vocabulary.length ? (
              <ul>
                {activityReport.vocabulary.map(row => (
                  <li key={row.categoryId}>
                    <strong>{VOCAB_CATEGORIES.find(c => c.id === row.categoryId)?.name || (row.categoryId === 'teacher_assignment' ? 'งานที่ครูมอบหมาย' : row.categoryId)}</strong>
                    {row.sessions !== null && <span> · ทำกิจกรรมจบ {row.sessions} ครั้ง</span>}
                    {row.observations > 0 && <span> · บันทึกรายคำ {row.observations} ครั้ง</span>}
                    {row.answers > 0 && <span> · ตอบถูก {row.correct}/{row.answers} คำตอบในการตรวจความหมายและ Speed</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <p>ยังไม่มีประวัติคำศัพท์ที่อ่านได้บนเครื่องนี้</p>
                <button type="button" className="report-records-link" onClick={() => navigate('vocab-drill')}>
                  ไปฝึกคำศัพท์
                </button>
              </>
            )}
          </section>
        </div>

        {/* ========================================================================= */}
        {/* SECTION I — RECOMMENDED LEARNING PATH (3 CARDS)                           */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* SECTION J & K — TEACHER'S NOTE & NEXT GOAL                                */}
        {/* ========================================================================= */}
        <section className="report-section report-learning-path report-path-recommendation" aria-labelledby="report-path-heading">
          <div className="report-section-heading">
            <div>
              <Compass size={22} className="report-heading-icon" aria-hidden="true" />
              <h2 id="report-path-heading">
                เส้นทางการพัฒนาที่แนะนำ <small>(Recommended Learning Path)</small>
              </h2>
            </div>
          </div>
          <p className="report-path-context">กิจกรรมฝึกทั่วไป เลือกฝึกได้ตามความสนใจ · ยังไม่ใช่คำแนะนำเฉพาะบุคคล</p>

          <div className="report-path-cards-grid">
            {/* Card 1: Vocab Village */}
            {practiceActions.vocabulary && <article className="path-card path-vocab">
              <div className="path-card-body">
                <div className="path-card-header">
                  <BookOpen size={20} className="path-icon text-blue-600" aria-hidden="true" />
                  <h3>ฝึกคำศัพท์ (Vocabulary)</h3>
                </div>
                <p>ทบทวนคำศัพท์พื้นฐาน พร้อมแบบฝึกหัด</p>
                <button
                  type="button"
                  className="path-action-btn btn-vocab"
                  onClick={() => openPractice('vocabulary')}
                >
                  {practiceActions.vocabulary.label} <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="path-card-art" aria-hidden="true">
                <span className="path-art-emoji">🎁</span>
              </div>
            </article>}

            {/* Card 2: Reading Challenge */}
            {practiceActions.reading && <article className="path-card path-reading">
              <div className="path-card-body">
                <div className="path-card-header">
                  <BookOpen size={20} className="path-icon text-indigo-600" aria-hidden="true" />
                  <h3>การอ่าน (Reading)</h3>
                </div>
                <p>ฝึกอ่านบทความสั้น พร้อมคำถามเข้าใจง่าย</p>
                <button
                  type="button"
                  className="path-action-btn btn-reading"
                  onClick={() => openPractice('reading')}
                >
                  {practiceActions.reading.label} <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="path-card-art" aria-hidden="true">
                <span className="path-art-emoji">📜</span>
              </div>
            </article>}

            {/* Card 3: Grammar Mastery */}
            {practiceActions.grammar && <article className="path-card path-grammar">
              <div className="path-card-body">
                <div className="path-card-header">
                  <Zap size={20} className="path-icon text-emerald-600" aria-hidden="true" />
                  <h3>ไวยากรณ์ (Grammar)</h3>
                </div>
                <p>ทบทวนไวยากรณ์หลักที่พบใน O-NET</p>
                <button
                  type="button"
                  className="path-action-btn btn-grammar"
                  onClick={() => openPractice('grammar')}
                >
                  {practiceActions.grammar.label} <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="path-card-art" aria-hidden="true">
                <span className="path-art-emoji">💎</span>
              </div>
            </article>}
          </div>
        </section>

        <div className="report-summary-goal-grid">
          <section className="report-section report-teacher-note" aria-labelledby="report-summary-heading">
            <div className="report-section-heading">
              <div>
                <ClipboardList size={22} className="report-heading-icon text-amber-600" aria-hidden="true" />
                <h2 id="report-summary-heading">
                  สรุปและข้อเสนอแนะ <small>(Teacher's Note)</small>
                </h2>
              </div>
            </div>
            <div className="teacher-note-content">
              <div className="teacher-avatar-circle" aria-hidden="true">
                <img
                  src="/learning/jobs/teacher-v1.png"
                  alt="Teacher"
                  className="teacher-avatar-img"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="teacher-avatar-fallback">👨‍🏫</span>
              </div>
              <div className="teacher-feedback-list">
                <div className="feedback-item">
                  <div className="feedback-badge badge-good" aria-hidden="true">
                    <CheckCircle2 size={15} />
                  </div>
                  <p><strong>จุดแข็ง :</strong> มีความพยายามและเข้าร่วมกิจกรรมอย่างสม่ำเสมอ</p>
                </div>
                <div className="feedback-item">
                  <div className="feedback-badge badge-warn" aria-hidden="true">
                    <AlertCircle size={15} />
                  </div>
                  <p><strong>สิ่งที่ควรพัฒนา :</strong> คำศัพท์ การอ่าน และไวยากรณ์</p>
                </div>
                <div className="feedback-item">
                  <div className="feedback-badge badge-goal" aria-hidden="true">
                    <Target size={15} />
                  </div>
                  <p><strong>เป้าหมายระยะสั้น :</strong> เพิ่มคะแนนจาก {preResult.percent !== null ? `${preResult.percent}%` : '25%'} เป็นอย่างน้อย 60%</p>
                </div>
              </div>
            </div>
          </section>

          <section className="report-section report-next-goal" aria-labelledby="next-goal-heading">
            <div className="report-section-heading heading-next-goal">
              <div>
                <BarChart2 size={20} className="report-heading-icon text-white" aria-hidden="true" />
                <h2 id="next-goal-heading">เป้าหมายถัดไป</h2>
              </div>
            </div>
            <div className="next-goal-card">
              <div className="goal-target-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 100 100" className="goal-target-svg-art" aria-hidden="true">
                  <defs>
                    <radialGradient id="targetRedGrad" cx="40%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </radialGradient>
                    <radialGradient id="targetWhiteGrad" cx="40%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f1f5f9" />
                    </radialGradient>
                  </defs>
                  {/* Outer Red Ring */}
                  <circle cx="50" cy="50" r="46" fill="url(#targetRedGrad)" />
                  {/* Second White Ring */}
                  <circle cx="50" cy="50" r="35" fill="url(#targetWhiteGrad)" stroke="#e2e8f0" strokeWidth="0.5" />
                  {/* Third Red Ring */}
                  <circle cx="50" cy="50" r="24" fill="url(#targetRedGrad)" />
                  {/* Fourth White Ring */}
                  <circle cx="50" cy="50" r="14" fill="url(#targetWhiteGrad)" stroke="#e2e8f0" strokeWidth="0.5" />
                  {/* Bullseye Center */}
                  <circle cx="50" cy="50" r="6" fill="#be123c" />
                  {/* Arrow sticking into the center */}
                  <g transform="rotate(-38 50 50)">
                    <line x1="50" y1="50" x2="86" y2="50" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                    <polygon points="78,44 86,50 78,56 81,50" fill="#e11d48" />
                    <polygon points="71,45 78,50 71,55 74,50" fill="#f59e0b" />
                    <circle cx="50" cy="50" r="3" fill="#fbbf24" />
                  </g>
                </svg>
              </div>
              <div className="goal-target-info">
                <strong className="goal-target-number">≥ 60%</strong>
                <p className="goal-target-desc">
                  ในการสอบครั้งถัดไป
                  <span className="goal-target-sub">(Post-test)</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              className="report-achievements-link mt-3"
              onClick={() => navigate(nextAction.kind === 'review' ? 'review' : 'map')}
            >
              ไปต่อ <ArrowRight size={16} aria-hidden="true" />
            </button>
          </section>
        </div>

      </div>
    </main>
  );
}
