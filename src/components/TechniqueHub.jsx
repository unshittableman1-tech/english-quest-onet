import UIIcon, { UIIconText } from './UIIcon';
import { useState } from 'react';
import SpeakButton from './SpeakButton';

// ── TechniqueHub ──────────────────────────────────────────────
// Full O-NET Strategy & Cheat Sheet Hub from Kru Pattie (โค้งหักศอก)

export const ALL_TECHNIQUES = [
  {
    id: 'part1',
    part: 'Part 1',
    title: '💬 Conversation Patterns (บทสนทนา)',
    icon: '💬',
    color: 'from-amber-400 to-orange-500',
    description: 'สูตรทักทาย ถามตอบ และตอบรับตามสถานการณ์ในชีวิตประจำวัน',
    rules: [
      { q: 'How are you?', a: "I'm fine / Not bad / Pretty good / OK", note: 'ตอบความรู้สึกสบายดี' },
      { q: 'Thank you very much.', a: "You're welcome. / No problem. / Don't mention it.", note: 'ตอบรับคำขอบคุณ' },
      { q: "I'm sorry I'm late.", a: "That's OK. / Never mind. / Don't worry.", note: 'ตอบรับคำขอโทษ' },
      { q: 'Can I help you?', a: 'Yes, please. I\'m looking for... / No, thank you.', note: 'ในร้านค้า / ซื้อของ' },
      { q: 'Would you like some coffee?', a: 'Yes, please. / No, thank you.', note: 'การเสนอ / การชวน' },
      { q: 'May I go out, please?', a: 'Yes, you may. / No, you may not.', note: 'ขออนุญาตออกนอกห้อง' },
      { q: 'Nice to meet you.', a: 'Nice to meet you, too. (ต้องมี too!)', note: 'ทักทายคนเพิ่งรู้จัก' },
      { q: 'Goodbye!', a: 'See you! / Take care! / Bye!', note: 'อำลา' },
    ],
  },
  {
    id: 'part2',
    part: 'Part 2',
    title: '🚦 Signs & Notices (ป้ายสัญลักษณ์)',
    icon: '🚦',
    color: 'from-red-600 to-orange-500',
    description: 'สูตรถอดรหัสป้ายจราจรและป้ายเตือนในข้อสอบ O-NET',
    rules: [
      { q: 'NO + V-ing / Noun', a: 'ห้ามทำเด็ดขาด (ตัดช้อยส์ที่บอกว่าทำได้ทิ้ง)', note: 'เช่น No Parking = ห้ามจอด' },
      { q: 'FREE ...', a: 'ไม่ต้องจ่ายเงิน / ฟรี (ตัดช้อยส์ที่บอกว่าต้องจ่าย)', note: 'เช่น Free WiFi / Buy 1 Get 1 Free' },
      { q: '... ONLY', a: 'อนุญาตเฉพาะกลุ่มนั้นเท่านั้น', note: 'เช่น Staff Only = พนักงานเท่านั้น' },
      { q: 'OPEN / CLOSED', a: 'ดูวันและเวลาทำการ', note: 'เช่น Closed on Sundays = ปิดวันอาทิตย์' },
      { icon: '➡️', q: 'ลูกศรชี้', a: 'บอกทางเข้า/ออก หรือทิศทางจราจร', note: 'เช่น Entrance → (ทางเข้า)' },
    ],
  },
  {
    id: 'part3',
    part: 'Part 3',
    title: '📖 Reading Comprehension (การอ่าน)',
    icon: '📖',
    color: 'from-indigo-600 to-blue-600',
    description: 'สูตร Q → Scan → Answer อ่านจับใจความรวดเร็ว',
    rules: [
      { q: 'Who ... ?', a: 'มองหา: ชื่อคน, he, she, they, อาชีพ', note: 'ถามบุคคล' },
      { q: 'Where ... ?', a: 'มองหา: ชื่อสถานที่, in/at/on..., เมือง', note: 'ถามสถานที่' },
      { q: 'When ... ?', a: 'มองหา: เวลา, วัน, เดือน, ปี, o\'clock', note: 'ถามเวลา' },
      { q: 'Why ... ?', a: 'มองหา: because, to + V1, so', note: 'ถามเหตุผล' },
      { q: 'How ... ?', a: 'มองหา: by + พาหนะ (by bus, by car)', note: 'ถามวิธีการเดินทาง' },
      { q: 'How many ... ?', a: 'มองหา: ตัวเลขจำนวน (1, 2, 3...)', note: 'ถามจำนวน' },
      { q: 'Main idea ... ?', a: 'อ่านประโยคแรกและประโยคสุดท้ายของบทความ', note: 'ถามใจความสำคัญ' },
    ],
  },
  {
    id: 'part4',
    part: 'Part 4',
    title: '⚡ Grammar Indicators (คำใบ้ไวยากรณ์)',
    icon: '⚡',
    color: 'from-pink-600 to-rose-500',
    description: 'มองหาคำใบ้ (Indicator words) แล้วกาคำตอบทันที',
    rules: [
      { q: 'yesterday / last... / ...ago', a: 'กริยาช่อง 2 (went, ate, saw, played)', note: 'Past Simple Tense' },
      { q: 'now / at the moment / Listen!', a: 'is / am / are + V-ing', note: 'Present Continuous Tense' },
      { q: 'tomorrow / next... / soon', a: 'will + V ช่อง 1 ไม่เติมอะไรเลย', note: 'Future Simple Tense' },
      { q: 'always / usually / every day', a: 'V1 (เติม -s เมื่อประธานเป็น He/She/It)', note: 'Present Simple Tense' },
      { q: '... than ...', a: 'Adjective เติม -er หรือ more ...', note: 'การเปรียบเทียบขั้นกว่า' },
      { q: 'the ... (ในประโยคเปรียบเทียบ)', a: 'Adjective เติม -est หรือ the most ...', note: 'การเปรียบเทียบขั้นสุด' },
      { q: "didn't / don't / doesn't", a: 'กริยาช่อง 1 แท้เท่านั้น (ไม่เติม -s/-ed)', note: 'หลัง v.to do = V1' },
      { q: 'can / could / must / should', a: 'กริยาช่อง 1 แท้เท่านั้น', note: 'หลัง Modal Verb = V1' },
    ],
  },
  {
    id: 'part5',
    part: 'Part 5',
    title: '📦 Sentence & Event Ordering (เรียงลำดับ)',
    icon: '📦',
    color: 'from-amber-500 to-yellow-500',
    description: 'สูตรเรียงลำดับเหตุการณ์ในชีวิตประจำวัน',
    rules: [
      { q: 'คำบอกลำดับต้นประโยค', a: 'First / At first (เริ่ม) → Then / Next / After that (กลาง) → Finally / At last (จบ)', note: 'หาคำเชื่อมก่อนเสมอ' },
      { q: 'ลำดับซื้อตั๋ว / ขึ้นรถ', a: 'ไปถึง → ถามตั๋ว → จ่ายเงิน → รับตั๋ว → ขึ้นรถ/เข้าชม', note: 'arrived → asked → paid → got ticket → got on' },
      { q: 'ลำดับปรุงอาหาร', a: 'เตรียมวัตถุดิบ → ผสม → ปรุง/ต้ม/ทอด → เสิร์ฟ → รับประทาน', note: 'prepare → mix → cook → serve → eat' },
      { q: 'ลำดับประจำวัน', a: 'ตื่นนอน → แปรงฟัน → ทานอาหารเช้า → แต่งตัว → ไปโรงเรียน', note: 'wake up → brush → breakfast → uniform → school' },
    ],
  },
];

