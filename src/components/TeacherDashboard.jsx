import UIIcon, { UIIconText } from './UIIcon';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Menu, RefreshCw, Download, ArrowRight, X } from 'lucide-react';
import TeacherOverview, { exportRiskStudents } from './teacher/TeacherOverview';
import TeacherSidebarNav from './teacher/TeacherSidebarNav';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import { canManageSchoolStudents } from '../utils/roleAccess';
import TeacherPracticeReview from './teacher/TeacherPracticeReview';
import TeacherVocabularyReport from './teacher/TeacherVocabularyReport';
import Student360Profile from './teacher/Student360Profile';
import OfficialExamTeacherPanel from './teacher/OfficialExamTeacherPanel';
import YearSimulationsTeacherPanel from './teacher/YearSimulationsTeacherPanel';
import { downloadStudentImportTemplate } from '../utils/studentImportFile';
import { filterStudent360Roster } from '../utils/student360Model';
import TierArtwork from './ranking/TierArtwork';
import { getRiskStudents, hasRiskEvidence, TEACHER_CHAPTERS } from '../utils/teacherAnalytics';
import { QUESTS } from '../data/questions';
import { useApp } from '../App';
import {
  parseCSVData
} from '../utils/storage';
import {
  getStaffStudents, createStaffStudent, renameStaffStudent,
  setStaffTranslatePermission, deleteStaffStudent,
  deleteStaffStudentsByClass, deleteAllStaffStudents
} from '../utils/staffStudents';
import {
  getClassPreTestAverage, getClassCurrentAverage,
  getLevelTitle, calcLevel, calculateRankScore, getRankingTier, getStudentCurrentPercent, getStudentPreTestPercent
} from '../utils/scoring';
import { BADGES } from '../data/badges';
import {
  openExamSession, closeExamSession, getExamSession, getAllFinalExamResultsFromCloud
} from '../utils/arenaStorage';
import { getActiveSchoolContext, setActiveSchoolContext, getSchoolByCode } from '../utils/schoolStorage';

// ── Donut Pie Chart (pure SVG, no library) ─────────────────────────
function DonutChart({ data, size = 120, thickness = 22, label, sublabel }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div style={{ width: size, height: size }} className="flex items-center justify-center">
          <svg width={size} height={size} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={thickness} />
          </svg>
        </div>
        {label && <div className="text-slate-500 text-xs text-center">{label}</div>}
      </div>
    );
  }
  const cx = 60, cy = 60, r = 44;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;
  const slices = data.map(d => {
    const pct = d.value / total;
    const dashLen = pct * circumference;
    const offset = circumference - cumulative * circumference;
    cumulative += pct;
    return { ...d, dashLen, offset, pct };
  });
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${s.dashLen} ${circumference - s.dashLen}`}
              strokeDashoffset={s.offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 4px ${s.color}88)` }}
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {label && <div className="text-white font-black text-xl leading-none">{label}</div>}
          {sublabel && <div className="text-slate-400 text-[10px] mt-0.5 font-medium">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}

const QUEST_THAI_LABELS = {
  vocabulary: 'คำศัพท์', signs: 'ป้ายและสัญลักษณ์', directions: 'ทิศทาง', market: 'การซื้อขาย',
  conversation: 'บทสนทนา', reading: 'การอ่าน', grammar: 'ไวยากรณ์', shapes_colors: 'รูปร่างและสี',
  school_subjects: 'วิชาในโรงเรียน', weather_seasons: 'อากาศและฤดูกาล', emotions_feelings: 'อารมณ์และความรู้สึก',
};
const QUEST_LABELS = Object.fromEntries(QUESTS.map(quest => [quest.id, quest.name]));
const formatQuestLabel = questId => {
  const english = QUEST_LABELS[questId] || questId.replaceAll('_', ' ');
  const thai = QUEST_THAI_LABELS[questId];
  return thai ? `${english} — ${thai}` : english;
};

const generateExamPin = () => {
  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return String(100000 + (values[0] % 900000));
};

const isWeakExamPin = pin => {
  if (!/^\d{6}$/.test(pin)) return true;
  if (/^(\d)\1{5}$/.test(pin)) return true;
  return ['123456', '654321', '111111', '000000', '999999'].includes(pin);
};

