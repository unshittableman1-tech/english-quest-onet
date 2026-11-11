import UIIcon, { UIIconText } from './UIIcon';
import { useApp } from '../App';
import { useEffect } from 'react';
import { LESSONS } from '../data/lessons';
import SpeakButton from './SpeakButton';

export default function MiniLesson({ questId }) {
  const { navigate } = useApp();
  const lesson = LESSONS[questId];
  useEffect(() => {
    if (!lesson) navigate('quiz', questId);
  }, [lesson, navigate, questId]);

  if (!lesson) {
    return null;
  }

  // Final boss goes straight to quiz
  if (questId === 'finalboss') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4 float-anim"><UIIcon value={"🏆"} /></div>
          <h1 className="text-3xl font-black text-gradient-gold mb-2">O-NET Final Boss</h1>
          <p className="text-slate-600 mb-6">แบบทดสอบจำลอง O-NET ป.6</p>

          <div className="glass-card p-4 mb-6 text-left space-y-2">
            {lesson.aiTip.tips.map((tip, i) => (
              <div key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-amber-500 shrink-0">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="btn-ghost flex-1" onClick={() => navigate('map')}><UIIcon value={"←"} /> กลับ</button>
            <button className="btn-gold flex-1 text-lg" onClick={() => navigate('finalboss')}><UIIcon value={"⚔️"} /> เริ่มสอบ!</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className={`bg-gradient-to-r ${lesson.color} p-6 pt-10`}>
        <button
          className="text-white/80 text-sm font-semibold mb-4 flex items-center gap-1 hover:text-slate-800 transition-colors"
          onClick={() => navigate('map')}
        >
          <UIIcon value={"←"} /> กลับ Quest Map
        </button>
        <div className="text-5xl mb-2"><UIIcon value={lesson.icon} /></div>
        <h1 className="text-2xl font-black text-slate-800">{lesson.title}</h1>
        <p className="text-slate-800/80 text-sm mt-1">{lesson.subtitle}</p>
      </div>

      <div className="px-4 mt-5 max-w-lg mx-auto space-y-5">
        {/* Vocabulary Grid */}
        {lesson.vocab.length > 0 && (
          <div>
            <h2 className="section-title"><UIIcon value={"📋"} /> คำศัพท์/วลีสำคัญ</h2>
            <div className="grid grid-cols-2 gap-2">
              {lesson.vocab.map((item, i) => (
                <div key={i} className="glass-card p-3 flex items-center gap-2">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-11 w-11 shrink-0 object-contain" loading="lazy" />
                  ) : (
                    <span className="text-xl shrink-0">{item.emoji}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-slate-800 font-bold text-sm truncate">{item.en}</div>
                      <SpeakButton text={item.en} className="w-5 h-5" />
                    </div>
                    <div className="text-slate-500 text-xs truncate">{item.th}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Tip */}
        <div className="rounded-2xl overflow-hidden border border-amber-200">
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-3">
            <h3 className="font-black text-amber-800 text-base">{lesson.aiTip.title}</h3>
          </div>
          <div className="glass-card rounded-none p-4 space-y-2">
            {lesson.aiTip.tips.map((tip, i) => (
              <div key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-amber-500 font-black shrink-0"><UIIcon value={"💡"} /></span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Start Quiz button */}
        <div className="flex gap-3 pt-2">
          <button className="btn-ghost flex-1" onClick={() => navigate('map')}>
            <UIIcon value={"←"} /> กลับ
          </button>
          <button
            className={`flex-1 py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r ${lesson.color} hover:opacity-90 active:scale-95 transition-all shadow-xl`}
            onClick={() => navigate('quiz', questId)}
          >
            <UIIcon value={"⚔️"} /> เริ่ม Quiz!
          </button>
        </div>
      </div>
    </div>
  );
}
