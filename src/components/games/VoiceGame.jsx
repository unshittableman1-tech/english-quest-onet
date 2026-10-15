import UIIcon, { UIIconText } from '../UIIcon';
import { useState, useRef, useEffect } from 'react';

export default function VoiceGame({ mission, onComplete, onBack }) {
  const sentences = mission.sentences || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState('play'); // play, done
  const [correctCount, setCorrectCount] = useState(0);
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        
        // Auto-check if matched
        if (event.results[0].isFinal) {
           checkAnswer(currentTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setErrorMsg('Error: ' + event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setErrorMsg('เบราว์เซอร์ของคุณไม่รองรับระบบสั่งงานด้วยเสียง (แนะนำให้ใช้ Chrome)');
    }
  }, [currentIdx]);

  function startListening() {
    if (!recognitionRef.current) return;
    setErrorMsg('');
    setTranscript('');
    setShowResult(false);
    setIsListening(true);
    recognitionRef.current.start();
  }

  function stopListening() {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  }

  function cleanString(str) {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  }

  function checkAnswer(spokenText) {
    if (!spokenText) return;
    const expected = cleanString(sentences[currentIdx].text);
    const spoken = cleanString(spokenText);
    
    // Simple matching: if spoken contains the expected phrase or is very similar
    const isRight = spoken.includes(expected) || expected.includes(spoken) && spoken.length > expected.length * 0.8;
    
    setIsCorrect(isRight);
    setShowResult(true);
    setIsListening(false);
    if (isRight) {
      setCorrectCount(c => c + 1);
    }
  }

  function handleNext() {
    const next = currentIdx + 1;
    if (next >= sentences.length) {
      setPhase('done');
      return;
    }
    setCurrentIdx(next);
    setTranscript('');
    setShowResult(false);
    setIsCorrect(false);
  }

  function calcXP() {
    return Math.round(mission.xpReward * Math.max(0.3, correctCount / Math.max(sentences.length, 1)));
  }

  if (phase === 'done') {
    const xpEarned = calcXP();
    const pct = Math.round((correctCount / sentences.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4"><UIIconText value={pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '💪'} /></div>
          <h2 className="text-2xl font-black text-amber-800 mb-2">ฝึกพูดสำเร็จ!</h2>
          <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-600">{correctCount}/{sentences.length}</div>
              <div className="text-slate-500 text-xs">ถูก</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-amber-600">{pct}%</div>
              <div className="text-slate-500 text-xs">ความแม่นยำ</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-yellow-600">+{xpEarned}</div>
              <div className="text-slate-500 text-xs">XP</div>
            </div>
          </div>
          <button onClick={() => onComplete(xpEarned)} className="btn-success w-full py-3">รับ XP!</button>
        </div>
      </div>
    );
  }

  const current = sentences[currentIdx] || {};

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-xl"><UIIcon value={"←"} /></button>
        <div className="flex-1">
          <h2 className="text-slate-800 font-black text-base">{mission.title || 'Voice Quest'}</h2>
          <p className="text-slate-500 text-xs">{mission.subtitle || 'ฝึกออกเสียงประโยค'}</p>
        </div>
        <div className="text-slate-500 text-sm">{currentIdx + 1}/{sentences.length}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-4 w-full">
          {current.context && <p className="text-slate-500 text-sm">{current.context}</p>}
          <div className="glass-card p-6 bg-white border-2 border-sky-300">
            <p className="text-2xl font-black text-sky-900">{current.text}</p>
            {current.thai && <p className="text-slate-500 mt-2 text-sm">{current.thai}</p>}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4 w-full">
          <button 
            onMouseDown={startListening} 
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            disabled={showResult}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse scale-110' : showResult ? 'bg-slate-200 text-slate-400' : 'bg-sky-500 text-white hover:bg-sky-400 active:scale-95'}`}
          >
            <UIIcon value={"🎤"} />
          </button>
          <p className="text-slate-500 text-xs">
            {isListening ? 'กำลังฟัง... (ปล่อยปุ่มเมื่อพูดจบ)' : showResult ? '' : 'กดค้างเพื่อพูด'}
          </p>

          <div className="min-h-[60px] w-full text-center">
            {transcript && (
              <p className="text-lg text-slate-700 italic">"{transcript}"</p>
            )}
            {errorMsg && <p className="text-rose-500 text-xs mt-2">{errorMsg}</p>}
          </div>
        </div>

        {showResult && (
          <div className={`w-full p-4 rounded-2xl text-center ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            <p className="font-black text-lg"><UIIconText value={isCorrect ? '✅ สำเนียงยอดเยี่ยม!' : '❌ เกือบแล้ว ลองอีกครั้ง หรือข้ามไปก่อน'} /></p>
            <button onClick={handleNext} className="mt-4 btn-primary w-full py-3">
              {currentIdx + 1 >= sentences.length ? 'ดูผลลัพธ์' : 'ข้อต่อไป'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
