// src/components/teacher/StudentIndividualDiagnosticModal.jsx
import { useState, useMemo } from 'react';
import { 
  X, CheckCircle2, AlertCircle, TrendingUp, Clock, Award, 
  HelpCircle, ChevronRight, BookOpen, Sparkles, Filter, Target
} from 'lucide-react';
import { getOnetRealYearPool } from '../../data/onetRealExamPools';
import { analyzeStudentIndividualAttempt } from '../../data/yearSimItemAnalysis';

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '-';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m} นาที ${s > 0 ? `${s} วิ` : ''}`;
}

export default function StudentIndividualDiagnosticModal({
  theme = 'light',
  student,
  yearConfig,
  attempt,
  onClose,
}) {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('matrix'); // 'skills' | 'matrix' | 'action_plan'
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'wrong_only' | 'correct_only'

  // Load question pool for this year
  const pool = useMemo(() => {
    return getOnetRealYearPool(yearConfig?.year || 2565) || [];
  }, [yearConfig]);

  // Run deep diagnosis
  const diagnostic = useMemo(() => {
    return analyzeStudentIndividualAttempt(student, yearConfig, attempt, pool);
  }, [student, yearConfig, attempt, pool]);

  if (!diagnostic) return null;

  const currentItem = diagnostic.items[selectedQuestionIndex] || diagnostic.items[0];

  const visibleItems = diagnostic.items.filter(it => {
    if (filterMode === 'wrong_only') return !it.isCorrect;
    if (filterMode === 'correct_only') return it.isCorrect;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-4xl rounded-2xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden ${
        isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* ── Modal Header ── */}
        <div className={`p-5 border-b flex items-start justify-between gap-4 ${
          isDark ? 'border-white/10 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-indigo-600 text-white shadow-sm">
                วิเคราะห์รายบุคคล
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border ${yearConfig?.badgeDark || 'bg-slate-800 text-slate-200'}`}>
                {yearConfig?.label} ({yearConfig?.title})
              </span>
            </div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <span>{student.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
              }`}>
                ชั้น {student.class || '-'} เลขที่ {student.number || '-'}
              </span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              เจาะลึกผลคะแนนและพฤติกรรมการตอบรายข้อ (32 ข้อ) เพื่อวางแผนการสอนซ่อมเสริมเฉพาะตัว
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Metric Highlights Bar ── */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border-b text-xs ${
          isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'
        }`}>
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-0.5">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>คะแนนรวม</span>
            <div className="text-lg font-black text-indigo-600">
              {diagnostic.score} / {diagnostic.totalQuestions} <span className="text-xs font-normal">({diagnostic.percent.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-0.5">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>ตอบถูก / ตอบผิด</span>
            <div className="text-lg font-black flex items-center gap-2">
              <span className="text-emerald-600 font-black">✓ {diagnostic.correctCount}</span>
              <span className="text-rose-600 font-black">✗ {diagnostic.wrongCount}</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-0.5">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>เวลาที่ใช้</span>
            <div className="text-lg font-black">
              {formatDuration(diagnostic.timeUsed)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 space-y-0.5">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>สถานะประเมิน</span>
            <div className={`text-base font-black ${
              diagnostic.percent >= 70 ? 'text-emerald-600' :
              diagnostic.percent >= 50 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {diagnostic.percent >= 70 ? 'ระดับดีเยี่ยม' :
               diagnostic.percent >= 50 ? 'ผ่านเกณฑ์มาตรฐาน' : 'ต้องเร่งพัฒนา'}
            </div>
          </div>
        </div>

        {/* ── Tab Switcher ── */}
        <div className={`flex items-center gap-2 px-5 py-2.5 border-b shrink-0 ${
          isDark ? 'border-white/5 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60')
            }`}
          >
            📝 ตารางข้อสอบ 1–32 & เจาะลึกรายข้อ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'skills'
                ? 'bg-indigo-600 text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60')
            }`}
          >
            🎯 วิเคราะห์ทักษะ 7 ด้าน
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('action_plan')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'action_plan'
                ? 'bg-indigo-600 text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60')
            }`}
          >
            📋 แผนพัฒนาเฉพาะตัว
          </button>
        </div>

        {/* ── Modal Body Content ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: Item Matrix & Deep Dive */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              {/* Filter for matrix */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  เลือกข้อสอบเพื่อดูรายละเอียดคำตอบที่นักเรียนเลือก:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      filterMode === 'all'
                        ? 'bg-indigo-600 text-white'
                        : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')
                    }`}
                  >
                    ทั้งหมด (32 ข้อ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('wrong_only')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      filterMode === 'wrong_only'
                        ? 'bg-rose-600 text-white'
                        : (isDark ? 'bg-slate-800 text-rose-400' : 'bg-rose-50 text-rose-700 border border-rose-200')
                    }`}
                  >
                    เฉพาะข้อที่ผิด ({diagnostic.wrongCount} ข้อ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('correct_only')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      filterMode === 'correct_only'
                        ? 'bg-emerald-600 text-white'
                        : (isDark ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                    }`}
                  >
                    เฉพาะข้อที่ถูก ({diagnostic.correctCount} ข้อ)
                  </button>
                </div>
              </div>

              {/* 32 Grid matrix buttons */}
              <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 p-3 rounded-xl border bg-slate-950/20 dark:bg-slate-950/40 border-slate-200 dark:border-white/5">
                {diagnostic.items.map((it, idx) => {
                  const isSelected = selectedQuestionIndex === idx;
                  const isHidden = (filterMode === 'wrong_only' && it.isCorrect) || (filterMode === 'correct_only' && !it.isCorrect);

                  return (
                    <button
                      key={it.number}
                      type="button"
                      disabled={isHidden}
                      onClick={() => setSelectedQuestionIndex(idx)}
                      className={`h-9 rounded-lg font-mono text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isHidden ? 'opacity-20 cursor-not-allowed' : ''
                      } ${
                        isSelected
                          ? 'ring-2 ring-indigo-400 shadow-md scale-105 z-10'
                          : ''
                      } ${
                        it.isCorrect
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                      }`}
                      title={`ข้อที่ ${it.number}: ${it.isCorrect ? 'ตอบถูก' : 'ตอบผิด'}`}
                    >
                      <span>{it.number}</span>
                      <span className="text-[9px] font-normal leading-none">
                        {it.isCorrect ? '✓' : '✗'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Question Drilldown Card */}
              {currentItem && (
                <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
                  isDark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  {/* Item header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-400 text-slate-950">
                        ข้อที่ {currentItem.number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700 border'
                      }`}>
                        {currentItem.skill}
                      </span>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      currentItem.isCorrect
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                    }`}>
                      {currentItem.isCorrect ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>นักเรียนตอบถูกต้อง</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={13} />
                          <span>นักเรียนตอบผิด (เลือกช้อยส์ {currentItem.studentAnswerLetter})</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stimulus image if exists */}
                  {currentItem.image && (
                    <div className="flex justify-center p-2 rounded-xl bg-black/10">
                      <img 
                        src={currentItem.image} 
                        alt="Stimulus"
                        className="max-h-40 w-auto object-contain rounded-lg border border-slate-200 dark:border-white/10" 
                      />
                    </div>
                  )}

                  {/* Question Stem */}
                  <div className="text-sm md:text-base font-bold whitespace-pre-line">
                    {currentItem.questionText}
                  </div>

                  {/* 4 choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {currentItem.options.map((opt, optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx];
                      const isCorrectChoice = optIdx === currentItem.correctAnswerIndex;
                      const isStudentChoice = optIdx === currentItem.studentAnswerIndex;

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                            isCorrectChoice
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-950 dark:text-emerald-200 font-bold'
                              : isStudentChoice
                              ? 'bg-rose-500/15 border-rose-500/50 text-rose-950 dark:text-rose-200 font-bold'
                              : (isDark ? 'bg-slate-900 border-white/5 opacity-80' : 'bg-white border-slate-200 opacity-80')
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] ${
                              isCorrectChoice
                                ? 'bg-emerald-500 text-white'
                                : isStudentChoice
                                ? 'bg-rose-500 text-white'
                                : (isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')
                            }`}>
                              {letter}
                            </span>
                            <span>{opt}</span>
                          </div>

                          <div className="shrink-0 flex items-center gap-1 text-[11px]">
                            {isCorrectChoice && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white font-black text-[10px]">
                                เฉลย ✓
                              </span>
                            )}
                            {isStudentChoice && !isCorrectChoice && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-black text-[10px]">
                                นักเรียนเลือก ✗
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pedagogical insight */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                      isDark ? 'bg-rose-950/20 border-rose-500/20 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div className="font-bold flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <span>🚨 จุดที่นักเรียนมักสับสนในข้อนี้:</span>
                      </div>
                      <p className="leading-relaxed opacity-90">{currentItem.misconception}</p>
                    </div>

                    <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                      isDark ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    }`}>
                      <div className="font-bold flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                        <span>💡 คำแนะนำสำหรับนักเรียนคนนี้:</span>
                      </div>
                      <p className="leading-relaxed opacity-90">{currentItem.actionPlan?.action}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Skills Breakdown */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                วิเคราะห์ความเชี่ยวชาญแยกตาม 7 สาระหลักตามหลักสูตรแกนกลางและ Test Blueprint สทศ.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(diagnostic.skillBreakdown).map(([skillKey, data]) => {
                  if (data.total === 0) return null;

                  return (
                    <div
                      key={skillKey}
                      className={`p-4 rounded-xl border space-y-2 ${
                        isDark ? 'bg-slate-950/60 border-white/5' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm">{data.label}</span>
                          <span className={`text-xs ml-1.5 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            ({data.correct}/{data.total} ข้อ)
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-black ${
                          data.status === 'strong' ? 'bg-emerald-500/20 text-emerald-600' :
                          data.status === 'moderate' ? 'bg-amber-500/20 text-amber-600' : 'bg-rose-500/20 text-rose-600'
                        }`}>
                          {data.percent}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${data.percent}%` }}
                          className={`h-full rounded-full transition-all ${
                            data.status === 'strong' ? 'bg-emerald-500' :
                            data.status === 'moderate' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        />
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {data.status === 'strong' ? '✓ มีความพร้อมสูงและแม่นยำ' :
                         data.status === 'moderate' ? '⚠️ พอใช้ ควรเสริมคำศัพท์และโจทย์เพิ่ม' : '🚨 จุดอ่อนเร่งด่วนที่ต้องปรับพื้นฐาน'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Individual Action Plan */}
          {activeTab === 'action_plan' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-slate-950/60 border-white/5' : 'bg-white border-slate-200'
              }`}>
                <h4 className="font-black text-sm flex items-center gap-1.5 text-indigo-600">
                  <Sparkles size={16} />
                  <span>สรุปจุดแข็งและทักษะที่ทำได้ดี</span>
                </h4>
                {diagnostic.strongSkills.length > 0 ? (
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    {diagnostic.strongSkills.map(sk => (
                      <li key={sk.key}>
                        <span className="font-bold">{sk.label}:</span> ทำคะแนนได้ {sk.percent}% ({sk.correct}/{sk.total} ข้อ)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">ยังไม่มีทักษะที่ได้ระดับดีเยี่ยม ควรเน้นฝึกทำโจทย์รอบละ 10 ข้อเพื่อสะสมความมั่นใจ</p>
                )}
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-rose-950/20 border-rose-500/20 text-rose-100' : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <h4 className="font-black text-sm flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <AlertCircle size={16} />
                  <span>จุดอ่อนเร่งด่วนที่ต้องฝึกซ่อมเสริม (Priority Growth Areas)</span>
                </h4>
                {diagnostic.weakSkills.length > 0 ? (
                  <div className="space-y-2 pt-1 text-xs">
                    {diagnostic.weakSkills.map(sk => (
                      <div key={sk.key} className="p-2.5 rounded-lg bg-white/60 dark:bg-black/20 space-y-1">
                        <div className="font-bold text-rose-600 dark:text-rose-400">
                          {sk.label} (ความแม่นยำ {sk.percent}%)
                        </div>
                        <p className="opacity-90">
                          แนะนำให้ครูมอบหมายใบงานหรือแบบฝึกทบทวนเฉพาะเรื่องนี้ โดยเน้นการวิเคราะห์ตัดช้อยส์ลวง
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs opacity-80">ยอดเยี่ยม! นักเรียนไม่มีจุดอ่อนที่ต่ำกว่าเกณฑ์ 50% ในการสอบรอบนี้</p>
                )}
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="font-black text-sm flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 size={16} />
                  <span>คำแนะนำการมอบหมายการบ้าน / กิจกรรม</span>
                </h4>
                <div className="text-xs space-y-1.5 leading-relaxed text-slate-600 dark:text-slate-300">
                  <p>1. มอบหมายให้นักเรียนกลับไปกดดู <strong>เฉลยและจุดสังเกต</strong> ในข้อที่ทำผิด ({diagnostic.wrongCount} ข้อ)</p>
                  <p>2. จัดกิจกรรมคู่บัดดี้ (Peer Tutoring) ให้นักเรียนที่ได้คะแนนสูงในทักษะนั้น ช่วยอธิบายเทคนิคการสังเกตข้อสอบ</p>
                  <p>3. ให้นักเรียนฝึกทำซ้ำในรอบถัดไปเพื่อวัดผลความจำและความก้าวหน้า</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${
          isDark ? 'border-white/10 bg-slate-950/80' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="text-xs text-slate-500">
            วิเคราะห์ผลสอบชุด {yearConfig?.label} · นักเรียน: {student.name}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
