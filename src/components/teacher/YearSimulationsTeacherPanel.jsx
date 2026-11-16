import { useState, useMemo } from 'react';
import UIIcon from '../UIIcon';
import { 
  FileCheck2, Download, Search, RefreshCw, ChevronRight, 
  TrendingUp, Award, Clock, Users, CheckCircle2, AlertCircle, BarChart3, X, Sparkles
} from 'lucide-react';
import YearSimItemAnalysisView from './YearSimItemAnalysisView';
import StudentIndividualDiagnosticModal from './StudentIndividualDiagnosticModal';

export const SIM_YEARS = [
  { 
    year: 2564, 
    id: 'onet_year_2564', 
    bestKey: 'bestOnetYear2564', 
    label: "O-NET '64", 
    title: 'แนวข้อสอบ O-NET ปี 2564', 
    badgeDark: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    badgeLight: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  { 
    year: 2565, 
    id: 'onet_year_2565', 
    bestKey: 'bestOnetYear2565', 
    label: "O-NET '65", 
    title: 'แนวข้อสอบ O-NET ปี 2565', 
    badgeDark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    badgeLight: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  { 
    year: 2566, 
    id: 'onet_year_2566', 
    bestKey: 'bestOnetYear2566', 
    label: "O-NET '66", 
    title: 'แนวข้อสอบ O-NET ปี 2566', 
    badgeDark: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    badgeLight: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  { 
    year: 2567, 
    id: 'onet_year_2567', 
    bestKey: 'bestOnetYear2567', 
    label: "O-NET '67", 
    title: 'แนวข้อสอบ O-NET ปี 2567', 
    badgeDark: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    badgeLight: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  { 
    year: 2568, 
    id: 'onet_year_2568', 
    bestKey: 'bestOnetYear2568', 
    label: "O-NET '68", 
    title: 'จำลอง O-NET ปี 2568', 
    badgeDark: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    badgeLight: 'bg-violet-50 text-violet-700 border-violet-200'
  },
];

export function getStudentArenaStats(student) {
  if (!student) return {};
  let stats = student.arenaStats;
  if (!stats) {
    try {
      const raw = localStorage.getItem(`eng_quest_arena_${student.id}`);
      if (raw) stats = JSON.parse(raw);
    } catch {}
  }
  return stats || {};
}

export function getStudentYearStats(student, yearConfig) {
  const stats = getStudentArenaStats(student);
  let best = stats[yearConfig.bestKey];
  const attempts = Array.isArray(stats.attempts)
    ? stats.attempts.filter(a => a.mode === yearConfig.id)
    : [];
  if (!best && attempts.length > 0) {
    best = attempts.reduce((acc, curr) => (!acc || (curr.percent || 0) > (acc.percent || 0)) ? curr : acc, null);
  }
  return { best, attempts, attemptCount: attempts.length };
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '-';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m} นาที ${s > 0 ? `${s} วิ` : ''}`;
}

export default function YearSimulationsTeacherPanel({
  theme = 'light',
  students = [],
  selectedClass = 'all',
  onSelectStudent,
  onRefresh,
}) {
  const isDark = theme === 'dark';
  const [mainView, setMainView] = useState('roster'); // 'roster' | 'item_analysis'
  const [activeYearTab, setActiveYearTab] = useState('all'); // 'all' | '2564' | '2565' | '2566' | '2567' | '2568'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [selectedStudentDiagnostic, setSelectedStudentDiagnostic] = useState(null);

  // Filter students by query
  const filteredStudents = useMemo(() => {
    let list = students;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => (s.name || '').toLowerCase().includes(q) || (s.number || '').includes(q));
    }
    return list;
  }, [students, searchQuery]);

  // Aggregate metrics across students for each year
  const yearMetrics = useMemo(() => {
    const metrics = {};
    for (const y of SIM_YEARS) {
      let testedCount = 0;
      let totalPercent = 0;
      let passCount = 0;
      let maxPercent = 0;
      let minPercent = 100;
      let totalTime = 0;
      let timedCount = 0;

      students.forEach(s => {
        const { best } = getStudentYearStats(s, y);
        if (best && typeof best.percent === 'number') {
          testedCount++;
          totalPercent += best.percent;
          if (best.percent >= 50) passCount++;
          if (best.percent > maxPercent) maxPercent = best.percent;
          if (best.percent < minPercent) minPercent = best.percent;
          if (best.timeUsed) {
            totalTime += best.timeUsed;
            timedCount++;
          }
        }
      });

      metrics[y.year] = {
        testedCount,
        testedRatio: students.length > 0 ? (testedCount / students.length) * 100 : 0,
        avgPercent: testedCount > 0 ? totalPercent / testedCount : 0,
        passRate: testedCount > 0 ? (passCount / testedCount) * 100 : 0,
        maxPercent: testedCount > 0 ? maxPercent : 0,
        minPercent: testedCount > 0 ? minPercent : 0,
        avgTimeUsed: timedCount > 0 ? totalTime / timedCount : 0,
      };
    }
    return metrics;
  }, [students]);

  // Overall KPI across all 5 years
  const overallKpi = useMemo(() => {
    let anyTestedStudents = new Set();
    let totalCompletedSets = 0;
    let totalCombinedPercent = 0;
    let totalCombinedRecords = 0;

    students.forEach(s => {
      SIM_YEARS.forEach(y => {
        const { best } = getStudentYearStats(s, y);
        if (best && typeof best.percent === 'number') {
          anyTestedStudents.add(s.id);
          totalCompletedSets++;
          totalCombinedPercent += best.percent;
          totalCombinedRecords++;
        }
      });
    });

    const studentCount = students.length;
    const participantCount = anyTestedStudents.size;
    const participationRate = studentCount > 0 ? (participantCount / studentCount) * 100 : 0;
    const avgScore = totalCombinedRecords > 0 ? totalCombinedPercent / totalCombinedRecords : 0;

    return {
      studentCount,
      participantCount,
      participationRate,
      totalCompletedSets,
      avgScore,
    };
  }, [students]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ลำดับ', 'เลขที่', 'ชื่อ-นามสกุล', 'ชั้นเรียน',
      'ปี 2564 (%)', 'ปี 2565 (%)', 'ปี 2566 (%)', 'ปี 2567 (%)', 'ปี 2568 (%)',
      'เฉลี่ยสะสม (%)', 'จำนวนชุดที่ทำ (ชุด)'
    ];

    const rows = filteredStudents.map((s, idx) => {
      const scores = SIM_YEARS.map(y => {
        const { best } = getStudentYearStats(s, y);
        return best ? best.percent.toFixed(1) : '-';
      });
      const validScores = scores.filter(v => v !== '-').map(Number);
      const avg = validScores.length > 0 
        ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) 
        : '-';
      return [
        idx + 1,
        `"${s.number || ''}"`,
        `"${s.name || ''}"`,
        `"${s.class || ''}"`,
        ...scores,
        avg,
        validScores.length
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `onet_simulation_scores_${selectedClass}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ── Masthead ── */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border shadow-sm transition-all ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-indigo-500/20' 
          : 'bg-gradient-to-r from-indigo-50/90 via-white to-sky-50/90 border-indigo-100'
      }`}>
        <div className="space-y-1">
          <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            isDark 
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
              : 'bg-indigo-100 text-indigo-800 border-indigo-200'
          }`}>
            <FileCheck2 size={13} />
            <span>ระบบวิเคราะห์ผลสอบจำลอง</span>
          </div>
          <h2 className={`text-xl md:text-2xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <span>จำลองข้อสอบ O-NET 64–68</span>
            <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${
              isDark 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}>
              5 ชุดมาตรฐาน สทศ.
            </span>
          </h2>
          <p className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            ติดตามผลคะแนนและสถิติการฝึกทำข้อสอบจำลองรายปี พ.ศ. 2564–2568 (32 ข้อ · 100 คะแนน · 60 นาที) แยกรายบุคคลและภาพรวมห้องเรียน
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="รีเฟรชข้อมูลล่าสุด"
            >
              <RefreshCw size={14} />
              <span>รีเฟรช</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
            title="ส่งออกรายงาน Excel/CSV"
          >
            <Download size={14} />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* ── Main View Selector ── */}
      <div className={`p-1.5 rounded-2xl border flex items-center gap-1.5 shadow-sm ${
        isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-100/90 border-slate-200'
      }`}>
        <button
          type="button"
          onClick={() => setMainView('roster')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mainView === 'roster'
              ? (isDark ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-indigo-700 shadow-sm')
              : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
          }`}
        >
          <BarChart3 size={16} />
          <span>📊 คะแนน & วิเคราะห์ภาพรวมห้องเรียน</span>
        </button>
        <button
          type="button"
          onClick={() => setMainView('item_analysis')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mainView === 'item_analysis'
              ? (isDark ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20')
              : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
          }`}
        >
          <FileCheck2 size={16} />
          <span>🔍 วิเคราะห์ข้อสอบรายข้อ & แผนการสอน (Item Analysis)</span>
        </button>
      </div>

      {mainView === 'item_analysis' ? (
        <YearSimItemAnalysisView
          theme={theme}
          selectedYear={activeYearTab === 'all' ? 2565 : Number(activeYearTab)}
          onSelectYear={(y) => setActiveYearTab(String(y))}
          students={students}
        />
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Metric 1 */}
        <div className={`p-4 rounded-xl border space-y-1 shadow-sm ${
          isDark ? 'bg-slate-900/80 border-white/5' : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>นักเรียนที่เข้าฝึกซ้อม</span>
            <Users size={16} className="text-sky-500" />
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {overallKpi.participantCount} <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>/ {overallKpi.studentCount} คน</span>
          </div>
          <div className="text-[11px] text-sky-600 font-medium">
            มีส่วนร่วม {overallKpi.participationRate.toFixed(1)}% ของห้อง
          </div>
        </div>

        {/* Metric 2 */}
        <div className={`p-4 rounded-xl border space-y-1 shadow-sm ${
          isDark ? 'bg-slate-900/80 border-white/5' : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>คะแนนเฉลี่ยรวม 5 ปี</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {overallKpi.avgScore > 0 ? overallKpi.avgScore.toFixed(1) : '-'} <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>/ 100</span>
          </div>
          <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {overallKpi.avgScore >= 50 ? '✓ เกินเกณฑ์มาตรฐาน สพฐ.' : 'ควรส่งเสริมการทบทวน'}
          </div>
        </div>

        {/* Metric 3 */}
        <div className={`p-4 rounded-xl border space-y-1 shadow-sm ${
          isDark ? 'bg-slate-900/80 border-white/5' : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>จำนวนชุดที่สอบเสร็จ</span>
            <CheckCircle2 size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {overallKpi.totalCompletedSets} <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>รอบสอบ</span>
          </div>
          <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            จาก 5 ชุดวิชา (ปี 64–68)
          </div>
        </div>

        {/* Metric 4 */}
        <div className={`p-4 rounded-xl border space-y-1 shadow-sm ${
          isDark ? 'bg-slate-900/80 border-white/5' : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>มาตรฐาน Blueprint</span>
            <Award size={16} className="text-violet-500" />
          </div>
          <div className="text-2xl font-black text-violet-600">
            100%
          </div>
          <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            สอดคล้องตัวชี้วัด สทศ. ทุกข้อ
          </div>
        </div>
      </div>

      {/* ── Year Summary Cards (5 Years Grid) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SIM_YEARS.map(y => {
          const m = yearMetrics[y.year] || {};
          const isSelected = activeYearTab === String(y.year);
          const badgeStyle = isDark ? y.badgeDark : y.badgeLight;

          return (
            <div
              key={y.year}
              onClick={() => setActiveYearTab(isSelected ? 'all' : String(y.year))}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden shadow-sm ${
                isSelected 
                  ? (isDark 
                      ? 'bg-slate-800 border-indigo-400 ring-2 ring-indigo-500/30' 
                      : 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-300/40 shadow-md')
                  : (isDark 
                      ? 'bg-slate-900/80 border-white/5 hover:border-white/20' 
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md')
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>
                  {y.label}
                </span>
                <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>32 ข้อ</span>
              </div>
              <div className={`text-lg font-black mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {m.avgPercent > 0 ? `${m.avgPercent.toFixed(1)}` : '-'}
                <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}> /100</span>
              </div>
              <div className={`flex items-center justify-between text-[11px] mt-2 pt-2 border-t ${
                isDark ? 'border-white/5 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <span>ทำแล้ว: {m.testedCount} คน</span>
                <span className={m.passRate >= 50 ? 'text-emerald-600 font-semibold' : ''}>
                  ผ่าน {m.passRate.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border shadow-sm ${
        isDark ? 'bg-slate-900/80 border-white/5' : 'bg-white border-slate-200'
      }`}>
        {/* Year Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveYearTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeYearTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            📊 ภาพรวมทุกปี
          </button>
          {SIM_YEARS.map(y => (
            <button
              key={y.year}
              type="button"
              onClick={() => setActiveYearTab(String(y.year))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeYearTab === String(y.year)
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              {y.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือเลขที่..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 border ${
              isDark 
                ? 'bg-slate-950/60 border-white/10 text-white placeholder-slate-500' 
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* ── Student Scores Table ── */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${
        isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className={`border-b text-xs font-bold ${
                isDark 
                  ? 'border-white/10 bg-slate-950/80 text-slate-400' 
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">ชื่อ - สกุล</th>
                <th className="p-3 text-center">ห้อง</th>
                {activeYearTab === 'all' ? (
                  <>
                    <th className="p-3 text-center text-rose-600">ปี '64</th>
                    <th className="p-3 text-center text-emerald-600">ปี '65</th>
                    <th className="p-3 text-center text-sky-600">ปี '66</th>
                    <th className="p-3 text-center text-amber-600">ปี '67</th>
                    <th className="p-3 text-center text-violet-600">ปี '68</th>
                    <th className="p-3 text-center text-indigo-600 font-black">เฉลี่ยสะสม</th>
                    <th className="p-3 text-center">ทำแล้ว</th>
                  </>
                ) : (
                  <>
                    <th className="p-3 text-center text-indigo-600">คะแนนเต็ม 100</th>
                    <th className="p-3 text-center">ข้อที่ตอบถูก</th>
                    <th className="p-3 text-center">เวลาที่ใช้</th>
                    <th className="p-3 text-center">จำนวนรอบที่ทำ</th>
                    <th className="p-3 text-center">สถานะ</th>
                  </>
                )}
                <th className="p-3 text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className={`p-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    ไม่พบข้อมูลนักเรียนที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  if (activeYearTab === 'all') {
                    const yearScores = SIM_YEARS.map(y => {
                      const { best, attemptCount } = getStudentYearStats(s, y);
                      return { year: y.year, best, attemptCount };
                    });

                    const testedScores = yearScores
                      .filter(ys => ys.best && typeof ys.best.percent === 'number')
                      .map(ys => ys.best.percent);

                    const avgScore = testedScores.length > 0 
                      ? (testedScores.reduce((a, b) => a + b, 0) / testedScores.length)
                      : null;

                    return (
                      <tr key={s.id} className={`transition-colors ${
                        isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50/80'
                      }`}>
                        <td className={`p-3 text-center text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {idx + 1}
                        </td>
                        <td className={`p-3 font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          <button
                            type="button"
                            onClick={() => onSelectStudent ? onSelectStudent(s.id) : setSelectedStudentDetail({ student: s, yearStats: yearScores })}
                            className="hover:text-indigo-600 transition-colors text-left cursor-pointer"
                          >
                            {s.name}
                          </button>
                        </td>
                        <td className={`p-3 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {s.class || '-'}
                        </td>
                        {yearScores.map(ys => (
                          <td key={ys.year} className="p-3 text-center font-mono">
                            {ys.best ? (
                              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                ys.best.percent >= 70 
                                  ? (isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-200') :
                                ys.best.percent >= 50 
                                  ? (isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-200') :
                                  (isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-100 text-rose-800 border-rose-200')
                              }`}>
                                {Math.round(ys.best.percent)}
                              </span>
                            ) : (
                              <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>-</span>
                            )}
                          </td>
                        ))}
                        <td className="p-3 text-center font-mono">
                          {avgScore !== null ? (
                            <span className="text-sm font-black text-indigo-600">
                              {avgScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>-</span>
                          )}
                        </td>
                        <td className={`p-3 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {testedScores.length} / 5 ชุด
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const targetYear = activeYearTab === 'all' ? 2565 : Number(activeYearTab);
                                const yConfig = SIM_YEARS.find(y => y.year === targetYear) || SIM_YEARS[1];
                                const { best, attempts } = getStudentYearStats(s, yConfig);
                                const att = best || attempts[0] || {
                                  score: 0,
                                  total: 32,
                                  percent: 0,
                                  timeUsed: 0,
                                  mode: yConfig.id,
                                  wrongQuestions: []
                                };
                                setSelectedStudentDiagnostic({
                                  student: s,
                                  yearConfig: yConfig,
                                  attempt: att
                                });
                              }}
                              className={`px-2 py-1 text-xs rounded-lg border font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${
                                isDark 
                                  ? 'bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border-indigo-500/40' 
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm'
                              }`}
                              title="วิเคราะห์ผลการสอบรายบุคคล"
                            >
                              <BarChart3 size={12} />
                              <span>วิเคราะห์รายคน</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentDetail({ student: s, yearStats: yearScores })}
                              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                                isDark 
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                              }`}
                            >
                              <span>ดูประวัติ</span>
                              <ChevronRight size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  } else {
                    // Single year tab
                    const yearConfig = SIM_YEARS.find(y => String(y.year) === activeYearTab);
                    const { best, attempts, attemptCount } = getStudentYearStats(s, yearConfig);

                    return (
                      <tr key={s.id} className={`transition-colors ${
                        isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50/80'
                      }`}>
                        <td className={`p-3 text-center text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {idx + 1}
                        </td>
                        <td className={`p-3 font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          <button
                            type="button"
                            onClick={() => onSelectStudent ? onSelectStudent(s.id) : setSelectedStudentDetail({ student: s, yearConfig, best, attempts })}
                            className="hover:text-indigo-600 transition-colors text-left cursor-pointer"
                          >
                            {s.name}
                          </button>
                        </td>
                        <td className={`p-3 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {s.class || '-'}
                        </td>
                        <td className="p-3 text-center font-mono">
                          {best ? (
                            <span className={`px-2.5 py-1 rounded-lg text-sm font-black border ${
                              best.percent >= 70 
                                ? (isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-200') :
                              best.percent >= 50 
                                ? (isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-200') :
                                (isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-100 text-rose-800 border-rose-200')
                            }`}>
                              {best.percent.toFixed(1)}
                            </span>
                          ) : (
                            <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>ยังไม่เข้าทำ</span>
                          )}
                        </td>
                        <td className={`p-3 text-center font-mono text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {best ? `${best.score || Math.round((best.percent / 100) * 32)} / 32` : '-'}
                        </td>
                        <td className={`p-3 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {best ? formatDuration(best.timeUsed) : '-'}
                        </td>
                        <td className={`p-3 text-center font-mono text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {attemptCount > 0 ? `${attemptCount} รอบ` : '-'}
                        </td>
                        <td className="p-3 text-center">
                          {best ? (
                            best.percent >= 70 ? (
                              <span className="text-[11px] font-bold text-emerald-600">ระดับดีเยี่ยม</span>
                            ) : best.percent >= 50 ? (
                              <span className="text-[11px] font-bold text-amber-600">ผ่านเกณฑ์</span>
                            ) : (
                              <span className="text-[11px] font-bold text-rose-600">ควรพัฒนาเพิ่ม</span>
                            )
                          ) : (
                            <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>รอดำเนินการ</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const att = best || attempts[0] || {
                                  score: 0,
                                  total: 32,
                                  percent: 0,
                                  timeUsed: 0,
                                  mode: yearConfig.id,
                                  wrongQuestions: []
                                };
                                setSelectedStudentDiagnostic({
                                  student: s,
                                  yearConfig,
                                  attempt: att
                                });
                              }}
                              className={`px-2 py-1 text-xs rounded-lg border font-bold transition-all inline-flex items-center gap-1 cursor-pointer ${
                                isDark 
                                  ? 'bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border-indigo-500/40' 
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm'
                              }`}
                              title="วิเคราะห์ผลการสอบรายบุคคล"
                            >
                              <BarChart3 size={12} />
                              <span>วิเคราะห์รายคน</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentDetail({ student: s, yearConfig, best, attempts })}
                              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                                isDark 
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                              }`}
                            >
                              <span>ดูประวัติ</span>
                              <ChevronRight size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* ── Student Attempt Detail Modal ── */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border ${
            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <span>{selectedStudentDetail.student.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    ชั้น {selectedStudentDetail.student.class || '-'} เลขที่ {selectedStudentDetail.student.number || '-'}
                  </span>
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  ประวัติการฝึกซ้อมข้อสอบจำลอง O-NET พ.ศ. 2564–2568
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content of Modal */}
            <div className="space-y-3">
              {SIM_YEARS.map(y => {
                const { best, attempts } = getStudentYearStats(selectedStudentDetail.student, y);
                const badgeStyle = isDark ? y.badgeDark : y.badgeLight;

                return (
                  <div key={y.year} className={`p-3.5 rounded-xl border space-y-2 ${
                    isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>
                          {y.label}
                        </span>
                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{y.title}</span>
                      </div>
                      {best ? (
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className={`text-sm font-black ${
                              best.percent >= 70 ? 'text-emerald-600' :
                              best.percent >= 50 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {best.percent.toFixed(1)}%
                            </span>
                            <span className={`text-xs ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              ({best.score || Math.round((best.percent / 100) * 32)}/32 ข้อ)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentDiagnostic({
                                student: selectedStudentDetail.student,
                                yearConfig: y,
                                attempt: best
                              });
                            }}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                              isDark
                                ? 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border-indigo-500/40'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                            }`}
                            title="เปิดระบบวิเคราะห์รายบุคคล"
                          >
                            <BarChart3 size={12} />
                            <span>วิเคราะห์รอบนี้</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ยังไม่เคยเข้าทำ</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentDiagnostic({
                                student: selectedStudentDetail.student,
                                yearConfig: y,
                                attempt: {
                                  score: 0,
                                  total: 32,
                                  percent: 0,
                                  timeUsed: 0,
                                  mode: y.id,
                                  wrongQuestions: []
                                }
                              });
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                              isDark ? 'bg-slate-800 text-slate-400 border-white/5 hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                            }`}
                          >
                            ดูตัวอย่าง
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Attempt history list */}
                    {attempts && attempts.length > 0 && (
                      <div className={`pt-2 border-t space-y-1 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                        <div className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>ประวัติการทำ ({attempts.length} รอบ):</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                          {attempts.map((att, aIdx) => (
                            <div key={aIdx} className={`p-2 rounded-lg border flex items-center justify-between gap-1.5 ${
                              isDark ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800'
                            }`}>
                              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>รอบที่ {attempts.length - aIdx}:</span>
                              <span className="font-mono font-bold">{att.score}/{att.total || 32} ({Math.round(att.percent)}%)</span>
                              <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{formatDuration(att.timeUsed)}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudentDiagnostic({
                                    student: selectedStudentDetail.student,
                                    yearConfig: y,
                                    attempt: att
                                  });
                                }}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
                                  isDark
                                    ? 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border-indigo-500/40'
                                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm'
                                }`}
                              >
                                <span>วิเคราะห์รายข้อ</span>
                                <ChevronRight size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
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
      )}

      {/* ── Student Individual Diagnostic Modal ── */}
      {selectedStudentDiagnostic && (
        <StudentIndividualDiagnosticModal
          theme={theme}
          student={selectedStudentDiagnostic.student}
          yearConfig={selectedStudentDiagnostic.yearConfig}
          attempt={selectedStudentDiagnostic.attempt}
          onClose={() => setSelectedStudentDiagnostic(null)}
        />
      )}
    </div>
  );
}
