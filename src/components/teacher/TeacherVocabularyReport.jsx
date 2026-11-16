import { useEffect, useMemo, useState } from 'react';
import { fetchTeacherVocabulary } from '../../utils/vocabPracticeCloud';
import TeacherVocabularyAssignments from './TeacherVocabularyAssignments';
import { readVocabPractice, formatVocabPracticeDate } from '../../utils/vocabPractice';
import { VOCAB_CATEGORIES } from '../../data/vocabDrill';
import { getVocabCategoryArtwork } from '../../data/vocabCategoryArtwork';
import {
  ArrowLeft, Search, RefreshCw, Award, BookOpen, AlertTriangle,
  CheckCircle, ChevronRight, Sparkles, Target, Clock, User
} from 'lucide-react';

const ONET_HIGH_YIELD_CATEGORIES = [
  { id: 'signs', nameTh: 'ป้ายสัญลักษณ์ & ป้ายเตือน', indicator: 'ต 1.1 ป.6/3', desc: 'ออกสอบทุกปี 3-4 ข้อ ป้ายห้าม ระวัง ความปลอดภัย', yieldLevel: 'สูงสุด' },
  { id: 'exam_commands', nameTh: 'คำสั่งข้อสอบ & คำถาม', indicator: 'ต 1.1 ป.6/1', desc: 'คำสั่งชี้ขาด เช่น Which, What does it mean, According to', yieldLevel: 'สูงสุด' },
  { id: 'conversation', nameTh: 'บทสนทนาในชีวิตประจำวัน', indicator: 'ต 1.2 ป.6/1', desc: 'ทักทาย ถามทุกข์สุข ขอยืมของ ชวนทำกิจกรรม', yieldLevel: 'สูง' },
  { id: 'school', nameTh: 'โรงเรียนและห้องเรียน', indicator: 'ต 4.1 ป.6/1', desc: 'วิชาเรียน อุปกรณ์การเรียน กฎระเบียบโรงเรียน', yieldLevel: 'สูง' },
  { id: 'directions', nameTh: 'ทิศทางและแผนผัง', indicator: 'ต 1.1 ป.6/3', desc: 'Turn left, go straight, next to, opposite', yieldLevel: 'สูง' },
  { id: 'tenses', nameTh: 'กาลเวลาและไวยากรณ์ O-NET', indicator: 'ต 1.2 ป.6/1', desc: 'Present Simple, Past Simple, Future Simple', yieldLevel: 'ปานกลาง' },
];