export default function TeacherDashboard({ initialTab = 'overview' }) {
  const { navigate, handleLogout, showToast, student: currentTeacher } = useApp();
  const isSuperAdmin = currentTeacher?.authVerified === true && currentTeacher?.role === 'super_admin';
  const canManageRoster = isSuperAdmin || currentTeacher?.membership_role === 'school_admin';

  // Resolved school: Super admin uses activeSchool context, regular teacher is strictly locked to their own school
  const [activeSchool, setActiveSchool] = useState(() => getActiveSchoolContext());
  const displaySchool = useMemo(() => {
    if (isSuperAdmin) {
      return activeSchool || getSchoolByCode('BNS01') || { name: 'โรงเรียนบ้านนาสาร', code: 'BNS01', id: 'sch_bns_01' };
    }
    return {
      name: currentTeacher?.school_name || 'โรงเรียนของคุณ',
      code: currentTeacher?.school_code || '',
      id: currentTeacher?.school_id || '',
      area: currentTeacher?.school_area || ''
    };
  }, [isSuperAdmin, activeSchool, currentTeacher]);

  const [students, setStudents] = useState([]);
  const rosterContext = JSON.stringify([displaySchool.id, currentTeacher?.user_id, currentTeacher?.school_membership_id, currentTeacher?.role, currentTeacher?.membership_role]);
  const [loadedRosterContext, setLoadedRosterContext] = useState(null);
  const rosterRequest = useRef(0);
  const rosterScope = useRef(rosterContext);
  rosterScope.current = rosterContext;
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetClass, setResetTargetClass] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', class: '', number: '' });
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [duplicateData, setDuplicateData] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudentForBadges, setSelectedStudentForBadges] = useState(null);
  const [selectedClass, setSelectedClass] = useState('all');
  // Online status (on-demand by teacher)
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineCheckedAt, setOnlineCheckedAt] = useState(null);
  const [showOnlineList, setShowOnlineList] = useState(false);
  const [selectedStudentForDrilldown, setSelectedStudentForDrilldown] = useState(null);
  const [drilldownTab, setDrilldownTab] = useState('overview');
  const [studentQuery, setStudentQuery] = useState('');
  const [profileSkill, setProfileSkill] = useState('');
  const [profileEvidence, setProfileEvidence] = useState('all');
  const [selectedWeakQuest, setSelectedWeakQuest] = useState(null);
  const [showClassComparison, setShowClassComparison] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Theme: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('teacher_theme') || 'dark';
  });


  // ── Final Exam Control ────────────────────────────────────────
  const [examSession, setExamSession] = useState(null);
  const [examResults, setExamResults] = useState([]);
  const [examPinInput, setExamPinInput] = useState('');
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [editPinInput, setEditPinInput] = useState('');
  const [examLoading, setExamLoading] = useState(false);
  const [showExamPanel, setShowExamPanel] = useState(true);
  const [examResultsLoaded, setExamResultsLoaded] = useState(false);
  const [examCloudSyncOk, setExamCloudSyncOk] = useState(null); // null=ไม่รู้, true=ok, false=fail

  const refresh = useCallback(async ({ silent = false, reportError = false } = {}) => {
    const requestId = ++rosterRequest.current;
    const scope = rosterContext;
    if (!silent) setLoading(true);
    try {
      const latestStudents = await getStaffStudents(displaySchool.id);
      if (rosterScope.current !== scope || requestId !== rosterRequest.current) return [];
      setStudents(latestStudents);
      setLoadedRosterContext(scope);
      setLastUpdatedAt(new Date());
      setLoadError(false);
      setCurrentPage(1);
      return latestStudents;
    } catch (error) {
      if (rosterScope.current !== scope || requestId !== rosterRequest.current) return [];
      if (['42501', 'PGRST301', 'PGRST302'].includes(error.code)) { setStudents([]); setLoadedRosterContext(null); }
      setLoadError(true);
      if (reportError) showToast('ไม่สามารถยืนยันสิทธิ์เพื่อโหลดข้อมูลนักเรียนได้');
      throw error;
    } finally {
      if (!silent && rosterScope.current === scope && requestId === rosterRequest.current) setLoading(false);
    }
  }, [displaySchool.id, showToast, rosterContext]);

  useEffect(() => { setSelectedStudentForDrilldown(null); }, [displaySchool.id, currentTeacher?.user_id]);

  useEffect(() => {
    let active = true;
    const refreshIfActive = async (options) => {
      try {
        if (active) await refresh(options);
      } catch {
        // The dashboard keeps the last verified snapshot when refresh fails.
      }
    };

    refreshIfActive({ reportError: true });
    // Load current exam session status
    const cached = getExamSession();
    if (cached) setExamSession(cached);
    handleLoadExamResults();

    const intervalId = window.setInterval(() => {
      if (!document.hidden) refreshIfActive({ silent: true });
    }, 30000);
    const handleVisibility = () => {
      if (!document.hidden) refreshIfActive({ silent: true });
    };
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [displaySchool.id, refresh]);

  useEffect(() => {
    if (!selectedStudentForDrilldown?.id) return;
    const latestStudent = students.find(student => student.id === selectedStudentForDrilldown.id);
    if (latestStudent && latestStudent !== selectedStudentForDrilldown) {
      setSelectedStudentForDrilldown(latestStudent);
    }
  }, [students, selectedStudentForDrilldown]);

  const handleOpenExam = async () => {
    const pin = examPinInput.trim();
    if (!pin) { showToast('⚠️ กรุณาใส่รหัส PIN ก่อน'); return; }
    if (isWeakExamPin(pin)) { showToast('⚠️ กรุณาใช้ PIN 6 หลักที่คาดเดายาก หรือกดสุ่ม PIN'); return; }
    setExamLoading(true);
    setExamCloudSyncOk(null);
    try {
      const session = await openExamSession(pin);
      setExamSession(session);
      setExamPinInput('');
      setExamCloudSyncOk(session.cloudSynced);
      if (session.cloudSynced) {
        showToast(`✅ เปิดสอบปลายภาคสำเร็จ! รหัส PIN: ${pin}`);
      } else {
        showToast('⚠️ เปิดสอบแล้ว แต่ยังไม่ได้ Sync Cloud — นักเรียนอาจยังไม่เห็น');
      }
    } catch (e) {
      setExamCloudSyncOk(false);
      showToast('❌ เปิดสอบไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setExamLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    const pin = editPinInput.trim();
    if (isWeakExamPin(pin)) {
      showToast('⚠️ กรุณาใช้ PIN 6 หลักที่คาดเดายาก หรือกดสุ่ม PIN');
      return;
    }
    setExamLoading(true);
    try {
      const session = await openExamSession(pin);
      setExamSession(session);
      setIsEditingPin(false);
      setEditPinInput('');
      showToast(`✅ เปลี่ยนรหัส PIN เป็น "${pin}" สำเร็จ!`);
    } catch (e) {
      showToast('❌ เปลี่ยน PIN ไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setExamLoading(false);
    }
  };

  const handleCloseExam = async () => {
    if (!window.confirm('ปิดสอบปลายภาค? นักเรียนจะไม่สามารถเข้าสอบได้อีก (แต่ยังดูผลได้)')) return;
    setExamLoading(true);
    setExamCloudSyncOk(null);
    try {
      const session = await closeExamSession();
      setExamSession(session);
      setExamCloudSyncOk(session.cloudSynced);
      if (session.cloudSynced) {
        showToast('🔒 ปิดสอบปลายภาคแล้ว (Sync Cloud สำเร็จ)');
      } else {
        showToast('⚠️ ปิดสอบแล้ว แต่ยังไม่ได้ Sync Cloud');
      }
    } catch (e) {
      setExamCloudSyncOk(false);
      showToast('❌ ปิดสอบไม่สำเร็จ');
    } finally {
      setExamLoading(false);
    }
  };

  const handleLoadExamResults = async () => {
    setExamLoading(true);
    try {
      const results = await getAllFinalExamResultsFromCloud();
      setExamResults(results);
      setExamResultsLoaded(true);
    } catch (e) {
      showToast('❌ โหลดผลสอบไม่สำเร็จ');
    } finally {
      setExamLoading(false);
    }
  };

  const handleExportExamResults = () => {
    if (filteredExamResults.length === 0) return;
    const headers = [
      'ลำดับ', 'โรงเรียน', 'ชื่อ-นามสกุล', 'ห้อง', 'เลขที่',
      'คะแนนที่ได้ (เต็ม 100)', 'จำนวนข้อถูก (เต็ม 50)', 'ร้อยละ (%)',
      'ผลการประเมิน', 'เวลาที่ใช้ (นาที:วินาที)', 'วันที่และเวลาสอบ'
    ];
    const rows = filteredExamResults.map((r, idx) => {
      const res = r.finalExamResult;
      const points = res.points !== undefined ? res.points : (res.score * 2);
      const date = res.submittedAt ? new Date(res.submittedAt).toLocaleString('th-TH') : '-';
      const m = Math.floor((res.timeUsed || 0) / 60);
      const s = ((res.timeUsed || 0) % 60).toString().padStart(2, '0');
      const timeStr = `${m}:${s}`;
      return [
        idx + 1,
        `"${(displaySchool.name || '').replace(/"/g, '""')}"`,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.class || '-').replace(/"/g, '""')}"`,
        `"${(r.number || '-').replace(/"/g, '""')}"`,
        points,
        `${res.score}/${res.total}`,
        `${Math.round(res.percent)}%`,
        res.percent >= 70 ? 'ผ่าน' : 'ไม่ผ่าน',
        timeStr,
        `"${date}"`
      ].join(',');
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ผลสอบปลายภาค_${displaySchool.code}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExamResultsPDF = () => {
    if (filteredExamResults.length === 0) return;

    const totalStudents = filteredExamResults.length;
    const passedCount = filteredExamResults.filter(r => r.finalExamResult.percent >= 70).length;
    const failedCount = totalStudents - passedCount;
    const passRate = Math.round((passedCount / totalStudents) * 100);
    
    const scores = filteredExamResults.map(r => r.finalExamResult.points !== undefined ? r.finalExamResult.points : (r.finalExamResult.score * 2));
    const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / totalStudents) * 10) / 10;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    // Skill breakdown summary across all students
    const skillTotals = {};
    filteredExamResults.forEach(r => {
      const skills = r.finalExamResult.skillScores || {};
      Object.keys(skills).forEach(s => {
        if (!skillTotals[s]) skillTotals[s] = { correct: 0, total: 0 };
        skillTotals[s].correct += skills[s].correct || 0;
        skillTotals[s].total += skills[s].total || 0;
      });
    });

    const skillRows = Object.keys(skillTotals).map(s => {
      const pct = skillTotals[s].total > 0 ? Math.round((skillTotals[s].correct / skillTotals[s].total) * 100) : 0;
      return `<tr>
        <td style="padding: 6px 12px; border: 1px solid #e2e8f0; font-weight: 500;">${s}</td>
        <td style="padding: 6px 12px; border: 1px solid #e2e8f0; text-align: center;">${skillTotals[s].correct} / ${skillTotals[s].total}</td>
        <td style="padding: 6px 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${pct >= 70 ? '#15803d' : '#b91c1c'};">${pct}%</td>
      </tr>`;
    }).join('');

    const studentRows = filteredExamResults.map((r, idx) => {
      const res = r.finalExamResult;
      const points = res.points !== undefined ? res.points : (res.score * 2);
      const passed = res.percent >= 70;
      const date = res.submittedAt ? new Date(res.submittedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';
      return `<tr>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center;">${r.number || '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center;">${r.class || '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 600;">${r.name}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-size: 14px;">${points} <span style="font-size: 11px; color: #64748b; font-weight: normal;">/ 100</span></td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">${res.score} / ${res.total}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${Math.round(res.percent)}%</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center;">
          <span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: ${passed ? '#dcfce7' : '#fee2e2'}; color: ${passed ? '#166534' : '#991b1b'};">
            ${passed ? 'ผ่าน' : 'ไม่ผ่าน'}
          </span>
        </td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #64748b;">${date}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>แบบรายงานผลการสอบปลายภาค - วิชาภาษาอังกฤษ ป.6</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body {
      font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.5;
    }
    @page {
      size: A4 portrait;
      margin: 15mm 12mm;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      tr { page-break-inside: avoid; }
      thead { display: table-header-group; }
    }
    .header-card {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }
    .stat-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
      background: #f8fafc;
    }
    .stat-val {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }
    .stat-label {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #f1f5f9;
      padding: 10px 8px;
      border: 1px solid #cbd5e1;
      font-size: 12px;
      color: #334155;
      font-weight: 600;
    }
    .signature-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-around;
      page-break-inside: avoid;
    }
    .sig-box {
      text-align: center;
      width: 250px;
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <span style="font-weight: bold; color: #1e40af;">📄 รายงานผลการสอบปลายภาค / บันทึกเป็น PDF</span>
      <div style="font-size: 12px; color: #3b82f6; margin-top: 2px;">สามารถเลือก "Save as PDF" ในหน้าต่างสั่งพิมพ์เพื่อบันทึกไฟล์ PDF ได้ทันที</div>
    </div>
    <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px;">
      🖨️ สั่งพิมพ์ / บันทึก PDF
    </button>
  </div>

  <div class="header-card">
    <div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600;">แบบรายงานผลการสอบอย่างเป็นทางการ</div>
      <h1 style="margin: 4px 0 2px 0; font-size: 20px; font-weight: 800; color: #0f172a;">รายงานสรุปผลการสอบปลายภาค (Final Examination Report)</h1>
      <div style="font-size: 13px; color: #334155;">กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ · วิชาภาษาอังกฤษ ป.6 (O-NET Adventure)</div>
      <div style="font-size: 13px; color: #0284c7; font-weight: 700; margin-top: 2px;">🏫 โรงเรียน: ${displaySchool.name} (${displaySchool.code})</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #64748b;">
      <div>ข้อสอบ: <strong>50 ข้อ</strong> | เต็ม: <strong>100 คะแนน</strong> (ข้อละ 2 คะแนน)</div>
      <div>เกณฑ์ผ่าน: <strong>70 คะแนน (70%)</strong></div>
      <div>วันที่ออกรายงาน: <strong>${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-val">${totalStudents}</div>
      <div class="stat-label">ผู้เข้าสอบทั้งหมด</div>
    </div>
    <div class="stat-box" style="background: #f0fdf4; border-color: #bbf7d0;">
      <div class="stat-val" style="color: #166534;">${passedCount} <span style="font-size: 12px; font-weight: normal;">(${passRate}%)</span></div>
      <div class="stat-label" style="color: #15803d;">ผ่านเกณฑ์ (≥70)</div>
    </div>
    <div class="stat-box" style="background: #fef2f2; border-color: #fecaca;">
      <div class="stat-val" style="color: #991b1b;">${failedCount} <span style="font-size: 12px; font-weight: normal;">(${100 - passRate}%)</span></div>
      <div class="stat-label" style="color: #b91c1c;">ไม่ผ่านเกณฑ์ (&lt;70)</div>
    </div>
    <div class="stat-box">
      <div class="stat-val" style="color: #2563eb;">${avgScore}</div>
      <div class="stat-label">คะแนนเฉลี่ย (/100)</div>
    </div>
    <div class="stat-box">
      <div class="stat-val" style="color: #059669;">${maxScore}</div>
      <div class="stat-label">คะแนนสูงสุด</div>
    </div>
    <div class="stat-box">
      <div class="stat-val" style="color: #d97706;">${minScore}</div>
      <div class="stat-label">คะแนนต่ำสุด</div>
    </div>
  </div>

  <h3 style="font-size: 14px; margin: 16px 0 8px 0; color: #1e293b;">รายชื่อและคะแนนผลสอบนักเรียน</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 40px;">ที่</th>
        <th style="width: 50px;">เลขที่</th>
        <th style="width: 60px;">ห้อง</th>
        <th style="text-align: left;">ชื่อ-นามสกุล</th>
        <th style="width: 110px;">คะแนน (/100)</th>
        <th style="width: 90px;">ตอบถูก (/50)</th>
        <th style="width: 70px;">ร้อยละ</th>
        <th style="width: 90px;">ผลการสอบ</th>
        <th style="width: 120px;">วันที่สอบ</th>
      </tr>
    </thead>
    <tbody>
      ${studentRows}
    </tbody>
  </table>

  ${skillRows ? `
  <div style="margin-top: 20px; page-break-inside: avoid;">
    <h3 style="font-size: 14px; margin: 0 0 8px 0; color: #1e293b;">สรุปผลสัมฤทธิ์ตามรายทักษะ (Skill Breakdown)</h3>
    <table style="width: 450px;">
      <thead>
        <tr>
          <th style="text-align: left;">หัวข้อทักษะ</th>
          <th style="width: 120px;">ข้อที่ถูก / ทั้งหมด</th>
          <th style="width: 80px;">ร้อยละ</th>
        </tr>
      </thead>
      <tbody>
        ${skillRows}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="signature-section">
    <div class="sig-box">
      <div style="height: 50px;"></div>
      <div>ลงชื่อ..........................................................</div>
      <div style="font-weight: 600; margin-top: 4px;">(..........................................................)</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">ครูผู้สอน / กรรมการคุมสอบ</div>
    </div>
    <div class="sig-box">
      <div style="height: 50px;"></div>
      <div>ลงชื่อ..........................................................</div>
      <div style="font-weight: 600; margin-top: 4px;">(..........................................................)</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">หัวหน้ากลุ่มสาระการเรียนรู้ / ฝ่ายวิชาการ</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('เบราว์เซอร์บล็อกหน้าต่าง Pop-up กรุณาอนุญาต Pop-up เพื่อพิมพ์หรือบันทึก PDF');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const schoolStudents = useMemo(() => {
    if (loadedRosterContext !== rosterContext) return [];
    const raw = students.filter(s => s.role !== 'teacher' && !s.isDemo);
    const targetCode = (displaySchool.code || 'BNS01').toUpperCase();
    const targetId = displaySchool.id || '';
    return raw.filter(s => {
      if (s.school_id) return s.school_id === targetId;
      const sCode = (s.school_code || '').toUpperCase();
      if (sCode) return sCode === targetCode;
      return targetCode === 'BNS01';
    });
  }, [students, displaySchool, loadedRosterContext, rosterContext]);

  const schoolExamResults = useMemo(() => {
    const schoolStudentIds = new Set(schoolStudents.map(s => s.id));
    const targetCode = (displaySchool.code || 'BNS01').toUpperCase();
    return examResults.filter(r => {
      if (schoolStudentIds.has(r.id)) return true;
      const rCode = (r.school_code || r.school_id || '').toUpperCase();
      if (rCode) return rCode === targetCode;
      return targetCode === 'BNS01';
    });
  }, [examResults, schoolStudents, displaySchool]);

  const uniqueClasses = [...new Set(schoolStudents.map(s => s.class))].filter(Boolean).sort();
  
  const filteredStudents = selectedClass === 'all' 
    ? schoolStudents 
    : schoolStudents.filter(s => s.class === selectedClass);

  const filteredExamResults = useMemo(() => {
    if (selectedClass === 'all') return schoolExamResults;
    return schoolExamResults.filter(r => r.class === selectedClass);
  }, [schoolExamResults, selectedClass]);

  const preTestAvg = getClassPreTestAverage(filteredStudents);
  const currentAvg = getClassCurrentAverage(filteredStudents);

  const executeReset = async () => {
    if (!canManageRoster) return showToast('⛔ บัญชีครูไม่มีสิทธิ์ลบรายชื่อนักเรียน');
    if (resetTargetClass === 'all') {
      await deleteAllStaffStudents(displaySchool.id);
      setStudents([]);
      if (showToast) showToast('🗑️ ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว');
    } else {
      await deleteStaffStudentsByClass(displaySchool.id, resetTargetClass);
      setStudents(prev => prev.filter(s => s.class !== resetTargetClass));
      if (showToast) showToast(`🗑️ ล้างข้อมูลชั้น ${resetTargetClass} เรียบร้อยแล้ว`);
    }
    setShowResetModal(false);
    setResetTargetClass('all');
  };

  const handleReset = () => {
    if (!canManageRoster) return showToast('⛔ บัญชีครูไม่มีสิทธิ์ลบรายชื่อนักเรียน');
    setShowResetModal(true);
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!canManageRoster) return showToast('⛔ บัญชีครูไม่มีสิทธิ์เพิ่มนักเรียน');
    if (!addForm.name || !addForm.class || !addForm.number) {
      if (showToast) showToast('⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    
    let className = addForm.class.trim();
    if (!className.startsWith('ป.')) {
      className = 'ป.' + className;
    }

    try {
      if (showToast) showToast('กำลังเพิ่มข้อมูล...');
      await createStaffStudent(displaySchool.id, {
        name: addForm.name.trim(),
        class: className,
        number: addForm.number.toString(),
        role: 'student',
        school_code: displaySchool.code || 'BNS01',
        school_id: displaySchool.id || 'sch_bns_01',
        school_name: displaySchool.name || 'โรงเรียนบ้านนาสาร'
      });
      if (showToast) showToast('✅ เพิ่มข้อมูลสำเร็จ');
      setShowAddModal(false);
      setAddForm({ name: '', class: '', number: '' });
      refresh();
    } catch (error) {
      if (showToast) showToast('❌ เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    }
  };

  const processParsedData = (parsedStudents) => {
    const valid = [];
    const duplicates = [];
    const seenNames = new Set();
    
    // Check against existing students in this school
    const existingNames = new Set(schoolStudents.map(s => s.name.trim().toLowerCase()));

    for (const student of parsedStudents) {
      const nameKey = student.name.trim().toLowerCase();
      
      if (seenNames.has(nameKey) || existingNames.has(nameKey)) {
        duplicates.push(student);
      } else {
        seenNames.add(nameKey);
        valid.push(student);
      }
    }
    
    setPreviewData(valid);
    setDuplicateData(duplicates);
    setShowPreviewModal(true);
  };

  const handleConfirmImport = async () => {
    if (!canManageRoster) return showToast('⛔ บัญชีครูไม่มีสิทธิ์นำเข้านักเรียน');
    try {
      if (showToast) showToast(`กำลังบันทึกข้อมูล ${previewData.length} รายการ...`);
      for (const student of previewData) {
        await createStaffStudent(displaySchool.id, {
          ...student,
          school_code: displaySchool.code || student.school_code || 'BNS01',
          school_id: displaySchool.id || student.school_id || 'sch_bns_01',
          school_name: displaySchool.name || student.school_name || 'โรงเรียนบ้านนาสาร'
        });
      }
      if (showToast) showToast(`✅ บันทึกข้อมูลสำเร็จ ${previewData.length} รายการ`);
      setShowPreviewModal(false);
      setPreviewData([]);
      setDuplicateData([]);
      refresh();
    } catch (e) {
      console.error(e);
      if (showToast) showToast('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleImportFromSheetSubmit = async (e) => {
    e.preventDefault();
    if (!canManageRoster) return showToast('⛔ บัญชีครูไม่มีสิทธิ์นำเข้านักเรียน');
    if (!sheetUrl) return;

    try {
      if (showToast) showToast('กำลังดึงข้อมูลจาก Google Sheets...');
      
      // Extract ID from URL
      const match = sheetUrl.match(/\/d\/(.*?)\//);
      if (!match) {
        if (showToast) showToast('❌ ลิงก์ไม่ถูกต้อง กรุณาตรวจสอบลิงก์ Google Sheets');
        return;
      }
      
      const sheetId = match[1];
      let exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      // Extract gid if exists
      const gidMatch = sheetUrl.match(/[#&]gid=([0-9]+)/);
      if (gidMatch) {
        exportUrl += `&gid=${gidMatch[1]}`;
      }

      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const csvText = await response.text();
      const parsedStudents = await parseCSVData(csvText);
      
      setShowSheetModal(false);
      setSheetUrl('');
      processParsedData(parsedStudents);
      
    } catch (error) {
      console.error("Sheet import error:", error);
      if (showToast) showToast('❌ ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบว่าตั้งค่า "แชร์ให้ทุกคนที่มีลิงก์" แล้ว');
    }
  };

  const handleImportCSV = (e) => {
    if (!canManageRoster) return showToast('⛔ บัญชีครูไม่มีสิทธิ์นำเข้านักเรียน');
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      const parsedStudents = await parseCSVData(csvText);
      processParsedData(parsedStudents);
      e.target.value = null; // Reset input
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!canManageRoster) return showToast('⛔ บัญชีครูไม่มีสิทธิ์ลบนักเรียน');
    if (window.confirm(`⚠️ คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ "${studentName}"?\n(การกระทำนี้ไม่สามารถย้อนกลับได้)`)) {
      await deleteStaffStudent(displaySchool.id, studentId);
      refresh();
    }
  };

  const handleEditStudent = async (student) => {
    const newName = window.prompt(`แก้ไขชื่อนักเรียน:\n(ชื่อเดิม: ${student.name})`, student.name);
    if (!newName || newName.trim() === '' || newName === student.name) return;
    
    await renameStaffStudent(displaySchool.id, student.id, newName.trim());
    refresh();
  };

  // Online IDs from on-demand check (not from heartbeat)
  const onlineStudentIds = new Set(
    (onlineStatus || []).filter(s => s.isOnline).map(s => s.id)
  );

  const profileStudents = filterStudent360Roster(filteredStudents, QUESTS, { query: studentQuery, skill: profileSkill, evidence: profileEvidence });
  const studentsWithStats = profileStudents.map(s => {
    const p = s.questProgress || {};
    const questEntries = Object.entries(p).filter(([k]) => k !== 'finalboss');
    const avgPct = getStudentCurrentPercent(s) ?? 0;
    const totalStars = questEntries.reduce((acc, [, v]) => acc + (v.stars ? v.stars.reduce((a,b)=>a+b,0) : 0), 0);
    const missionsPassed = questEntries.filter(([, v]) => v.passed).length;
    const mistakesCount = Object.keys(s.mistakeBank || {}).length;
    const badgeCount = (s.badges || []).length;
    const isOnline = onlineStudentIds.has(s.id);

    return { ...s, avgPct, totalStars, missionsPassed, mistakesCount, badgeCount, isOnline };
  });

  const sortedStudents = [...studentsWithStats].sort((a, b) => {
    let va = a[sortField] ?? '';
    let vb = b[sortField] ?? '';
    
    if (sortField === 'isOnline') {
      va = va ? 1 : 0;
      vb = vb ? 1 : 0;
      return sortDir === 'asc' ? vb - va : va - vb; // 'asc' shows online first (1 > 0)
    }
    
    if (['number', 'xp', 'level', 'avgPct', 'totalStars', 'missionsPassed', 'mistakesCount', 'badgeCount'].includes(sortField)) {
      va = Number(va) || 0;
      vb = Number(vb) || 0;
      return sortDir === 'asc' ? va - vb : vb - va;
    }
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb, 'th') : vb.localeCompare(va, 'th');
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  const itemsPerPage = rowsPerPage === 'all' ? sortedStudents.length : parseInt(rowsPerPage);
  const totalPages = Math.ceil(sortedStudents.length / (itemsPerPage || 1));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + itemsPerPage);


  const handleCheckOnline = async () => {
    setOnlineLoading(true);
    try {
      const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const schoolResult = schoolStudents.map(s => ({
        id: s.id, name: s.name, class: s.class, number: s.number,
        lastActive: s.lastActive || null,
        isOnline: Boolean(s.lastActive && s.lastActive >= cutoff),
      }));
      const filtered = selectedClass === 'all'
        ? schoolResult
        : schoolResult.filter(s => s.class === selectedClass);
      setOnlineStatus(filtered);
      setOnlineCheckedAt(new Date());
      setShowOnlineList(true);
    } catch (e) {
      console.error('Online status fetch failed', e);
    } finally {
      setOnlineLoading(false);
    }
  };

  const onlineCount = onlineStatus ? onlineStatus.filter(s => s.isOnline).length : null;
  const onlineStudents = onlineStatus ? onlineStatus.filter(s => s.isOnline) : [];
  const totalStudents = filteredStudents.length;

  const riskStudents = getRiskStudents(filteredStudents);
  const atRiskCount = riskStudents.length;
  const openStudentReport = (studentId, tab = 'overview') => {
    const target = filteredStudents.find(student => student.id === studentId);
    if (target) { setDrilldownTab(tab); setSelectedStudentForDrilldown(target); }
  };
  const openWeakQuestStudents = (quest) => {
    const matchingStudents = filteredStudents.filter(student => {
      const result = student.questProgress?.[quest.id] || student.arenaStats?.[quest.id];
      const score = result?.pct ?? result?.percent;
      return score !== null && score !== undefined && Number.isFinite(Number(score)) && Number(score) < 70;
    });
    if (matchingStudents.length === 1) openStudentReport(matchingStudents[0].id, 'errors');
    else setSelectedWeakQuest({ ...quest, students: matchingStudents });
  };

  const MENU_ITEMS = [
    ...(canManageSchoolStudents(currentTeacher, displaySchool.id) ? [{ id:'student_management', label:'จัดการนักเรียนและชั้นเรียน', desc:'รายชื่อ นำเข้า PIN และที่นั่ง', icon:'👥' }] : []),
    { id: 'overview', label: 'ภาพรวมห้องเรียน', icon: '📊', desc: 'สถิติรวม & ชาร์ตสรุป' },
    { id: 'table', label: 'รายชื่อนักเรียน', icon: '👥', desc: 'ตาราง & จัดการข้อมูล' },
    { id: 'skills', label: 'วิเคราะห์ทักษะ', icon: '🎯', desc: 'Skill Breakdown 30 วิชา' },
    { id: 'final_exam', label: 'สอบปลายภาค', icon: '🎓', desc: 'เปิด/ปิดสอบ & รายงานผล', badge: examSession?.isOpen ? 'เปิดสอบ' : null, badgeColor: 'bg-emerald-500 text-white' },
    { id: 'warning', label: 'Early Warning', icon: '⚠️', desc: 'แจ้งเตือนกลุ่มเสี่ยง', badge: atRiskCount > 0 ? `${atRiskCount}` : null, badgeColor: 'bg-rose-500 text-white' },
    { id: 'ranking', label: 'สรุปอันดับ', icon: '🏆', desc: 'Leaderboard & Tiers' },
    { id: 'year_simulations', label: 'จำลองข้อสอบ 64–68', icon: '📝', desc: 'สถิติและคะแนนสอบจำลอง 5 ปี (2564–2568)' },
    { id: 'arena', label: 'O-NET Arena', icon: '🏟️', desc: 'ผลการฝึกซ้อม Mock Exams & Arena' },
    { id: 'strategy', label: 'วิเคราะห์กลยุทธ์', icon: '🧠', desc: 'กลยุทธ์การทำข้อสอบ' },
    { id: 'practice_review', label: 'ตรวจชุดฝึก AI', icon: '🛡️', desc: 'อนุมัติก่อนส่งให้นักเรียน' },
    { id: 'vocabulary_report', label: 'ติดตามคำศัพท์', icon: '📖', desc: 'ตอบเอง / ใช้ตัวช่วย / ควรทบทวน' },
  ];

  const currentTabObj = MENU_ITEMS.find(m => m.id === activeTab) || MENU_ITEMS[0];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100 teacher-dark' : 'bg-slate-100 text-slate-800 teacher-light'} flex flex-col lg:flex-row relative z-20 transition-colors duration-300`}>
      {/* ── Desktop Sidebar ───────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900 border-r border-slate-800 shrink-0 sticky top-0 h-screen justify-between p-4 select-none z-30 overflow-y-auto">
        <div className="space-y-6">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
              <UIIcon value={"👩‍🏫"} />
            </div>
            <div>
              <h1 className="font-black text-white text-base leading-tight">Teacher Hub</h1>
              <p className="text-[11px] text-slate-400">English Quest AI ป.6</p>
            </div>
          </div>

          {/* School Badge & Super Admin Controls */}
          {isSuperAdmin ? (
            <>
              {activeSchool && (
                <div className="bg-sky-500/10 border border-sky-500/25 rounded-xl p-2.5 text-xs flex items-center justify-between">
                  <div className="truncate pr-1">
                    <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">กำลังดูโรงเรียน:</div>
                    <div className="font-bold text-white truncate text-xs">{activeSchool.name}</div>
                  </div>
                  <button
                    onClick={() => { setActiveSchoolContext(null); setActiveSchool(null); navigate('super-admin'); }}
                    className="text-[10px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold px-2 py-1 rounded-lg transition-all shrink-0 cursor-pointer"
                    title="กลับหน้า Super Admin เพื่อสลับโรงเรียน"
                  >
                    สลับ
                  </button>
                </div>
              )}

              {/* Link to Super Admin Hub */}
              <button
                onClick={() => navigate('super-admin')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-left shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span><UIIcon value={"👑"} /></span>
                  <span>Super Admin Hub</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">
                  ทุก รร.
                </span>
              </button>
            </>
          ) : null}

          {/* Link to School Admin Hub */}
          {(currentTeacher?.membership_role === 'school_admin' || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('student_management')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-all text-left shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span><UIIcon value={"🏫"} /></span>
                <span>School Admin Hub</span>
              </div>
              <span className="text-[10px] bg-sky-500/20 px-1.5 py-0.5 rounded text-sky-200">
                จัดการสิทธิ์
              </span>
            </button>
          )}

          {/* Nav items */}
          <TeacherSidebarNav items={MENU_ITEMS} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
          {/* Theme Selector */}
          <div className="flex items-center justify-between p-1 bg-slate-800/50 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium pl-2">ธีม:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setTheme('dark'); localStorage.setItem('teacher_theme', 'dark'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="โหมดมืด"
              >
                <UIIcon value={"🌙"} /> มืด
              </button>
              <button
                onClick={() => { setTheme('light'); localStorage.setItem('teacher_theme', 'light'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  theme === 'light'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="โหมดขาว"
              >
                <UIIcon value={"☀️"} /> ขาว
              </button>
            </div>
          </div>

          <button
            onClick={() => { handleCheckOnline(); setShowOnlineList(true); }}
            className="w-full bg-slate-800/50 hover:bg-slate-800 rounded-xl p-2.5 border border-slate-800 text-xs flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${onlineCount ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-slate-300">เด็กออนไลน์:</span>
            </div>
            <span className="font-black text-emerald-400 font-mono">
              {onlineCount !== null ? `${onlineCount}/${totalStudents}` : 'เช็คสถานะ'}
            </span>
          </button>

          <button
            onClick={() => handleLogout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all"
          >
            <span><UIIcon value={"🚪"} /></span> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer (Hamburger Menu) ────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 bg-slate-900 border-r border-slate-800 h-full p-4 flex flex-col justify-between shadow-2xl z-10 animate-slide-right select-none">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
                    <UIIcon value={"👩‍🏫"} />
                  </div>
                  <div>
                    <h1 className="font-black text-white text-base leading-tight">Teacher Hub</h1>
                    <p className="text-[11px] text-slate-400">English Quest AI ป.6</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <UIIcon value={"✕"} />
                </button>
              </div>

              {/* Mobile Drawer School Badge */}
              {isSuperAdmin ? (
                activeSchool && (
                  <div className="bg-sky-500/10 border border-sky-500/25 rounded-xl p-2.5 text-xs flex items-center justify-between">
                    <div className="truncate pr-1">
                      <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">กำลังดูโรงเรียน:</div>
                      <div className="font-bold text-white truncate text-xs">{activeSchool.name}</div>
                    </div>
                    <button
                      onClick={() => { setActiveSchoolContext(null); setActiveSchool(null); setSidebarOpen(false); navigate('super-admin'); }}
                      className="text-[10px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold px-2 py-1 rounded-lg transition-all shrink-0 cursor-pointer"
                    >
                      สลับ
                    </button>
                  </div>
                )
              ) : null}

              {/* Mobile Link to School Admin Hub */}
              {(currentTeacher?.membership_role === 'school_admin' || isSuperAdmin) && (
                <button
                  onClick={() => { setSidebarOpen(false); setActiveTab('student_management'); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-all text-left shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span><UIIcon value={"🏫"} /></span>
                    <span>School Admin Hub</span>
                  </div>
                  <span className="text-[10px] bg-sky-500/20 px-1.5 py-0.5 rounded text-sky-200">
                    จัดการสิทธิ์
                  </span>
                </button>
              )}

              <TeacherSidebarNav items={MENU_ITEMS} activeTab={activeTab} onChange={id => { setActiveTab(id); setSidebarOpen(false); }} />
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-800">
              {/* Theme Selector in Mobile Drawer */}
              <div className="flex items-center justify-between p-1 bg-slate-800/50 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium pl-2">ธีม:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setTheme('dark'); localStorage.setItem('teacher_theme', 'dark'); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      theme === 'dark'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UIIcon value={"🌙"} /> มืด
                  </button>
                  <button
                    onClick={() => { setTheme('light'); localStorage.setItem('teacher_theme', 'light'); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      theme === 'light'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UIIcon value={"☀️"} /> ขาว
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleLogout()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all"
              >
                <span><UIIcon value={"🚪"} /></span> ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 px-4 py-4 backdrop-blur-md md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300 lg:hidden" title="เปิดเมนู" aria-label="เปิดเมนู"><Menu size={20} /></button>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white">{currentTabObj.label}</h2>
                <p className="mt-1 break-words text-xs text-slate-400">{displaySchool.name} <span className="ml-1 font-mono text-slate-500">· {displaySchool.code}</span></p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={`hidden text-[11px] sm:inline ${loadError ? 'text-rose-400' : 'text-slate-500'}`} role="status">
                {loadError ? 'อัปเดตล่าสุดไม่สำเร็จ' : lastUpdatedAt ? `อัปเดต ${lastUpdatedAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}` : 'กำลังอัปเดต'}
              </span>
              <button onClick={() => refresh({ reportError: true }).catch(() => {})} disabled={loading} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50" title="รีเฟรชข้อมูลล่าสุด" aria-label="รีเฟรชข้อมูลล่าสุด"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /></button>
            </div>
          </div>
          <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-slate-950 p-1" role="group" aria-label="เลือกห้องเรียน">
              {[{ value: 'all', label: 'ทุกห้อง' }, ...uniqueClasses.map(c => ({ value: c, label: c }))].map(option => (
                <button key={option.value} aria-pressed={selectedClass === option.value} onClick={() => { setSelectedClass(option.value); setCurrentPage(1); setOnlineStatus(null); }} className={`min-h-9 shrink-0 whitespace-nowrap rounded-md px-3 text-xs font-semibold transition-colors ${selectedClass === option.value ? 'bg-sky-700 text-white' : 'text-slate-400 hover:text-white'}`}>{option.label}</button>
              ))}
            </div>
            <button onClick={handleCheckOnline} disabled={onlineLoading} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50">
              <span className={`h-2 w-2 rounded-full ${onlineCount ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              {onlineLoading ? 'กำลังตรวจสอบ...' : onlineCount === null ? 'ตรวจสอบออนไลน์' : `ออนไลน์ ${onlineCount}/${totalStudents}`}
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'student_management' && canManageSchoolStudents(currentTeacher, displaySchool.id) && <SchoolAdminDashboard key={displaySchool.id} embedded schoolContext={displaySchool} onChanged={() => refresh({silent:true}).catch(()=>{})} />}
          {activeTab === 'practice_review' && <TeacherPracticeReview schoolId={displaySchool.id} showToast={showToast} />}
          {activeTab === 'vocabulary_report' && <TeacherVocabularyReport key={displaySchool.id} schoolId={displaySchool.id} students={filteredStudents} />}
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

        {loading ? <div className="py-12 text-center text-sm text-slate-400" role="status">กำลังโหลดผลการเรียน...</div> : <TeacherOverview
          students={filteredStudents}
          preTestAvg={preTestAvg}
          currentAvg={currentAvg}
          riskStudents={riskStudents}
          Chart={DonutChart}
          onWarning={() => setActiveTab('warning')}
          onExam={() => setActiveTab('final_exam')}
          onStudent={(studentId) => studentId ? openStudentReport(studentId) : setActiveTab('table')}
          onWeakQuest={openWeakQuestStudents}
        />}

        {/* ── Chapter Progress Section ─────────────────────────────────────── */}
        {filteredStudents.length > 0 && (() => {
          // Quest IDs grouped by chapter
          const CHAPTER_DEFS = TEACHER_CHAPTERS;

          const chapterStats = CHAPTER_DEFS.map(ch => {
            let passed = 0, total = 0;
            if (ch.useArena) {
              filteredStudents.forEach(s => {
                const aStats = s.arenaStats || {};
                ch.arenaMocks.forEach(mk => {
                  total++;
                  if ((aStats[mk]?.percent || 0) >= 70) passed++;
                });
              });
            } else {
              filteredStudents.forEach(s => {
                ch.quests.forEach(q => {
                  const qd = (s.questProgress || {})[q];
                  total++;
                  if (qd?.passed || qd?.pct >= 70) passed++;
                });
              });
            }
            const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
            return { ...ch, passed, total, pct };
          }).filter(ch => ch.total > 0);

          // Class comparison data (scoped to current school)
          const classes = [...new Set(schoolStudents.map(s => s.class))].filter(Boolean).sort();
          const classCompData = classes.map(cls => {
            const clsStudents = schoolStudents.filter(s => s.class === cls);
            return {
              cls,
              chapters: CHAPTER_DEFS.map(ch => {
                let passed = 0, total = 0;
                if (ch.useArena) {
                  clsStudents.forEach(s => {
                    ch.arenaMocks.forEach(mk => {
                      total++;
                      if (((s.arenaStats || {})[mk]?.percent || 0) >= 70) passed++;
                    });
                  });
                } else {
                  clsStudents.forEach(s => {
                    ch.quests.forEach(q => {
                      const qd = (s.questProgress || {})[q];
                      total++;
                      if (qd?.passed || qd?.pct >= 70) passed++;
                    });
                  });
                }
                return { ch: ch.ch, icon: ch.icon, label: ch.label, color: ch.color, pct: total > 0 ? Math.round((passed / total) * 100) : 0, passed, total };
              }).filter(c => c.total > 0),
            };
          });

          const grandPassed2 = chapterStats.reduce((a, c) => a + c.passed, 0);
          const grandTotal2 = chapterStats.reduce((a, c) => a + c.total, 0);
          const grandPct2 = grandTotal2 > 0 ? Math.round((grandPassed2 / grandTotal2) * 100) : 0;

          return (
            <div className="border-t border-slate-700 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h3 className="font-bold text-indigo-300 flex items-center gap-2 text-base">
                  <span><UIIcon value={"📈"} /></span> ความคืบหน้าแต่ละ Chapter
                </h3>
                {classes.length > 1 && (
                  <button
                    onClick={() => setShowClassComparison(v => !v)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl border font-bold transition-all ${
                      showClassComparison
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/50'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <UIIconText value={showClassComparison ? '📊 ซ่อนเปรียบเทียบ' : '🏫 เปรียบเทียบห้อง'} />
                  </button>
                )}
              </div>

              {showClassComparison && classes.length > 1 ? (
                <div className="space-y-5">
                  {CHAPTER_DEFS.map(ch => (
                    <div key={ch.ch}>
                      <div className="flex items-center gap-2 mb-2">
                        <span><UIIcon value={ch.icon} /></span>
                        <span className="text-sm font-bold text-slate-200">{ch.label}</span>
                      </div>
                      <div className="space-y-1.5">
                        {classCompData.map(({ cls, chapters }) => {
                          const c = chapters.find(x => x.ch === ch.ch);
                          if (!c) return (
                            <div key={cls} className="flex items-center gap-3 opacity-30">
                              <div className="w-14 text-xs font-bold text-slate-500 shrink-0">{cls}</div>
                              <div className="flex-1 h-1.5 rounded-full bg-slate-800 border border-white/5" />
                              <div className="w-10 text-xs text-slate-500 text-right">—</div>
                            </div>
                          );
                          return (
                            <div key={cls} className="flex items-center gap-3">
                              <div className="w-14 text-xs font-bold text-slate-300 shrink-0">{cls}</div>
                              <div className="flex-1 h-2 rounded-full bg-slate-800 border border-white/5 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${c.pct}%`, backgroundColor: ch.color, boxShadow: `0 0 6px ${ch.color}55` }}
                                />
                              </div>
                              <div className="w-10 text-xs font-black text-right shrink-0"
                                style={{ color: c.pct >= 80 ? '#10b981' : c.pct >= 60 ? '#f59e0b' : c.pct >= 40 ? '#fb923c' : '#ef4444' }}>
                                {c.pct}%
                              </div>
                              <div className="w-14 text-xs text-slate-400 font-mono shrink-0">{c.passed}/{c.total}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {chapterStats.map(ch => (
                    <div key={ch.ch}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base"><UIIcon value={ch.icon} /></span>
                          <span className="text-sm font-semibold text-slate-200">{ch.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-400">{ch.passed}/{ch.total} ด่าน</span>
                          <span className="font-black w-10 text-right" style={{ color: ch.pct >= 80 ? '#10b981' : ch.pct >= 60 ? '#f59e0b' : ch.pct >= 40 ? '#fb923c' : '#ef4444' }}>
                            {ch.pct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 border border-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${ch.pct}%`, backgroundColor: ch.color, boxShadow: `0 0 8px ${ch.color}66` }} />
                      </div>
                    </div>
                  ))}

                  {/* Grand Total */}
                  <div className="pt-3 mt-2 border-t border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base"><UIIcon value={"🏆"} /></span>
                        <span className="text-sm font-bold text-white">รวมทั้งหมด</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-300 font-medium">{grandPassed2}/{grandTotal2} ด่าน</span>
                        <span className="font-black w-10 text-right" style={{ color: grandPct2 >= 80 ? '#10b981' : grandPct2 >= 60 ? '#f59e0b' : grandPct2 >= 40 ? '#fb923c' : '#ef4444' }}>
                          {grandPct2}%
                        </span>
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-slate-800 border border-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${grandPct2}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7, #3b82f6)', boxShadow: '0 0 10px #6366f188' }} />
                    </div>
                    <div className="text-center text-xs text-slate-400 mt-1.5">คิดจากทุกด่านที่มีในระบบ × {filteredStudents.length} คน</div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
            </div>
          )}

        {/* ── Tab: Skill Breakdown ─────────────────────────────────── */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            {filteredStudents.length > 0 && (() => {
              // Collect all quest scores across all students
              const SKIP_QUESTS_SK = new Set(['finalboss', 'strategy_boss']);
              const skillMap = {}; // questId -> { total, count }
              filteredStudents.forEach(s => {
                Object.entries(s.questProgress || {}).forEach(([q, v]) => {
                  if (SKIP_QUESTS_SK.has(q)) return;
                  if (!skillMap[q]) skillMap[q] = { total: 0, count: 0 };
                  skillMap[q].total += (v.pct || 0);
                  skillMap[q].count++;
                });
              });
              const skills = Object.entries(skillMap)
                .map(([q, { total, count }]) => ({
                  id: q,
                  label: formatQuestLabel(q),
                  avg: Math.round(total / count),
                  count,
                }))
                .filter(s => s.count >= Math.ceil(filteredStudents.length * 0.1)) // show only quests played by ≥10% of class
                .sort((a, b) => a.avg - b.avg); // weakest first

              if (skills.length === 0) {
                return (
                  <div className="glass-card-dark p-8 text-center text-slate-400">
                    <div className="text-3xl mb-2"><UIIcon value={"🎯"} /></div>
                    <p>ยังไม่มีข้อมูลคะแนนรายวิชาของนักเรียนในห้องนี้</p>
                  </div>
                );
              }

              return (
                <div className="glass-card-dark p-6 mb-5 border border-rose-500/25 shadow-xl">
                  <h3 className="font-bold text-rose-300 mb-4 flex items-center gap-2 text-base">
                    <span><UIIcon value={"🎯"} /></span> Skill Breakdown — คะแนนเฉลี่ยรายวิชา (เรียงจากอ่อนสุด)
                    <span className="text-slate-400 text-xs font-normal">เฉลี่ย class</span>
                  </h3>
                  <div className="space-y-2.5">
                    {skills.map((sk, i) => (
                      <button key={sk.id} type="button" onClick={() => openWeakQuestStudents({ id: sk.id, name: sk.label })} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left hover:bg-slate-800/70" aria-label={`ดูผู้เรียนใน ${sk.label}`}>
                        <div className="w-5 text-xs text-slate-500 shrink-0 text-right">{i + 1}</div>
                        <div className="w-52 text-xs text-slate-200 font-medium shrink-0 truncate" title={sk.label}>{sk.label}</div>
                        <div className="flex-1 h-2 rounded-full bg-slate-800 border border-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${sk.avg}%`,
                              backgroundColor: sk.avg >= 80 ? '#10b981' : sk.avg >= 70 ? '#3b82f6' : sk.avg >= 50 ? '#f59e0b' : '#ef4444',
                              boxShadow: sk.avg < 50 ? '0 0 6px #ef444466' : 'none',
                            }}
                          />
                        </div>
                        <div
                          className="w-10 text-xs font-black text-right shrink-0"
                          style={{ color: sk.avg >= 80 ? '#10b981' : sk.avg >= 70 ? '#3b82f6' : sk.avg >= 50 ? '#f59e0b' : '#ef4444' }}
                        >
                          {sk.avg}%
                        </div>
                        <div className="w-12 text-xs text-slate-400 font-mono shrink-0">{sk.count}คน</div>
                        <ArrowRight size={14} className="shrink-0 text-sky-400" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab: Early Warning */}
        {activeTab === 'warning' && (() => {
          const today = Date.now();
          const atRiskStudents = riskStudents;
          const highRiskCount = atRiskStudents.filter(student => student.severity === 'high').length;
          const monitorCount = atRiskStudents.length - highRiskCount;
          const insufficientDataCount = filteredStudents.filter(student => !hasRiskEvidence(student)).length;
          const normalCount = Math.max(0, filteredStudents.length - atRiskStudents.length - insufficientDataCount);
          const inactiveOnly = [];

          return (
            <div className="space-y-4">
              {/* Summary Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-sm text-slate-300">ประเมินด้วยกฎจากคะแนน กิจกรรม ข้อผิดซ้ำ และการเข้าใช้งาน</p><p className="mt-1 text-xs text-slate-500">อัปเดตล่าสุด {new Date(today).toLocaleString('th-TH')} · ไม่ใช่ผลวิเคราะห์จาก AI</p></div>
                <button disabled={!atRiskStudents.length} onClick={() => exportRiskStudents(atRiskStudents)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-600 px-3 text-sm font-semibold text-slate-200 disabled:opacity-40"><Download size={16} />ส่งออกรายชื่อ</button>
              </div>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className="glass-card-dark p-4 text-center border border-rose-500/30 shadow-xl shadow-rose-950/20 hover:border-rose-500/50 transition-all">
                  <div className="text-3xl font-black text-rose-400">{highRiskCount}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">เสี่ยงสูง</div>
                </div>
                <div className="glass-card-dark p-4 text-center border border-amber-500/30 shadow-xl shadow-amber-950/20 hover:border-amber-500/50 transition-all">
                  <div className="text-3xl font-black text-amber-400">{monitorCount}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">ควรติดตาม</div>
                </div>
                <div className="glass-card-dark p-4 text-center border border-emerald-500/30 shadow-xl shadow-emerald-950/20 hover:border-emerald-500/50 transition-all">
                  <div className="text-3xl font-black text-emerald-400">{normalCount}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">ปกติ</div>
                </div>
                <div className="glass-card-dark p-4 text-center border border-slate-600 shadow-xl transition-all">
                  <div className="text-3xl font-black text-slate-300">{insufficientDataCount}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">ข้อมูลไม่เพียงพอ</div>
                </div>
              </div>

              {/* At-Risk List */}
              <div className="glass-card-dark p-6 border border-rose-500/25 shadow-xl">
                <h3 className="text-lg font-bold text-rose-300 mb-4 flex items-center gap-2">
                  <span><UIIcon value={"🔴"} /></span> นักเรียนที่ต้องให้ความสนใจ ({atRiskStudents.length} คน)
                </h3>
                {atRiskStudents.length === 0 ? (
                  <div className="text-center py-8 text-emerald-400">
                    <div className="text-4xl mb-2"><UIIcon value={"✅"} /></div>
                    <div className="font-bold">ยังไม่พบสัญญาณเสี่ยงในผู้เรียนที่มีข้อมูลเพียงพอ</div>
                    {insufficientDataCount > 0 && <div className="mt-2 text-xs text-slate-400">มี {insufficientDataCount} คนที่ยังประเมินไม่ได้</div>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {atRiskStudents.map(s => (
                      <div key={s.id} className="flex items-start gap-3 bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 hover:border-rose-500/50 transition-colors shadow-lg">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm">{s.name} <span className="text-slate-400 font-normal">ชั้น {s.class} · เลขที่ {s.number}</span></div>
                          <p className={`mt-1 text-xs font-semibold ${s.severity === 'high' ? 'text-rose-400' : s.severity === 'medium' ? 'text-amber-400' : 'text-sky-400'}`}>{s.severity === 'high' ? 'ความเสี่ยงสูง' : s.severity === 'medium' ? 'ควรติดตาม' : 'เฝ้าดู'}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {s.reasons.map((r, i) => (
                              <span key={i} className="text-[11px] bg-rose-500/20 text-rose-200 border border-rose-500/40 px-2.5 py-0.5 rounded-full font-medium shadow-sm">{r}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-slate-400 text-xs">คะแนนเฉลี่ย</div>
                          <div className={`font-black text-base ${s.avgScore >= 70 ? 'text-emerald-400' : s.avgScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{s.avgScore === null ? '—' : `${s.avgScore}%`}</div>
                          <button onClick={() => openStudentReport(s.id, 'errors')} className="mt-2 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-sky-400">ดูข้อมูลรายบุคคล <ArrowRight size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inactive List */}
              {inactiveOnly.length > 0 && (
                <div className="glass-card-dark p-6 border border-amber-500/25 shadow-xl">
                  <h3 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                    <span><UIIcon value={"🟡"} /></span> ไม่ค่อย Active (แต่ยังไม่เสี่ยง)
                  </h3>
                  <div className="space-y-2">
                    {inactiveOnly.slice(0, 8).map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-amber-950/20 border border-amber-500/25 rounded-xl px-4 py-2.5 hover:border-amber-500/40 transition-colors">
                        <span className="text-white text-sm font-semibold">{s.name} <span className="text-slate-400 text-xs font-normal">ชั้น {s.class} · เลขที่ {s.number}</span></span>
                        <span className="text-amber-300 text-xs font-bold font-mono">ไม่ active {s.inactiveDays} วัน</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab: Table */}
        {activeTab === 'table' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-100">
              <label>ค้นหาชื่อ / เลขที่<input className="block max-w-full rounded border border-slate-600 bg-slate-800 p-2" value={studentQuery} onChange={event => { setStudentQuery(event.target.value); setCurrentPage(1); }} /></label>
              <label>ทักษะ<select aria-label="กรองทักษะ" className="block rounded border border-slate-600 bg-slate-800 p-2" value={profileSkill} onChange={event => { setProfileSkill(event.target.value); setCurrentPage(1); }}><option value="">ทุกทักษะที่มี mapping</option><option value="vocabulary">คำศัพท์</option><option value="reading">การอ่าน</option><option value="grammar">ไวยากรณ์</option></select></label>
              <label>หลักฐาน<select aria-label="กรองหลักฐานการฝึก" className="block rounded border border-slate-600 bg-slate-800 p-2" value={profileEvidence} onChange={event => { setProfileEvidence(event.target.value); setCurrentPage(1); }}><option value="all">ทั้งหมด</option><option value="available">มีคำตอบรายข้อที่จับคู่ได้</option><option value="insufficient">หลักฐานยังไม่พอ</option><option value="errors">พบคำตอบแรกผิด · ไม่ใช่วินิจฉัย</option></select></label>
              <p className="w-full text-slate-300">ตัวกรองนี้อ่านหลักฐาน Quest ในรายชื่อที่ระบบส่งคืน ไม่ใช้ XP ตัดสินทักษะ · การกรองสถานะงานยังรอข้อมูลสรุปฝั่งเซิร์ฟเวอร์</p>
            </div>
            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-xl">
              <div className="flex flex-wrap items-center gap-2">
                {canManageRoster && <>
                  <button onClick={() => setShowAddModal(true)} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"><UIIcon value={"➕"} /> เพิ่มนักเรียน</button>
                  <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-900/30 cursor-pointer transition-all active:scale-95"><UIIcon value={"📤"} /> Import CSV<input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} /></label>

                  <button onClick={() => setShowSheetModal(true)} className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-900/30 transition-all active:scale-95"><UIIcon value={"🔗"} /> Google Sheets</button>
                </>}
                <button
                  type="button"
                  onClick={() => {
                    downloadStudentImportTemplate();
                    showToast('📥 ดาวน์โหลดแบบฟอร์มเรียบร้อยแล้ว');
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/30 transition-all active:scale-95 cursor-pointer"
                  title="ดาวน์โหลดแบบฟอร์ม Excel / CSV ตัวอย่าง"
                >
                  <UIIcon value={"📥"} /> แบบฟอร์ม Excel
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-violet-900/30 transition-all active:scale-95"
                >
                  <UIIcon value={"📊"} /> Export รายงาน
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={refresh}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <UIIcon value={"🔄"} /> รีเฟรช
                </button>
                {canManageRoster && <button
                  onClick={handleReset}
                  className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold rounded-xl border border-rose-500/30 flex items-center gap-1 transition-all"
                >
                  <UIIcon value={"🗑️"} /> Reset Data
                </button>}
              </div>
            </div>

            <div className="glass-card-dark overflow-hidden shadow-2xl">
            {profileStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">ไม่มีนักเรียนที่ตรงตัวกรอง หรือยังไม่มีข้อมูลในห้องนี้</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-950/70">
                      <th className="px-3 py-3 text-left text-slate-400 font-bold text-xs">ลำดับ</th>
                      {[
                        { key: 'name', label: 'ชื่อ', align: 'left' },
                        { key: 'isOnline', label: 'ออนไลน์', align: 'center' },
                        { key: 'class', label: 'ชั้น', align: 'left' },
                        { key: 'number', label: 'เลขที่', align: 'left' },
                        { key: 'xp', label: 'XP', align: 'left' },
                        { key: 'level', label: 'Lv.', align: 'left' },
                        { key: 'totalStars', label: 'ดาว', align: 'center' },
                        { key: 'missionsPassed', label: 'ภารกิจ', align: 'center' },
                        { key: 'badgeCount', label: 'Badge', align: 'center' },
                        { key: 'mistakesCount', label: 'ข้อผิด', align: 'center' },
                        { key: 'avgPct', label: 'คะแนนรวม', align: 'left' },
                      ].map(col => (
                        <th
                          key={col.key}
                          className={`px-3 py-3 text-${col.align} text-slate-400 font-bold text-xs cursor-pointer hover:text-white transition-colors select-none`}
                          onClick={() => handleSort(col.key)}
                        >
                          <div className={`flex items-center gap-1 ${col.align === 'center' ? 'justify-center' : ''}`}>
                            {col.label} {sortField === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                          </div>
                        </th>
                      ))}
                      <th className="px-3 py-3 text-left text-slate-400 font-bold text-xs">จุดอ่อน</th>
                      <th className="px-3 py-3 text-center text-slate-400 font-bold text-xs">สิทธิ์คำแปล</th>
                      <th className="px-3 py-3 text-right text-slate-400 font-bold text-xs">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((s, i) => {
                      const p = s.questProgress || {};
                      const weakList = Object.entries(p)
                        .filter(([, v]) => v.attempts > 0 && v.pct < 60)
                        .map(([k]) => formatQuestLabel(k))
                        .join(', ');
                        
                      const perm = s.translatePermission || 'full';
                      const permBg = perm === 'full' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                        : perm === 'vocab_only' 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                          : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30';
                      const permText = perm === 'full' ? '🟢 แปลทั้งหมด' : perm === 'vocab_only' ? '🟡 เฉพาะศัพท์' : '🔴 ปิดแปล';

                      const handleTogglePermission = async () => {
                        const nextPerm = perm === 'full' ? 'vocab_only' : perm === 'vocab_only' ? 'off' : 'full';
                        await setStaffTranslatePermission(displaySchool.id, s.id, nextPerm);
                        setStudents(prev => prev.map(item => item.id === s.id ? { ...item, translatePermission: nextPerm } : item));
                        const labelStr = nextPerm === 'full' ? 'แปลทั้งหมด 🟢' : nextPerm === 'vocab_only' ? 'เฉพาะศัพท์ 🟡' : 'ปิดแปล 🔴';
                        if (showToast) showToast(`✏️ สิทธิ์คำแปลของ ${s.name}: ${labelStr}`);
                      };

                      return (
                        <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                          <td className="px-3 py-2.5 text-slate-500 font-mono text-xs">{startIndex + i + 1}</td>
                          <td className="px-3 py-2.5 text-white font-semibold">
                            <button
                              className="hover:text-blue-400 transition-colors text-left flex items-center gap-1"
                              onClick={() => openStudentReport(s.id)}
                              aria-label={`ดูข้อมูลรายบุคคล ${s.name}`}
                              title="ดูข้อมูลรายบุคคล / View Student Profile"
                            >
                              <span>{s.name}</span>
                              <span className="text-slate-500 hover:text-slate-300 text-xs"><UIIcon value={"🔍"} /></span>
                            </button>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {s.isOnline ? (
                              <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                ออนไลน์
                              </div>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-slate-300">{s.class}</td>
                          <td className="px-3 py-2.5 text-slate-300 font-mono">{s.number}</td>
                          <td className="px-3 py-2.5 text-amber-400 font-bold font-mono">{s.xp || 0}</td>
                          <td className="px-3 py-2.5 text-sky-400 font-bold font-mono">{s.level || 1}</td>
                          <td className="px-3 py-2.5 text-center text-amber-300 font-bold font-mono">{s.totalStars}</td>
                          <td className="px-3 py-2.5 text-center text-emerald-400 font-bold font-mono">{s.missionsPassed}</td>
                          <td className="px-3 py-2.5 text-center font-bold">
                             <button 
                               onClick={() => setSelectedStudentForBadges(s)}
                               className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 text-xs transition-colors"
                               title="คลิกเพื่อดู Badge"
                             >
                               {s.badgeCount} <UIIcon value={"🏅"} />
                             </button>
                          </td>
                          <td className="px-3 py-2.5 text-center text-rose-400 font-bold font-mono">{s.mistakesCount}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-16 rounded-full bg-slate-800 border border-white/5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${s.avgPct >= 70 ? 'bg-emerald-500' : s.avgPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${s.avgPct}%` }}
                                />
                              </div>
                              <span className="text-slate-200 font-bold font-mono text-xs">{s.avgPct}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-amber-300 text-xs">{weakList || '—'}</td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              onClick={handleTogglePermission}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${permBg}`}
                              title="คลิกเพื่อเปลี่ยนสิทธิ์คำแปล (แปลทั้งหมด -> เฉพาะศัพท์ -> ปิดแปล)"
                            >
                              {permText}
                            </button>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <button className="text-sky-400 hover:text-sky-300 mx-1 text-base transition-colors" onClick={() => handleEditStudent(s)} title="แก้ไขชื่อ"><UIIcon value={"✏️"} /></button>
                            {canManageRoster && <button className="text-rose-400 hover:text-rose-300 mx-1 text-base transition-colors" onClick={() => handleDeleteStudent(s.id, s.name)} title="ลบข้อมูล"><UIIcon value={"🗑️"} /></button>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-white/10 bg-slate-950/60">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>แสดงผล:</span>
                    <select 
                      className="bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-slate-200 text-xs font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(e.target.value);
                        setCurrentPage(1); // Reset to page 1
                      }}
                    >
                      <option value="5">5 แถว</option>
                      <option value="10">10 แถว</option>
                      <option value="20">20 แถว</option>
                      <option value="50">50 แถว</option>
                      <option value="all">ทั้งหมด</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors py-1.5 px-4 text-xs font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed" 
                      onClick={() => setCurrentPage(p => p - 1)} 
                      disabled={currentPage <= 1}
                    >
                      <UIIcon value={"←"} /> ก่อนหน้า
                    </button>
                    <span className="text-slate-300 text-sm font-bold">
                      หน้า {currentPage} / {totalPages || 1}
                    </span>
                    <button 
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors py-1.5 px-4 text-xs font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed" 
                      onClick={() => setCurrentPage(p => p + 1)} 
                      disabled={currentPage >= totalPages || totalPages === 0}
                    >
                      ถัดไป <UIIcon value={"→"} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        )}

        {/* Tab: Strategy Analytics */}
        {activeTab === 'strategy' && (
          <div className="space-y-4">
            <div className="glass-card-dark p-6 border border-fuchsia-500/25 shadow-xl">
              <h3 className="text-lg font-bold text-fuchsia-300 mb-4 flex items-center gap-2">
                <span><UIIcon value={"🧠"} /></span> ภาพรวมกลยุทธ์ (Chapter 3)
              </h3>
              
              {(() => {
                const twoStepStudents = filteredStudents.filter(s => s.badgeStats?.twoStepTotal > 0);
                
                if (twoStepStudents.length === 0) {
                   return <div className="py-8 text-center"><p className="font-semibold text-slate-300">ยังไม่มีข้อมูลการทำกิจกรรม Two-Step ใน Chapter 3</p><p className="mt-2 text-sm text-slate-500">ระบบยังไม่สรุปความสามารถด้านกลยุทธ์จนกว่าจะมีผลกิจกรรมที่เกี่ยวข้อง</p></div>;
                }
                
                let totalQs = 0;
                let totalMain = 0;
                let totalReason = 0;
                let totalBoth = 0;
                
                twoStepStudents.forEach(s => {
                   totalQs += s.badgeStats.twoStepTotal || 0;
                   totalMain += s.badgeStats.twoStepMainCorrect || 0;
                   totalReason += s.badgeStats.twoStepReasonCorrect || 0;
                   totalBoth += s.badgeStats.twoStepBothCorrect || 0;
                });
                
                const mainAcc = Math.round((totalMain / totalQs) * 100) || 0;
                const reasonAcc = Math.round((totalReason / totalQs) * 100) || 0;
                const bothAcc = Math.round((totalBoth / totalQs) * 100) || 0;
                
                // Find target groups
                const luckyGuessers = twoStepStudents.filter(s => {
                   const m = s.badgeStats.twoStepMainCorrect || 0;
                   const r = s.badgeStats.twoStepReasonCorrect || 0;
                   const reasonAcc = ((s.badgeStats.twoStepReasonCorrect || 0) / s.badgeStats.twoStepTotal) * 100;
                  return reasonAcc < 40 && (s.badgeStats.twoStepMainCorrect || 0) > (s.badgeStats.twoStepReasonCorrect || 0);
                });
                
                const fastGuessers = filteredStudents.filter(s => (s.rankingStats?.fastGuessCount || 0) >= 5); // เดาเร็วบ่อย
                
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-slate-400 text-xs mb-1">ความแม่นยำคำตอบหลัก</div>
                        <div className="text-3xl font-black text-sky-400">{mainAcc}%</div>
                      </div>
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/10 text-center">
                        <div className="text-slate-400 text-xs mb-1">ความแม่นยำเหตุผล</div>
                        <div className="text-3xl font-black text-amber-400">{reasonAcc}%</div>
                      </div>
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-emerald-500/30 text-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <div className="text-slate-400 text-xs mb-1">ความแม่นยำกลยุทธ์ (ถูกทั้งคู่)</div>
                        <div className="text-3xl font-black text-emerald-400">{bothAcc}%</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* เดาถูกแต่เหตุผลผิด */}
                      <div className="bg-amber-950/20 p-4.5 rounded-2xl border border-amber-500/30">
                         <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-2">
                           <span className="text-xl"><UIIcon value={"🤔"} /></span> กลุ่มเดาคำตอบ (ถูกแต่เหตุผลผิด)
                         </h4>
                         <p className="text-xs text-slate-400 mb-3 leading-relaxed">นักเรียนที่มีแนวโน้มเดาคำตอบได้ถูกต้อง แต่ยังขาดความเข้าใจในเหตุผล (Accuracy เหตุผลต่ำกว่า 40%)</p>
                         <div className="space-y-2">
                           {luckyGuessers.length > 0 ? luckyGuessers.map(s => (
                             <div key={s.id} className="flex justify-between items-center bg-slate-950/60 border border-white/5 p-2.5 rounded-xl text-sm">
                               <span className="text-white font-medium">{s.name}</span>
                               <span className="text-amber-300 text-xs font-mono">
                                 Main: {Math.round(((s.badgeStats.twoStepMainCorrect || 0) / s.badgeStats.twoStepTotal) * 100)}% | 
                                 Reason: {Math.round(((s.badgeStats.twoStepReasonCorrect || 0) / s.badgeStats.twoStepTotal) * 100)}%
                               </span>
                             </div>
                           )) : (
                             <div className="text-slate-500 italic text-sm py-2">ไม่พบนักเรียนในกลุ่มนี้</div>
                           )}
                         </div>
                      </div>
                      
                      {/* เดาเร็ว / สแปมคลิก */}
                      <div className="bg-rose-950/20 p-4.5 rounded-2xl border border-rose-500/30">
                         <h4 className="font-bold text-rose-300 mb-2 flex items-center gap-2">
                           <span className="text-xl"><UIIcon value={"⚡"} /></span> กลุ่มสแปมคลิก (เดาเร็วบ่อย)
                         </h4>
                         <p className="text-xs text-slate-400 mb-3 leading-relaxed">นักเรียนที่ตอบคำถามเร็วกว่า 3 วินาทีสะสมเกิน 5 ครั้งขึ้นไป</p>
                         <div className="space-y-2">
                           {fastGuessers.length > 0 ? fastGuessers.map(s => (
                             <div key={s.id} className="flex justify-between items-center bg-slate-950/60 border border-white/5 p-2.5 rounded-xl text-sm">
                               <span className="text-white font-medium">{s.name}</span>
                               <span className="text-rose-400 font-bold font-mono text-xs">{s.rankingStats.fastGuessCount} ครั้ง</span>
                             </div>
                           )) : (
                             <div className="text-slate-500 italic text-sm py-2">ไม่พบนักเรียนในกลุ่มนี้</div>
                           )}
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab: Ranking */}
        {activeTab === 'ranking' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card-dark p-6 border border-amber-500/25 shadow-xl">
                <h3 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                  <span><UIIcon value={"🏅"} /></span> Top 5 นักเรียน (คะแนน Rank)
                </h3>
                <div className="space-y-2">
                   {[...filteredStudents]
                    .map(s => {
                      const rStats = s.rankingStats || {};
                      const rawFastGuess = rStats.fastGuessCount || 0;
                      const mistakesFromBank = Object.values(s.mistakeBank || {}).reduce((acc, m) => {
                        return acc + (m.correctInReview || 0) + (m.mastered ? 2 : 0);
                      }, 0);
                      const fastGuessCount = Math.max(0, rawFastGuess - (mistakesFromBank * 5));
                      const adjustedRankingStats = { ...rStats, fastGuessCount };
                      const rankScore = calculateRankScore({ ...s, rankingStats: adjustedRankingStats }, rawFastGuess);
                      return { ...s, rankScore };
                    })
                    .sort((a, b) => b.rankScore - a.rankScore)
                    .slice(0, 5)
                    .map((s, i) => {
                      const tier = getRankingTier(s.rankScore);
                      return (
                        <div key={s.id} className="flex items-center justify-between bg-slate-950/50 border border-white/5 p-2.5 rounded-xl hover:border-white/15 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-slate-500 w-5 font-mono">{i + 1}.</span>
                            {onlineStudents.some(os => os.id === s.id) && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="ออนไลน์" />}
                            <span className="text-white font-semibold">{s.name}</span>
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/10 ${tier.color}`}><TierArtwork tier={tier} className="tier-artwork-teacher" /> {tier.name}</span>
                          </div>
                          <span className="font-bold text-amber-400 font-mono">{s.rankScore.toLocaleString()}</span>
                        </div>
                      );
                    })}

                  {filteredStudents.length === 0 && (
                     <div className="text-slate-500 text-sm italic py-4 text-center">ไม่มีข้อมูลนักเรียนในห้องนี้</div>
                  )}
                </div>
              </div>

              <div className="glass-card-dark p-6 border border-rose-500/25 shadow-xl">
                <h3 className="text-lg font-bold text-rose-300 mb-4 flex items-center gap-2">
                  <span><UIIcon value={"⚠️"} /></span> สถิติ "กดมั่ว" (ตอบเร็วกว่า 3 วิ)
                </h3>
                <div className="space-y-2">
                  {[...filteredStudents]
                    .filter(s => (s.rankingStats?.fastGuessCount || 0) > 0)
                    .sort((a, b) => (b.rankingStats?.fastGuessCount || 0) - (a.rankingStats?.fastGuessCount || 0))
                    .slice(0, 5)
                    .map((s, i) => (
                      <div key={s.id} className="flex items-center justify-between bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/30">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{s.name}</span>
                        </div>
                        <span className="font-bold text-rose-400 font-mono text-xs">{s.rankingStats.fastGuessCount} ครั้ง</span>
                      </div>
                    ))}
                  {filteredStudents.every(s => !(s.rankingStats?.fastGuessCount > 0)) && (
                    <div className="text-slate-400 text-sm italic py-6 text-center">ไม่มีนักเรียนที่มีสถิติการกดมั่ว <UIIcon value={"🎉"} /></div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Full Leaderboard Button */}
            <div className="flex justify-center mt-4">
              <button 
                className="btn-gold flex items-center gap-2 py-3 px-8 text-lg animate-pulse"
                onClick={() => navigate('ranking')}
              >
                <UIIcon value={"🏆"} /> ดูหน้าต่าง Leaderboard เต็มรูปแบบ
              </button>
            </div>
          </div>
        )}

        {activeTab === 'year_simulations' && (
          <YearSimulationsTeacherPanel
            theme={theme}
            students={filteredStudents}
            selectedClass={selectedClass}
            onSelectStudent={(id) => openStudentReport(id, 'overview')}
            onRefresh={() => refresh({ silent: true }).catch(() => {})}
          />
        )}
        {/* Tab: Arena */}
        {activeTab === 'arena' && (() => {
          // Summary stats across all students
          const arenaStudents = filteredStudents.filter(s => s.arenaStats?.arenaRankScore > 0);
          const avgFullMock = arenaStudents.filter(s => s.arenaStats?.bestFullMock)
            .reduce((acc, s, _, arr) => acc + s.arenaStats.bestFullMock.percent / arr.length, 0);
          const passedFullMock = arenaStudents.filter(s => (s.arenaStats?.bestFullMock?.percent || 0) >= 70).length;

          const renderScore = (s, mockKey) => {
            // Prefer Supabase arenaStats, fallback to localStorage
            let arenaStats = s.arenaStats;
            if (!arenaStats) {
              try {
                const data = localStorage.getItem(`eng_quest_arena_${s.id}`);
                if (data) arenaStats = JSON.parse(data);
              } catch(e) {}
            }
            let m = arenaStats?.[mockKey];
            if (!m && arenaStats?.attempts) {
              const modeMap = {
                bestMiniMock: 'mini_mock_arena',
                bestSpeedMock: 'speed_mock_challenge',
                bestSkillMixedMock: 'skill_mixed_mock',
                bestWeaknessMock: 'weakness_mock',
                bestFullMock: 'full_mock_test',
                bestFinalSimulation: 'final_exam_simulation',
                bestOnetYear2564: 'onet_year_2564',
                bestOnetYear2565: 'onet_year_2565',
                bestOnetYear2566: 'onet_year_2566',
                bestOnetYear2567: 'onet_year_2567',
                bestOnetYear2568: 'onet_year_2568',
              };
              const targetMode = modeMap[mockKey];
              if (targetMode) {
                const matching = arenaStats.attempts.filter(a => a.mode === targetMode);
                if (matching.length > 0) {
                  m = matching.reduce((best, cur) => cur.percent > (best?.percent || 0) ? cur : best, null);
                }
              }
            }
            if (!m) return <span className="text-slate-600">-</span>;
            return <span className={`font-mono font-bold ${m.percent >= 80 ? 'text-emerald-400' : m.percent >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{Math.round(m.percent)}%</span>;
          };

          return (
            <div className="space-y-4">
              {/* Arena Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card-dark p-4 text-center border border-sky-500/30 shadow-xl shadow-sky-950/20 hover:border-sky-500/50 transition-all">
                  <div className="text-3xl font-black text-sky-400">{arenaStudents.length}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">เล่น Arena แล้ว</div>
                </div>
                <div className="glass-card-dark p-4 text-center border border-emerald-500/30 shadow-xl shadow-emerald-950/20 hover:border-emerald-500/50 transition-all">
                  <div className="text-3xl font-black text-emerald-400">{passedFullMock}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">ผ่าน Full Mock ≥70%</div>
                </div>
                <div className="glass-card-dark p-4 text-center border border-amber-500/30 shadow-xl shadow-amber-950/20 hover:border-amber-500/50 transition-all">
                  <div className="text-3xl font-black text-amber-400">{avgFullMock ? Math.round(avgFullMock) + '%' : '-'}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">เฉลี่ย Full Mock</div>
                </div>
              </div>

              {/* Arena Table */}
              <div className="glass-card-dark p-6 border border-sky-500/25 shadow-xl">
                <h3 className="text-lg font-bold text-sky-300 mb-4 flex items-center gap-2">
                  <span><UIIcon value={"🏟️"} /></span> O-NET Arena — ผลการฝึกซ้อม
                </h3>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/10 bg-slate-950/70 text-slate-400 text-xs font-bold">
                        <th className="p-3">ชื่อนักเรียน</th>
                        <th className="p-3">Mini Mock</th>
                        <th className="p-3">Speed Mock</th>
                        <th className="p-3">Skill Mixed</th>
                        <th className="p-3">Weakness</th>
                        <th className="p-3">Full Mock</th>
                        <th className="p-3">Final Sim</th>
                        <th className="p-3 text-rose-300">O-NET '64</th>
                        <th className="p-3 text-emerald-300">O-NET '65</th>
                        <th className="p-3 text-sky-300">O-NET '66</th>
                        <th className="p-3 text-amber-300">O-NET '67</th>
                        <th className="p-3 text-violet-300">O-NET '68</th>
                        <th className="p-3 text-center">Badges</th>
                        <th className="p-3 text-right">Rank Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredStudents]
                        .sort((a, b) => (b.arenaStats?.arenaRankScore || 0) - (a.arenaStats?.arenaRankScore || 0))
                        .map(s => {
                          const aStats = s.arenaStats || {};
                          return (
                            <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                              <td className="p-3 text-white font-semibold">{s.name}</td>
                              <td className="p-3">{renderScore(s, 'bestMiniMock')}</td>
                              <td className="p-3">{renderScore(s, 'bestSpeedMock')}</td>
                              <td className="p-3">{renderScore(s, 'bestSkillMixedMock')}</td>
                              <td className="p-3">{renderScore(s, 'bestWeaknessMock')}</td>
                              <td className="p-3">{renderScore(s, 'bestFullMock')}</td>
                              <td className="p-3">{renderScore(s, 'bestFinalSimulation')}</td>
                              <td className="p-3">{renderScore(s, 'bestOnetYear2564')}</td>
                              <td className="p-3">{renderScore(s, 'bestOnetYear2565')}</td>
                              <td className="p-3">{renderScore(s, 'bestOnetYear2566')}</td>
                              <td className="p-3">{renderScore(s, 'bestOnetYear2567')}</td>
                              <td className="p-3">{renderScore(s, 'bestOnetYear2568')}</td>
                              <td className="p-3 text-center text-amber-300 font-bold">{(aStats.arenaBadges || []).length} <UIIcon value={"🏅"} /></td>
                              <td className="p-3 text-right text-sky-400 font-bold font-mono">{aStats.arenaRankScore ? Math.round(aStats.arenaRankScore) : '-'}</td>
                            </tr>
                          );
                        })}
                      {filteredStudents.length === 0 && (
                        <tr><td colSpan="14" className="p-5 text-center text-slate-500 italic">ไม่มีข้อมูลนักเรียน</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab: Final Exam */}
        {activeTab === 'final_exam' && (
          <div className="space-y-4">
            <div className="glass-card-dark border border-amber-500/30 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl"><UIIcon value={"🎓"} /></div>
                  <div>
                    <h3 className="text-xl font-black text-amber-300 flex items-center gap-2">
                      ควบคุมการสอบปลายภาค (Final Examination)
                      {examSession?.isOpen ? (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30 animate-pulse font-bold">
                          <UIIcon value={"🟢"} /> กำลังเปิดสอบอยู่
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-full border border-white/10 font-bold">
                          <UIIcon value={"🔒"} /> ปิดระบบสอบ
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      ข้อสอบ 50 ข้อ 100 คะแนน (ข้อละ 2 คะแนน) • สุ่มจาก 9 หัวข้อ O-NET • กำหนดรหัส PIN ให้นักเรียนเข้าสอบ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleLoadExamResults}
                    disabled={examLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <UIIconText value={examLoading ? '⏳ กำลังโหลด...' : '🔄 โหลดผลสอบล่าสุด'} />
                  </button>
                  {examResults.length > 0 && (
                    <>
                      <button
                        onClick={handleExportExamResults}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <UIIcon value={"📥"} /> Export CSV
                      </button>
                      <button
                        onClick={handleExportExamResultsPDF}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <UIIcon value={"📄"} /> Export PDF / พิมพ์รายงาน
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* PIN & Open/Close Controls */}
              <div className="bg-slate-950/70 border border-amber-400/30 rounded-2xl p-5 mb-6 shadow-xl">
                {!examSession?.isOpen ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-amber-400 font-black text-sm flex items-center gap-2">
                          <span><UIIcon value={"🔑"} /></span> กำหนด PIN สำหรับรอบสอบ
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          ใช้ตัวเลข 6 หลักที่คาดเดายาก รหัสนี้แยกจาก PIN เข้าบัญชีนักเรียน
                        </p>
                      </div>
                      {examPinInput && (
                        <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                          {examPinInput.length}/6 หลัก
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          name="teacher_custom_pin_field"
                          id="teacher_custom_pin_field"
                          value={examPinInput}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setExamPinInput(val);
                          }}
                          placeholder="PIN รอบสอบ 6 หลัก"
                          className="w-full bg-slate-950 border-2 border-amber-400/60 rounded-xl px-5 py-3.5 text-yellow-300 placeholder:text-slate-500 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 font-mono text-2xl font-black tracking-[0.25em] text-center transition-all shadow-inner"
                        />
                        {examPinInput && (
                          <button
                            type="button"
                            onClick={() => setExamPinInput('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded-lg text-sm"
                            title="ล้างค่า"
                          >
                            <UIIcon value={"✕"} />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={handleOpenExam}
                        disabled={examLoading || isWeakExamPin(examPinInput.trim())}
                        className="px-8 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black rounded-xl transition-all disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20 text-base flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <UIIconText value={examLoading ? '⏳ กำลังเปิด...' : '🟢 เปิดสอบด้วย PIN นี้'} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                      <span className="text-slate-400 font-bold"><UIIcon value={"💡"} /> แนะนำ:</span>
                      <button
                        type="button"
                        onClick={() => setExamPinInput(generateExamPin())}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-1 active:scale-95"
                      >
                        <UIIcon value={"🎲"} /> สุ่ม PIN ปลอดภัย 6 หลัก
                      </button>
                      <span className="text-slate-500">ระบบยังไม่มีวันหมดอายุหรือจำกัดจำนวนครั้งที่ลอง PIN</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Exam is currently open */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl animate-pulse shrink-0">
                          <UIIcon value={"🟢"} />
                        </div>
                        <div>
                          <div className="text-emerald-400 font-black text-sm flex items-center gap-2">
                            ระบบสอบกำลังเปิดอยู่ — นักเรียนใส่ PIN เข้าสอบได้ทันที!
                          </div>
                          <div className="text-slate-400 text-xs mt-1 flex items-center gap-2 flex-wrap">
                            <span>รหัส PIN สำหรับนักเรียน:</span>
                            <span className="font-mono text-2xl text-yellow-300 font-black tracking-widest bg-slate-950 px-3 py-0.5 rounded-lg border border-yellow-400/30 shadow-inner">
                              {examSession.pin}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText(examSession.pin);
                                showToast(`📋 คัดลอกรหัส PIN ${examSession.pin} แล้ว`);
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold border border-slate-700 transition-colors"
                              title="คัดลอกรหัส"
                            >
                              <UIIcon value={"📋"} /> คัดลอก PIN
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        {!isEditingPin && (
                          <button
                            onClick={() => {
                              setIsEditingPin(true);
                              setEditPinInput(examSession.pin);
                            }}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-300 hover:text-white font-bold text-xs rounded-xl border border-yellow-500/30 transition-all flex items-center gap-1.5"
                          >
                            <UIIcon value={"✏️"} /> เปลี่ยนรหัส PIN
                          </button>
                        )}

                        <button
                          onClick={handleCloseExam}
                          disabled={examLoading}
                          className="px-5 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-rose-950/40 flex items-center justify-center gap-1.5"
                        >
                          <UIIconText value={examLoading ? '⏳ กำลังปิด...' : '🔒 ปิดการสอบ'} />
                        </button>
                      </div>
                    </div>

                    {/* Inline Change PIN Box */}
                    {isEditingPin && (
                      <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-3 animate-scale-in">
                        <div className="flex-1 w-full text-left">
                          <label className="block text-xs font-bold text-yellow-300 mb-1">
                            <UIIcon value={"✏️"} /> ระบุรหัส PIN ใหม่ที่ต้องการเปลี่ยน:
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            autoComplete="off"
                            value={editPinInput}
                            onChange={e => setEditPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="PIN ใหม่ 6 หลัก"
                            className="w-full bg-slate-900 border border-amber-400/50 rounded-xl px-4 py-2 text-yellow-300 font-mono text-lg font-black tracking-widest text-center focus:outline-none focus:border-yellow-400"
                          />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={handleUpdatePin}
                            disabled={examLoading || isWeakExamPin(editPinInput.trim())}
                            className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all disabled:opacity-40"
                          >
                            บันทึก PIN ใหม่
                          </button>
                          <button
                            onClick={() => setIsEditingPin(false)}
                            className="px-3 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Exam Results Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <UIIcon value={"📊"} /> รายชื่อและผลคะแนนนักเรียน ({filteredExamResults.length} คน)
                  </h4>
                </div>

                {filteredExamResults.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-950/40 rounded-2xl border border-white/10">
                    <div className="text-4xl mb-2"><UIIcon value={"📝"} /></div>
                    <p className="font-medium">ยังไม่มีนักเรียนส่งข้อสอบในโรงเรียนนี้</p>
                    <p className="text-xs text-slate-500 mt-1">เมื่อนักเรียนทำข้อสอบ 50 ข้อเสร็จและกดยืนยันส่ง คะแนนจะปรากฏที่นี่ทันที</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/40 shadow-xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-950/80 text-slate-400 text-xs border-b border-white/10">
                          <th className="px-4 py-3 text-left">#</th>
                          <th className="px-4 py-3 text-left">เลขที่</th>
                          <th className="px-4 py-3 text-left">ห้อง</th>
                          <th className="px-4 py-3 text-left">ชื่อ - นามสกุล</th>
                          <th className="px-4 py-3 text-center">คะแนน (เต็ม 100)</th>
                          <th className="px-4 py-3 text-center">ตอบถูก</th>
                          <th className="px-4 py-3 text-center">ร้อยละ</th>
                          <th className="px-4 py-3 text-center">ผลประเมิน</th>
                          <th className="px-4 py-3 text-left hidden md:table-cell">วันที่สอบ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExamResults.map((r, idx) => {
                          const res = r.finalExamResult;
                          const passed = res.percent >= 70;
                          const points = res.points !== undefined ? res.points : (res.score * 2);
                          return (
                            <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.04] transition-colors">
                              <td className="px-4 py-3 text-slate-500 font-mono text-xs">{idx + 1}</td>
                              <td className="px-4 py-3 text-slate-300 font-mono">{r.number || '-'}</td>
                              <td className="px-4 py-3 text-slate-300">{r.class || '-'}</td>
                              <td className="px-4 py-3 text-white font-bold">{r.name}</td>
                              <td className="px-4 py-3 text-center font-mono font-black text-amber-400 text-base">
                                {points} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                              </td>
                              <td className="px-4 py-3 text-center text-slate-300 font-mono text-xs">
                                {res.score} / {res.total}
                              </td>
                              <td className={`px-4 py-3 text-center font-black ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {Math.round(res.percent)}%
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                  passed
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                }`}>
                                  <UIIconText value={passed ? '✅ ผ่าน' : '❌ ไม่ผ่าน'} />
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                                {res.submittedAt ? new Date(res.submittedAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div className="bg-slate-950/80 px-6 py-3.5 flex flex-wrap justify-between text-xs text-slate-400 border-t border-white/10 gap-3">
                      <span>ผู้เข้าสอบ: <strong className="text-white">{filteredExamResults.length}</strong> คน • ผ่าน: <strong className="text-emerald-400">{filteredExamResults.filter(r => r.finalExamResult.percent >= 70).length}</strong> คน ({filteredExamResults.length > 0 ? Math.round((filteredExamResults.filter(r => r.finalExamResult.percent >= 70).length / filteredExamResults.length) * 100) : 0}%)</span>
                      <span>คะแนนเฉลี่ย: <strong className="text-amber-400 font-mono font-bold">{filteredExamResults.length > 0 ? Math.round((filteredExamResults.reduce((a, r) => a + (r.finalExamResult.points !== undefined ? r.finalExamResult.points : (r.finalExamResult.score * 2)), 0) / filteredExamResults.length) * 10) / 10 : 0}</strong> / 100</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        </main>
      </div>

      {/* ── Online Students Modal ─────────────────────────────── */}
      {showOnlineList && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowOnlineList(false)} />
          <div className="relative bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-black text-base text-emerald-400">
                  สถานะออนไลน์นักเรียน ({onlineCount || 0} / {totalStudents})
                </h3>
              </div>
              <button onClick={() => setShowOnlineList(false)} className="text-slate-400 hover:text-white p-1"><UIIcon value={"✕"} /></button>
            </div>

            <div className="text-xs text-slate-400">
              {onlineCheckedAt ? `เช็คล่าสุด: ${onlineCheckedAt.toLocaleTimeString('th-TH')} (ใช้งานใน 10 นาทีที่ผ่านมา)` : 'ยังไม่ได้ตรวจสอบ'}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {onlineStudents.length > 0 ? onlineStudents.map(s => (
                <div key={s.id} className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{s.name}</span>
                  <span className="text-emerald-400 font-mono">ห้อง {s.class} · เลขที่ {s.number}</span>
                </div>
              )) : (
                <div className="text-center py-6 text-slate-500 text-xs">ไม่มีนักเรียนออนไลน์ใน 10 นาทีที่ผ่านมา</div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCheckOnline}
                disabled={onlineLoading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <UIIconText value={onlineLoading ? '⏳ กำลังเช็ค...' : '🔄 เช็คสถานะใหม่'} />
              </button>
              <button
                onClick={() => setShowOnlineList(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {canManageRoster && showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="relative glass-card-dark border border-amber-500/30 w-full max-w-md p-6 sm:p-8 shadow-2xl animate-scale-in text-white">
            <h2 className="text-2xl font-black text-white mb-6 text-center flex items-center justify-center gap-2">
              <span><UIIcon value={"➕"} /></span> เพิ่มนักเรียนใหม่
            </h2>
            
            <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1.5">ชื่อ - สกุล</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-white/15 text-white rounded-xl p-3 focus:border-amber-400 outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
                  value={addForm.name}
                  onChange={e => setAddForm({...addForm, name: e.target.value})}
                  placeholder="เช่น ด.ช.สมชาย ใจดี"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1.5">ชั้น</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-950 border border-white/15 text-white rounded-xl p-3 focus:border-amber-400 outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
                    value={addForm.class}
                    onChange={e => setAddForm({...addForm, class: e.target.value})}
                    placeholder="เช่น 6/1"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1.5">เลขที่</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-950 border border-white/15 text-white rounded-xl p-3 focus:border-amber-400 outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
                    value={addForm.number}
                    onChange={e => setAddForm({...addForm, number: e.target.value})}
                    placeholder="เช่น 1"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                <button type="button" className="flex-1 py-3 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-bold transition-colors" onClick={() => setShowAddModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95 text-sm">
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sheets Modal */}
      {canManageRoster && showSheetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowSheetModal(false)} />
          <div className="relative glass-card-dark border border-sky-500/30 w-full max-w-md p-6 sm:p-8 shadow-2xl animate-scale-in text-white">
            <h2 className="text-2xl font-black text-white mb-2 text-center flex items-center justify-center gap-2">
              <span><UIIcon value={"🔗"} /></span> ดึงข้อมูล Google Sheets
            </h2>
            <p className="text-center text-slate-400 text-xs mb-6">
              <UIIcon value={"⚠️"} /> อย่าลืมตั้งค่าแชร์ไฟล์เป็น <strong className="text-sky-400">"ทุกคนที่มีลิงก์"</strong> ก่อนนำมาวาง
            </p>
            
            <form onSubmit={handleImportFromSheetSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1.5">ลิงก์ (URL)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border border-white/15 text-white rounded-xl p-3 focus:border-sky-400 outline-none focus:ring-2 focus:ring-sky-500/20 text-sm"
                  value={sheetUrl}
                  onChange={e => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                <button type="button" className="flex-1 py-3 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-bold transition-colors" onClick={() => setShowSheetModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-sky-950/40 transition-all active:scale-95 text-sm">
                  ดึงข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Import Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowPreviewModal(false)} />
          <div className="relative glass-card-dark border border-sky-500/30 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-in text-white rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10 shrink-0">
              <h2 className="text-2xl font-black text-white text-center flex items-center justify-center gap-2">
                <span><UIIcon value={"📋"} /></span> ตรวจสอบข้อมูลก่อนบันทึก
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4">
                <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                  <span><UIIcon value={"✅"} /></span> ข้อมูลที่ผ่าน (พร้อมบันทึก): {previewData.length} รายการ
                </h3>
                <div className="text-sm text-emerald-200/80 max-h-36 overflow-y-auto space-y-1">
                  {previewData.slice(0, 10).map((s, i) => (
                    <div key={i} className="text-xs">{s.class} เลขที่ {s.number} - {s.name}</div>
                  ))}
                  {previewData.length > 10 && <div className="mt-2 text-emerald-300 font-bold text-xs">... และอื่นๆ อีก {previewData.length - 10} รายการ</div>}
                  {previewData.length === 0 && <div className="text-xs text-slate-400">ไม่มีข้อมูลที่สามารถนำเข้าได้</div>}
                </div>
              </div>

              {duplicateData.length > 0 && (
                <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4">
                  <h3 className="text-rose-400 font-bold mb-2 flex items-center gap-2">
                    <span><UIIcon value={"⚠️"} /></span> ข้อมูลซ้ำ (ถูกตัดออก): {duplicateData.length} รายการ
                  </h3>
                  <p className="text-xs text-rose-300/70 mb-3">รายชื่อเหล่านี้พบว่ามีชื่ออยู่ในไฟล์ซ้ำกัน หรือมีอยู่ในระบบแล้ว ระบบจะข้ามไม่บันทึกข้อมูลเหล่านี้</p>
                  <div className="text-sm text-rose-200/80 max-h-36 overflow-y-auto space-y-1">
                    {duplicateData.map((s, i) => (
                      <div key={i} className="text-xs">{s.class} เลขที่ {s.number} - {s.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex gap-3 shrink-0">
              <button className="flex-1 py-3 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-bold transition-colors" onClick={() => setShowPreviewModal(false)}>
                ยกเลิก
              </button>
              <button 
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 text-sm"
                onClick={handleConfirmImport}
                disabled={previewData.length === 0}
              >
                ยืนยันการบันทึก ({previewData.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {canManageRoster && showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowResetModal(false)} />
          <div className="relative glass-card-dark border-2 border-rose-500/50 w-full max-w-md p-6 sm:p-8 text-center shadow-2xl animate-scale-in text-white rounded-3xl">
            <div className="text-5xl mb-3 animate-bounce"><UIIcon value={"⚠️"} /></div>
            <h2 className="text-2xl font-black text-rose-400 mb-2">ลบข้อมูล?</h2>
            
            <div className="mb-6 text-left">
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">เลือกลบข้อมูล:</label>
              <select 
                className="w-full bg-slate-950 text-white rounded-xl p-3 border border-white/20 focus:border-rose-500 outline-none transition-all text-sm"
                value={resetTargetClass}
                onChange={(e) => setResetTargetClass(e.target.value)}
              >
                <option value="all"><UIIcon value={"⚠️"} /> ลบข้อมูลทั้งหมดทุกชั้นเรียน</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>ลบเฉพาะชั้น {cls}</option>
                ))}
              </select>
            </div>

            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              การกระทำนี้จะลบรายชื่อและคะแนนอย่างถาวร<br/>
              <span className="text-rose-400 font-bold">ไม่สามารถกู้คืนกลับมาได้อีก!</span>
            </p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-bold transition-colors" onClick={() => setShowResetModal(false)}>
                ยกเลิก
              </button>
              <button className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-950/40 transition-all active:scale-95 text-sm" onClick={executeReset}>
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Badges Modal */}
      {selectedStudentForBadges && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelectedStudentForBadges(null)} />
          <div className="relative glass-card-dark border border-emerald-500/30 w-full max-w-2xl p-6 shadow-2xl animate-scale-in max-h-[80vh] flex flex-col text-white rounded-3xl overflow-hidden">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span><UIIcon value={"🏅"} /></span> Badges ของ {selectedStudentForBadges.name}
              </h2>
              <button 
                className="text-slate-400 hover:text-white transition-colors text-lg"
                onClick={() => setSelectedStudentForBadges(null)}
              >
                <UIIcon value={"✕"} />
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
              {(!selectedStudentForBadges.badges || selectedStudentForBadges.badges.length === 0) ? (
                <div className="text-center py-8 text-slate-400 italic">
                  ยังไม่มี Badge ที่ได้รับ
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedStudentForBadges.badges.map((badgeItem, idx) => {
                    if (!badgeItem) return null;
                    let badgeId = '';
                    let name = '';
                    let description = '';
                    let icon = '🏅';
                    
                    if (typeof badgeItem === 'string') {
                      badgeId = badgeItem;
                    } else if (typeof badgeItem === 'object' && badgeItem.id) {
                      badgeId = badgeItem.id;
                      name = badgeItem.name || '';
                      description = badgeItem.description || '';
                      icon = badgeItem.icon || '🏅';
                    } else {
                      badgeId = String(badgeItem);
                    }
                    
                    // Legacy badge mapping for old data where badge ID = quest ID
                    const LEGACY_BADGES = {
                      vocabulary: { name: 'ผ่านด่าน Vocabulary', icon: '📖', description: 'สำเร็จภารกิจหมวดคำศัพท์พื้นฐาน' },
                      signs: { name: 'ผ่านด่าน Signs', icon: '🚸', description: 'สำเร็จภารกิจหมวดป้ายสัญลักษณ์' },
                      directions: { name: 'ผ่านด่าน Directions', icon: '🧭', description: 'สำเร็จภารกิจหมวดบอกทิศทาง' },
                      market: { name: 'ผ่านด่าน Market', icon: '🏪', description: 'สำเร็จภารกิจหมวดร้านค้า/ตลาด' },
                      conversation: { name: 'ผ่านด่าน Conversation', icon: '💬', description: 'สำเร็จภารกิจหมวดบทสนทนา' },
                      reading: { name: 'ผ่านด่าน Reading', icon: '📚', description: 'สำเร็จภารกิจหมวดการอ่าน' },
                      grammar: { name: 'ผ่านด่าน Grammar', icon: '✏️', description: 'สำเร็จภารกิจหมวดไวยากรณ์' },
                    };
                    
                    const foundBadge = BADGES.find(b => b.id === badgeId);
                    if (foundBadge) {
                      name = foundBadge.name;
                      description = foundBadge.description;
                      icon = foundBadge.icon;
                    } else if (LEGACY_BADGES[badgeId]) {
                      name = LEGACY_BADGES[badgeId].name;
                      description = LEGACY_BADGES[badgeId].description;
                      icon = LEGACY_BADGES[badgeId].icon;
                    }
                    
                    if (!name) name = `Badge: ${badgeId}`;
                    
                    return (
                      <div key={badgeId || idx} className="bg-slate-950/60 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3 transition-colors">
                        <div className="text-3xl drop-shadow-md filter brightness-110 shrink-0">
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-bold text-sm leading-tight truncate">{name}</div>
                          <div className="text-emerald-400/90 text-[10px] mt-0.5 truncate">{description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowExportModal(false)} />
          <div className="relative glass-card-dark border border-emerald-500/30 w-full max-w-md shadow-2xl p-6 sm:p-8 text-white rounded-3xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span><UIIcon value={"📊"} /></span> Export รายงาน
              </h2>
              <button className="text-slate-400 hover:text-white text-xl" onClick={() => setShowExportModal(false)}><UIIcon value={"✕"} /></button>
            </div>

            <div className="space-y-3">
              {/* CSV Export */}
              <button
                className="w-full flex items-center gap-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 transition-all text-left group"
                onClick={() => {
                  const rows = [
                    ['ชื่อ','ชั้น','เลขที่','XP','Level','ดาว','Badge','คะแนนเฉลี่ย%',
                     ...TEACHER_CHAPTERS.map(ch => `${ch.label} ผ่าน/ทั้งหมด`),
                     'Pre-test%','Login_ล่าสุด','ตอบแล้ว_ข้อ'],
                  ];

                  filteredStudents.forEach(s => {
                    const qp = s.questProgress || {};
                    const aStats = s.arenaStats || {};
                    const totalStars = Object.values(qp).reduce((a, v) => a + (v.stars ? v.stars.reduce((x,y)=>x+y,0) : 0), 0);
                    const avgPct = getStudentCurrentPercent(s);
                    const prePct = getStudentPreTestPercent(s);
                    const chapterResults = TEACHER_CHAPTERS.map(ch => {
                      const ids = ch.useArena ? ch.arenaMocks : ch.quests;
                      const count = ids.filter(id => ch.useArena ? aStats[id]?.percent >= 70 : qp[id]?.passed || qp[id]?.pct >= 70).length;
                      return `${count}/${ids.length}`;
                    });
                    const lastLogin = s.badgeStats?.lastLoginDate ? new Date(s.badgeStats.lastLoginDate).toLocaleDateString('th-TH') : '-';

                    rows.push([
                      s.name, s.class, s.number, s.xp||0, s.level||1, totalStars, (s.badges||[]).length, avgPct === null ? '-' : `${avgPct}%`,
                      ...chapterResults,
                      prePct === null ? '-' : `${Math.round(prePct)}%`,
                      lastLogin, s.rankingStats?.totalAnswered||0,
                    ]);
                  });

                  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
                  const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `english_quest_report_${new Date().toISOString().slice(0,10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setShowExportModal(false);
                }}
              >
                <div className="text-3xl"><UIIcon value={"📥"} /></div>
                <div>
                  <div className="font-bold text-emerald-400 group-hover:text-emerald-300">Export CSV</div>
                  <div className="text-xs text-slate-400 mt-0.5">ดาวน์โหลด Excel/Sheets ครบทุกข้อมูล</div>
                  <div className="text-[11px] text-slate-500 mt-1">ชื่อ • XP • คะแนนต่อ Chapter • Arena • Login ล่าสุด</div>
                </div>
              </button>

              {/* Print Report */}
              <button
                className="w-full flex items-center gap-4 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-2xl p-4 transition-all text-left group"
                onClick={() => {
                  setShowExportModal(false);
                  setTimeout(() => window.print(), 300);
                }}
              >
                <div className="text-3xl"><UIIcon value={"🖨️"} /></div>
                <div>
                  <div className="font-bold text-sky-400 group-hover:text-sky-300">Print / Save PDF</div>
                  <div className="text-xs text-slate-400 mt-0.5">พิมพ์รายงานหรือบันทึกเป็น PDF</div>
                  <div className="text-[11px] text-slate-500 mt-1">ใช้ Ctrl+P หรือ "Save as PDF" ใน browser</div>
                </div>
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-5">
              {filteredStudents.length} คน • {selectedClass === 'all' ? 'ทุกห้อง' : `ชั้น ${selectedClass}`}
            </p>
          </div>
        </div>
      )}

      {/* Student Drill-down Modal */}
      {selectedWeakQuest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-labelledby="weak-quest-students-title" onClick={() => setSelectedWeakQuest(null)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-5" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3"><div><h3 id="weak-quest-students-title" className="font-bold text-white">ควรทบทวน · {selectedWeakQuest.name}</h3><p className="mt-1 text-xs text-slate-400">นักเรียนที่ทำแล้วและยังไม่ผ่าน 70%</p></div><button onClick={() => setSelectedWeakQuest(null)} className="text-slate-400" aria-label="ปิด"><X size={18} /></button></div>
            <div className="mt-4 space-y-2">{selectedWeakQuest.students.map(student => {
              const result = student.questProgress?.[selectedWeakQuest.id] || student.arenaStats?.[selectedWeakQuest.id];
              const score = result?.pct ?? result?.percent ?? 0;
              return <button key={student.id} onClick={() => { setSelectedWeakQuest(null); openStudentReport(student.id, 'errors'); }} className="flex w-full items-center justify-between rounded-lg bg-slate-950/70 px-3 py-3 text-left hover:bg-slate-800"><span><strong className="block text-sm text-white">{student.name}</strong><small className="text-xs text-slate-400">{student.class} · เลขที่ {student.number || '-'}</small></span><span className="font-bold text-amber-400">{score}% <ArrowRight className="ml-1 inline" size={14} /></span></button>;
            })}</div>
          </div>
        </div>
      )}

      {selectedStudentForDrilldown && (
        <Student360Profile
          key={`${displaySchool.id}:${selectedStudentForDrilldown.id}`}
          schoolId={displaySchool.id}
          studentId={selectedStudentForDrilldown.id}
          actor={currentTeacher}
          initialTab={drilldownTab}
          renderLegacyDetails={record => <StudentDrilldownModal student={record} embedded />}
          onClose={() => setSelectedStudentForDrilldown(null)}
        />
      )}

    </div>
  );
}

// ── Student Drill-down Modal ──────────────────────────────────────────────────
function StudentDrilldownModal({ student, onClose, embedded = false }) {
  if (!student) return null;

  const CHAPTER_DEFS = TEACHER_CHAPTERS;

  const QUEST_NAMES = {
    vocabulary: 'Vocabulary Village', signs: 'Signs City', directions: 'Direction Maze',
    market: 'Market Quest', conversation: 'Conversation Hub', reading: 'Reading Realm', grammar: 'Grammar Gate',
    illness: 'Illness & Health', jobs: 'Jobs World', food: 'Food Court', numbers: 'Numbers Zone',
    question_words: 'Question Words', sign_detective: 'Sign Detective', conversation_rescue: 'Conv. Rescue',
    map_escape: 'Map Escape', reading_detective: 'Reading Detective',
    pronouns_master: 'Pronouns Master', nouns_quantifiers: 'Nouns & Qty', adjectives_comp: 'Adjectives',
    prepositions_hub: 'Prepositions', clothes_fashion: 'Clothes & Fashion', weather_seasons: 'Weather',
    emotions_feelings: 'Emotions', world_countries: 'World Countries', shapes_colors: 'Shapes & Colors',
    nature_environment: 'Nature', school_subjects: 'School Subjects', tenses_arena: 'Tenses Arena',
  };

  const lastLogin = student.badgeStats?.lastLoginDate ? new Date(student.badgeStats.lastLoginDate) : null;
  const inactiveDays = lastLogin ? Math.floor((Date.now() - lastLogin.getTime()) / 86400000) : null;
  const totalStars = Object.values(student.questProgress || {}).reduce((a, v) => a + (v.stars ? v.stars.reduce((x,y)=>x+y,0) : 0), 0);

  return (
    <div className={embedded ? '' : 'fixed inset-0 z-[200] flex items-center justify-center p-4'}>
      {!embedded && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />}
      <div className={embedded ? '' : 'relative glass-card-dark border border-sky-500/30 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl rounded-3xl overflow-hidden'}>

        {/* Header */}
        {!embedded && <div className="p-5 border-b border-white/10 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white"><UIIcon value={"🔍"} /> {student.name}</h2>
              <div className="text-slate-400 text-sm mt-0.5">ชั้น {student.class} เลขที่ {student.number}</div>
            </div>
            <div className="flex items-center gap-4">
              {[
                { label: 'XP', value: student.xp || 0, color: 'text-amber-400' },
                { label: 'Lv.', value: student.level || 1, color: 'text-sky-400' },
                { label: '⭐', value: totalStars, color: 'text-amber-400' },
                { label: '🏅', value: (student.badges || []).length, color: 'text-emerald-400' },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
                  <div className="text-slate-400 text-xs">{item.label}</div>
                </div>
              ))}
              <button className="text-slate-400 hover:text-white text-2xl ml-2 transition-colors" onClick={onClose}><UIIcon value={"✕"} /></button>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {lastLogin && (
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                inactiveDays >= 7 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : inactiveDays >= 3 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                <UIIcon value={"🕒"} /> Login ล่าสุด: {inactiveDays === 0 ? 'วันนี้' : `${inactiveDays} วันที่แล้ว`}
              </span>
            )}
            {(student.preTest || getStudentPreTestPercent(student) !== null) && (
              <span className="text-xs px-2.5 py-1 rounded-full border bg-violet-500/20 text-violet-300 border-violet-500/30">
                Pre-test: {getStudentPreTestPercent(student) === null ? 'ไม่ทราบจำนวนข้อเดิม' : `${getStudentPreTestPercent(student)}%`}
              </span>
            )}
            {student.rankingStats && (
              <span className="text-xs px-2.5 py-1 rounded-full border bg-sky-500/20 text-sky-400 border-sky-500/30">
                ตอบแล้ว {student.rankingStats.totalAnswered || 0} ข้อ
              </span>
            )}
          </div>
        </div>

        }
        {/* Scrollable body */}
        <div className="overflow-y-auto p-5 space-y-5">
          {CHAPTER_DEFS.map(ch => {
            const qp = student.questProgress || {};
            const aStats = student.arenaStats || {};

            if (ch.useArena) {
              const hasSome = ch.arenaMocks.some(mk => aStats[mk] != null);
              if (!hasSome) return (
                <div key={ch.ch} className="opacity-40">
                  <div className="flex items-center gap-2 mb-1">
                    <span><UIIcon value={ch.icon} /></span>
                    <span className="text-sm font-bold text-slate-400">{ch.label}</span>
                    <span className="text-xs text-slate-500">— ยังไม่ได้เล่น</span>
                  </div>
                </div>
              );
              return (
                <div key={ch.ch}>
                  <div className="flex items-center gap-2 mb-2">
                    <span><UIIcon value={ch.icon} /></span>
                    <span className="text-sm font-bold" style={{ color: ch.color }}>{ch.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {ch.arenaMocks.map(mk => {
                      const m = aStats[mk];
                      if (!m) return (
                        <div key={mk} className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 text-center opacity-40">
                          <div className="text-slate-400 text-xs">{ch.arenaLabels[mk]}</div>
                          <div className="text-slate-600 text-sm">—</div>
                        </div>
                      );
                      const pct = Math.round(m.percent);
                      return (
                        <div key={mk} className="bg-slate-950/60 border border-white/10 rounded-xl p-2.5 text-center">
                          <div className="text-slate-400 text-xs mb-1">{ch.arenaLabels[mk]}</div>
                          <div className={`font-black text-lg ${
                            pct >= 80 ? 'text-emerald-400' : pct >= 70 ? 'text-blue-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400'
                          }`}>{pct}%</div>
                          <div className={`text-[10px] font-semibold ${pct >= 70 ? 'text-emerald-400' : 'text-rose-400/80'}`}>
                            <UIIconText value={pct >= 70 ? '✅ ผ่าน' : '✗ ยังไม่ผ่าน'} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const played = ch.quests.filter(q => qp[q] !== undefined);
            if (played.length === 0) return (
              <div key={ch.ch} className="opacity-40">
                <div className="flex items-center gap-2 mb-1">
                  <span><UIIcon value={ch.icon} /></span>
                  <span className="text-sm font-bold text-slate-400">{ch.label}</span>
                  <span className="text-xs text-slate-500">— ยังไม่ได้เล่น</span>
                </div>
              </div>
            );

            const chPassed = played.filter(q => qp[q]?.passed || qp[q]?.pct >= 70).length;
            const chPct = played.length > 0 ? Math.round(played.reduce((a, q) => a + (qp[q]?.pct || 0), 0) / played.length) : 0;

            return (
              <div key={ch.ch}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span><UIIcon value={ch.icon} /></span>
                    <span className="text-sm font-bold" style={{ color: ch.color }}>{ch.label}</span>
                  </div>
                  <span className="text-xs text-slate-400">ผ่าน {chPassed}/{ch.quests.length} • เฉลี่ยด่านที่เล่น {chPct}%</span>
                </div>
                <div className="space-y-1.5">
                  {ch.quests.map(q => {
                    const qd = qp[q];
                    if (!qd) return null;
                    const pct = qd.pct || 0;
                    return (
                      <div key={q} className="flex items-center gap-3">
                        <div className="w-32 text-xs text-slate-300 shrink-0 truncate">{QUEST_NAMES[q] || q}</div>
                        <div className="flex-1 h-2 rounded-full bg-slate-800 border border-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct >= 80 ? '#10b981' : pct >= 70 ? '#3b82f6' : pct >= 50 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <div className={`w-10 text-xs font-black text-right shrink-0 ${
                            pct >= 80 ? 'text-emerald-400' : pct >= 70 ? 'text-blue-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400'
                        }`}>{pct}%</div>
                        <span className={`text-xs w-6 shrink-0 ${qd.passed || pct >= 70 ? 'text-emerald-400' : 'text-white/20'}`}>
                          <UIIconText value={qd.passed || pct >= 70 ? '✅' : '✗'} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

