import UIIcon from './UIIcon';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Search, X } from 'lucide-react';
import FlashcardGame from './games/FlashcardGame';
import VocabDuelGame from './games/VocabDuelGame';
import MemoryMatchGame from './games/MemoryMatchGame';
import SpeedRushGame from './games/SpeedRushGame';
import AudioDetectiveGame from './games/AudioDetectiveGame';
import HeadsUpCharades from './HeadsUpCharades';
import { VOCAB_CATEGORIES, VOCAB_GROUPS, getDrillMission, getDrillCards } from '../data/vocabDrill';
import { QUEST_PALETTES } from '../utils/questPalette';
import { useApp } from '../App';
import { readVocabPractice, nextVocabPractice, saveVocabPractice, formatVocabPracticeDate } from '../utils/vocabPractice';
import '../vocab-drill.css';
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
export default function VocabDrillHub({ onBack, onAddXP }) {
  const { student } = useApp();
  const practiceId = student?.isDemo ? null : student?.id;
  const [history, setHistory] = useState(() => readVocabPractice(practiceId));
  const [historySaveFailed, setHistorySaveFailed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeMode, setActiveMode] = useState(null);
  const [query, setQuery] = useState('');
  const dialog = useRef(null);
  const selectionTrigger = useRef(null);
  const completionRecorded = useRef(false);
  const dailyData = getDailyDrillData();
  const closeSelection = () => { dialog.current?.close(); setSelectedCategory(null); selectionTrigger.current?.focus(); };
  useEffect(() => {
    if (selectedCategory && !activeMode) dialog.current?.showModal();
  }, [selectedCategory, activeMode]);
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
  if (selectedCategory && activeMode) {
    const mission = getDrillMission(selectedCategory);
    const cards = getDrillCards(selectedCategory);
    if (!mission || !cards.length) return <main className="vocab-hub"><p role="alert">หมวดนี้ยังไม่มีชุดคำศัพท์พร้อมใช้</p><button onClick={() => { setActiveMode(null); setSelectedCategory(null); }}>กลับไปเลือกหมวด</button></main>;
    const props = { cards, title: selectedCategory.name, onBack: () => setActiveMode(null), onComplete: handleGameComplete };
    if (activeMode === 'headsup') return <HeadsUpCharades {...props} />;
    if (activeMode === 'duel') return <VocabDuelGame {...props} />;
    if (activeMode === 'memory') return <MemoryMatchGame {...props} />;
    if (activeMode === 'speed') return <SpeedRushGame {...props} />;
    if (activeMode === 'audio') return <AudioDetectiveGame {...props} />;
    return <FlashcardGame mission={{ ...mission, cards, title: selectedCategory.name, subtitle: 'ทบทวนคำศัพท์' }} onComplete={handleGameComplete} onBack={() => setActiveMode(null)} />;
  }
  const categories = VOCAB_CATEGORIES.filter(cat => cat.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <main className="vocab-hub">
    <header className="vocab-header">
      {onBack && <button type="button" className="vocab-icon-button" onClick={onBack} aria-label="กลับแผนที่" title="กลับแผนที่"><ArrowLeft size={20} /></button>}
      <div><h1>Vocab Drill Center</h1><p>คลังคำศัพท์</p></div><span className="vocab-category-count">{VOCAB_CATEGORIES.length} หมวด</span>
    </header>
    <section className="vocab-daily" aria-label="โควตา XP ประจำวัน"><div><UIIcon value="🎁" /><strong>XP ทบทวนวันนี้</strong></div><span>{dailyData.totalXP} / {DAILY_XP_CAP} XP</span></section>
    {historySaveFailed && <p role="alert">บันทึกประวัติการฝึกในเครื่องไม่สำเร็จ</p>}
    <label className="vocab-search"><Search size={19} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาหมวดคำศัพท์" aria-label="ค้นหาหมวดคำศัพท์" /></label>
    {VOCAB_GROUPS.map(group => {
      const groupCategories = categories.filter(cat => cat.group === group.id);
      if (!groupCategories.length) return null;
      return <section key={group.id} className="vocab-group" aria-labelledby={`vocab-group-${group.id}`}><h2 id={`vocab-group-${group.id}`}>{group.name}</h2><div className="vocab-category-grid">
        {groupCategories.map(cat => {
          const count = getDrillCards(cat).length;
          const practice = history.categories[cat.id];
          return <button key={cat.id} data-category={cat.id} style={paletteStyle(cat.tone)} className="vocab-category" disabled={!count} onClick={event => { selectionTrigger.current = event.currentTarget; setSelectedCategory(cat); }} aria-haspopup="dialog">
            <span className="vocab-category-icon"><UIIcon value={cat.icon} size={25} /></span><strong>{cat.name}</strong>
            <span className="vocab-category-history">{practice ? <><span>ฝึกแล้ว {practice.sessions} รอบ</span><small>ล่าสุด {formatVocabPracticeDate(practice.lastPracticedAt)}</small></> : <span>ยังไม่มีประวัติการฝึก</span>}</span>
            <span className="vocab-category-meta">{count ? `${count} รายการ` : 'ยังไม่พร้อม'}<ArrowRight size={16} aria-hidden="true" /></span>
          </button>;
        })}
      </div></section>;
    })}
    {!categories.length && <p className="vocab-empty" role="status">ไม่พบหมวดคำศัพท์<button onClick={() => setQuery('')}>ล้างการค้นหา</button></p>}
    {selectedCategory && !activeMode && <dialog ref={dialog} className="vocab-dialog" style={paletteStyle(selectedCategory.tone)} aria-labelledby="vocab-dialog-title" onCancel={closeSelection} onClick={e => { if (e.target === e.currentTarget) closeSelection(); }}>
      <header><div><span className="vocab-category-icon"><UIIcon value={selectedCategory.icon} size={25} /></span><h2 id="vocab-dialog-title">{selectedCategory.name}</h2></div><button type="button" className="vocab-icon-button" onClick={closeSelection} aria-label="ปิดหน้าต่าง" title="ปิดหน้าต่าง"><X size={20} /></button></header>
      <div className="vocab-mode-list">{DRILL_MODES.map(mode => <button key={mode.id} onClick={() => { completionRecorded.current = false; setActiveMode(mode.id); }}><span className="vocab-mode-icon"><UIIcon value={mode.icon} size={22} /></span><span>{mode.name}</span><ArrowRight size={18} aria-hidden="true" /></button>)}</div>
    </dialog>}
  </main>;
}
