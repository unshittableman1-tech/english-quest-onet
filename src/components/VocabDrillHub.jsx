import UIIcon from './UIIcon';
import { planVocabularyRound, recordVocabularyPractice, vocabularyCoverage, readVocabularyCoverage, saveVocabularyCoverage } from '../utils/vocabCoverage';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Search, X } from 'lucide-react';
import FlashcardGame from './games/FlashcardGame';
import VocabDuelGame from './games/VocabDuelGame';
import MemoryMatchGame from './games/MemoryMatchGame';
import SpeedRushGame from './games/SpeedRushGame';
import AudioDetectiveGame from './games/AudioDetectiveGame';
import HeadsUpCharades from './HeadsUpCharades';
import { VOCAB_CATEGORIES, VOCAB_GROUPS, getDrillMission, getDrillCards, filterVocabCategories } from '../data/vocabDrill';
import { PDF_VOCABULARY_SUMMARY } from '../data/pdfVocabulary';
import { getVocabCategoryArtwork } from '../data/vocabCategoryArtwork';
import { QUEST_PALETTES } from '../utils/questPalette';
import { useApp } from '../App';
import { readVocabPractice, nextVocabPractice, saveVocabPractice, formatVocabPracticeDate } from '../utils/vocabPractice';
import '../vocab-drill.css';
import TopThirtyPractice from './TopThirtyPractice';
import { getQuestVocabulary } from '../data/questVocabulary';
import { getQuestVocabularyDeck } from '../data/questVocabularyDecks';
import { evidenceOwner, readWordEvidence, recordWordEvidence, saveWordEvidence, summarizeWords, vocabularyWord, vocabularyWordId, wordStatus } from '../utils/vocabWordEvidence';
import VocabularyQuickCheck from './games/VocabularyQuickCheck';
import { canSyncVocabulary, sendVocabularyEvents } from '../utils/vocabPracticeCloud';
import StudentVocabularyAssignments from './StudentVocabularyAssignments';
import { vocabularyCreditsPilotEnabled } from '../utils/vocabularyCreditsPilot';
import useVocabularyCreditAccount from '../hooks/useVocabularyCreditAccount';
import { CreditSetProgress } from './vocabularyCredits/VocabularyCreditTraining';
const VocabularyCreditsLab = lazy(() => import('./vocabularyCredits/VocabularyCreditsLab'));
const VocabularyCreditTraining = lazy(() => import('./vocabularyCredits/VocabularyCreditTraining'));
export { VOCAB_CATEGORIES } from '../data/vocabDrill';

