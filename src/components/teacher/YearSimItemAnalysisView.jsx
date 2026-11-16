// src/components/teacher/YearSimItemAnalysisView.jsx
import { useState, useMemo } from 'react';
import { 
  Search, Filter, ZoomIn, X, CheckCircle2, AlertTriangle, 
  BookOpen, Sparkles, HelpCircle, Layers, ArrowRight, Printer
} from 'lucide-react';
import { getOnetRealYearPool } from '../../data/onetRealExamPools';
import { aggregateClassItemAnalysis, SKILL_METADATA } from '../../data/yearSimItemAnalysis';

const CHOICE_COLORS = [
  'bg-blue-500',    // A
  'bg-purple-500',  // B
  'bg-amber-500',   // C
  'bg-emerald-500', // D
];

const CHOICE_BORDER_COLORS = [
  'border-blue-500/30',
  'border-purple-500/30',
  'border-amber-500/30',
  'border-emerald-500/30',
];

export default function YearSimItemAnalysisView({
  theme = 'light',
  selectedYear = 2565,
  onSelectYear,
  students = [],
}) {
  const isDark = theme === 'dark';
  const [activeYear, setActiveYear] = useState(selectedYear);
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // 'all' | 'hard' | 'moderate' | 'easy'
  const [skillFilter, setSkillFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);

  const currentYear = activeYear || selectedYear;

  // Load pool for selected year and aggregate with student data
  const itemAnalysisList = useMemo(() => {
    const pool = getOnetRealYearPool(currentYear) || [];
    return aggregateClassItemAnalysis(currentYear, pool, students);
  }, [currentYear, students]);

  // Filter list
  const filteredItems = useMemo(() => {
    return itemAnalysisList.filter(item => {
      // Difficulty filter
      if (difficultyFilter !== 'all' && item.difficultyKey !== difficultyFilter) {
        return false;
      }
      // Skill filter
      if (skillFilter !== 'all' && item.skill !== skillFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const text = `${item.number} ${item.questionText} ${item.options.join(' ')} ${item.skill} ${item.indicator} ${item.explanation?.keyword || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [itemAnalysisList, difficultyFilter, skillFilter, searchQuery]);

  // KPI Summary
  const stats = useMemo(() => {
    if (!itemAnalysisList.length) return { avgAccuracy: 0, hardCount: 0, moderateCount: 0, easyCount: 0 };
    const total = itemAnalysisList.length;
    const avg = Math.round(itemAnalysisList.reduce((acc, it) => acc + it.correctPct, 0) / total);
    const hard = itemAnalysisList.filter(it => it.difficultyKey === 'hard').length;
    const moderate = itemAnalysisList.filter(it => it.difficultyKey === 'moderate').length;
    const easy = itemAnalysisList.filter(it => it.difficultyKey === 'easy').length;
    return { avgAccuracy: avg, hardCount: hard, moderateCount: moderate, easyCount: easy };
  }, [itemAnalysisList]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Sub-header Toolbar ── */}
      <div className={`p-4 rounded-2xl border shadow-sm transition-all ${
        isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Year selector pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className={`text-xs font-bold mr-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              เลือกชุดข้อสอบ:
            </span>
            {[2564, 2565, 2566, 2567, 2568].map(y => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setActiveYear(y);
                  if (onSelectYear) onSelectYear(y);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentYear === y
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/30'
                    : (isDark 
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900')
                }`}
              >
                O-NET '{String(y).slice(-2)} (ปี {y})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="พิมพ์รายงานวิเคราะห์รายข้อ"
            >
              <Printer size={13} />
              <span>พิมพ์รายงาน</span>
            </button>
          </div>
        </div>

        {/* Filters and search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
          {/* Difficulty filter */}
          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ความยากง่าย / สถิติข้อ
            </label>
            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className={`w-full rounded-xl px-3 py-1.5 text-xs border focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">ทุกระดับความยาก ({itemAnalysisList.length} ข้อ)</option>
              <option value="hard">🚨 ข้อที่นักเรียนผิดบ่อย (&lt; 50%) [{stats.hardCount} ข้อ]</option>
              <option value="moderate">⚠️ ปานกลาง (50% - 70%) [{stats.moderateCount} ข้อ]</option>
              <option value="easy">✅ ทำได้ดี (&gt; 70%) [{stats.easyCount} ข้อ]</option>
            </select>
          </div>

          {/* Skill filter */}
          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              สาระการเรียนรู้ / ทักษะ
            </label>
            <select
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              className={`w-full rounded-xl px-3 py-1.5 text-xs border focus:outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">ทุกสาระและทักษะ</option>
              <option value="conversation">Conversation & Social (ต 1.2)</option>
              <option value="reading">Reading Comprehension (ต 1.1)</option>
              <option value="grammar">Grammar & Structure (ต 1.1, ต 1.2)</option>
              <option value="phonics">Phonics & Pronunciation (ต 1.1)</option>
              <option value="sign_notice">Signs & Notices (ต 1.1)</option>
              <option value="chart_table">Charts & Tables (ต 1.3)</option>
              <option value="culture">Culture & Festivals (ต 2.1, ต 2.2)</option>
            </select>
          </div>

          {/* Search bar */}
          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ค้นหาโจทย์ หรือ คำศัพท์
            </label>
            <div className="relative">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="ค้นหาข้อความโจทย์..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full rounded-xl pl-8 pr-3 py-1.5 text-xs border focus:outline-none focus:border-indigo-500 ${
                  isDark ? 'bg-slate-950 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary Indicator Strip ── */}
      <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
        isDark ? 'bg-slate-900/60 border-white/5 text-slate-300' : 'bg-indigo-50/60 border-indigo-100 text-indigo-900'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-bold">📊 ข้อมูลวิเคราะห์:</span>
          <span>แนวข้อสอบ O-NET ปี {currentYear} (32 ข้อ)</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
            isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white text-indigo-700 shadow-sm'
          }`}>
            คะแนนเฉลี่ยชุดนี้: {stats.avgAccuracy}%
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-rose-600 font-semibold">
            🚨 ต้องซ่อมเสริม: {stats.hardCount} ข้อ
          </span>
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            ⚠️ ปานกลาง: {stats.moderateCount} ข้อ
          </span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            ✅ ผ่านดี: {stats.easyCount} ข้อ
          </span>
        </div>
      </div>

      {/* ── Question Cards List (Rendered exactly per user design mockup) ── */}
      {filteredItems.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isDark ? 'bg-slate-900/40 border-white/5 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
        }`}>
          <HelpCircle size={36} className="mx-auto mb-2 opacity-40" />
          <p className="font-semibold text-sm">ไม่พบข้อสอบที่ตรงกับเงื่อนไขการค้นหา</p>
          <p className="text-xs mt-1">ลองเปลี่ยนตัวกรองความยาก ทักษะ หรือล้างคำค้นหา</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredItems.map(item => {
            const letterLabels = ['A', 'B', 'C', 'D'];

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all p-5 space-y-4 shadow-sm hover:shadow-md ${
                  isDark 
                    ? 'bg-slate-900/95 border-white/10 text-white' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {/* ── Card Header ── */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Golden Question Badge */}
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-400 text-slate-950 shadow-sm">
                      ข้อที่ {item.number}
                    </span>

                    {/* Points Badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.points} คะแนน
                    </span>

                    {/* Standard Indicator Badge */}
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                      {item.indicator}
                    </span>

                    {/* Skill Category Badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.skillLabel} ({item.thaiSkillLabel})
                    </span>
                  </div>

                  {/* Accuracy & Difficulty Pill */}
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${item.difficultyColor}`}>
                    <span>อัตราตอบถูก: {item.correctPct}%</span>
                    <span>({item.difficultyText})</span>
                  </div>
                </div>

                {/* ── Question Stimulus / Image (if available) ── */}
                {item.image && (
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-slate-950/20 dark:bg-slate-950/40 border-slate-200 dark:border-white/5">
                    <div 
                      onClick={() => setEnlargedImage(item.image)}
                      className="cursor-pointer group relative overflow-hidden rounded-lg border border-slate-200 dark:border-white/10 max-w-sm"
                    >
                      <img 
                        src={item.image} 
                        alt={item.imageAlt || `ภาพประกอบข้อ ${item.number}`}
                        className="max-h-48 w-auto object-contain transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                        <ZoomIn size={16} />
                        <span>คลิกเพื่อดูภาพขยาย</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnlargedImage(item.image)}
                      className={`text-[11px] font-semibold mt-2 flex items-center gap-1 cursor-pointer ${
                        isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
                      }`}
                    >
                      <ZoomIn size={12} />
                      <span>คลิกเพื่อดูภาพขยาย</span>
                    </button>
                  </div>
                )}

                {/* ── Question Text ── */}
                <div className={`text-base font-bold leading-relaxed whitespace-pre-line ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>
                  {item.questionText}
                </div>

                {/* ── Student Answer Trend Bar (Segmented Progress Bar) ── */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>📊 แนวโน้มการตอบของนักเรียน (A, B, C, D)</span>
                    </div>
                    <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      ผู้ตอบทั้งหมด {item.totalRespondents} คน {item.isBenchmark && '(ฐานข้อมูลสถิติมาตรฐาน)'}
                    </div>
                  </div>

                  {/* Multi-colored Segmented Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                    {letterLabels.map((letter, optIdx) => {
                      const pct = item.pcts[optIdx] || 0;
                      if (pct <= 0) return null;
                      return (
                        <div
                          key={letter}
                          style={{ width: `${pct}%` }}
                          className={`${CHOICE_COLORS[optIdx]} transition-all relative group`}
                          title={`ช้อยส์ (${letter}): ${pct}% (${item.counts[optIdx]} คน)`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* ── 4 Choices Grid (2x2) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {item.options.map((optText, optIdx) => {
                    const isCorrect = optIdx === item.correctAnswerIndex;
                    const letter = letterLabels[optIdx];
                    const pct = item.pcts[optIdx] || 0;
                    const count = item.counts[optIdx] || 0;

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                          isCorrect
                            ? (isDark 
                                ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30' 
                                : 'bg-emerald-50/90 border-emerald-400 ring-1 ring-emerald-300')
                            : (isDark 
                                ? 'bg-slate-950/60 border-white/10 hover:border-white/20' 
                                : 'bg-slate-50/80 border-slate-200 hover:border-slate-300')
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-xs font-black ${
                            isCorrect 
                              ? 'bg-emerald-500 text-white' 
                              : (isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700 shadow-sm border')
                          }`}>
                            ({letter})
                          </span>
                          <span className={`text-xs md:text-sm truncate font-medium ${
                            isCorrect ? (isDark ? 'text-emerald-200 font-bold' : 'text-emerald-900 font-bold') : ''
                          }`}>
                            {optText}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-xs font-mono font-bold ${
                            isCorrect 
                              ? (isDark ? 'text-emerald-400' : 'text-emerald-700') 
                              : (isDark ? 'text-slate-400' : 'text-slate-500')
                          }`}>
                            {pct}% ({count} คน)
                          </span>
                          {isCorrect && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-white shadow-sm">
                              ถูกต้อง
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Two Analytical Action Boxes ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {/* Box 1: Common Misconception */}
                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    isDark ? 'bg-rose-950/20 border-rose-500/20 text-rose-100' : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400">
                      <span>🚨 วิเคราะห์จุดผิดพลาด (Common Misconception)</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">
                      {item.misconception}
                    </p>
                  </div>

                  {/* Box 2: Teacher Action Plan */}
                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    isDark ? 'bg-amber-950/20 border-amber-500/20 text-amber-100' : 'bg-amber-50/70 border-amber-200 text-amber-950'
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
                      <span>📋 แผนงานการสอนซ่อมเสริม (Teacher Action Plan)</span>
                    </div>
                    <div className="text-xs leading-relaxed space-y-1 opacity-90">
                      <p>👉 {item.actionPlan?.action}</p>
                      <p>📌 <span className="font-semibold">แนวทางฝึก:</span> {item.actionPlan?.practice}</p>
                    </div>
                  </div>
                </div>

                {/* ── Official Answer Explanation & Clues ── */}
                <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  isDark ? 'bg-slate-950/70 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <p>
                    <span className="font-bold text-emerald-600">💡 เฉลยทางการ:</span> {item.explanation?.official}
                  </p>
                  <p>
                    <span className="font-bold text-amber-600">💡 จุดสังเกต:</span> {item.explanation?.clue}
                  </p>
                  <p>
                    <span className="font-bold text-indigo-600">🔑 คำศัพท์สำคัญ:</span> {item.explanation?.keyword}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Lightbox Image Modal ── */}
      {enlargedImage && (
        <div 
          onClick={() => setEnlargedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2 bg-slate-900 rounded-2xl shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setEnlargedImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <img 
              src={enlargedImage} 
              alt="ภาพขยาย" 
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
