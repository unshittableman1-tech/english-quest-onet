import React, { useState } from 'react';
import { VOCAB_DICTIONARY } from '../data/vocab_dictionary';

const TooltipWord = ({ word, meaning }) => {
  const [show, setShow] = useState(false);

  return (
    <span 
      className="vocab-word relative inline-block cursor-pointer border-b-2 border-dashed border-yellow-400/80 text-yellow-300 hover:text-yellow-100 transition-colors font-bold px-0.5 mx-0.5 rounded"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShow(!show);
      }}
    >
      {word}
      {show && (
        <span className="vocab-definition absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] bg-white/95 text-yellow-200 text-xs px-3 py-2 rounded-xl z-[100] shadow-2xl border border-yellow-500/40 text-center leading-relaxed font-semibold whitespace-normal break-words backdrop-blur-md">
          💡 {meaning}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900/95"></span>
        </span>
      )}
    </span>
  );
};

function getWordMeaning(word, activeVocab, keys) {
  if (!word) return null;
  const lower = word.toLowerCase().trim();
  if (!lower) return null;

  // 1. Direct match
  const directKey = keys.find(k => k.toLowerCase() === lower);
  if (directKey) return activeVocab[directKey];

  // 2. Smart Stemming
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
  if (lower.endsWith('s') && lower.length > 2) {
    const base = lower.slice(0, -1);
    const baseKey = keys.find(k => k.toLowerCase() === base);
    if (baseKey) return activeVocab[baseKey];
  }

  return null;
}

export default function VocabTooltip({ text, vocab, disabled, targetedOnly = false, keyword = '' }) {
  if (!text) return null;
  if (disabled) return <span>{text}</span>;
  const targets = ((typeof keyword === 'string' ? keyword : '').match(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g) || []).map(word => word.toLowerCase());
  const dictionary = targetedOnly ? Object.fromEntries(Object.entries(VOCAB_DICTIONARY).filter(([word]) => targets.includes(word.toLowerCase()))) : VOCAB_DICTIONARY;
  const activeVocab = { ...dictionary, ...(vocab || {}) };
  const keys = Object.keys(activeVocab).sort((a, b) => b.length - a.length);

  // Split into words and non-words
  const tokenRegex = /([a-zA-Z0-9]+(?:'[a-zA-Z]+)?)/g;
  const parts = text.split(tokenRegex);

  return (
    <>
      {parts.map((part, i) => {
        const meaning = getWordMeaning(part, activeVocab, keys);
        if (meaning) {
          return <TooltipWord key={i} word={part} meaning={meaning} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
