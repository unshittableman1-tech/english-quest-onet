import { useState } from 'react';
import SpeakButton from './SpeakButton';
import { recordAnswer, summarize } from '../data/conversationPractice';
import { practiceBanks, practiceRound } from '../data/techniquePractice';

export default function ConversationPractice({ onClose, part, title }) {
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(0);
  const scenarios = practiceRound(part, round);
  const roundCount = practiceBanks[part].length <= 5 ? 1 : 2;
  const [answers, setAnswers] = useState({});
  const [showHint, setShowHint] = useState(false);
  const question = scenarios[index];
  const answer = question && answers[question.id];
  const selected = question?.options.find(option => option.id === answer?.selected);
  const result = summarize(answers);

  function restart() {
    setAnswers({});
    setIndex(0);
    setShowHint(false);
  }
  function nextRound() {
    setRound((round + 1) % roundCount);
    restart();
  }

  return (
    <section className="bg-white p-5 md:p-6 rounded-2xl border-2 border-amber-300 shadow-md mb-5" aria-label="แบบฝึกสูตรลัด">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-black text-slate-950">ลองฝึก {title}</h3>
          <p className="text-sm text-slate-700 mt-1">แบบฝึกทดลอง · ผลอยู่เฉพาะรอบนี้ ไม่บันทึกคะแนน</p>
        </div>
        <button type="button" onClick={onClose} className="text-sm font-bold text-blue-800 underline underline-offset-4">กลับไปดูสรุป</button>
      </div>
      {question ? (
        <>
          <p className="text-sm font-bold text-blue-900">ชุดที่ {round + 1} จาก {roundCount} · ข้อที่ {index + 1} จาก {scenarios.length} · {question.topic}</p>
          <div className="h-2 rounded-full bg-slate-100 mt-2 mb-5" role="progressbar" aria-label="ความคืบหน้าแบบฝึก" aria-valuemin={0} aria-valuemax={scenarios.length} aria-valuenow={index}>
            <div className="h-full rounded-full bg-amber-400" style={{ width: `${(index / scenarios.length) * 100}%` }} />
          </div>
          <p className="font-bold text-slate-800">{question.context}</p>
          <div className="flex items-center gap-2 mt-3 mb-4 text-lg font-black text-slate-950">
            <span lang="en">“{question.line}”</span><SpeakButton text={question.line} className="p-1 text-blue-800 rounded-lg hover:bg-blue-50" />
          </div>
          <p className="text-sm font-bold text-slate-700 mb-2">เลือกคำตอบที่เหมาะสม</p>
          <div className="grid gap-2">
            {question.options.map(option => (
              <button key={option.id} type="button" disabled={answer?.solved} onClick={() => setAnswers(previous => recordAnswer(previous, question, option.id))}
                className={`text-left px-4 py-3 rounded-xl border-2 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${answer?.selected === option.id ? (option.correct ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-amber-600 bg-amber-50 text-amber-950') : 'border-slate-200 text-slate-900 hover:border-blue-400 hover:bg-blue-50'} disabled:cursor-default`}>
                {option.text}
              </button>
            ))}
          </div>
          <div className="mt-4" aria-live="polite">
            {selected && <p className={`rounded-xl px-4 py-3 text-sm font-bold ${answer.solved ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'}`}>{answer.solved ? 'ถูกต้อง! ' : 'ลองอีกครั้งนะ · '}{selected.explanation}</p>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div><button type="button" onClick={() => setShowHint(!showHint)} aria-expanded={showHint} className="text-sm font-bold text-blue-800 underline underline-offset-4">{showHint ? 'ซ่อนคำใบ้' : 'ดูคำใบ้'}</button>{showHint && <p className="text-sm text-slate-700 mt-2">{question.hint}</p>}</div>
            {answer?.solved && <button type="button" onClick={() => { setIndex(index + 1); setShowHint(false); }} className="rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 font-black text-slate-950">{index === scenarios.length - 1 ? 'ดูสรุปรอบฝึก' : 'ข้อต่อไป →'}</button>}
          </div>
        </>
      ) : (
        <div aria-live="polite">
          <h4 className="text-xl font-black text-slate-950">ฝึกครบแล้ว เยี่ยมมาก!</h4>
          <p className="mt-3 text-slate-800">ทำครบ {result.completed} สถานการณ์ · ตอบถูกครั้งแรก {result.firstCorrect} จาก {scenarios.length} ข้อ</p>
          <p className="mt-2 text-sm text-slate-700">กลับไปดูสรุปหรือฝึกอีกครั้งได้ ผลรอบนี้ไม่ได้บันทึกเข้ารายงาน</p>
          <button type="button" onClick={restart} className="mt-5 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 font-black text-slate-950">ฝึกอีกครั้ง</button>
          {roundCount > 1 && <button type="button" onClick={nextRound} className="mt-5 ml-3 rounded-xl border-2 border-blue-700 px-5 py-2.5 font-black text-blue-900">ฝึกชุดถัดไป</button>}
        </div>
      )}
    </section>
  );
}
