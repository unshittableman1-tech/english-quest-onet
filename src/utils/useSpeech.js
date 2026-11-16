// useSpeech.js — Web Speech API hook สำหรับออกเสียงภาษาอังกฤษ
import { useState, useCallback, useEffect, useRef } from 'react';

// ── ตรวจสอบว่า browser รองรับ Speech Synthesis ──────────────
export const isSpeechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

// ── หา voice ภาษาอังกฤษที่ดีที่สุด ──────────────────────────
function getBestEnglishVoice() {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();

  // Priority: US English female > US English > UK English > any English
  const priorities = [
    v => v.lang === 'en-US' && v.name.toLowerCase().includes('female'),
    v => v.lang === 'en-US' && v.name.toLowerCase().includes('samantha'),
    v => v.lang === 'en-US' && v.name.toLowerCase().includes('zira'),
    v => v.lang === 'en-US' && v.name.toLowerCase().includes('google'),
    v => v.lang === 'en-US',
    v => v.lang === 'en-GB',
    v => v.lang === 'en-AU',
    v => v.lang?.startsWith('en'),
  ];

  for (const check of priorities) {
    const found = voices.find(check);
    if (found) return found;
  }
  return null;
}

// ── หา voice ภาษาไทยที่ดีที่สุด ──────────────────────────
function getBestThaiVoice() {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  const priorities = [
    v => v.lang === 'th-TH' && v.name.toLowerCase().includes('google'),
    v => v.lang === 'th-TH' && v.name.toLowerCase().includes('premwa'),
    v => v.lang === 'th-TH' && v.name.toLowerCase().includes('niwat'),
    v => v.lang === 'th-TH',
    v => v.lang?.startsWith('th'),
  ];
  for (const check of priorities) {
    const found = voices.find(check);
    if (found) return found;
  }
  return null;
}

// ── ฟังก์ชันทำความสะอาดข้อความก่อนออกเสียง ────────────────
export function cleanSpeechText(text) {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text.replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\u200D\uFE0E\uFE0F]/gu, '');
  if (cleaned.includes('=')) {
    const parts = cleaned.split('=');
    if (/[A-Za-z]/.test(parts[0]) && /[\u0E00-\u0E7F]/.test(parts[1])) {
      cleaned = parts[0];
    }
  }
  cleaned = cleaned.replace(/\s*→\s*/g, ', ');
  return cleaned.replace(/\s+/g, ' ').trim();
}

// ── Main hook ─────────────────────────────────────────────────
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setSupported(isSpeechSupported());
    return () => {
      clearTimeout(timerRef.current);
      if (utteranceRef.current) {
        utteranceRef.current.onstart = null;
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!isSpeechSupported() || !text) return;
    const sanitized = cleanSpeechText(text);
    if (!sanitized) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();
    clearTimeout(timerRef.current);
    setSpeaking(false);

    // Small delay to ensure cancel completes
    timerRef.current = setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(sanitized);
      utteranceRef.current = utterance;

      const isThai = /[\u0E00-\u0E7F]/.test(sanitized);
      const lang = options.lang ?? (isThai ? 'th-TH' : 'en-US');
      const voice = isThai ? getBestThaiVoice() : getBestEnglishVoice();

      // Settings
      utterance.lang  = lang;
      utterance.rate  = options.rate  ?? (isThai ? 0.95 : 0.525);
      utterance.pitch = options.pitch ?? 1.05;
      utterance.volume = options.volume ?? 1;

      if (voice) utterance.voice = voice;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend   = () => { utteranceRef.current = null; setSpeaking(false); };
      utterance.onerror = () => { utteranceRef.current = null; setSpeaking(false); };

      window.speechSynthesis.speak(utterance);
    }, 50);
  }, []);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    if (isSpeechSupported()) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      utteranceRef.current = null;
    }
  }, []);

  return { speak, stop, speaking, supported };
}

// ── Singleton speak function (ใช้โดยไม่ต้อง hook) ──────────
export function speakText(text, options = {}) {
  if (!isSpeechSupported() || !text) return;
  const sanitized = cleanSpeechText(text);
  if (!sanitized) return;
  window.speechSynthesis.cancel();
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(sanitized);
    const isThai = /[\u0E00-\u0E7F]/.test(sanitized);
    const lang = options.lang ?? (isThai ? 'th-TH' : 'en-US');
    const voice = isThai ? getBestThaiVoice() : getBestEnglishVoice();

    utterance.lang   = lang;
    utterance.rate   = options.rate   ?? (isThai ? 0.95 : 0.525);
    utterance.pitch  = options.pitch  ?? 1.05;
    utterance.volume = options.volume ?? 1;
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }, 50);
}

// ── Load voices (Chrome requires this) ─────────────────────
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // Load voices on demand
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices(); // trigger cache
  };
}