export default function TeacherVocabularyReport({ schoolId, students = [] }) {
  const [studentId, setStudentId] = useState('');
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('idle');
  const [revision, setRevision] = useState(0);
  const [loadedFor, setLoadedFor] = useState('');
  const [rosterQuery, setRosterQuery] = useState('');
  const [wordTableQuery, setWordTableQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const selected = students.find(student => student.id === studentId);

  // Load cloud evidence when an individual student is selected
  useEffect(() => {
    setRows([]);
    if (!selected) { setStatus('idle'); return; }
    let cancelled = false;
    setStatus('loading');
    fetchTeacherVocabulary(schoolId, studentId).then(data => {
      if (!cancelled) { setRows(data); setLoadedFor(`${schoolId}:${studentId}`); setStatus('ready'); }
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [schoolId, studentId, Boolean(selected), revision]);

  const visibleRows = selected && status === 'ready' && loadedFor === `${schoolId}:${studentId}` ? rows : [];

  // Classroom Roster Aggregation
  const studentRoster = useMemo(() => {
    return students.map((student, index) => {
      const practice = readVocabPractice(student.id);
      const catMap = practice?.categories || {};
      const catKeys = Object.keys(catMap);
      const totalSessions = Object.values(catMap).reduce((sum, item) => sum + (item.sessions || 0), 0);
      const timestamps = catKeys.map(k => new Date(catMap[k].lastPracticedAt).getTime()).filter(t => !isNaN(t));
      const latestTimestamp = timestamps.length ? Math.max(...timestamps) : null;
      return {
        index: index + 1,
        student,
        practicedCount: catKeys.length,
        totalSessions,
        catMap,
        latestPracticedAt: latestTimestamp ? new Date(latestTimestamp).toISOString() : null,
        tier: totalSessions >= 3 ? 'gold' : totalSessions > 0 ? 'silver' : 'none',
      };
    });
  }, [students, revision]);

  // Classroom High-Level KPIs
  const totalClassStudents = students.length;
  const activeLearnersCount = studentRoster.filter(r => r.totalSessions > 0).length;
  const totalClassSessions = studentRoster.reduce((sum, r) => sum + r.totalSessions, 0);
  const classCoveredCategories = useMemo(() => {
    const set = new Set();
    studentRoster.forEach(r => Object.keys(r.catMap).forEach(k => set.add(k)));
    return set;
  }, [studentRoster]);
  const classCoverageCount = classCoveredCategories.size;

  // Selected Student Detailed Category Breakdown
  const localStudentPractice = useMemo(() => {
    if (!selected) return null;
    return readVocabPractice(selected.id);
  }, [selected, revision]);

  const studentCategoryBreakdown = useMemo(() => {
    if (!selected) return [];
    const map = {};

    // 1. From local practice sessions
    if (localStudentPractice?.categories) {
      for (const [catId, p] of Object.entries(localStudentPractice.categories)) {
        map[catId] = {
          catId,
          sessions: p.sessions || 0,
          lastPracticedAt: p.lastPracticedAt,
          words: new Set(),
          independentCorrect: 0,
          independentAttempts: 0,
          weakWords: new Set(),
        };
      }
    }

    // 2. From cloud evidence rows
    for (const row of visibleRows) {
      const catId = row.category_id || 'unknown';
      if (!map[catId]) {
        map[catId] = {
          catId,
          sessions: 1,
          lastPracticedAt: row.last_received_at,
          words: new Set(),
          independentCorrect: 0,
          independentAttempts: 0,
          weakWords: new Set(),
        };
      }
      map[catId].words.add(row.word);
      map[catId].independentCorrect += (row.independent_correct || 0);
      map[catId].independentAttempts += (row.independent_attempts || 0);
      if (row.latest_independent_correct === false) {
        map[catId].weakWords.add(row.word);
      }
      if (new Date(row.last_received_at) > new Date(map[catId].lastPracticedAt || 0)) {
        map[catId].lastPracticedAt = row.last_received_at;
      }
    }

    return Object.values(map).map(item => {
      const catMeta = VOCAB_CATEGORIES.find(c => c.id === item.catId);
      return {
        ...item,
        name: catMeta?.name || item.catId,
        tone: catMeta?.tone || 'slate',
        wordsCount: item.words.size,
        weakCount: item.weakWords.size,
        accuracy: item.independentAttempts > 0
          ? Math.round((item.independentCorrect / item.independentAttempts) * 100)
          : null,
      };
    }).sort((a, b) => b.sessions - a.sessions);
  }, [selected, localStudentPractice, visibleRows]);

  // Selected Student KPIs
  const studentTotalSessions = studentCategoryBreakdown.reduce((sum, c) => sum + c.sessions, 0);
  const studentWeakWordsCount = visibleRows.filter(r => r.latest_independent_correct === false).length;
  const studentIndependentCorrectCount = visibleRows.reduce((sum, r) => sum + (r.independent_correct || 0), 0);
  const studentIndependentAttemptsCount = visibleRows.reduce((sum, r) => sum + (r.independent_attempts || 0), 0);
  const studentAccuracyPercent = studentIndependentAttemptsCount > 0
    ? Math.round((studentIndependentCorrectCount / studentIndependentAttemptsCount) * 100)
    : null;

  // Personalized Next Step Recommendations for the Selected Student
  const studentRecommendations = useMemo(() => {
    if (!selected) return [];
    const recs = [];
    const practicedIds = new Set(studentCategoryBreakdown.map(c => c.catId));

    // 1. Weakness / Remediation: Categories with errors
    const withErrors = studentCategoryBreakdown.find(c => c.weakCount > 0);
    if (withErrors) {
      recs.push({
        catId: withErrors.catId,
        title: withErrors.name,
        badge: '⚠️ ซ่อมคำที่ตอบผิด',
        badgeColor: 'bg-rose-900/60 text-rose-300 border-rose-700',
        reason: `มีคำศัพท์ ${withErrors.weakCount} คำที่ตอบผิดในแบบฝึก แนะนำให้มอบหมายซ่อมเสริม`,
      });
    }

    // 2. High-Yield O-NET Core: High-yield deck not yet started
    const unstartedHighYield = ONET_HIGH_YIELD_CATEGORIES.find(h => !practicedIds.has(h.id));
    if (unstartedHighYield) {
      recs.push({
        catId: unstartedHighYield.id,
        title: unstartedHighYield.nameTh,
        badge: '🔥 สำคัญต่อ O-NET',
        badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700',
        reason: `ตัวชี้วัด ${unstartedHighYield.indicator} (ออกสอบบ่อย) นักเรียนยังไม่เคยเริ่มฝึก`,
      });
    }

    // 3. Spaced Repetition: Practiced deck older than 3 days
    const staleDeck = studentCategoryBreakdown.find(c => {
      if (!c.lastPracticedAt) return false;
      const days = (Date.now() - new Date(c.lastPracticedAt).getTime()) / (1000 * 60 * 60 * 24);
      return days >= 3;
    });
    if (staleDeck && recs.length < 3) {
      const days = Math.floor((Date.now() - new Date(staleDeck.lastPracticedAt).getTime()) / (1000 * 60 * 60 * 24));
      recs.push({
        catId: staleDeck.catId,
        title: staleDeck.name,
        badge: '⏰ ควรทบทวนซ้ำ',
        badgeColor: 'bg-sky-900/60 text-sky-300 border-sky-700',
        reason: `ฝึกไปเมื่อ ${days} วันที่แล้ว ทวนซ้ำตามหลัก Spaced Repetition เพื่อคงความจำถาวร`,
      });
    }

    // Fallback: If still < 2 recs, pick next high-yield
    if (recs.length < 2) {
      const anyOther = ONET_HIGH_YIELD_CATEGORIES.find(h => !recs.some(r => r.catId === h.id));
      if (anyOther) {
        recs.push({
          catId: anyOther.id,
          title: anyOther.nameTh,
          badge: '🎯 แนะนำเสริม',
          badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
          reason: `เสริมคลังคำศัพท์ตัวชี้วัด ${anyOther.indicator} เพื่อเตรียมความพร้อมสอบ`,
        });
      }
    }

    return recs;
  }, [selected, studentCategoryBreakdown]);

  // Filtered Word Evidence Rows
  const filteredWordRows = useMemo(() => {
    return visibleRows.filter(row => {
      const matchQuery = !wordTableQuery.trim() ||
        `${row.word} ${row.meaning_th || ''}`.toLowerCase().includes(wordTableQuery.toLowerCase().trim());
      const matchCat = !categoryFilter || row.category_id === categoryFilter;
      return matchQuery && matchCat;
    });
  }, [visibleRows, wordTableQuery, categoryFilter]);

  // Filtered Classroom Roster
  const filteredRoster = useMemo(() => {
    if (!rosterQuery.trim()) return studentRoster;
    const q = rosterQuery.toLowerCase().trim();
    return studentRoster.filter(r =>
      r.student.name?.toLowerCase().includes(q) ||
      r.student.class?.toLowerCase().includes(q) ||
      String(r.student.number || '').includes(q)
    );
  }, [studentRoster, rosterQuery]);

  return (
    <section className="space-y-6 text-slate-100" aria-labelledby="teacher-vocabulary-title">
      {/* ── Dashboard Header ──────────────────────────────────────── */}
      <header className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {selected && (
                <button
                  type="button"
                  onClick={() => setStudentId('')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  <ArrowLeft size={16} /> กลับภาพรวมห้อง
                </button>
              )}
              <h3 id="teacher-vocabulary-title" className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="text-sky-400" size={24} />
                {selected ? `สถิติคำศัพท์: ${selected.name} (${selected.class})` : 'ติดตามคำศัพท์ & แนะนำการฝึก'}
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              วิเคราะห์ความถี่การฝึกคำศัพท์ (Sessions) · ตรวจสอบหมวดที่ยังขาด · ชี้แนะเส้นทางฝึก O-NET ให้เหมาะสม
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <span>เลือกนักเรียน:</span>
              <select
                className="rounded-lg border border-slate-600 bg-slate-800 p-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                value={selected ? studentId : ''}
                onChange={event => setStudentId(event.target.value)}
              >
                <option value="">ภาพรวมทั้งห้อง ({students.length} คน)</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.number ? `[เลขที่ ${student.number}] ` : ''}{student.name} · {student.class}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
              disabled={status === 'loading'}
              onClick={() => setRevision(previous => previous + 1)}
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw size={16} className={status === 'loading' ? 'animate-spin' : ''} />
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Status Banners ────────────────────────────────────────── */}
      {status === 'error' && (
        <div role="alert" className="rounded-xl border border-rose-700 bg-rose-950/70 p-4 text-rose-200 text-sm flex items-center gap-3">
          <AlertTriangle size={20} className="text-rose-400 flex-shrink-0" />
          <span>ยังโหลดผลจากระบบคลาวด์ไม่ได้ ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต ระบบจะไม่แสดงข้อผิดพลาดเป็นคะแนนศูนย์</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1. CLASSROOM OVERVIEW VIEW (WHEN !selected)                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {!selected && (
        <div className="space-y-6">
          {/* Class KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 shadow">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>นักเรียนในห้อง</span>
                <User size={18} className="text-sky-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white">{totalClassStudents} <span className="text-sm font-normal text-slate-400">คน</span></div>
              <div className="mt-1 text-xs text-slate-400">บัญชีนักเรียนที่ดูแลในชั้นนี้</div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 shadow">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>เริ่มฝึกคำศัพท์แล้ว</span>
                <CheckCircle size={18} className="text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-400">
                {activeLearnersCount} <span className="text-sm font-normal text-slate-400">/ {totalClassStudents} คน</span>
              </div>
              <div className="mt-1 text-xs text-emerald-400/90">
                คิดเป็น {totalClassStudents > 0 ? Math.round((activeLearnersCount / totalClassStudents) * 100) : 0}% ของห้อง
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 shadow">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>รอบฝึกสะสมทั้งห้อง</span>
                <Award size={18} className="text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-400">{totalClassSessions} <span className="text-sm font-normal text-slate-400">รอบ</span></div>
              <div className="mt-1 text-xs text-slate-400">เฉลี่ย {activeLearnersCount > 0 ? (totalClassSessions / activeLearnersCount).toFixed(1) : 0} รอบ/คนที่มีการฝึก</div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 shadow">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>ความครอบคลุมหมวด O-NET</span>
                <Target size={18} className="text-indigo-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-indigo-400">
                {classCoverageCount} <span className="text-sm font-normal text-slate-400">/ 53 หมวด</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                คิดเป็น {Math.round((classCoverageCount / 53) * 100)}% ของคลังศัพท์ทั้งหมด
              </div>
            </div>
          </div>

          {/* Pedagogical Guidance & XP Policy Note */}
          <div className="rounded-2xl border border-sky-800/60 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 p-5 shadow-lg">
            <h4 className="flex items-center gap-2 text-base font-bold text-sky-300">
              <Sparkles size={18} className="text-amber-400" />
              ข้อคิดเห็นทางครุศาสตร์: การให้ XP และแนวทางการฝึกเพื่อความจำระยะยาว
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 text-xs leading-relaxed text-slate-300">
              <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/60">
                <strong className="block text-amber-300 text-sm mb-1">⚖️ ทำไมเด็กฝึกบ่อยจึงจำกัด XP ไว้ที่ 50 XP/วัน?</strong>
                การเปิดให้รับ XP ไม่จำกัดจะกระตุ้นให้เด็กเล่นแต่หมวดเดิมที่ง่ายซ้ำถี่ๆ เพื่อ "ปั๊มเวล" ระบบจึงใช้ระบบลดทอนตัวคูณ (รอบแรก 100%, รอบสอง 50%, รอบสาม 0%) และตั้งเพดาน 50 XP/วัน เพื่อจูงใจให้เด็ก **สลับไปฝึกหมวดอื่นที่ยังไม่เคยแตะ** หรือ **กลับมาฝึกซ้ำในวันถัดไป**
              </div>
              <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/60">
                <strong className="block text-emerald-300 text-sm mb-1">🧠 พลังของ Spaced Repetition (การเว้นระยะทบทวน)</strong>
                งานวิจัยการเรียนรู้ยืนยันว่า การท่องหมวดเดิม 10 ครั้งในวันเดียว จะลืมเกือบ 80% ภายใน 1 สัปดาห์ แต่ถ้าท่องเพียง 1 รอบ แล้วเว้น 2-3 วันกลับมาทวนอีก 1 รอบ ข้อมูลจะถูกจัดเก็บเข้าสู่ Long-term Memory ได้คงทนกว่ามาก
              </div>
            </div>
          </div>

          {/* O-NET High-Yield Category Roadmap */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="text-amber-400" size={20} />
                  หมวด O-NET ออกสอบบ่อยที่สุด (Class Priority Roadmap)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  6 หมวดหลักที่เด็ก ป.6 ต้องเผชิญในข้อสอบจริง เช็คว่านักเรียนในห้องฝึกไปแล้วกี่คน
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {ONET_HIGH_YIELD_CATEGORIES.map(item => {
                const practicedCount = studentRoster.filter(r => r.catMap[item.id]?.sessions > 0).length;
                const percent = totalClassStudents > 0 ? Math.round((practicedCount / totalClassStudents) * 100) : 0;
                const isReady = percent >= 50;

                return (
                  <div key={item.id} className="rounded-xl border border-slate-700/80 bg-slate-800/50 p-4 transition hover:border-slate-600">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={getVocabCategoryArtwork(item.id)}
                          alt=""
                          className="w-10 h-10 object-contain rounded-lg bg-slate-700/40 p-1"
                        />
                        <div>
                          <h5 className="font-bold text-sm text-white">{item.nameTh}</h5>
                          <span className="text-xs text-sky-400 font-mono">{item.indicator}</span>
                        </div>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-xs font-bold border ${isReady ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-amber-950 text-amber-300 border-amber-700'}`}>
                        {isReady ? 'พร้อมสอบ' : 'ควรเร่งฝึก'}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-300 leading-snug">{item.desc}</p>

                    <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-slate-400">ฝึกแล้ว: <strong className="text-white">{practicedCount}/{totalClassStudents} คน</strong> ({percent}%)</span>
                      <div className="w-20 bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Student Vocabulary Roster Table */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="text-sky-400" size={20} />
                  ตารางสรุปการฝึกคำศัพท์ของนักเรียนทั้งห้อง ({filteredRoster.length} คน)
                </h4>
                <p className="text-xs text-slate-400 mt-1">คลิกที่ชื่อหรือปุ่ม "ดูสถิติรายคน" เพื่อเจาะลึกคำผิดและมอบหมายงานซ่อมเสริม</p>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={rosterQuery}
                  onChange={e => setRosterQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ, เลขที่, หรือชั้น..."
                  className="rounded-lg border border-slate-600 bg-slate-800 pl-9 pr-3 py-1.5 text-sm text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-800/80 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">เลขที่</th>
                    <th className="p-3.5">ชื่อ - นามสกุล</th>
                    <th className="p-3.5">ชั้น/ห้อง</th>
                    <th className="p-3.5 text-center">หมวดที่ฝึกแล้ว</th>
                    <th className="p-3.5 text-center">รอบสะสม</th>
                    <th className="p-3.5">ฝึกล่าสุด</th>
                    <th className="p-3.5 text-center">สถานะ</th>
                    <th className="p-3.5 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredRoster.map(item => (
                    <tr
                      key={item.student.id}
                      className="hover:bg-slate-800/50 transition cursor-pointer"
                      onClick={() => setStudentId(item.student.id)}
                    >
                      <td className="p-3.5 font-mono text-slate-400">{item.student.number || item.index}</td>
                      <td className="p-3.5 font-bold text-white hover:text-sky-300">
                        {item.student.name}
                      </td>
                      <td className="p-3.5 text-slate-300">{item.student.class}</td>
                      <td className="p-3.5 text-center">
                        <span className="font-bold text-sky-400">{item.practicedCount}</span>
                        <span className="text-slate-500 text-xs"> / 53</span>
                      </td>
                      <td className="p-3.5 text-center">
                        {item.totalSessions > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-600 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                            ⭐ {item.totalSessions} รอบ
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">0 รอบ</span>
                        )}
                      </td>
                      <td className="p-3.5 text-xs text-slate-400">
                        {item.latestPracticedAt ? formatVocabPracticeDate(item.latestPracticedAt) : '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        {item.tier === 'gold' && <span className="rounded px-2 py-0.5 text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">🏆 ขยันสม่ำเสมอ</span>}
                        {item.tier === 'silver' && <span className="rounded px-2 py-0.5 text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">⭐ เริ่มต้นแล้ว</span>}
                        {item.tier === 'none' && <span className="rounded px-2 py-0.5 text-xs font-bold bg-slate-800 text-slate-500 border border-slate-700">⏳ ยังไม่เริ่ม</span>}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setStudentId(item.student.id); }}
                          className="inline-flex items-center gap-1 rounded-lg bg-sky-600/20 border border-sky-500/40 px-3 py-1 text-xs font-bold text-sky-300 hover:bg-sky-600 hover:text-white transition"
                        >
                          ดูสถิติรายคน <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredRoster.length && (
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-slate-400">
                        ไม่พบนักเรียนตามเงื่อนไขค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 2. INDIVIDUAL STUDENT DRILLDOWN VIEW (WHEN selected)           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {selected && (
        <div className="space-y-6">
          {/* Individual Student KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 shadow">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>หมวดที่ฝึกแล้ว</span>
                <BookOpen size={18} className="text-sky-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white">
                {studentCategoryBreakdown.length} <span className="text-sm font-normal text-slate-400">/ 53 หมวด</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">ครอบคลุม {Math.round((studentCategoryBreakdown.length / 53) * 100)}%</div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 shadow">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>จำนวนรอบฝึกสะสม</span>
                <Award size={18} className="text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-400">
                {studentTotalSessions} <span className="text-sm font-normal text-slate-400">รอบ</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {studentTotalSessions >= 3 ? 'ระดับ Mastery สะสมดาวแล้ว' : 'ควรสะสมรอบฝึกให้ถึง 3 รอบ/หมวด'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 shadow">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>ตอบเองถูกในแบบฝึก</span>
                <CheckCircle size={18} className="text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-400">
                {studentIndependentCorrectCount} <span className="text-sm font-normal text-slate-400">ครั้ง</span>
              </div>
              <div className="mt-1 text-xs text-emerald-400">
                ความแม่นยำ {studentAccuracyPercent !== null ? `${studentAccuracyPercent}%` : 'ยังไม่มีสถิติ'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 shadow">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>คำที่ต้องซ่อมเสริม</span>
                <AlertTriangle size={18} className="text-rose-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-rose-400">
                {studentWeakWordsCount} <span className="text-sm font-normal text-slate-400">คำ</span>
              </div>
              <div className="mt-1 text-xs text-rose-400">คำที่ตอบผิดล่าสุด ควรแนะนำให้ซ่อม</div>
            </div>
          </div>

          {/* Personalized Next Step Recommendations for This Student */}
          {studentRecommendations.length > 0 && (
            <section className="rounded-2xl border border-sky-800/80 bg-gradient-to-br from-slate-900 via-sky-950/30 to-slate-900 p-5 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  🎯 หมวดที่แนะนำให้นักเรียนคนนี้ฝึกต่อ (Personalized Next Steps)
                </h4>
                <span className="text-xs text-sky-400 font-semibold">แนะนำ 3 อันดับแรก</span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {studentRecommendations.map(rec => (
                  <div key={rec.catId} className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 flex flex-col justify-between">
                    <div>
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border mb-2 ${rec.badgeColor}`}>
                        {rec.badge}
                      </span>
                      <h5 className="font-bold text-sm text-white">{rec.title}</h5>
                      <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">{rec.reason}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-700/60 text-xs text-sky-400 font-bold">
                      หมวด: {rec.catId}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Category Breakdown Table / Grid */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Target size={18} className="text-amber-400" />
              สรุปการฝึกแยกตามหมวดของ {selected.name} ({studentCategoryBreakdown.length} หมวดที่เคยเข้าฝึก)
            </h4>

            {studentCategoryBreakdown.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-left text-sm text-slate-200">
                  <thead className="bg-slate-800/80 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">หมวดคำศัพท์</th>
                      <th className="p-3 text-center">รอบที่ฝึก</th>
                      <th className="p-3 text-center">คำในหมวดที่ฝึก</th>
                      <th className="p-3 text-center">ความแม่นยำตอบเอง</th>
                      <th className="p-3 text-center">คำที่ต้องซ่อม</th>
                      <th className="p-3">ฝึกล่าสุด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {studentCategoryBreakdown.map(item => (
                      <tr key={item.catId} className="hover:bg-slate-800/40">
                        <td className="p-3 flex items-center gap-3">
                          <img
                            src={getVocabCategoryArtwork(item.catId)}
                            alt=""
                            className="w-8 h-8 object-contain rounded bg-slate-800 p-0.5"
                          />
                          <div>
                            <strong className="text-white block">{item.name}</strong>
                            <span className="text-xs text-slate-400 font-mono">{item.catId}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold text-amber-300">
                          {item.sessions >= 3 ? `🏆 ${item.sessions} รอบ` : `${item.sessions} รอบ`}
                        </td>
                        <td className="p-3 text-center text-slate-300">
                          {item.wordsCount > 0 ? `${item.wordsCount} คำ` : '-'}
                        </td>
                        <td className="p-3 text-center">
                          {item.accuracy !== null ? (
                            <span className={`font-bold ${item.accuracy >= 80 ? 'text-emerald-400' : item.accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {item.accuracy}%
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-3 text-center">
                          {item.weakCount > 0 ? (
                            <span className="rounded bg-rose-950 border border-rose-800 px-2 py-0.5 text-xs font-bold text-rose-300">
                              ⚠️ {item.weakCount} คำ
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-400">ครบถ้วน</span>
                          )}
                        </td>
                        <td className="p-3 text-xs text-slate-400">
                          {item.lastPracticedAt ? formatVocabPracticeDate(item.lastPracticedAt) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-6 text-center text-slate-400 bg-slate-800/40 rounded-xl">
                นักเรียนคนนี้ยังไม่มีประวัติการฝึกคำศัพท์ในระบบ
              </p>
            )}
          </section>

          {/* Teacher Vocabulary Assignments Component */}
          <TeacherVocabularyAssignments
            key={`${schoolId}:${studentId}`}
            schoolId={schoolId}
            student={selected}
            evidenceRows={visibleRows}
          />

          {/* Detailed Word Evidence Table */}
          {status === 'loading' && <p role="status" className="text-sm text-slate-400">กำลังโหลดผลฝึกจากเซิร์ฟเวอร์…</p>}
          {status === 'ready' && !rows.length && (
            <p role="status" className="text-sm text-slate-400 bg-slate-800/40 p-4 rounded-xl">
              ยังไม่มีผลฝึกรายคำที่ส่งถึงระบบคลาวด์สำหรับนักเรียนคนนี้ (หรือกำลังรอการซิงก์จากอุปกรณ์นักเรียน)
            </p>
          )}

          {!!visibleRows.length && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock size={18} className="text-sky-400" />
                  ประวัติผลรายคำทั้งหมด ({filteredWordRows.length} / {visibleRows.length} รายการ)
                </h4>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-white"
                  >
                    <option value="">ทุกหมวด ({visibleRows.length})</option>
                    {[...new Set(visibleRows.map(r => r.category_id))].map(catId => (
                      <option key={catId} value={catId}>{catId}</option>
                    ))}
                  </select>

                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={wordTableQuery}
                      onChange={e => setWordTableQuery(e.target.value)}
                      placeholder="ค้นหาคำศัพท์หรือความหมาย..."
                      className="rounded-lg border border-slate-600 bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-left text-sm text-slate-200">
                  <caption className="sr-only">{selected.name} · {visibleRows.length} รายการคำ/บริบท</caption>
                  <thead className="bg-slate-800/80 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">คำศัพท์ / ความหมาย</th>
                      <th className="p-3">หมวด / Quest</th>
                      <th className="p-3 text-center">ตอบเองถูก / ครั้ง</th>
                      <th className="p-3 text-center">ใช้ตัวช่วยถูก / ครั้ง</th>
                      <th className="p-3 text-center">ผลตอบเองล่าสุด</th>
                      <th className="p-3">ระบบรับผลล่าสุด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredWordRows.map(row => (
                      <tr key={`${row.word_id}:${row.category_id}:${row.quest_id || ''}`} className="hover:bg-slate-800/40">
                        <td className="p-3">
                          <strong lang="en" className="text-white text-base font-bold">{row.word}</strong>
                          <div className="text-xs text-slate-400 mt-0.5">{row.meaning_th}</div>
                        </td>
                        <td className="p-3 text-xs text-slate-300">
                          <div className="font-semibold">{row.category_id}</div>
                          <div className="text-slate-500">{row.quest_id || 'ฝึกในหมวดโดยตรง'}</div>
                        </td>
                        <td className="p-3 text-center font-bold text-sky-400">
                          {row.independent_correct} / {row.independent_attempts}
                        </td>
                        <td className="p-3 text-center text-slate-400">
                          {row.assisted_correct} / {row.assisted_attempts}
                        </td>
                        <td className="p-3 text-center">
                          {row.latest_independent_correct === null ? (
                            <span className="text-xs text-slate-500">ยังไม่มีการตอบเอง</span>
                          ) : row.latest_independent_correct ? (
                            <span className="rounded bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-xs font-bold text-emerald-300">ตอบถูกในแบบฝึก</span>
                          ) : (
                            <span className="rounded bg-rose-950 border border-rose-800 px-2 py-0.5 text-xs font-bold text-rose-300">⚠️ ควรทบทวน</span>
                          )}
                        </td>
                        <td className="p-3 text-xs text-slate-400">
                          {row.last_received_at ? new Date(row.last_received_at).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : '-'}
                        </td>
                      </tr>
                    ))}
                    {!filteredWordRows.length && (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-slate-400">
                          ไม่พบคำศัพท์ตามเงื่อนไขค้นหา
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
