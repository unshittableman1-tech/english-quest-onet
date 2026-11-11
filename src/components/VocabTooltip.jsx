import React, { useState, useEffect, useRef } from 'react';
import { VOCAB_DICTIONARY } from '../data/vocab_dictionary';
import { hintRevealsAnswer } from '../utils/hintSafety';
import { getCachedMeaning, saveCachedMeaning, fetchLiveTranslation } from '../utils/dynamicTranslator';
import { tokenizeTextWithPhrases } from '../utils/phraseTokenizer';
import { useApp } from '../App';
import { evidenceOwner, isWordMasteredOrRecognized, markWordAsMastered } from '../utils/vocabWordEvidence';

const TooltipWord = ({
  word,
  initialMeaning,
  blockedMeanings = [],
  enableDynamic = true,
  isPhrase = false,
  owner = null,
  showToast = null,
}) => {
  const [show, setShow] = useState(false);
  const [meaning, setMeaning] = useState(initialMeaning || null);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  // If initialMeaning updates or was found in cache
  useEffect(() => {
    if (initialMeaning) {
      setMeaning(initialMeaning);
    } else {
      const cached = getCachedMeaning(word);
      if (cached) setMeaning(cached);
    }
  }, [word, initialMeaning]);

  // Option 1 & 3: Check if the learner already mastered this word (either through practice or explicit mark)
  const isMastered = isWordMasteredOrRecognized(word, owner);

  if (isMastered) {
    return <span>{word}</span>;
  }

  const handleTrigger = async (e) => {
    e.stopPropagation();
    setShow(prev => !prev);

    // If meaning is not yet known and dynamic translation is allowed
    if (!meaning && enableDynamic && !fetchedRef.current) {
      fetchedRef.current = true;
      setLoading(true);
      try {
        const fetched = await fetchLiveTranslation(word);
        if (fetched && !hintRevealsAnswer(fetched, blockedMeanings)) {
          setMeaning(fetched);
        }
      } catch {
        // Silently fail if offline or API limit
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMouseEnter = async () => {
    setShow(true);
    if (!meaning && enableDynamic && !fetchedRef.current) {
      fetchedRef.current = true;
      setLoading(true);
      try {
        const fetched = await fetchLiveTranslation(word);
        if (fetched && !hintRevealsAnswer(fetched, blockedMeanings)) {
          setMeaning(fetched);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMouseLeave = () => {
    setShow(false);
  };

  const handleMarkMastered = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!owner) return;
    markWordAsMastered(owner, word);
    setShow(false);
    if (showToast) {
      showToast(`✓ บันทึกว่าจำคำว่า "${word}" ได้แล้ว (จะไม่แปลซ้ำอีก)`);
    }
  };

  // If meaning reveals answer, don't show tooltip
  const safeMeaning = meaning && !hintRevealsAnswer(meaning, blockedMeanings) ? meaning : null;

  const underlineClass = isPhrase
    ? "vocab-phrase relative inline-block cursor-pointer border-b-2 border-dashed border-purple-600 text-purple-950 bg-purple-50/70 hover:bg-purple-100 hover:text-purple-950 transition-all font-bold px-1 mx-0.5 rounded select-none shadow-[0_1px_3px_rgba(147,51,234,0.12)]"
    : "vocab-word relative inline-block cursor-pointer border-b-2 border-dashed border-amber-600/70 text-amber-900 hover:text-amber-950 hover:bg-amber-100/50 transition-colors font-bold px-0.5 mx-0.5 rounded select-none";

  return (
    <span 
      className={underlineClass}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTrigger}
      title={safeMeaning || undefined}
    >
      {word}
      {show && (
        <span
          className="vocab-definition absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[280px] min-w-[90px] bg-slate-900 text-amber-100 text-xs px-3 py-2 rounded-xl z-[100] shadow-2xl border border-amber-400 text-center leading-relaxed font-semibold whitespace-normal break-words pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-1.5 text-slate-300">
              <span className="animate-spin text-amber-400">⏳</span> กำลังแปล...
            </span>
          ) : safeMeaning ? (
            <>
              {safeMeaning.includes('สูตร O-NET') ? (
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-400/50 mr-1.5 align-middle shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                  🧠 สูตร O-NET
                </span>
              ) : isPhrase ? (
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/50 mr-1.5 align-middle">
                  🔗 วลี / สำนวน
                </span>
              ) : null}
              <span className="block font-bold text-amber-100">💡 {safeMeaning}</span>

              {owner && (
                <div className="mt-2 pt-1.5 border-t border-slate-700/80 flex justify-center">
                  <button
                    type="button"
                    onClick={handleMarkMastered}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 transition-colors cursor-pointer active:scale-95"
                    title="ฉันจำคำนี้ได้แล้ว ไม่ต้องแปลอีก"
                  >
                    ✓ จำได้แล้ว ไม่ต้องแปลอีก
                  </button>
                </div>
              )}

              <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900/95"></span>
            </>
          ) : (
            <span className="text-slate-400">ยังไม่มีคำแปล</span>
          )}
        </span>
      )}
    </span>
  );
};

function getWordMeaning(word, activeVocab, keys) {
  if (!word) return null;
  const lower = word.toLowerCase().trim();
  if (!lower) return null;

  // 1. Direct match in dictionary
  const directKey = keys.find(k => k.toLowerCase() === lower);
  if (directKey) return activeVocab[directKey];

  // 2. Cached meaning check
  const cached = getCachedMeaning(lower);
  if (cached) return cached;

  // 3. Possessive 's stemming (e.g. someone's -> ของใครบางคน)
  if (lower.endsWith("'s") && lower.length > 2) {
    const base = lower.slice(0, -2);
    const baseKey = keys.find(k => k.toLowerCase() === base);
    if (baseKey) return `ของ${activeVocab[baseKey]}`;
  }

  // 4. Smart Stemming: ing, ed, s/es
  if (lower.endsWith('ing') && lower.length > 4) {
    const base = lower.slice(0, -3);
    const baseKey = keys.find(k => k.toLowerCase() === base || k.toLowerCase() === base + 'e');
    if (baseKey) return `กำลัง${activeVocab[baseKey]}`;
  }
  if (lower.endsWith('ed') && lower.length > 3) {
    const base = lower.slice(0, -2);
    const baseKey = keys.find(k => k.toLowerCase() === base || k.toLowerCase() === base + 'e');
    if (baseKey) return `ได้${activeVocab[baseKey]}แล้ว (อดีต V2)`;
  }
  if (lower.endsWith('es') && lower.length > 3) {
    const base = lower.slice(0, -2);
    const baseKey = keys.find(k => k.toLowerCase() === base);
    if (baseKey) return activeVocab[baseKey];
  }
  if (lower.endsWith('s') && lower.length > 2) {
    const base = lower.slice(0, -1);
    const baseKey = keys.find(k => k.toLowerCase() === base);
    if (baseKey) return activeVocab[baseKey];
  }

  return null;
}

export default function VocabTooltip({
  text,
  vocab,
  disabled,
  targetedOnly = false,
  keyword = '',
  blockedMeanings = [],
  enableDynamic = true
}) {
  const [revision, setRevision] = useState(0);

  // Safely read AppContext
  let appStudent = null;
  let showToast = null;
  try {
    const app = useApp();
    if (app) {
      appStudent = app.student;
      showToast = app.showToast;
    }
  } catch {
    // Outside AppContext
  }
  const owner = evidenceOwner(appStudent);

  // Listen to live mastered change events
  useEffect(() => {
    const onMasteredChange = () => setRevision(r => r + 1);
    window.addEventListener('onet_vocab_mastered_change', onMasteredChange);
    return () => window.removeEventListener('onet_vocab_mastered_change', onMasteredChange);
  }, []);

  if (!text) return null;
  if (disabled) return <span>{text}</span>;

  const targets = ((typeof keyword === 'string' ? keyword : '').match(/[a-zA-Z0-9]+(?:'[a-zA-Z]+)?/g) || []).map(w => w.toLowerCase());
  const dictionary = targetedOnly 
    ? Object.fromEntries(Object.entries(VOCAB_DICTIONARY).filter(([word]) => targets.includes(word.toLowerCase()))) 
    : VOCAB_DICTIONARY;
  const activeVocab = { ...dictionary, ...(vocab || {}) };
  
  // Extract all keys sorted by length descending
  const allKeys = Object.keys(activeVocab).sort((a, b) => b.length - a.length);
  // Multi-word phrases are keys containing spaces or hyphens
  const phraseKeys = allKeys.filter(k => k.includes(' ') || k.includes('-'));

  // 1. First split by multi-word phrases
  const segments = tokenizeTextWithPhrases(text, phraseKeys);

  // 2. Tokenize individual words within non-phrase segments
  const tokenRegex = /([a-zA-Z0-9]+(?:['\-_][a-zA-Z0-9]+)*)/g;

  return (
    <>
      {segments.map((seg, sIdx) => {
        if (seg.isPhrase) {
          const phraseMeaning = activeVocab[seg.phraseKey] || getWordMeaning(seg.text, activeVocab, allKeys);
          return (
            <TooltipWord
              key={`ph-${sIdx}-${revision}`}
              word={seg.text}
              initialMeaning={phraseMeaning}
              blockedMeanings={blockedMeanings}
              enableDynamic={enableDynamic}
              isPhrase={true}
              owner={owner}
              showToast={showToast}
            />
          );
        }

        const parts = seg.text.split(tokenRegex);
        return (
          <React.Fragment key={`seg-${sIdx}-${revision}`}>
            {parts.map((part, pIdx) => {
              if (!part) return null;
              // Check if part is an English word token
              const isWord = /^[a-zA-Z0-9]+(?:['\-_][a-zA-Z0-9]+)*$/.test(part);
              if (!isWord) {
                return <span key={`txt-${pIdx}`}>{part}</span>;
              }

              const meaning = getWordMeaning(part, activeVocab, allKeys);
              return (
                <TooltipWord
                  key={`wd-${pIdx}-${revision}`}
                  word={part}
                  initialMeaning={meaning}
                  blockedMeanings={blockedMeanings}
                  enableDynamic={enableDynamic}
                  owner={owner}
                  showToast={showToast}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}
