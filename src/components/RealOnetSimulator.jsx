import UIIcon, { UIIconText } from './UIIcon';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_TECHNIQUES } from './TechniqueHub';
import SpeakButton from './SpeakButton';
import { prepareSimulatorParts, getSimulatorResults, SIMULATOR_TIME_LIMIT } from '../utils/simulator';

// ── RealOnetSimulator ─────────────────────────────────────────
// Authored five-part timed practice, scored as a percentage.

export const SIMULATOR_PARTS = [
    {
      id: 'part1',
      title: 'Part 1: Conversation',
      icon: '💬',
      desc: 'บทสนทนาในชีวิตประจำวัน (10 ข้อ)',
      tech: ALL_TECHNIQUES[0],
      questions: [
        { q: 'Amy: Good morning! How are you?\nAnn: ___', opts: ['I\'m fine, thank you.', 'Good morning, Amy.', 'I go to school.', 'See you tomorrow.'], ans: 0 },
        { q: 'A: Thank you for your help.\nB: ___', opts: ['You\'re welcome.', 'I\'m sorry.', 'That\'s OK.', 'Good luck.'], ans: 0 },
        { q: 'A: I\'m sorry I broke your ruler.\nB: ___', opts: ['That\'s all right.', 'You are welcome.', 'Yes, please.', 'No, thanks.'], ans: 0 },
        { q: 'Shopkeeper: Can I help you?\nCustomer: ___', opts: ['Yes, please. I\'m looking for a shirt.', 'I am fine, thanks.', 'Good morning.', 'See you later.'], ans: 0 },
        { q: 'A: Would you like some water?\nB: ___', opts: ['Yes, please.', 'I\'m sorry.', 'You\'re welcome.', 'That\'s OK.'], ans: 0 },
        { q: 'Tom: This is my friend, Tina.\nJohn: ___', opts: ['Nice to meet you, Tina.', 'What is your name?', 'I am 12 years old.', 'Where are you from?'], ans: 0 },
        { q: 'A: May I go to the toilet, please?\nThe teacher gives permission: ___', opts: ['Yes, you may.', 'No, you may not.', 'I am fine.', 'You\'re welcome.'], ans: 0 },
        { q: 'A: Can I borrow your pencil?\nB: ___', opts: ['Sure, here you are.', 'I don\'t like pencils.', 'Thank you very much.', 'Goodbye.'], ans: 0 },
        { q: 'Doctor: What\'s the matter?\nPatient: ___', opts: ['I have a headache.', 'I am a doctor.', 'I like pizza.', 'It is sunny today.'], ans: 0 },
        { q: 'A: Goodbye! Have a nice weekend.\nB: ___', opts: ['Thanks, you too!', 'I am fine.', 'Yes, please.', 'No, thank you.'], ans: 0 },
      ],
    },
    {
      id: 'part2',
      title: 'Part 2: Signs & Notices',
      icon: '🚦',
      desc: 'วิเคราะห์ป้ายจราจรและสัญลักษณ์ (10 ข้อ)',
      tech: ALL_TECHNIQUES[1],
      questions: [
        { q: 'Sign: NO PARKING MON-FRI\nWhat does this sign mean?', opts: ['You must not park here on weekdays.', 'You can park here on Monday.', 'Parking is free every day.', 'No cars allowed.'], ans: 0 },
        { q: 'Sign: BUY 1 GET 1 FREE\nWhat is TRUE about this offer?', opts: ['You get one extra item without paying.', 'You must pay for two items.', 'Everything is free.', 'The shop is closed.'], ans: 0 },
        { q: 'Sign: STAFF ONLY\nWho can enter this room?', opts: ['Employees of the shop', 'Customers', 'Children', 'Everyone'], ans: 0 },
        { q: 'Sign: CLOSED ON SUNDAYS\nWhen is this shop open?', opts: ['Monday to Saturday', 'Sunday only', 'Every day', 'Never'], ans: 0 },
        { q: 'Sign: FIRE EXIT\nWhen should you use this door?', opts: ['During an emergency/fire', 'To go to the bathroom', 'To buy food', 'Every day'], ans: 0 },
        { q: 'Sign: WET FLOOR\nWhat should you do?', opts: ['Walk carefully', 'Run fast', 'Sit down', 'Stop driving'], ans: 0 },
        { q: 'Sign: NO PETS ALLOWED\nWhat is NOT allowed?', opts: ['Dogs and cats', 'People', 'Cars', 'Bicycles'], ans: 0 },
        { q: 'Sign: KEEP QUIET\nWhere would you see this sign?', opts: ['In a library', 'At a football stadium', 'In a market', 'At a party'], ans: 0 },
        { q: 'Sign: SPEED LIMIT 50\nWhat does this sign mean?', opts: ['Do not drive faster than 50 km/h', 'Drive 50 km to the hospital', 'Only 50 cars allowed', 'Drive faster than 50'], ans: 0 },
        { q: 'Sign: NO PHOTOGRAPHY\nWhat can\'t you do?', opts: ['Take pictures', 'Walk', 'Speak', 'Listen to music'], ans: 0 },
      ],
    },
    {
      id: 'part3',
      title: 'Part 3: Reading Comprehension',
      icon: '📖',
      desc: 'อ่านจับใจความตอบคำถาม (10 ข้อ)',
      tech: ALL_TECHNIQUES[2],
      passage: 'Mike is 12 years old. He goes to Wattana School by bicycle every morning. He gets up at 6:00 a.m. His favorite subject is English because he likes reading books. After school, he plays football with his friends.',
      questions: [
        { q: 'How old is Mike?', opts: ['12 years old', '10 years old', '14 years old', '15 years old'], ans: 0 },
        { q: 'Where does Mike go to school?', opts: ['Wattana School', 'Bangkok School', 'Central School', 'Primary School'], ans: 0 },
        { q: 'How does Mike go to school?', opts: ['By bicycle', 'By bus', 'By car', 'On foot'], ans: 0 },
        { q: 'What time does Mike get up?', opts: ['6:00 a.m.', '7:00 a.m.', '5:30 a.m.', '6:30 a.m.'], ans: 0 },
        { q: 'What is Mike\'s favorite subject?', opts: ['English', 'Math', 'Science', 'P.E.'], ans: 0 },
        { q: 'Why does Mike like English?', opts: ['Because he likes reading books.', 'Because it is easy.', 'Because his teacher is nice.', 'Because he likes numbers.'], ans: 0 },
        { q: 'What does Mike do after school?', opts: ['Plays football with friends', 'Does homework', 'Watches TV', 'Goes shopping'], ans: 0 },
        { q: 'When is Halloween celebrated?', opts: ['October 31st', 'December 25th', 'January 1st', 'April 13th'], ans: 0, passage: 'Halloween is celebrated on October 31st. Children wear costumes and go trick-or-treating to collect candies. People carve pumpkins to make jack-o\'-lanterns.' },
        { q: 'What do children do on Halloween?', opts: ['Trick-or-treat for candies', 'Plant trees', 'Splash water', 'Eat mooncake'], ans: 0, passage: 'Halloween is celebrated on October 31st. Children wear costumes and go trick-or-treating to collect candies. People carve pumpkins to make jack-o\'-lanterns.' },
        { q: 'What is a jack-o\'-lantern?', opts: ['A carved pumpkin', 'A scary mask', 'A ghost costume', 'A sweet candy'], ans: 0, passage: 'Halloween is celebrated on October 31st. Children wear costumes and go trick-or-treating to collect candies. People carve pumpkins to make jack-o\'-lanterns.' },
      ],
    },
    {
      id: 'part4',
      title: 'Part 4: Grammar & Vocabulary',
      icon: '⚡',
      desc: 'ไวยากรณ์ Tense, Pronoun & Vocab (10 ข้อ)',
      tech: ALL_TECHNIQUES[3],
      questions: [
        { q: 'She ___ to school yesterday.', opts: ['went', 'goes', 'going', 'will go'], ans: 0 },
        { q: 'Look! The students ___ football now.', opts: ['are playing', 'play', 'played', 'will play'], ans: 0 },
        { q: 'An elephant is ___ than a horse.', opts: ['bigger', 'big', 'biggest', 'more big'], ans: 0 },
        { q: 'Mary has a cat. ___ cat is very cute.', opts: ['Her', 'She', 'Hers', 'Herself'], ans: 0 },
        { q: 'Do you have ___ milk left?', opts: ['any', 'some', 'many', 'few'], ans: 0 },
        { q: 'My brother works in a hospital and treats sick people. He is a ___.', opts: ['doctor', 'pilot', 'teacher', 'chef'], ans: 0 },
        { q: 'He didn\'t ___ his homework last night.', opts: ['do', 'did', 'does', 'doing'], ans: 0 },
        { q: 'Mount Everest is the ___ mountain in the world.', opts: ['highest', 'higher', 'high', 'more high'], ans: 0 },
        { q: 'My birthday is ___ October 31st.', opts: ['on', 'in', 'at', 'by'], ans: 0 },
        { q: 'We ___ to Japan next summer.', opts: ['will travel', 'traveled', 'travels', 'traveling'], ans: 0 },
      ],
    },
    {
      id: 'part5',
      title: 'Part 5: Sentence & Event Ordering',
      icon: '📦',
      desc: 'เรียงลำดับเหตุการณ์และประโยค (5 ข้อ)',
      tech: ALL_TECHNIQUES[4],
      questions: [
        { q: 'ข้อใดเรียงลำดับคำบอกเหตุการณ์ถูกต้อง?', opts: ['First → Then → Finally', 'Finally → First → Then', 'Then → First → Finally', 'First → Finally → Then'], ans: 0 },
        { q: 'เรียงลำดับเหตุการณ์ซื้อตั๋วหนัง:\nA. Paid for ticket\nB. Arrived at cinema\nC. Asked for ticket', opts: ['B → C → A', 'A → B → C', 'C → B → A', 'B → A → C'], ans: 0 },
        { q: 'เรียงลำดับชีวิตประจำวันตอนเช้า:\nA. Wake up\nB. Go to school\nC. Eat breakfast', opts: ['A → C → B', 'C → A → B', 'B → A → C', 'A → B → C'], ans: 0 },
        { q: 'เรียงประโยค: (school / She / yesterday / went / to)', opts: ['She went to school yesterday.', 'Yesterday to school went She.', 'She to school yesterday went.', 'Went She to school yesterday.'], ans: 0 },
        { q: 'เรียงขั้นตอนทำอาหาร:\nA. Cook\nB. Prepare\nC. Serve', opts: ['B → A → C', 'A → B → C', 'C → B → A', 'B → C → A'], ans: 0 },
      ],
    },
  ];

