import UIIcon from './UIIcon';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Search, X } from 'lucide-react';
import FlashcardGame from './games/FlashcardGame';
import VocabDuelGame from './games/VocabDuelGame';
import MemoryMatchGame from './games/MemoryMatchGame';
import SpeedRushGame from './games/SpeedRushGame';
import AudioDetectiveGame from './games/AudioDetectiveGame';
import HeadsUpCharades from './HeadsUpCharades';
import { VOCAB_CATEGORIES, VOCAB_GROUPS, getDrillMission, getDrillCards } from '../data/vocabDrill';
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
  const [query, setQuery] = useState('');
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
  const startMode = (mode, focused = false) => { evidenceSession.current = crypto.randomUUID(); completionRecorded.current = false; setQuestWordsOnly(focused); setActiveMode(mode); };
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
    setHistorySaveFailed(!saveVocabPractice(practiceId, updatedHistory));
    setActiveMode(null);
  };
  if (creditSetId && creditPilotAvailable) return <Suspense fallback={<p role="status">กำลังเปิดชุดฝึกเดิม…</p>}><VocabularyCreditTraining setId={creditSetId} initialStep={creditInitialStep} onEvidence={handleEvidence} onBack={() => setCreditSetId(null)} /></Suspense>;
  if (creditPilotOpen && creditPilotAvailable) return <Suspense fallback={<p role="status">กำลังเปิดชุดทดลองแต้มคำศัพท์…</p>}><VocabularyCreditsLab onBack={() => setCreditPilotOpen(false)} /></Suspense>;
  if (topThirtyOpen && topThirtyAvailable) return <TopThirtyPractice learnerId={student?.id} onBack={() => setTopThirtyOpen(false)} />;
  if (selectedCategory && activeMode) {
    const mission = getDrillMission(selectedCategory);
    const cards = selectedCards;
    if (!mission || !cards.length) return <main className="vocab-hub"><p role="alert">หมวดนี้ยังไม่มีชุดคำศัพท์พร้อมใช้</p><button onClick={() => { setActiveMode(null); setSelectedCategory(null); }}>กลับไปเลือกหมวด</button></main>;
    const props = { cards, title: questWordsOnly ? 'คำศัพท์จำเป็นของด่าน' : selectedCategory.name, onBack: () => setActiveMode(null), onComplete: handleGameComplete, onEvidence: handleEvidence };
    if (activeMode === 'quick_check') return <VocabularyQuickCheck {...props} />;
    if (activeMode === 'headsup') return <HeadsUpCharades {...props} />;
    if (activeMode === 'duel') return <VocabDuelGame {...props} />;
    if (activeMode === 'memory') return <MemoryMatchGame {...props} />;
    if (activeMode === 'speed') return <SpeedRushGame {...props} />;
    if (activeMode === 'audio') return <AudioDetectiveGame {...props} />;
    return <FlashcardGame mission={{ ...mission, cards, title: props.title, subtitle: 'ทบทวนคำศัพท์' }} onEvidence={handleEvidence} onComplete={handleGameComplete} onBack={() => setActiveMode(null)} />;
  }
  const categories = VOCAB_CATEGORIES.filter(cat => cat.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const practicedCategories = Object.keys(history.categories).length;
  const totalSessions = Object.values(history.categories).reduce((sum, item) => sum + item.sessions, 0);
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
    <section className="vocab-overview" aria-label="ภาพรวม Vocab Adventure">
      <div><strong>{VOCAB_CATEGORIES.length}</strong><span>หมวดคำศัพท์</span></div>
      <div><strong>{DRILL_MODES.length}</strong><span>รูปแบบเกม</span></div>
      <div><strong>{practicedCategories}</strong><span>หมวดที่เคยฝึก</span></div>
      <div><strong>{totalSessions}</strong><span>รอบสะสม</span></div>
    </section>
    <section className="vocab-daily" aria-label="โควตา XP ประจำวัน"><div><UIIcon value="🎁" /><strong>XP ทบทวนวันนี้</strong></div><span>{dailyData.totalXP} / {DAILY_XP_CAP} XP</span></section>
    {historySaveFailed && <p role="alert">บันทึกประวัติการฝึกในเครื่องไม่สำเร็จ</p>}
    <p className="vocab-evidence-note">ผลรายคำบันทึกในเบราว์เซอร์นี้{student?.isDemo ? ' · Demo เก็บชั่วคราวจนรีเฟรช' : ' แยกตามผู้เรียนและโรงเรียน'} · การตอบถูกในแบบฝึกยังไม่ใช่การยืนยันความเชี่ยวชาญ</p>
    {canSyncVocabulary(student) && <p className="vocab-evidence-note" role="status">{cloudStatus === 'error' ? 'ยังส่งผลให้ครูไม่ได้ · เก็บคิวไว้ในเครื่องและจะลองใหม่เมื่อเชื่อมต่อ' : wordHistory.events.some(event => event.cloudPending) ? 'กำลังรอส่งผลฝึกให้ครู…' : cloudStatus === 'synced' ? 'ส่งผลฝึกให้ครูแล้ว' : 'ผลฝึกใหม่จะส่งให้ครู · ประวัติเก่าในเครื่องยังไม่ส่งย้อนหลัง'} <button type="button" onClick={() => setSyncRevision(previous => previous + 1)}>ลองส่งอีกครั้ง</button></p>}
    <label className="vocab-search"><Search size={19} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาหมวดคำศัพท์" aria-label="ค้นหาหมวดคำศัพท์" /></label>
    {VOCAB_GROUPS.map(group => {
      const groupCategories = categories.filter(cat => cat.group === group.id);
      if (!groupCategories.length) return null;
      return <section key={group.id} className="vocab-group" aria-labelledby={`vocab-group-${group.id}`}><h2 id={`vocab-group-${group.id}`}>{group.name}</h2><div className="vocab-category-grid">
        {groupCategories.map(cat => {
          const count = getDrillCards(cat).length;
          const practice = history.categories[cat.id];
          return <button key={cat.id} data-category={cat.id} style={paletteStyle(cat.tone)} className="vocab-category" disabled={!count} onClick={event => { selectionTrigger.current = event.currentTarget; setSelectedCategory(cat); }} aria-haspopup="dialog">
            <img className="vocab-category-artwork" src={getVocabCategoryArtwork(cat.id)} alt="" aria-hidden="true" /><strong>{cat.name}</strong>
            <span className="vocab-category-history">{practice ? <><span>ฝึกแล้ว {practice.sessions} รอบ</span><small>ล่าสุด {formatVocabPracticeDate(practice.lastPracticedAt)}</small></> : <span>ยังไม่มีประวัติการฝึก</span>}</span>
            <span className="vocab-category-meta">{count ? `${count} รายการ` : 'ยังไม่พร้อม'}<ArrowRight size={16} aria-hidden="true" /></span>
          </button>;
        })}
      </div></section>;
    })}
    {!categories.length && <p className="vocab-empty" role="status">ไม่พบหมวดคำศัพท์<button onClick={() => setQuery('')}>ล้างการค้นหา</button></p>}
    {selectedCategory && !activeMode && <dialog ref={dialog} className="vocab-dialog" style={paletteStyle(selectedCategory.tone)} aria-labelledby="vocab-dialog-title" onCancel={closeSelection} onClick={e => { if (e.target === e.currentTarget) closeSelection(); }}>
      <header><div><img className="vocab-category-artwork" src={getVocabCategoryArtwork(selectedCategory.id)} alt="" aria-hidden="true" /><h2 id="vocab-dialog-title">{selectedCategory.name}</h2></div><button type="button" className="vocab-icon-button" onClick={closeSelection} aria-label="ปิดหน้าต่าง" title="ปิดหน้าต่าง"><X size={20} /></button></header>
      {linkedDeck && selectedCategory.id === linkedCategoryId && <section className="vocab-word-progress" aria-label="คำศัพท์ที่เชื่อมกับด่าน"><h3>คำศัพท์จำเป็นของด่าน · ตอบถูกในแบบฝึก {summarizeWords(wordHistory, linkedDeck.cards).recognized}/{linkedDeck.cards.length} คำ</h3><ul>{linkedDeck.cards.map(card => <li key={card.linkedWord}><span lang="en">{card.linkedWord}</span><small>{wordStatus(wordHistory, card).label}</small></li>)}</ul>{linkedDeck.missingWords.length > 0 && <p>กำลังเตรียมการ์ดเพิ่ม: {linkedDeck.missingWords.join(', ')}</p>}<button type="button" disabled={!linkedDeck.cards.length} onClick={() => creditPilotAvailable ? openCreditSet('quest:' + initialQuestId) : startMode('flashcard', true)}>ฝึกเฉพาะคำของด่าน</button><button type="button" disabled={linkedDeck.cards.length < 2} onClick={() => startMode('quick_check', true)}>ตรวจเฉพาะคำของด่าน</button></section>}
      {creditPilotAvailable && creditAccount.state?.sets.find(set => set.id === (linkedDeck && selectedCategory.id === linkedCategoryId ? 'quest:' + initialQuestId : 'category:' + selectedCategory.id)) && <CreditSetProgress set={creditAccount.state.sets.find(set => set.id === (linkedDeck && selectedCategory.id === linkedCategoryId ? 'quest:' + initialQuestId : 'category:' + selectedCategory.id))} onStart={step => openCreditSet(linkedDeck && selectedCategory.id === linkedCategoryId ? 'quest:' + initialQuestId : 'category:' + selectedCategory.id, step)} />}
      <details className="vocab-word-progress"><summary>ผลรายคำในหมวดนี้ · ตอบถูกในแบบฝึก {summarizeWords(wordHistory, getDrillCards(selectedCategory)).recognized}/{getDrillCards(selectedCategory).length}</summary><ul>{getDrillCards(selectedCategory).map(card => <li key={card.id}><span lang="en">{vocabularyWord(card)}</span><small>{wordStatus(wordHistory, card).label}</small></li>)}</ul></details>
      <div className="vocab-mode-list"><button type="button" onClick={() => startMode('quick_check')}>ตรวจคำศัพท์เบื้องต้น · ไม่คิด XP</button>{DRILL_MODES.map(mode => <button key={mode.id} onClick={() => startMode(mode.id)}><span className="vocab-mode-icon"><UIIcon value={mode.icon} size={22} /></span><span>{mode.name}</span><ArrowRight size={18} aria-hidden="true" /></button>)}</div>
    </dialog>}
  </main>;
}