const DRILL_MODES = [
  { id: 'flashcard', name: 'ทบทวนคำ (Flashcard)', icon: '📖' },
  { id: 'audio', name: 'ฟังคำศัพท์ (Audio Detective)', icon: '🔊' },
  { id: 'memory', name: 'จับคู่คำ (Memory Match)', icon: '🃏' },
  { id: 'speed', name: 'สปีดรัน 60 วิ (Speed Rush)', icon: '⏱️' },
  { id: 'duel', name: 'ดวล 2 คน (1v1 Duel)', icon: '⚔️' },
  { id: 'headsup', name: 'ใบ้คำ (Heads-Up)', icon: '📱' },
];
const DAILY_XP_CAP = 50;
function getDailyDrillData() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const data = JSON.parse(localStorage.getItem('onet_vocab_drill_daily_v2'));
    if (data?.date === today) return data;
  } catch { /* Invalid local cache starts a fresh day. */ }
  return { date: today, totalXP: 0, categoryCounts: {} };
}
function paletteStyle(tone) {
  const p = QUEST_PALETTES[tone];
  return { '--vocab-ink': p.ink, '--vocab-soft': p.soft, '--vocab-edge': p.edge, '--vocab-surface': p.surface };
}
export default function VocabDrillHub({ onBack, onAddXP, initialQuestId = null }) {
  const { student } = useApp();
  const [creditPilotOpen, setCreditPilotOpen] = useState(false);
  const creditPilotAvailable = vocabularyCreditsPilotEnabled(student);
  const creditAccount = useVocabularyCreditAccount({ enabled: creditPilotAvailable });
  const [creditSetId, setCreditSetId] = useState(null);
  const [creditInitialStep, setCreditInitialStep] = useState(null);
  const openCreditSet = (id, step = null) => { setCreditInitialStep(step); setCreditSetId(id); };
  const practiceId = student?.isDemo ? null : student?.id;
  const [history, setHistory] = useState(() => readVocabPractice(practiceId));
  const [historySaveFailed, setHistorySaveFailed] = useState(false);
  const linkedCategoryId = getQuestVocabulary(initialQuestId)?.categoryId || null;
  const [selectedCategory, setSelectedCategory] = useState(() => VOCAB_CATEGORIES.find(category => category.id === linkedCategoryId) || null);
  const [activeMode, setActiveMode] = useState(null);
  const [roundCards, setRoundCards] = useState([]);
  const [coverageRevision, setCoverageRevision] = useState(0);
  const coverageSession = useRef(null);
  const guestCoverage = useRef({});
  const [query, setQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [pdfExpanded, setPdfExpanded] = useState(false);
  const [topThirtyOpen, setTopThirtyOpen] = useState(false);
  const topThirtyAvailable = import.meta.env.DEV && ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname);
  const dialog = useRef(null);
  const selectionTrigger = useRef(null);
  const completionRecorded = useRef(false);
  const dailyData = getDailyDrillData();
  const owner = evidenceOwner(student);
  const [wordHistory, setWordHistory] = useState(() => readWordEvidence(owner));
  const [cloudStatus, setCloudStatus] = useState('idle');
  const [syncRevision, setSyncRevision] = useState(0);
  const evidenceRef = useRef(wordHistory);
  const evidenceSession = useRef(crypto.randomUUID());
  const [questWordsOnly, setQuestWordsOnly] = useState(false);
  const linkedDeck = useMemo(() => getQuestVocabularyDeck(initialQuestId), [initialQuestId]);
  const selectedCards = useMemo(() => selectedCategory ? questWordsOnly && linkedDeck?.cards.length ? linkedDeck.cards : getDrillCards(selectedCategory) : [], [selectedCategory, questWordsOnly, linkedDeck]);
  useEffect(() => { const next = readWordEvidence(owner); evidenceRef.current = next; setWordHistory(next); setCloudStatus('idle'); }, [owner]);
  useEffect(() => {
    if (!canSyncVocabulary(student)) return;
    const retry = () => setSyncRevision(previous => previous + 1);
    window.addEventListener('online', retry);
    const timer = window.setInterval(retry, 30000);
    return () => { window.removeEventListener('online', retry); window.clearInterval(timer); };
  }, [owner]);
  useEffect(() => {
    if (!canSyncVocabulary(student) || !wordHistory.events.some(event => event.cloudPending)) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setCloudStatus('syncing');
      try {
        const accepted = new Set(await sendVocabularyEvents(student, wordHistory.events));
        if (cancelled) return;
        const next = { ...evidenceRef.current, events: evidenceRef.current.events.map(event => accepted.has(event.eventId) ? { ...event, cloudPending: false } : event) };
        evidenceRef.current = next;
        setWordHistory(next);
        if (!saveWordEvidence(owner, next)) setHistorySaveFailed(true);
        setCloudStatus('synced');
      } catch { if (!cancelled) setCloudStatus('error'); }
    }, 500);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [wordHistory, owner, syncRevision]);
  const handleEvidence = observation => {
    const wordId = vocabularyWordId(observation.card);
    if (!wordId) return;
    const next = recordWordEvidence(evidenceRef.current, {
      eventId: `${evidenceSession.current}:${observation.mode}:${observation.observationId}`,
      wordId, word: vocabularyWord(observation.card), categoryId: observation.assignmentId ? 'teacher_assignment' : selectedCategory.id,
      questId: observation.assignmentId ? null : questWordsOnly ? initialQuestId : null, mode: observation.mode,
      assignmentId: observation.assignmentId || null,
      correct: observation.correct, assisted: observation.assisted,
      meaningTh: observation.card.backThai, cloudPending: canSyncVocabulary(student),
      selfReported: observation.selfReported ?? null, at: new Date().toISOString(),
    });
    evidenceRef.current = next;
    setWordHistory(next);
    if (!saveWordEvidence(owner, next)) setHistorySaveFailed(true);
  };
  const coverageScope = (focused = false) => focused ? `${selectedCategory.id}:quest:${initialQuestId}` : selectedCategory.id;
  const coverageFor = (scope) => guestCoverage.current[scope] || (owner ? readVocabularyCoverage(owner, scope) : {});
  const handlePracticed = (card, session) => {
    if (!session || session !== coverageSession.current || session.owner !== owner || !card) return;
    // Each word is consumed only after an interaction, not merely by opening a game.
    if (session.recorded.has(card.id)) return;
    session.recorded.add(card.id);
    const current = coverageFor(session.scope);
    const next = recordVocabularyPractice(current, session.mode, card);
    guestCoverage.current[session.scope] = next;
    if (!saveVocabularyCoverage(owner, session.scope, next)) setHistorySaveFailed(true);
    setCoverageRevision(value => value + 1);
  };
  const startMode = (mode, focused = false) => {
    evidenceSession.current = crypto.randomUUID(); completionRecorded.current = false;
    const scope = coverageScope(focused);
    const source = focused && linkedDeck?.cards.length ? linkedDeck.cards : getDrillCards(selectedCategory);
    coverageSession.current = { owner, scope, mode, recorded: new Set() };
    setRoundCards(mode === 'quick_check' ? source : planVocabularyRound(source, coverageFor(scope), mode));
    setQuestWordsOnly(focused); setActiveMode(mode);
  };
  useEffect(() => { setActiveMode(null); coverageSession.current = null; guestCoverage.current = {}; }, [owner]);
  const closeSelection = () => { dialog.current?.close(); setSelectedCategory(null); selectionTrigger.current?.focus(); };
  useEffect(() => {
    if (selectedCategory && !activeMode && !creditSetId && !creditPilotOpen) dialog.current?.showModal();
  }, [selectedCategory, activeMode, creditSetId, creditPilotOpen]);
  useEffect(() => { setHistory(readVocabPractice(practiceId)); setHistorySaveFailed(false); }, [practiceId]);
  const handleGameComplete = rawXP => {
    if (completionRecorded.current) return;
    completionRecorded.current = true;
    const data = getDailyDrillData();
    const catId = selectedCategory?.id || 'vocab';
    const currentCount = data.categoryCounts[catId] || 0;
    const multiplier = currentCount >= 2 ? 0 : currentCount === 1 ? .5 : 1;
    const xpEarned = Math.min(Math.round(rawXP * multiplier), Math.max(0, DAILY_XP_CAP - data.totalXP));
    if (xpEarned > 0 && onAddXP) onAddXP(xpEarned, `🃏 ${activeMode}: ${selectedCategory?.name}`);
    data.totalXP += xpEarned;
    data.categoryCounts[catId] = currentCount + 1;
    localStorage.setItem('onet_vocab_drill_daily_v2', JSON.stringify(data));
    const updatedHistory = nextVocabPractice(history, catId, activeMode);
    setHistory(updatedHistory);
    if (!saveVocabPractice(practiceId, updatedHistory)) setHistorySaveFailed(true);
    setActiveMode(null);
  };
  if (creditSetId && creditPilotAvailable) return <Suspense fallback={<p role="status">กำลังเปิดชุดฝึกเดิม…</p>}><VocabularyCreditTraining setId={creditSetId} initialStep={creditInitialStep} onEvidence={handleEvidence} onBack={() => setCreditSetId(null)} /></Suspense>;
  if (creditPilotOpen && creditPilotAvailable) return <Suspense fallback={<p role="status">กำลังเปิดชุดทดลองแต้มคำศัพท์…</p>}><VocabularyCreditsLab onBack={() => setCreditPilotOpen(false)} /></Suspense>;
  if (topThirtyOpen && topThirtyAvailable) return <TopThirtyPractice learnerId={student?.id} onBack={() => setTopThirtyOpen(false)} />;
  if (selectedCategory && activeMode) {
    const mission = getDrillMission(selectedCategory);
    const cards = roundCards;
    if (!mission || !cards.length) return <main className="vocab-hub"><p role="alert">หมวดนี้ยังไม่มีชุดคำศัพท์พร้อมใช้</p><button onClick={() => { setActiveMode(null); setSelectedCategory(null); }}>กลับไปเลือกหมวด</button></main>;
    const session = coverageSession.current;
    const onPracticed = card => handlePracticed(card, session);
    const completeGame = xp => { if (coverageSession.current === session) handleGameComplete(xp); };
    const leaveGame = () => { coverageSession.current = null; setActiveMode(null); };
    const props = { cards, coveragePlanned: true, choiceCards: selectedCards, onPracticed, title: questWordsOnly ? 'คำศัพท์จำเป็นของด่าน' : selectedCategory.name, onBack: leaveGame, onComplete: completeGame, onEvidence: handleEvidence };
    if (activeMode === 'quick_check') return <VocabularyQuickCheck {...props} />;
    if (activeMode === 'headsup') return <HeadsUpCharades {...props} />;
    if (activeMode === 'duel') return <VocabDuelGame {...props} />;
    if (activeMode === 'memory') return <MemoryMatchGame {...props} />;
    if (activeMode === 'speed') return <SpeedRushGame {...props} />;
    if (activeMode === 'audio') return <AudioDetectiveGame {...props} />;
    return <FlashcardGame mission={{ ...mission, cards, title: props.title, subtitle: 'ทบทวนคำศัพท์' }} onEvidence={handleEvidence} onPracticed={onPracticed} onComplete={completeGame} onBack={leaveGame} />;
  }

  const daysSince = isoString => {
    if (!isoString) return 999;
    return Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60 * 24)));
  };

  const weakWordsMap = useMemo(() => {
    const map = {};
    for (const cat of VOCAB_CATEGORIES) {
      const cards = getDrillCards(cat);
      let weak = 0;
      for (const card of cards) {
        if (wordStatus(wordHistory, card).status === 'practice') weak++;
      }
      map[cat.id] = weak;
    }
    return map;
  }, [wordHistory]);

  const recommendations = useMemo(() => {
    const recs = [];
    const usedIds = new Set();

    if (linkedCategoryId) {
      const cat = VOCAB_CATEGORIES.find(c => c.id === linkedCategoryId);
      if (cat) {
        usedIds.add(cat.id);
        recs.push({
          category: cat,
          tagClass: 'tag-quest',
          tagLabel: '🎯 ตรงกับเควสต์',
          reason: `คำศัพท์สำคัญของด่าน ${initialQuestId || ''} ฝึกให้คล่องก่อนลุยด่านต่อ`,
        });
      }
    } else {
      const practicedEntries = Object.entries(history.categories)
        .sort((a, b) => new Date(b[1].lastPracticedAt) - new Date(a[1].lastPracticedAt));
      const recentToContinue = practicedEntries.find(([id, data]) => data.sessions < 3);
      if (recentToContinue) {
        const cat = VOCAB_CATEGORIES.find(c => c.id === recentToContinue[0]);
        if (cat) {
          usedIds.add(cat.id);
          recs.push({
            category: cat,
            tagClass: 'tag-quest',
            tagLabel: '⚡ ลุยต่อจุดเดิม',
            reason: `ฝึกไปแล้ว ${recentToContinue[1].sessions} รอบ ลุยต่ออีกรอบเพื่อรับดาว Mastery 🏆`,
          });
        }
      }
    }

    const ONET_PRIORITY_IDS = ['signs', 'exam_commands', 'conversation', 'directions', 'school', 'family', 'feelings', 'culture'];
    for (const pid of ONET_PRIORITY_IDS) {
      if (usedIds.has(pid)) continue;
      const cat = VOCAB_CATEGORIES.find(c => c.id === pid);
      if (cat && (!history.categories[pid] || history.categories[pid].sessions === 0)) {
        usedIds.add(pid);
        recs.push({
          category: cat,
          tagClass: 'tag-hot',
          tagLabel: '🎯 หมวดแนะนำ',
          reason: 'เลือกหมวดนี้เพื่อเริ่มฝึกคำศัพท์และรูปแบบโจทย์',
        });
        break;
      }
    }
    if (recs.length < 2) {
      for (const pid of ONET_PRIORITY_IDS) {
        if (usedIds.has(pid)) continue;
        const cat = VOCAB_CATEGORIES.find(c => c.id === pid);
        if (cat) {
          usedIds.add(pid);
          recs.push({
            category: cat,
            tagClass: 'tag-hot',
            tagLabel: '🎯 หมวดแนะนำ',
            reason: 'เลือกฝึกคำศัพท์และรูปแบบโจทย์ในหมวดนี้',
          });
          break;
        }
      }
    }

    const weakCat = VOCAB_CATEGORIES.find(c => !usedIds.has(c.id) && weakWordsMap[c.id] > 0);
    if (weakCat) {
      usedIds.add(weakCat.id);
      recs.push({
        category: weakCat,
        tagClass: 'tag-review',
        tagLabel: '⚠️ มีคำต้องซ่อม',
        reason: `พบ ${weakWordsMap[weakCat.id]} คำที่คุณเคยตอบผิด ทวนซ้ำหมวดนี้เพื่ออุดจุดอ่อน`,
      });
    } else {
      const staleEntry = Object.entries(history.categories).find(([id, data]) => !usedIds.has(id) && daysSince(data.lastPracticedAt) >= 3);
      if (staleEntry) {
        const cat = VOCAB_CATEGORIES.find(c => c.id === staleEntry[0]);
        if (cat) {
          usedIds.add(cat.id);
          const days = daysSince(staleEntry[1].lastPracticedAt);
          recs.push({
            category: cat,
            tagClass: 'tag-review',
            tagLabel: '⏰ ถึงเวลาทบทวน',
            reason: `ฝึกไปเมื่อ ${days} วันก่อน กลับมาทบทวนอีกครั้งได้`,
          });
        }
      }
    }

    if (recs.length < 3) {
      for (const cat of VOCAB_CATEGORIES) {
        if (recs.length >= 3) break;
        if (usedIds.has(cat.id)) continue;
        if (!history.categories[cat.id]) {
          usedIds.add(cat.id);
          recs.push({
            category: cat,
            tagClass: 'tag-quest',
            tagLabel: '✨ หมวดใหม่น่าลอง',
            reason: 'เปิดโลกคำศัพท์ใหม่ เพิ่มคลังคำศัพท์ให้หลากหลายรอบด้าน',
          });
        }
      }
    }

    return recs.slice(0, 3);
  }, [linkedCategoryId, initialQuestId, history, weakWordsMap]);

  const recCategoryIds = useMemo(() => new Set(recommendations.map(r => r.category.id)), [recommendations]);
  const baseCategories = filterVocabCategories(query);
  const categories = useMemo(() => {
    if (filterTab === 'recommended') {
      return baseCategories.filter(cat => recCategoryIds.has(cat.id));
    }
    if (filterTab === 'practiced') {
      return baseCategories.filter(cat => history.categories[cat.id]?.sessions > 0);
    }
    if (filterTab === 'unpracticed') {
      return baseCategories.filter(cat => !history.categories[cat.id]?.sessions);
    }
    if (filterTab === 'needs_review') {
      return baseCategories.filter(cat => weakWordsMap[cat.id] > 0 || (history.categories[cat.id] && daysSince(history.categories[cat.id].lastPracticedAt) >= 3));
    }
    return baseCategories;
  }, [baseCategories, filterTab, recCategoryIds, history, weakWordsMap]);

  const allCount = VOCAB_CATEGORIES.length;
  const practicedCategories = VOCAB_CATEGORIES.filter(cat => history.categories[cat.id]?.sessions > 0).length;
  const unpracticedCount = allCount - practicedCategories;
  const reviewCount = VOCAB_CATEGORIES.filter(c => weakWordsMap[c.id] > 0 || (history.categories[c.id] && daysSince(history.categories[c.id].lastPracticedAt) >= 3)).length;
  const totalSessions = Object.values(history.categories).reduce((sum, item) => sum + item.sessions, 0);
  const visibleCategories = selectedGroup === 'all' ? categories : categories.filter(cat => cat.group === selectedGroup);
  const groups = [...VOCAB_GROUPS.filter(group => group.id !== 'pdf_vocabulary'), ...VOCAB_GROUPS.filter(group => group.id === 'pdf_vocabulary')];
  const shortGroupNames = { quest_verbs:'กริยาใน Quest', words:'คำศัพท์ใกล้ตัว', communication:'การสื่อสาร', culture:'วัฒนธรรม', grammar:'ไวยากรณ์', exam_intelligence:'ถอดรหัส O-NET', pdf_vocabulary:'ชุดคำศัพท์ ป.6' };
  return <main className="vocab-hub">
    <header className="vocab-header">
      {onBack && <button type="button" className="vocab-icon-button" onClick={onBack} aria-label="กลับแผนที่" title="กลับแผนที่"><ArrowLeft size={20} /></button>}
      <img className="vocab-hero-artwork" src="/learning/verbs/read-v1.png" alt="" aria-hidden="true" />
      <div><p className="vocab-kicker">สนามฝึกคำศัพท์</p><h1>Vocab Adventure</h1><p>เลือกโลกคำศัพท์ แล้วฝึกผ่านเกมที่คุณชอบ</p></div><span className="vocab-category-count">{VOCAB_CATEGORIES.length} หมวด</span>
    </header>
    {linkedCategoryId && <p className="vocab-quest-link" role="status">ศัพท์จำเป็นของด่าน {linkedDeck?.words.length || 0} คำ/วลี · ฝึกเฉพาะชุดนี้ได้ · การฝึกยังไม่ใช่เงื่อนไขปลดล็อก</p>}
    {canSyncVocabulary(student) && <StudentVocabularyAssignments student={student} wordHistory={wordHistory} onEvidence={handleEvidence} />}
    {creditPilotAvailable && <section className="top30-entry" aria-label="ทดลองแต้มคำศัพท์"><div><strong>แต้มคำศัพท์ช่วยอ่าน · {creditAccount.state?.balance ?? '…'} แต้ม</strong><span>ฝึกชุดเดิมครบ 3 ขั้น แล้วใช้แต้มแปลคำที่ต้องการ</span></div><button type="button" onClick={() => setCreditPilotOpen(true)}>ดูกระเป๋าแต้มและลองแปลคำ →</button></section>}
    {topThirtyAvailable && <section className="top30-entry" aria-label="Top 30 อ่านโจทย์ให้เข้าใจ"><div><strong>Top 30 · อ่านโจทย์ให้เข้าใจ</strong><span>ก่อนเรียน A · หลังเรียน B · ติดตาม C รวม 90 ข้อ</span></div><button type="button" onClick={() => setTopThirtyOpen(true)}>เปิดชุดฝึก →</button></section>}
    <section className="vocab-overview" aria-label="ความคืบหน้าของฉัน">
      <div><strong>{practicedCategories}</strong><span>หมวดที่เคยฝึก</span></div>
      <div><strong>{totalSessions}</strong><span>รอบสะสม</span></div>
      <div><strong>{dailyData.totalXP} / {DAILY_XP_CAP}</strong><span>XP ทบทวนวันนี้</span></div>
    </section>
    {historySaveFailed && <p role="alert">บันทึกประวัติการฝึกในเครื่องไม่สำเร็จ</p>}
    <p className="vocab-evidence-note">ผลรายคำบันทึกในเบราว์เซอร์นี้{student?.isDemo ? ' · Demo เก็บชั่วคราวจนรีเฟรช' : ' แยกตามผู้เรียนและโรงเรียน'} · การตอบถูกในแบบฝึกยังไม่ใช่การยืนยันความเชี่ยวชาญ</p>
    {canSyncVocabulary(student) && <p className="vocab-evidence-note" role="status">{cloudStatus === 'error' ? 'ยังส่งผลให้ครูไม่ได้ · เก็บคิวไว้ในเครื่องและจะลองใหม่เมื่อเชื่อมต่อ' : wordHistory.events.some(event => event.cloudPending) ? 'กำลังรอส่งผลฝึกให้ครู…' : cloudStatus === 'synced' ? 'ส่งผลฝึกให้ครูแล้ว' : 'ผลฝึกใหม่จะส่งให้ครู · ประวัติเก่าในเครื่องยังไม่ส่งย้อนหลัง'} <button type="button" onClick={() => setSyncRevision(previous => previous + 1)}>ลองส่งอีกครั้ง</button></p>}
    {/* Smart Next Recommendations */}
    {recommendations.length > 0 && (
      <section className="vocab-recommendations" aria-labelledby="vocab-rec-title">
        <div className="vocab-recommendations-header">
          <h2 id="vocab-rec-title">🎯 เลือกฝึกกันต่อ</h2>
          <p className="vocab-recommendations-subtitle">หมวดที่น่าลองและหมวดที่เคยฝึก</p>
        </div>
        <div className="vocab-recommendations-grid">
          {recommendations.map(rec => {
            const cat = rec.category;
            const practice = history.categories[cat.id];
            const count = getDrillCards(cat).length;
            return (
              <div key={rec.tagLabel + cat.id} className="vocab-rec-card">
                <div>
                  <span className={`vocab-rec-tag ${rec.tagClass}`}>{rec.tagLabel}</span>
                  <div className="vocab-rec-top">
                    <img className="vocab-rec-artwork" src={getVocabCategoryArtwork(cat.id)} alt="" aria-hidden="true" />
                    <div>
                      <h3 className="vocab-rec-title">{cat.name}</h3>
                      <p className="vocab-rec-reason">{rec.reason}</p>
                    </div>
                  </div>
                </div>
                <div className="vocab-rec-bottom">
                  <span className="vocab-rec-badge">
                    {practice?.sessions > 0 ? `🏆 ฝึกแล้ว ${practice.sessions} รอบ` : '✨ ยังไม่เคยฝึก'} • {count} คำ
                  </span>
                  <button
                    type="button"
                    className="vocab-rec-cta"
                    onClick={event => {
                      selectionTrigger.current = event.currentTarget;
                      setSelectedCategory(cat);
                    }}
                  >
                    เริ่มฝึกหมวดนี้ ➔
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    )}

    <label className="vocab-search"><Search size={19} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาหมวด คำศัพท์ หรือคำแปล" aria-label="ค้นหาหมวด คำศัพท์ หรือคำแปล" /></label>
    <div className="vocab-group-filter" role="group" aria-label="เลือกกลุ่มคำศัพท์">
      <button type="button" aria-pressed={selectedGroup === 'all'} onClick={() => setSelectedGroup('all')}>ทุกกลุ่ม</button>
      {groups.map(group => <button key={group.id} type="button" aria-pressed={selectedGroup === group.id} onClick={() => { setSelectedGroup(group.id); if (group.id === 'pdf_vocabulary') setPdfExpanded(true); }}>{shortGroupNames[group.id] || group.name}</button>)}
    </div>
    {/* Filter Pills Bar */}
    <div className="vocab-filter-bar" role="tablist" aria-label="ตัวกรองหมวดคำศัพท์">
      <button
        type="button"
        role="tab"
        aria-selected={filterTab === 'all'}
        className={`vocab-filter-pill ${filterTab === 'all' ? 'is-active' : ''}`}
        onClick={() => setFilterTab('all')}
      >
        ทั้งหมด <span className="pill-count">{allCount}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={filterTab === 'recommended'}
        className={`vocab-filter-pill ${filterTab === 'recommended' ? 'is-active' : ''}`}
        onClick={() => setFilterTab('recommended')}
      >
        🎯 แนะนำ <span className="pill-count">{recommendations.length}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={filterTab === 'practiced'}
        className={`vocab-filter-pill ${filterTab === 'practiced' ? 'is-active' : ''}`}
        onClick={() => setFilterTab('practiced')}
      >
        เคยฝึกแล้ว <span className="pill-count">{practicedCategories}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={filterTab === 'unpracticed'}
        className={`vocab-filter-pill ${filterTab === 'unpracticed' ? 'is-active' : ''}`}
        onClick={() => setFilterTab('unpracticed')}
      >
        ยังไม่เคยฝึก <span className="pill-count">{unpracticedCount}</span>
      </button>
      {reviewCount > 0 && (
        <button
          type="button"
          role="tab"
          aria-selected={filterTab === 'needs_review'}
          className={`vocab-filter-pill ${filterTab === 'needs_review' ? 'is-active' : ''}`}
          onClick={() => setFilterTab('needs_review')}
        >
          ⚠️ ต้องซ่อม/ควรทวน <span className="pill-count">{reviewCount}</span>
        </button>
      )}
    </div>

    {groups.map(group => {
      const groupCategories = visibleCategories.filter(cat => cat.group === group.id);
      if (!groupCategories.length) return null;
      if (group.id === 'pdf_vocabulary' && !pdfExpanded && !query.trim() && filterTab === 'all') return <section key={group.id} className="vocab-pdf-collection" aria-labelledby="vocab-pdf-title"><div><span>📚 คลังคำศัพท์</span><h2 id="vocab-pdf-title">ชุดคำศัพท์ ป.6</h2><p>{groupCategories.length} ชุด · {PDF_VOCABULARY_SUMMARY.uniqueWords} คำ/วลี</p></div><button type="button" onClick={() => { setSelectedGroup('pdf_vocabulary'); setPdfExpanded(true); }}>เลือกชุดคำศัพท์ <ArrowRight size={16} aria-hidden="true" /></button></section>;
      return <section key={group.id} className="vocab-group" aria-labelledby={`vocab-group-${group.id}`}><h2 id={`vocab-group-${group.id}`}>{group.name}</h2>{group.description && <p className="vocab-evidence-note">{group.description}</p>}<div className="vocab-category-grid">
        {groupCategories.map(cat => {
          const count = getDrillCards(cat).length;
          const practice = history.categories[cat.id];
          return <button key={cat.id} data-category={cat.id} style={paletteStyle(cat.tone)} className="vocab-category" disabled={!count} onClick={event => { selectionTrigger.current = event.currentTarget; setSelectedCategory(cat); }} aria-haspopup="dialog">
            <img className="vocab-category-artwork" src={getVocabCategoryArtwork(cat.id)} alt="" aria-hidden="true" /><strong>{cat.name}</strong>
            <div className="vocab-category-badges">
              {practice?.sessions > 0 ? (
                <span className={`vocab-badge-session is-tier${Math.min(3, practice.sessions)}`}>
                  {practice.sessions >= 3 ? '🏆' : practice.sessions === 2 ? '⭐⭐' : '⭐'} ฝึกแล้ว {practice.sessions} รอบ
                </span>
              ) : (
                <span className="vocab-badge-session is-new">✨ ยังไม่เคยฝึก</span>
              )}
              {practice?.sessions > 0 && daysSince(practice.lastPracticedAt) >= 3 && (
                <span className="vocab-badge-review">⏰ ควรทวน</span>
              )}
              {weakWordsMap[cat.id] > 0 && (
                <span className="vocab-badge-weak">⚠️ มี {weakWordsMap[cat.id]} คำต้องซ่อม</span>
              )}
            </div>
            {practice?.sessions > 0 && <span className="vocab-category-history"><small>ล่าสุด {formatVocabPracticeDate(practice.lastPracticedAt)}</small></span>}
            <span className="vocab-category-meta">{count ? `${count} รายการ` : 'ยังไม่พร้อม'}<ArrowRight size={16} aria-hidden="true" /></span>
          </button>;
        })}
      </div></section>;
    })}
    {!visibleCategories.length && <p className="vocab-empty" role="status">ไม่พบหมวดคำศัพท์<button onClick={() => { setQuery(''); setFilterTab('all'); setSelectedGroup('all'); }}>ล้างตัวกรอง</button></p>}
    {selectedCategory && !activeMode && <dialog ref={dialog} className="vocab-dialog" style={paletteStyle(selectedCategory.tone)} aria-labelledby="vocab-dialog-title" onCancel={closeSelection} onClick={e => { if (e.target === e.currentTarget) closeSelection(); }}>
      <header><div><img className="vocab-category-artwork" src={getVocabCategoryArtwork(selectedCategory.id)} alt="" aria-hidden="true" /><h2 id="vocab-dialog-title">{selectedCategory.name}</h2></div><button type="button" className="vocab-icon-button" onClick={closeSelection} aria-label="ปิดหน้าต่าง" title="ปิดหน้าต่าง"><X size={20} /></button></header>
      {selectedCategory.sourceNote && <p className="vocab-evidence-note">{selectedCategory.sourceNote}</p>}
      {linkedDeck && selectedCategory.id === linkedCategoryId && <section className="vocab-word-progress" aria-label="คำศัพท์ที่เชื่อมกับด่าน"><h3>คำศัพท์จำเป็นของด่าน · ตอบถูกในแบบฝึก {summarizeWords(wordHistory, linkedDeck.cards).recognized}/{linkedDeck.cards.length} คำ</h3><ul>{linkedDeck.cards.map(card => <li key={card.linkedWord}><span lang="en">{card.linkedWord}</span><small>{wordStatus(wordHistory, card).label}</small></li>)}</ul>{linkedDeck.missingWords.length > 0 && <p>กำลังเตรียมการ์ดเพิ่ม: {linkedDeck.missingWords.join(', ')}</p>}<button type="button" disabled={!linkedDeck.cards.length} onClick={() => creditPilotAvailable ? openCreditSet('quest:' + initialQuestId) : startMode('flashcard', true)}>ฝึกเฉพาะคำของด่าน</button><button type="button" disabled={linkedDeck.cards.length < 2} onClick={() => startMode('quick_check', true)}>ตรวจเฉพาะคำของด่าน</button></section>}
      {creditPilotAvailable && creditAccount.state?.sets.find(set => set.id === (linkedDeck && selectedCategory.id === linkedCategoryId ? 'quest:' + initialQuestId : 'category:' + selectedCategory.id)) && <CreditSetProgress set={creditAccount.state.sets.find(set => set.id === (linkedDeck && selectedCategory.id === linkedCategoryId ? 'quest:' + initialQuestId : 'category:' + selectedCategory.id))} onStart={step => openCreditSet(linkedDeck && selectedCategory.id === linkedCategoryId ? 'quest:' + initialQuestId : 'category:' + selectedCategory.id, step)} />}
      <details className="vocab-word-progress"><summary>ผลรายคำในหมวดนี้ · ตอบถูกในแบบฝึก {summarizeWords(wordHistory, getDrillCards(selectedCategory)).recognized}/{getDrillCards(selectedCategory).length}</summary><ul>{getDrillCards(selectedCategory).map(card => <li key={card.id}><span lang="en">{vocabularyWord(card)}</span><small>{wordStatus(wordHistory, card).label}</small></li>)}</ul></details>
      <p className="vocab-word-progress" data-coverage-revision={coverageRevision}>ทั้ง 6 เกมใช้ประวัติร่วมกัน · ฝึกแล้วรวม {vocabularyCoverage(getDrillCards(selectedCategory), coverageFor(selectedCategory.id)).practiced}/{getDrillCards(selectedCategory).length} คำ · เลือกคำที่ยังฝึกไม่ครบก่อน · จำบนอุปกรณ์นี้แยกผู้เรียน · ฝึกครบไม่ได้แปลว่าตอบถูกทั้งหมด</p><div className="vocab-mode-list"><button type="button" onClick={() => startMode('quick_check')}>ตรวจคำศัพท์เบื้องต้น · ไม่คิด XP</button>{DRILL_MODES.map(mode => {
        const all = getDrillCards(selectedCategory), coverage = vocabularyCoverage(all, coverageFor(selectedCategory.id), mode.id);
        const next = planVocabularyRound(all, coverageFor(selectedCategory.id), mode.id);
        return <button key={mode.id} aria-label={mode.name} onClick={() => startMode(mode.id)}><span className="vocab-mode-icon"><UIIcon value={mode.icon} size={22} /></span><span>{mode.name}<small className="block">เกมนี้ฝึกแล้ว {coverage.practiced}/{coverage.total} คำ · รอบถัดไป {next.length} {mode.id === 'memory' ? 'คู่' : 'คำ'}{coverage.cycles ? ` · ครบหมวด ${coverage.cycles} รอบ` : ''}</small></span><ArrowRight size={18} aria-hidden="true" /></button>;
      })}</div>
    </dialog>}
  </main>;
}