export default function TechniqueHub({ onBack }) {
  const [activePart, setActivePart] = useState('part1');
  const currentTech = ALL_TECHNIQUES.find(t => t.id === activePart) || ALL_TECHNIQUES[0];

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto pb-20" spellCheck={false}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        {onBack && (
          <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-xl"><UIIcon value={"←"} /></button>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-black text-gradient-gold"><UIIcon value={"🧠"} /> O-NET Technique Hub</h1>

        </div>
      </div>

      {/* Part Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {ALL_TECHNIQUES.map(tech => {
          const isActive = tech.id === activePart;
          return (
            <button
              key={tech.id}
              onClick={() => setActivePart(tech.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-400 text-slate-900 border-yellow-300 shadow-lg scale-105'
                  : 'glass-card text-slate-500 border-amber-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span><UIIcon value={tech.icon} /></span>
              <span>{tech.part}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Part Card */}
      <div className="glass-card p-6 border border-yellow-500/30 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentTech.color} flex items-center justify-center text-2xl shadow-lg`}>
            <UIIcon value={currentTech.icon} />
          </div>
          <div>
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest">{currentTech.part}</span>
            <h2 className="text-lg font-black text-slate-800">{currentTech.title}</h2>
          </div>
        </div>
        <p className="text-slate-500 text-xs">{currentTech.description}</p>
      </div>

      {/* Rules list */}
      <div className="space-y-3">
        {currentTech.rules.map((rule, idx) => (
          <div key={idx} className="glass-card p-4 border border-amber-200 hover:border-yellow-500/30 transition-all">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="font-bold text-yellow-300 text-sm flex-1 flex items-center gap-2">
                <span>{rule.q}</span>
                <SpeakButton text={rule.q} className="p-1 hover:bg-white/10 rounded" />
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-500 shrink-0 font-mono">
                #{idx + 1}
              </span>
            </div>
            <div className="text-emerald-300 font-bold text-sm mb-1">
              <UIIcon value={"👉"} /> {rule.a}
            </div>
            {rule.note && (
              <div className="text-slate-500 text-xs bg-black/20 rounded-lg p-2 mt-1">
                <UIIcon value={"💡"} /> {rule.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
