import UIIcon, { UIIconText } from '../UIIcon';
import { useState, useRef } from 'react';
import SpeakButton from '../SpeakButton';
import VocabTooltip from '../VocabTooltip';

// ── FlashcardGame ─────────────────────────────────────────────
// Props:
//   mission: { cards: [...], xpReward, title, subtitle, techniqueCard? }
//   techniqueCard: object หรือ null (TECHNIQUE_CARDS[key])
//   onComplete: (xpEarned) => void
//   onBack: () => void

export default function FlashcardGame({ mission, techniqueCard, onComplete, onBack, onEvidence, onPracticed, showXP = true, completionLabel = 'รับ XP แล้วไปต่อ!' }) {
  const [showTechnique, setShowTechnique] = useState(!!techniqueCard);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [failedImageId, setFailedImageId] = useState(null);
  const [results, setResults] = useState([]); // 'know' | 'again'
  const [phase, setPhase] = useState('study'); // 'study' | 'review' | 'done'
  const [reviewQueue, setReviewQueue] = useState([]);
  const [canAnswer, setCanAnswer] = useState(false);
  const [gameStartTime] = useState(Date.now());
  const cards = mission.cards || [];
  const cardRef = useRef(null);

  const currentCard = phase === 'review' ? reviewQueue[currentIdx] : cards[currentIdx];
  const totalCards = phase === 'review' ? reviewQueue.length : cards.length;
  const progress = Math.round((currentIdx / Math.max(totalCards, 1)) * 100);

  function handleFlip() {
    if (!flipped) {
      setCanAnswer(false);
      setTimeout(() => setCanAnswer(true), 1200); // 1.2 second mandatory read delay
    }
    setFlipped(f => !f);
  }

  function handleResponse(knew) {
    if (flipped && !canAnswer && knew) return; // Prevent fast-click spamming
    onPracticed?.(currentCard);
    onEvidence?.({ card: currentCard, mode: 'study', correct: null, assisted: true, selfReported: knew, observationId: `${phase}:${currentIdx}` });

    const newResults = [...results, { card: currentCard, knew }];
    setResults(newResults);

    if (!knew) {
      setReviewQueue(q => [...q, currentCard]);
    }

    setFlipped(false);
    setCanAnswer(false);
    const next = currentIdx + 1;

    if (next >= totalCards) {
      if (phase === 'study' && reviewQueue.length > 0) {
        setTimeout(() => { setPhase('review'); setCurrentIdx(0); }, 300);
      } else {
        setTimeout(() => setPhase('done'), 300);
      }
    } else {
      setTimeout(() => setCurrentIdx(next), 200);
    }
  }

  function calcXP() {
    const knew = results.filter(r => r.knew).length;
    const pct = knew / Math.max(results.length, 1);
    const durationSec = (Date.now() - gameStartTime) / 1000;
    // Anti-spam speed check: If total time spent is under 1s per card, award 0 XP
    const minRequiredSec = Math.max(cards.length * 1.0, 3);
    if (durationSec < minRequiredSec) {
      return 0;
    }
    return Math.round(mission.xpReward * Math.max(0.4, pct));
  }

  function getSpeakText(card) {
    if (!card) return '';
    if (card.frontLabel && /[A-Za-z]/.test(card.frontLabel) && !/[\u0E00-\u0E7F]/.test(card.frontLabel)) {
      return card.frontLabel;
    }
    if (card.front && /[A-Za-z]/.test(card.front) && !/[\u0E00-\u0E7F]/.test(card.front)) {
      return card.front;
    }
    return card.back || card.frontLabel || card.front || '';
  }

  // ── Technique Card Screen ─────────────────────────────────
  if (showTechnique && techniqueCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-6 border border-amber-300">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3"><UIIcon value={"🧠"} /></div>
            <h2 className="text-xl font-black text-amber-800">{techniqueCard.title}</h2>
            <p className="text-slate-500 text-sm mt-1">อ่านให้เข้าใจก่อนเล่น!</p>
          </div>
          <div className="space-y-3 mb-6">
            {techniqueCard.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-amber-50 rounded-xl p-3 border border-amber-200">
                <span className="text-2xl shrink-0"><UIIcon value={tip.icon} /></span>
                <div>
                  <p className="text-slate-800 font-bold text-sm">{tip.text}</p>
                  {tip.example && <p className="text-slate-500 text-xs mt-0.5">เช่น: {tip.example}</p>}
                </div>
              </div>
            ))}
          </div>
          {techniqueCard.strategy && (
            <div className="bg-amber-100 border border-amber-300 rounded-xl p-3 mb-6">
              <p className="text-amber-800 text-sm font-bold text-center"><UIIcon value={"💡"} /> {techniqueCard.strategy}</p>
            </div>
          )}
          <button
            onClick={() => setShowTechnique(false)}
            className="btn-primary w-full py-3"
          >
            เข้าใจแล้ว! เริ่มเลย <UIIcon value={"✅"} />
          </button>
        </div>
      </div>
    );
  }

  // ── Done Screen ────────────────────────────────────────────
  if (phase === 'done') {
    const knew = results.filter(r => r.knew).length;
    const xpEarned = calcXP();
    const pct = Math.round((knew / Math.max(results.length, 1)) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4"><UIIconText value={pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '💪'} /></div>
          <h2 className="text-2xl font-black text-amber-800 mb-2">จบแล้ว!</h2>
          <p className="text-slate-500 mb-6">{mission.title}</p>
          <div className={`grid ${showXP ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mb-8`}>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-600">{knew}</div>
              <div className="text-slate-500 text-xs">จำได้</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-amber-600">{pct}%</div>
              <div className="text-slate-500 text-xs">คะแนน</div>
            </div>
            {showXP && <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-yellow-600">+{xpEarned}</div>
              <div className="text-slate-500 text-xs">XP</div>
            </div>}
          </div>
          <button
            onClick={() => onComplete(xpEarned)}
            className="btn-success w-full py-3"
          >
            {completionLabel} <UIIcon value={"🎉"} />
          </button>
        </div>
      </div>
    );
  }

  const speakText = getSpeakText(currentCard);
  const showCardImage = Boolean(currentCard?.image && failedImageId !== currentCard.id);
  const frontText = currentCard?.frontType === 'text'
    ? currentCard.front
    : currentCard?.frontLabel || (showCardImage ? speakText : '');

  // ── Study / Review Screen ─────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-xl"><UIIcon value={"←"} /></button>
        <div className="flex-1">
          <h2 className="text-slate-800 font-black text-base">{mission.title}</h2>
          <p className="text-slate-500 text-xs"><UIIconText value={phase === 'review' ? '🔁 รอบทบทวน' : mission.subtitle} /></p>
        </div>
        <div className="text-slate-500 text-sm font-bold">{currentIdx + 1}/{totalCards}</div>
      </div>

      {/* Progress Bar */}
      <div className="progress-track h-2 mb-6">
        <div
          className="progress-fill bg-gradient-to-r from-amber-400 to-amber-500"
          style={{ width: `${progress}%`, height: '100%', transition: 'width 0.3s' }}
        />
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          ref={cardRef}
          data-testid="vocab-flashcard"
          onClick={handleFlip}
          className={`w-full max-w-sm cursor-pointer select-none transition-all duration-500 ${flipped ? 'scale-[0.98]' : ''}`}
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative w-full"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.4s ease',
              minHeight: '260px',
            }}
          >
            {/* Front */}
            <div
              className={`absolute inset-0 bg-white border-2 border-amber-300 p-8 ${String(currentCard?.front || '').length > 35 ? 'pt-16' : ''} flex flex-col items-center justify-center text-center rounded-3xl shadow-lg relative`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {speakText && (
                <div className="absolute top-4 right-4 z-20">
                  <SpeakButton text={speakText} className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700" />
                </div>
              )}
              {showCardImage && <img src={currentCard.image} alt={currentCard.imageAlt || ''} className="vocab-action-image" onError={() => setFailedImageId(currentCard.id)} />}
              {currentCard?.frontCaption && <p className="text-sm font-semibold text-slate-600 mb-2">{currentCard.frontCaption}</p>}
              {!showCardImage && <div className={`vocab-card-symbol ${currentCard?.frontType === 'text' ? `${String(currentCard?.front || '').length > 35 ? 'text-xl leading-snug' : 'text-3xl'} font-black break-words max-w-full mb-4` : 'text-7xl mb-4'}`}>{currentCard?.front}</div>}
              {frontText && (showCardImage || currentCard?.frontType !== 'text') && (
                <div className="vocab-flashcard-copy w-full min-w-0">
                  <p className="text-slate-800 text-xl font-black whitespace-pre-line break-words">
                    <VocabTooltip text={frontText} />
                  </p>
                </div>
              )}
              {currentCard?.hint && (
                <p className="text-slate-500 text-sm mt-3"><UIIcon value={"💡"} /> {currentCard.hint}</p>
              )}
              <p className="text-slate-500 text-xs mt-6">แตะเพื่อดูคำตอบ</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-400 p-8 flex flex-col items-center justify-center text-center rounded-3xl shadow-lg relative"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {speakText && (
                <div className="absolute top-4 right-4 z-20">
                  <SpeakButton text={currentCard?.back || speakText} className="p-2 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-800" />
                </div>
              )}
              {currentCard?.backCaption && <p className="text-sm font-semibold text-slate-700 mb-2">{currentCard.backCaption}</p>}
              <div className="vocab-flashcard-copy w-full min-w-0 text-xl sm:text-2xl leading-relaxed font-black text-amber-900 mb-2 whitespace-pre-line break-words" style={{ overflowWrap: 'anywhere' }}>
                <VocabTooltip text={currentCard?.back} />
              </div>
              <div className="text-xl text-amber-700 font-bold">{currentCard?.backThai}</div>
              {currentCard?.example && <section className="mt-4 text-sm text-slate-700" aria-label="ประโยคตัวอย่าง">
                <div className="flex items-center justify-center gap-2"><p>{currentCard.example}</p><SpeakButton text={currentCard.example} label="ฟังประโยคตัวอย่าง" /></div>
                <p className="mt-1">{currentCard.exampleThai}</p>
              </section>}
              {currentCard?.hint && (
                <div className="mt-4 px-4 py-2 rounded-xl bg-amber-200 border border-amber-300">
                  <p className="text-amber-800 text-sm"><UIIcon value={"💡"} /> {currentCard.hint}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Response Buttons (only after flip) */}
        {flipped && (
          <div className="flex gap-4 mt-8 w-full max-w-sm">
            <button
              onClick={() => handleResponse(false)}
              className="btn-danger flex-1 py-4"
            >
              <UIIcon value={"❌"} /> ยังไม่แม่น
            </button>
            <button
              onClick={() => handleResponse(true)}
              disabled={!canAnswer}
              className={`btn-success flex-1 py-4 transition-all ${
                !canAnswer ? 'opacity-40 cursor-not-allowed scale-95' : ''
              }`}
            >
              <UIIconText value={canAnswer ? '✅ จำได้!' : '⏳ อ่านคำตอบ...'} />
            </button>
          </div>
        )}

        {!flipped && (
          <div className="flex items-center gap-2 mt-8 text-slate-500 text-sm">
            <span>แตะการ์ดเพื่อดูคำตอบ</span>
            {speakText && <span className="text-xs bg-amber-100 px-2 py-0.5 rounded-full text-amber-700"><UIIcon value={"🔊"} /> กดฟังเสียงที่มุมการ์ดได้</span>}
          </div>
        )}
      </div>

      {/* XP Preview */}
      {showXP && <div className="mt-4 text-center text-slate-500 text-xs">
        <UIIcon value={"🎯"} /> รางวัล: สูงสุด +{mission.xpReward} XP
      </div>}
    </div>
  );
}