export default function RealOnetSimulator({ student, onBack, onAddXP }) {
  const [parts] = useState(() => prepareSimulatorParts(SIMULATOR_PARTS));
  const [phase, setPhase] = useState('intro');
  const [currentPartIdx, setCurrentPartIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(SIMULATOR_TIME_LIMIT);
  const answersRef = useRef({});
  const deadline = useRef(0);
  const submitted = useRef(false);
  const rewardAwarded = useRef(false);
  const advancing = useRef(false);
  const finish = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    setAnswers({ ...answersRef.current });
    setPhase('result');
  }, []);

  function startPart() {
    if (!deadline.current) deadline.current = Date.now() + SIMULATOR_TIME_LIMIT * 1000;
    setPhase('exam');
  }

  useEffect(() => { advancing.current = false; }, [currentPartIdx, currentQIdx]);

  // Timer countdown
  useEffect(() => {
    if (!deadline.current || !['exam', 'tip'].includes(phase)) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (!remaining) finish();
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, finish]);

  const currentPart = parts[currentPartIdx];
  const currentQ = currentPart?.questions[currentQIdx];

  function handleSelectOpt(optIdx) {
    if (submitted.current || phase !== 'exam') return;
    const key = `${currentPartIdx}_${currentQIdx}`;
    const next = { ...answersRef.current, [key]: optIdx };
    answersRef.current = next;
    setAnswers(next);
  }

  function handleNextQuestion() {
    if (submitted.current || advancing.current || answersRef.current[`${currentPartIdx}_${currentQIdx}`] === undefined) return;
    advancing.current = true;
    if (currentQIdx + 1 < currentPart.questions.length) {
      setCurrentQIdx(currentQIdx + 1);
    } else if (currentPartIdx + 1 < parts.length) {
      setCurrentPartIdx(currentPartIdx + 1);
      setCurrentQIdx(0);
      setPhase('tip'); // Show technique tip for next part
    } else {
      finish();
    }
  }

  function calculateResults() {
    return getSimulatorResults(parts, answers);
  }

  // Award Bonus XP on result screen
  useEffect(() => {
    if (phase === 'result' && !rewardAwarded.current) {
      rewardAwarded.current = true;
      const res = calculateResults();
      if (onAddXP && res.bonusXP > 0) {
        onAddXP(res.bonusXP, `คะแนนชุดฝึก 5 ส่วน: ${res.realScore}%`);
      }
    }
  }, [phase, onAddXP]);

  // ── Intro Screen ───────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto select-none">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center gap-3 mb-4 pt-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-sm font-bold active:scale-95 transition-all shadow-md"
            >
              <UIIcon value={"←"} /> ย้อนกลับ
            </button>
          )}
          <div className="flex-1 text-right">
            <span className="text-amber-400 text-xs font-bold">ชุดฝึก 5 ส่วน</span>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-3xl shadow-2xl w-full p-6 text-center text-white flex-1 flex flex-col justify-between">
          <div>
            <div className="text-6xl mb-4"><UIIcon value={"🏆"} /></div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 mb-2">ชุดฝึกภาษาอังกฤษ 5 ส่วน</h1>
            <p className="text-slate-400 text-sm mb-6">45 ข้อ · 45 นาที · คะแนนฝึกคิดเป็นเปอร์เซ็นต์</p>

            <div className="space-y-2 mb-6 text-left">
              {parts.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
                  <span className="text-slate-200 font-bold text-sm"><UIIcon value={p.icon} /> {p.title}</span>
                  <span className="text-amber-400 text-xs font-mono font-bold">{p.questions.length} ข้อ</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setPhase('tip')}
            className="w-full py-4 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 active:scale-95 transition-all shadow-xl mt-4"
          >
            พร้อมแล้ว <UIIcon value={"→"} /> เริ่มทำข้อสอบ! <UIIcon value={"🚀"} />
          </button>
        </div>
      </div>
    );
  }

  // ── Technique Tip Intermission ──────────────────────────────
  if (phase === 'tip') {
    return (
      <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto select-none">
        <div className="flex items-center gap-3 mb-4 pt-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-sm font-bold active:scale-95 transition-all shadow-md"
            >
              <UIIcon value={"←"} /> ออก
            </button>
          )}
          <div className="flex-1 text-right">
            <span className="text-amber-400 text-xs font-bold">{currentPart.title}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-3xl shadow-2xl w-full p-6 text-white flex-1 flex flex-col justify-between">
          <div>
            <div className="text-center mb-6">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">{currentPart.title}</span>
              <h2 className="text-xl font-black text-white mt-1"><UIIcon value={"🧠"} /> เทคนิคลัดประจำ Part นี้</h2>
              {deadline.current > 0 && <p role="timer" aria-label="เวลาที่เหลือ" className="text-sm text-amber-200 mt-2">เหลือ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>}
            </div>

            <div className="space-y-3 mb-6">
              {currentPart.tech.rules.slice(0, 4).map((rule, idx) => (
                <div key={idx} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5">
                  <p className="text-amber-300 font-bold text-sm"><UIIcon value={"💡"} /> {rule.q}</p>
                  <p className="text-emerald-300 text-xs mt-1"><UIIcon value={"👉"} /> {rule.a}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startPart}
            className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-95 transition-all shadow-xl mt-4"
          >
            เข้าใจสูตรลัดแล้ว <UIIcon value={"→"} /> ลุยข้อสอบ! <UIIcon value={"📝"} />
          </button>
        </div>
      </div>
    );
  }

  // ── Result Screen ──────────────────────────────────────────
  if (phase === 'result') {
    const res = calculateResults();
    return (
      <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto select-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-3xl shadow-2xl w-full p-6 text-center text-white flex-1 flex flex-col justify-between">
          <div>
            <div className="text-6xl mb-3"><UIIconText value={res.realScore >= 70 ? '🏆' : '💪'} /></div>
            <h2 className="text-2xl font-black text-amber-400 mb-1">ผลชุดฝึกภาษาอังกฤษ 5 ส่วน</h2>
            <p className="text-slate-400 text-xs mb-6">คะแนนฝึกจาก {res.totalQuestions} ข้อ</p>

            {/* Practice percentage */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 p-5 rounded-2xl mb-4">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-1">คะแนนฝึกของคุณ</div>
              <div className="text-5xl font-black text-amber-400">{res.realScore}%</div>
              <p className="text-slate-300 text-xs mt-2">
                ตอบถูก {res.totalCorrect} จาก {res.totalQuestions} ข้อ
              </p>
            </div>

            {/* Bonus XP Banner */}
            <div className="bg-emerald-500/20 border border-emerald-500/40 px-4 py-2.5 rounded-xl mb-6 flex items-center justify-between">
              <span className="text-emerald-300 text-xs font-bold"><UIIcon value={"🎁"} /> โบนัส XP ที่ได้รับ:</span>
              <span className="text-emerald-400 font-black text-base">+{res.bonusXP} XP</span>
            </div>

            {/* Part stats analytics */}
            <div className="space-y-2 mb-6 text-left">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2"><UIIcon value={"📊"} /> วิเคราะห์คะแนนแยกราย Part</p>
              {res.partStats.map((st, i) => (
                <div key={i} className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-slate-200 font-bold text-xs">{st.part}</span>
                  <span className={`font-black text-sm ${st.pct >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {st.correct}/{st.total} ({st.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full py-4 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 active:scale-95 transition-all shadow-xl mt-4"
          >
            <UIIcon value={"←"} /> กลับสู่หน้าหลัก <UIIcon value={"🗺️"} />
          </button>
        </div>
      </div>
    );
  }

  // ── Exam Screen ────────────────────────────────────────────
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const key = `${currentPartIdx}_${currentQIdx}`;
  const selectedOpt = answers[key];

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto select-none">
      {/* HUD Header with Back/Exit button */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold active:scale-95 transition-all shadow-md"
        >
          <UIIcon value={"←"} /> ย้อนกลับ
        </button>
        <div className="flex-1 text-center">
          <span className="text-xs font-black text-amber-400 uppercase tracking-wider">{currentPart.title}</span>
          <p className="text-slate-400 text-[10px]">ข้อ {currentQIdx + 1}/{currentPart.questions.length}</p>
        </div>
        <div role="timer" aria-label="เวลาที่เหลือ" className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-bold text-xs shadow-md">
          <UIIcon value={"⏱️"} /> {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Reading passage if present */}
      {currentQ.passage && (
        <div className="simulator-passage bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 mb-4 shadow-md">
          <p className="text-slate-200 text-sm leading-relaxed">{currentQ.passage}</p>
        </div>
      )}

      {/* Question Card (Dark eye-friendly design) */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-3xl p-6 mb-4 flex-1 flex flex-col shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-5">
          <p className="text-white font-bold text-base md:text-lg whitespace-pre-line flex-1 leading-relaxed">
            {currentQ.q}
          </p>
          <SpeakButton text={currentQ.q} className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl shrink-0 text-slate-300 hover:text-white transition-colors" />
        </div>

        {/* Options */}
        <div className="space-y-2.5 mt-auto">
          {currentQ.opts.map((opt, i) => {
            const isSelected = selectedOpt === i;
            return (
              <div key={i} className="flex items-center gap-2">
              <button
                key={i}
                aria-label={`คำตอบ ${String.fromCharCode(65 + i)}: ${opt}`} aria-pressed={isSelected}
                onClick={() => handleSelectOpt(i)}
                className={`w-full p-4 rounded-2xl text-sm font-bold text-left transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 scale-[1.01] shadow-xl'
                    : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700/80 hover:border-amber-400/60 text-slate-100 shadow-md active:scale-[0.99]'
                }`}
              >
                <span className="flex-1">
                  <span className={`font-mono mr-2.5 font-bold ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </span>
              </button>
              <SpeakButton text={opt} className="p-1 text-slate-400 hover:text-white shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNextQuestion}
        disabled={selectedOpt === undefined}
        className={`w-full py-4 rounded-2xl font-black transition-all shadow-xl ${
          selectedOpt !== undefined
            ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 hover:brightness-110 active:scale-95'
            : 'bg-slate-800/60 text-slate-600 border border-slate-700/60 cursor-not-allowed'
        }`}
      >
        <UIIconText value={currentQIdx + 1 >= currentPart.questions.length && currentPartIdx + 1 >= parts.length
          ? 'ส่งข้อสอบ 🏁'
          : currentQIdx + 1 >= currentPart.questions.length
            ? 'ไป Part ถัดไป →'
            : 'ข้อต่อไป →'} />
      </button>
    </div>
  );
}

