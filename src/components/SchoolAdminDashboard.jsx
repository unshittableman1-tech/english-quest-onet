import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import { canManageSchoolStudents } from '../utils/roleAccess';
import { readStudentImportFile, downloadStudentImportTemplate } from '../utils/studentImportFile';
import {
  Shield, Users, UserCheck, UserX, AlertTriangle, RefreshCw, Upload, Download,
  Plus, Edit, Eye, Search, Filter, History, CheckCircle2, XCircle, ArrowLeft,
  GraduationCap, Building, KeyRound, Clock
} from 'lucide-react';
import { useApp } from '../App';
import UIIcon, { UIIconText } from './UIIcon';
import { getActiveSchoolContext } from '../utils/schoolStorage';
import { schoolEntryUrl } from '../utils/schoolEntry';
import {
  getSchoolAdminDashboard, listSchoolStudents, getStudentSeatHistory,
  updateStudentProfile, changeStudentSeat, createStudentsBulk,
  listSchoolTeachers, setTeacherMembership, updateSchoolTeacherName, parseStudentCSV,
  validateStudentImportBatch, generateRequestId, resetSchoolStudentPin
} from '../utils/schoolAdmin';

export default function SchoolAdminDashboard({ onBackToTeacher, embedded = false, schoolContext = null, onChanged }) {
  const { navigate, showToast, student: currentStaff } = useApp();
  const isPlatformAdmin = currentStaff?.role === 'super_admin';
  const activeCtx = isPlatformAdmin ? getActiveSchoolContext() : null;
  const effectiveSchool = schoolContext || activeCtx || currentStaff;
  const canManagePersonnel = isPlatformAdmin || currentStaff?.membership_role === 'school_admin';
  const ContentTag = embedded ? 'section' : 'main';
  const loadRequest = useRef(0);
  useEffect(() => () => { ++loadRequest.current; }, []);
  const schoolId = effectiveSchool?.school_id || effectiveSchool?.id || null;
  const schoolName = effectiveSchool?.school_name || effectiveSchool?.name || 'ไม่พบข้อมูลโรงเรียน';
  const schoolCode = effectiveSchool?.school_code || effectiveSchool?.code || 'N/A';

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('teacher_theme') || 'dark');
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('teacher_theme', next);
  };

  // State
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'teachers'

  // Student filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [newStudent, setNewStudent] = useState(null);
  const [pinStudent, setPinStudent] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const resetRequest = useRef(null);
  const [membershipFilter, setMembershipFilter] = useState('all'); // 'all' | 'ACTIVE' | 'INACTIVE'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ student_id: '', name: '', class: '', number: '' });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyStudent, setHistoryStudent] = useState(null);
  const [seatHistory, setSeatHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [teacherUserId, setTeacherUserId] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Bulk Import State
  const [importText, setImportText] = useState('');
  const [importBatch, setImportBatch] = useState(null);

  // Fetch dashboard stats & lists
  const loadData = useCallback(async () => {
    const request = ++loadRequest.current;
    setLoading(true);
    setLoadError(null);
    if (!schoolId || !canManageSchoolStudents(currentStaff, schoolId)) {
      setDashboardData(null);
      setStudents([]);
      setTeachers([]);
      setLoadError('ไม่พบขอบเขตโรงเรียนที่ได้รับอนุญาต');
      setLoading(false);
      return;
    }
    try {
      const [dash, studentList, teacherList] = await Promise.all([
        getSchoolAdminDashboard(schoolId),
        listSchoolStudents(schoolId, searchQuery, membershipFilter),
        canManagePersonnel ? listSchoolTeachers(schoolId) : Promise.resolve([]),
      ]);

      if (request !== loadRequest.current) return;
      setDashboardData(dash);
      setStudents(studentList);
      setTeachers(teacherList);
    } catch (err) {
      if (request !== loadRequest.current) return;
      setDashboardData(null);
      setStudents([]);
      setTeachers([]);
      setLoadError(err.message || 'ไม่สามารถโหลดข้อมูลที่ยืนยันจากเซิร์ฟเวอร์ได้');
      showToast(`⚠️ เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}`);
    } finally {
      if (request === loadRequest.current) setLoading(false);
    }
  }, [schoolId, searchQuery, membershipFilter, showToast, canManagePersonnel, currentStaff]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Seat metrics from verified dashboard or student count
  const activeSeats = dashboardData?.active_seats ?? null;
  const seatLimit = dashboardData?.seat_limit ?? null;
  const availableSeats = activeSeats !== null && seatLimit !== null ? Math.max(0, seatLimit - activeSeats) : null;
  const inactiveMemberships = dashboardData?.inactive_memberships ?? null;
  const subStatus = dashboardData?.subscription?.status ?? null;
  const planName = dashboardData?.plan?.name ?? null;
  const verifiedSchoolCode = dashboardData?.school?.status === 'active' ? dashboardData.school.code : null;
  const entryUrl = verifiedSchoolCode ? schoolEntryUrl(window.location.origin, verifiedSchoolCode) : null;
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let active = true;
    setQrDataUrl('');
    if (entryUrl) {
      QRCode.toDataURL(entryUrl, { width: 224, margin: 2, errorCorrectionLevel: 'M' })
        .then(dataUrl => { if (active) setQrDataUrl(dataUrl); })
        .catch(() => { if (active) setQrDataUrl(''); });
    }
    return () => { active = false; };
  }, [entryUrl]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = !searchQuery.trim() ||
        (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.student_id && s.student_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.class && s.class.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.number && s.number.toString().includes(searchQuery));
      const matchFilter = membershipFilter === 'all' || s.membership_status === membershipFilter;
      return matchSearch && matchFilter && (classFilter === 'all' || s.class === classFilter);
    });
  }, [students, searchQuery, membershipFilter, classFilter]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  // Actions
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      student_id: student.student_id || '',
      name: student.name || '',
      class: student.class || '',
      number: student.number || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.student_id.trim() || !editForm.name.trim() || !editForm.class.trim() || !editForm.number.trim()) {
      showToast('⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    setActionLoading(true);
    try {
      await updateStudentProfile(schoolId, editingStudent.identity_account_id, {
        student_id: editForm.student_id.trim().toUpperCase(),
        name: editForm.name.trim(),
        class: editForm.class.trim(),
        number: editForm.number.trim(),
      }, generateRequestId());
      showToast('✅ แก้ไขข้อมูลนักเรียนเรียบร้อย');
      setShowEditModal(false);
      loadData();
      onChanged?.();
    } catch (err) {
      showToast(`❌ แก้ไขข้อมูลไม่สำเร็จ: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSeat = async (student) => {
    const isCurrentlyActive = student.membership_status === 'ACTIVE';
    const action = isCurrentlyActive ? 'DEACTIVATE' : 'REACTIVATE';
    const confirmMsg = isCurrentlyActive
      ? `ต้องการนำ ${student.name} (${student.student_id}) ออกจากการใช้งานหรือไม่? ระบบจะปิดที่นั่ง ตัดสิทธิ์เข้าสู่ระบบ และเก็บประวัติไว้ สามารถเปิดใช้งานใหม่ภายหลังได้`
      : `ต้องการเปิดใช้งานที่นั่งให้ ${student.name} (${student.student_id}) หรือไม่? (ที่นั่งว่างคงเหลือ: ${availableSeats} ที่)`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const result = await changeStudentSeat(
        schoolId,
        student.identity_account_id,
        action,
        generateRequestId(),
        'school_admin_request'
      );
      if (result.ok) {
        showToast(action === 'DEACTIVATE' ? '⏸️ ปิดสิทธิ์และคืนที่นั่งแล้ว เก็บประวัติไว้' : '🟢 เปิดใช้งานที่นั่งสำเร็จ');
        loadData();
      onChanged?.();
      } else {
        showToast(`⚠️ การดำเนินการถูกปฏิเสธ: ${result.code}`);
      }
    } catch (err) {
      showToast(`❌ ดำเนินการไม่สำเร็จ: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenHistory = async (student) => {
    setHistoryStudent(student);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const history = await getStudentSeatHistory(schoolId, student.learner_id);
      setSeatHistory(history);
    } catch (err) {
      showToast(`⚠️ โหลดประวัติไม่สำเร็จ: ${err.message}`);
      setSeatHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Bulk Import Handlers
  const handleParseImport = (text) => {
    setImportText(text);
    const parsed = parseStudentCSV(text);
    const validated = validateStudentImportBatch(parsed, students, seatLimit, activeSeats ?? 0);
    setImportBatch(validated);
  };

  const handleCommitImport = async () => {
    if (!importBatch || !importBatch.canCommit) return;
    setActionLoading(true);
    try {
      const payloadRows = importBatch.rows.map((r) => ({
        student_id: r.student_id,
        name: r.name,
        class: r.class,
        number: r.number,
      }));
      await createStudentsBulk(schoolId, payloadRows, generateRequestId());
      showToast(`🎉 นำเข้านักเรียนสำเร็จ ${payloadRows.length} คน (All-or-nothing Atomic Commit)`);
      setShowImportModal(false);
      setImportText('');
      setImportBatch(null);
      loadData();
      onChanged?.();
    } catch (err) {
      showToast(`❌ นำเข้าไม่สำเร็จ: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Teacher Handlers
  const handleSaveTeacherName = async (teacher) => {
    if (!teacherName.trim()) {
      showToast('กรุณาระบุชื่อและนามสกุลครู');
      return;
    }
    setActionLoading(true);
    try {
      await updateSchoolTeacherName(schoolId, teacher.user_id, teacherName);
      setEditingTeacherId(null);
      showToast('บันทึกชื่อครูแล้ว');
      await loadData();
    } catch (err) {
      showToast(`บันทึกชื่อครูไม่สำเร็จ: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTeacher = async (teacher) => {
    const willEnable = teacher.status !== 'active';
    if (teacher.user_id === currentStaff?.user_id) {
      showToast('⚠️ คุณไม่สามารถระงับสิทธิ์ของตนเองได้');
      return;
    }
    if (teacher.role === 'school_admin') {
      showToast('⚠️ ไม่สามารถแก้ไขสถานะของผู้ดูแลโรงเรียน (School Admin) ผ่านส่วนนี้ได้');
      return;
    }
    const msg = willEnable
      ? `ต้องการเปิดใช้งานครู ${teacher.email || teacher.user_id} หรือไม่?`
      : `ต้องการระงับการเข้าถึงของครู ${teacher.email || teacher.user_id} ชั่วคราวหรือไม่?`;
    if (!window.confirm(msg)) return;

    setActionLoading(true);
    try {
      await setTeacherMembership(schoolId, teacher.user_id, willEnable, generateRequestId());
      showToast(willEnable ? '🟢 เปิดสิทธิ์ครูผู้สอนเรียบร้อย' : '⏸️ ระงับสิทธิ์ครูผู้สอนแล้ว');
      loadData();
      onChanged?.();
    } catch (err) {
      showToast(`❌ แก้ไขสิทธิ์ครูไม่สำเร็จ: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!teacherUserId.trim()) {
      showToast('⚠️ กรุณาระบุ Auth User ID ของครู');
      return;
    }
    setActionLoading(true);
    try {
      await setTeacherMembership(schoolId, teacherUserId.trim(), true, generateRequestId());
      showToast('🎉 มอบหมายสิทธิ์ครูผู้สอนประจำโรงเรียนสำเร็จ');
      setShowAddTeacherModal(false);
      setTeacherUserId('');
      loadData();
      onChanged?.();
    } catch (err) {
      showToast(`❌ มอบหมายสิทธิ์ไม่สำเร็จ: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddStudent = async event => {
    event.preventDefault();
    const batch=validateStudentImportBatch([newStudent],students,seatLimit,activeSeats ?? 0);
    if (!batch.canCommit) return showToast('กรุณาตรวจรหัส ชื่อ ชั้น เลขที่ และจำนวนที่นั่งว่าง');
    setActionLoading(true);
    try {
      await createStudentsBulk(schoolId,[newStudent],generateRequestId());
      setNewStudent(null);showToast('เพิ่มนักเรียนแล้ว ออก PIN ใหม่เพื่อเปิดใช้งานล็อกอิน');
      loadData();onChanged?.();
    } catch(error) {showToast(error.message || 'เพิ่มนักเรียนไม่สำเร็จ');}
    finally {setActionLoading(false);}
  };

  const handleResetPin = async event => {
    event.preventDefault();setPinError('');
    if (!/^\d{6}$/.test(newPin) || newPin !== confirmPin) return setPinError('กรอก PIN ใหม่ 6 หลักให้ตรงกันทั้งสองช่อง');
    setActionLoading(true);
    try {
      await resetSchoolStudentPin(schoolId,pinStudent.identity_account_id,newPin,resetRequest.current);
      setNewPin('');setConfirmPin('');setPinStudent(null);
      showToast('ออก PIN ใหม่สำเร็จ นักเรียนใช้รหัสใหม่เข้าสู่ระบบได้ทันที');loadData();
    } catch(error) {setPinError(error.message);}
    finally {setActionLoading(false);}
  };

  const printSchoolEntry = () => {
    const popup=window.open('','_blank','width=640,height=800');
    if (!popup) return showToast('กรุณาอนุญาตหน้าต่างใหม่เพื่อพิมพ์ QR');
    popup.opener=null;
    popup.document.title='ทางเข้าเรียน '+schoolName;
    const heading=popup.document.createElement('h1');heading.textContent=schoolName;
    const code=popup.document.createElement('p');code.textContent='รหัสโรงเรียน: '+verifiedSchoolCode;
    const link=popup.document.createElement('p');link.textContent=entryUrl;
    popup.document.body.append(heading,code,link);
    const img=popup.document.createElement('img');img.width=280;img.alt='QR ทางเข้าโรงเรียน';
    img.onload=()=>{popup.focus();popup.print();};img.src=qrDataUrl;popup.document.body.append(img);
  };

  return (
    <div className={embedded ? 'space-y-4' : `min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100 teacher-dark' : 'bg-slate-100 text-slate-800 teacher-light'} flex flex-col font-sans transition-colors duration-300`}>
      {/* ── Top Header ────────────────────────────────────────────── */}
      {!embedded && <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(isPlatformAdmin ? 'super-admin' : 'teacher')}
            className="min-h-11 min-w-11 p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
            title={isPlatformAdmin ? 'กลับสู่ Super Admin Hub' : 'กลับสู่ Teacher Hub'}
            aria-label={isPlatformAdmin ? 'กลับสู่ Super Admin Hub' : 'กลับสู่ Teacher Hub'}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20">
            <Shield className="text-white" size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-white text-base sm:text-lg leading-tight">
                {schoolName}
              </h1>
              <span className="font-mono text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md">
                {schoolCode}
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                School Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">ระบบบริหารจัดการโควตานักเรียน & สิทธิ์บุคลากรประจำโรงเรียน</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-white/5 transition-all text-xs flex items-center gap-1.5"
            title="รีเฟรชข้อมูลล่าสุด"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 bg-slate-800 text-amber-300 border-amber-500/30"
          >
            <span><UIIconText value={theme === 'dark' ? '🌙' : '☀️'} /></span>
            <span className="hidden sm:inline">{theme === 'dark' ? 'โหมดมืด' : 'โหมดขาว'}</span>
          </button>

          {/* Switch to Teacher Hub */}
          {!isPlatformAdmin && <button
            onClick={() => navigate('teacher')}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5"
          >
            <GraduationCap size={15} />
            <span className="hidden sm:inline">Teacher Hub</span>
          </button>}

          {/* Super Admin Backlink if platform admin */}
          {isPlatformAdmin && (
            <button
              onClick={() => navigate('super-admin')}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40 text-xs font-bold flex items-center gap-1"
            >
              <span><UIIcon value={"👑"} /></span>
              <span className="hidden sm:inline">Super Admin Hub</span>
            </button>
          )}
        </div>
      </header>}

      {/* ── Main Container ────────────────────────────────────────── */}
      <ContentTag className={embedded ? "space-y-5" : "flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6"}>

        {loadError && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200" role="alert">
            ข้อมูลแพ็กเกจและสิทธิ์ยังไม่พร้อมใช้งาน: {loadError}
          </div>
        )}

        {entryUrl && (
          <section className="rounded-2xl border border-sky-500/30 bg-slate-900 p-4 sm:p-5" aria-label="ลิงก์เข้าเรียนของโรงเรียน">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-black text-white">ทางเข้าเรียนของโรงเรียน</h2>
                <p className="mt-1 text-xs text-slate-300">ส่งลิงก์หรือ QR ให้นักเรียนเพื่อเปิดหน้าล็อกอินของโรงเรียน ยังต้องใช้รหัสนักเรียนและ PIN</p>
                <p className="mt-2 break-all font-mono text-xs text-sky-300">{entryUrl}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => navigator.clipboard.writeText(entryUrl).then(() => showToast('คัดลอกลิงก์แล้ว')).catch(() => showToast('คัดลอกไม่สำเร็จ'))}
                    className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-500">คัดลอกลิงก์</button>
                  {qrDataUrl && <a href={qrDataUrl} download={`eq-school-${verifiedSchoolCode}.png`}
                    className="rounded-xl border border-sky-500/40 px-3 py-2 text-xs font-bold text-sky-200 hover:bg-slate-800">ดาวน์โหลด QR</a>}
                  {qrDataUrl && <button type="button" onClick={printSchoolEntry} className="rounded-xl bg-slate-700 px-3 py-2 text-xs font-bold text-white">พิมพ์ QR / ทางเข้าห้องเรียน</button>}
                  <a href={entryUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-slate-700 px-3 py-2 text-xs font-bold text-white">เปิดหน้าห้องเรียน</a>
                </div>
              </div>
              {qrDataUrl ? <img src={qrDataUrl} alt={`QR สำหรับเปิดหน้าล็อกอินโรงเรียน ${dashboardData.school.name}`} width="152" height="152" className="rounded-xl bg-white p-2" />
                : <p className="text-xs text-slate-400">QR ยังไม่พร้อมใช้งาน</p>}
            </div>
          </section>
        )}

        {/* ── Top Verified Subscription & Quota Stat Cards ────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Seats / Limit */}
          <div className="glass-card-dark p-4 border border-sky-500/20 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sky-400 font-bold text-xs flex items-center gap-1">
                <UserCheck size={16} /> ที่นั่งกำลังใช้งาน
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                โควตา {seatLimit ?? 'ไม่พร้อมใช้งาน'}
              </span>
            </div>
            <div className="text-3xl font-black text-white">
              {activeSeats ?? '—'} <span className="text-slate-500 text-sm font-normal">/ {seatLimit ?? '—'}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full ${
                  activeSeats !== null && seatLimit !== null && activeSeats >= seatLimit ? 'bg-rose-500' :
                    activeSeats !== null && seatLimit ? (activeSeats / seatLimit) >= 0.8 ? 'bg-amber-400' : 'bg-sky-400' : 'bg-slate-600'
                }`}
                style={{ width: activeSeats !== null && seatLimit !== null ? `${Math.min(100, (activeSeats / Math.max(1, seatLimit)) * 100)}%` : '0%' }}
              />
            </div>
          </div>

          {/* Available Seats */}
          <div className="glass-card-dark p-4 border border-emerald-500/20 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <Users size={16} /> ที่นั่งว่างคงเหลือ
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                พร้อมจัดสรร
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-400">{availableSeats ?? '—'}</div>
            <div className="text-xs text-slate-400 mt-1">{availableSeats === null ? 'ยังไม่มีข้อมูลที่ยืนยันจากเซิร์ฟเวอร์' : 'ที่นั่งสามารถรับนักเรียนเพิ่มได้ทันที'}</div>
          </div>

          {/* Inactive Memberships */}
          <div className="glass-card-dark p-4 border border-slate-700 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-bold text-xs flex items-center gap-1">
                <UserX size={16} /> บัญชีที่ปิดใช้งาน
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                คืนที่นั่งแล้ว
              </span>
            </div>
            <div className="text-3xl font-black text-slate-300">{inactiveMemberships ?? '—'}</div>
            <div className="text-xs text-slate-400 mt-1">นักเรียนที่ปิดสิทธิ์ สามารถเปิดใหม่ได้</div>
          </div>

          {/* Subscription & Plan Status */}
          <div className="glass-card-dark p-4 border border-amber-500/20 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                <Building size={16} /> แพ็กเกจ & สัญญา
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                subStatus === 'active'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}>
                {subStatus ?? 'unavailable'}
              </span>
            </div>
            <div className="text-xl font-black text-white truncate">{planName ?? 'ไม่พร้อมใช้งาน'}</div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {dashboardData?.subscription?.ends_at
                ? `หมดอายุ: ${new Date(dashboardData.subscription.ends_at).toLocaleDateString('th-TH')}`
                : 'ยังไม่มีข้อมูลสัญญาที่ตรวจสอบได้'}
            </div>
          </div>
        </div>

        {/* ── Tabs Navigation Bar ──────────────────────────────────── */}
        <div className="glass-card-dark p-2 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-white/5">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'students'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users size={16} />
              <span>การจัดการนักเรียน & ที่นั่ง ({students.length})</span>
            </button>
            {canManagePersonnel && <button
              onClick={() => setActiveTab('teachers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'teachers'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GraduationCap size={16} />
              <span>ครูผู้สอนประจำโรงเรียน ({teachers.length})</span>
            </button>}
          </div>

          {activeTab === 'students' && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setNewStudent({student_id:'',name:'',class:'',number:''})} className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white">เพิ่มนักเรียน</button>
            </div>
          )}

          {canManagePersonnel && activeTab === 'teachers' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
              >
                <Plus size={14} />
                <span>เพิ่มครูผู้สอน</span>
              </button>
            </div>
          )}
        </div>

        {/* ── TAB 1: Student Management ────────────────────────────── */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <section aria-labelledby="student-import-tools-title" className="rounded-2xl border border-emerald-500/25 bg-slate-900/70 p-4 md:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0"><h3 id="student-import-tools-title" className="flex items-center gap-2 text-sm font-bold text-white"><Upload size={17} className="text-emerald-400" aria-hidden="true" /> นำเข้ารายชื่อนักเรียน</h3><p className="mt-1 text-xs leading-relaxed text-slate-400">ดาวน์โหลดแบบฟอร์ม กรอกข้อมูล แล้วนำไฟล์กลับมาตรวจสอบก่อนนำเข้า</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { downloadStudentImportTemplate('แบบฟอร์มนำเข้านักเรียน_EnglishQuest_มาตรฐาน.csv', 'standard'); showToast('ดาวน์โหลดแบบฟอร์มชื่อรวมแล้ว'); }} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3 text-xs font-bold text-slate-100 hover:bg-slate-700"><Download size={15} aria-hidden="true" /> แบบฟอร์มชื่อรวม</button>
                  <button type="button" onClick={() => { downloadStudentImportTemplate('แบบฟอร์มนำเข้านักเรียน_EnglishQuest_แยกคำนำหน้า.csv', 'detailed'); showToast('ดาวน์โหลดแบบฟอร์มแยกชื่อแล้ว'); }} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3 text-xs font-bold text-slate-100 hover:bg-slate-700"><Download size={15} aria-hidden="true" /> แบบฟอร์มแยกชื่อ</button>
                  <button type="button" onClick={() => setShowImportModal(true)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-emerald-500 px-4 text-xs font-black text-slate-950 hover:bg-emerald-400"><Upload size={15} aria-hidden="true" /> นำเข้า Excel / CSV</button>
                </div>
              </div>
            </section>
            {/* Search & Filter Toolbar */}
            <div className="glass-card-dark p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 border border-white/5">
              <div className="relative w-full md:w-96">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, รหัสนักเรียน (STD-xxx), ห้องเรียน..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs">
                    ✕
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                <label className="text-xs text-slate-300">ห้องเรียน <select aria-label="กรองห้องเรียน" value={classFilter} onChange={e=>{setClassFilter(e.target.value);setCurrentPage(1);}} className="rounded-lg bg-slate-800 px-2 py-2"><option value="all">ทุกห้อง</option>{[...new Set(students.map(s=>s.class).filter(Boolean))].sort().map(c=><option key={c} value={c}>{c}</option>)}</select></label>
                <span className="text-xs text-slate-400 font-medium">สถานะที่นั่ง:</span>
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'ACTIVE', label: '🟢 ใช้งานอยู่ (Active)' },
                  { id: 'INACTIVE', label: '⏸️ ปิดใช้งาน (Inactive)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { setMembershipFilter(f.id); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      membershipFilter === f.id
                        ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Students Table */}
            <div className="glass-card-dark rounded-2xl overflow-hidden border border-white/10 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider bg-slate-950/70">
                      <th className="py-3 px-4">รหัสนักเรียน (School-scoped)</th>
                      <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                      <th className="py-3 px-4 text-center">ชั้น / ห้อง</th>
                      <th className="py-3 px-4 text-center">เลขที่</th>
                      <th className="py-3 px-4 text-center">สถานะที่นั่ง</th>
                      <th className="py-3 px-4 text-center">สถานะบัญชี</th>
                      <th className="py-3 px-4 text-right">เครื่องมือ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-slate-500">
                          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-sky-400" />
                          <p>กำลังโหลดข้อมูลนักเรียน...</p>
                        </td>
                      </tr>
                    ) : paginatedStudents.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-slate-500">
                          <Users size={32} className="mx-auto mb-2 text-slate-600" />
                          <p className="font-bold">ไม่พบข้อมูลนักเรียนตามเงื่อนไข</p>
                          <button
                            onClick={() => setShowImportModal(true)}
                            className="mt-2 text-sky-400 hover:underline font-bold text-xs"
                          >
                            + นำเข้านักเรียนใหม่ผ่าน Excel/CSV
                          </button>
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((student) => {
                        const isActive = student.membership_status === 'ACTIVE';
                        return (
                          <tr key={student.identity_account_id || student.student_id} className="hover:bg-white/[0.04] transition-colors">
                            {/* Student ID */}
                            <td className="py-3 px-4 font-mono font-bold text-sky-300">
                              <span className="bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                                {student.student_id}
                              </span>
                            </td>

                            {/* Name */}
                            <td className="py-3 px-4 font-medium text-white">
                              {student.name}
                            </td>

                            {/* Class */}
                            <td className="py-3 px-4 text-center text-slate-300">
                              {student.class}
                            </td>

                            {/* Number */}
                            <td className="py-3 px-4 text-center text-slate-300 font-mono">
                              {student.number}
                            </td>

                            {/* Seat Status */}
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-slate-700/50 text-slate-400 border-slate-600'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                {isActive ? 'ACTIVE (ใช้ที่นั่ง)' : 'INACTIVE (ปิด)'}
                              </span>
                            </td>

                            {/* Account Status */}
                            <td className="py-3 px-4 text-center text-slate-400 text-[11px] font-mono">
                              {student.account_status || 'verified'}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Seat Toggle: Deactivate / Reactivate */}
                                <button
                                  onClick={() => handleToggleSeat(student)}
                                  disabled={actionLoading || (!isActive && availableSeats <= 0)}
                                  className={`p-1.5 rounded-lg border text-xs transition-all ${
                                    isActive
                                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                                      : availableSeats > 0
                                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                                  }`}
                                  aria-label={isActive ? `นำ ${student.name} ออกจากการใช้งาน` : `เปิดใช้งาน ${student.name} อีกครั้ง`}
                                  title={isActive ? 'นำออกจากการใช้งาน (เก็บประวัติ)' : (availableSeats > 0 ? 'เปิดการใช้งานที่นั่ง (ดึงโควตา)' : 'โควตาเต็ม ไม่สามารถเปิดได้')}
                                >
                                  {isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                </button>

                                <button type="button" aria-label={`ออก PIN ใหม่ให้ ${student.name}`} onClick={()=>{setPinStudent(student);setNewPin('');setConfirmPin('');setPinError('');resetRequest.current=generateRequestId();}} className="p-2 text-amber-300" title="ออก PIN ใหม่"><KeyRound size={16}/></button>
                                {/* Edit Allowed Profile Fields */}
                                <button
                                  onClick={() => handleOpenEdit(student)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-white/10 text-xs transition-all"
                                  title="แก้ไขข้อมูลโปรไฟล์ (รหัส, ชื่อ, ชั้น, เลขที่)"
                                >
                                  <Edit size={14} />
                                </button>

                                {/* Seat Audit History */}
                                <button
                                  onClick={() => handleOpenHistory(student)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 rounded-lg border border-sky-500/30 text-xs transition-all"
                                  title="ดูประวัติการเปลี่ยนแปลงที่นั่ง (Audit History)"
                                >
                                  <History size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
                  <div>
                    แสดง {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredStudents.length)} จากทั้งหมด {filteredStudents.length} คน
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg"
                    >
                      ก่อนหน้า
                    </button>
                    <span className="px-3 py-1 font-bold text-white bg-slate-800/80 rounded-lg">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: Teacher Management ────────────────────────────── */}
        {canManagePersonnel && activeTab === 'teachers' && (
          <div className="space-y-4">
            <div className="glass-card-dark rounded-2xl overflow-hidden border border-white/10 shadow-xl">
              <div className="p-4 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">รายชื่อครูผู้สอนที่ได้รับมอบหมายสิทธิ์</h3>
                  <p className="text-xs text-slate-400">ควบคุมสิทธิ์การเข้าถึงข้อมูลนักเรียนและแดชบอร์ดเฉพาะโรงเรียนนี้</p>
                </div>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider bg-slate-950/70">
                    <th className="py-3 px-4">ชื่อ–นามสกุล / อีเมล</th>
                    <th className="py-3 px-4 text-center">บทบาท (Role)</th>
                    <th className="py-3 px-4 text-center">สถานะสิทธิ์</th>
                    <th className="py-3 px-4 text-center">วันที่เพิ่มเข้าสู่ระบบ</th>
                    <th className="py-3 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        <GraduationCap size={32} className="mx-auto mb-2 text-slate-600" />
                        <p className="font-bold">ยังไม่มีรายชื่อครูผู้สอนอื่นในโรงเรียนนี้</p>
                      </td>
                    </tr>
                  ) : (
                    teachers.map((t) => {
                      const isSelf = t.user_id === currentStaff?.user_id;
                      const isSchoolAdmin = t.role === 'school_admin';
                      const isActive = t.status === 'active';
                      return (
                        <tr key={t.user_id} className="hover:bg-white/[0.04] transition-colors">
                          <td className="py-3 px-4 font-medium text-white">
                            {editingTeacherId === t.user_id ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <input aria-label="ชื่อและนามสกุลครู" maxLength={200} value={teacherName} onChange={(event) => setTeacherName(event.target.value)} className="min-w-0 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-white" />
                                <button type="button" disabled={actionLoading} onClick={() => handleSaveTeacherName(t)} className="text-emerald-300">บันทึก</button>
                                <button type="button" disabled={actionLoading} onClick={() => setEditingTeacherId(null)} className="text-slate-400">ยกเลิก</button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                <span>{t.teacher_name || 'ยังไม่ได้ระบุชื่อ–นามสกุล'}</span>
                                <button type="button" onClick={() => { setEditingTeacherId(t.user_id); setTeacherName(t.teacher_name || ''); }} className="text-sky-400 hover:text-sky-300">{t.teacher_name ? 'แก้ไขชื่อ' : 'เพิ่มชื่อ'}</button>
                              </div>
                            )}
                            <div className="mt-1 font-mono text-slate-400">{t.email || t.user_id}</div>
                            {isSelf && <span className="text-[10px] text-sky-400 font-bold">(บัญชีของคุณ)</span>}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              isSchoolAdmin
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}>
                              {t.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            }`}>
                              {isActive ? 'Active (ใช้งานได้)' : 'Suspended (ระงับ)'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                            {t.created_at ? new Date(t.created_at).toLocaleDateString('th-TH') : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleToggleTeacher(t)}
                              disabled={actionLoading || isSelf || isSchoolAdmin}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                                isSelf || isSchoolAdmin
                                  ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                                  : isActive
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                              title={isSelf ? 'ไม่สามารถเปลี่ยนสิทธิ์ของตนเองได้' : isSchoolAdmin ? 'ไม่สามารถลดสิทธิ์ School Admin ได้' : (isActive ? 'ระงับสิทธิ์ครู' : 'เปิดสิทธิ์ครู')}
                            >
                              {isActive ? 'ระงับสิทธิ์' : 'เปิดสิทธิ์'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </ContentTag>

      {newStudent && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
        <form onSubmit={handleAddStudent} role="dialog" aria-modal="true" aria-labelledby="new-school-student-title" className="w-full max-w-md space-y-4 rounded-2xl bg-slate-900 p-6 text-white">
          <h2 id="new-school-student-title" className="text-lg font-bold">เพิ่มนักเรียน</h2>
          {Object.entries({student_id:'รหัสนักเรียน',name:'ชื่อ-นามสกุล',class:'ชั้น / ห้องเรียน',number:'เลขที่'}).map(([key,label])=><label key={key} className="block text-sm">{label}<input required value={newStudent[key]} maxLength={key==='name'?120:32} onChange={e=>setNewStudent({...newStudent,[key]:e.target.value})} className="mt-1 block w-full rounded-lg bg-slate-800 p-3" /></label>)}
          <div className="flex gap-3"><button type="button" disabled={actionLoading} onClick={()=>setNewStudent(null)} className="rounded-lg bg-slate-700 px-4 py-3">ยกเลิก</button><button disabled={actionLoading} className="rounded-lg bg-sky-600 px-4 py-3">{actionLoading?'กำลังเพิ่ม...':'บันทึกนักเรียน'}</button></div>
        </form>
      </div>}
      {pinStudent && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
        <form onSubmit={handleResetPin} role="dialog" aria-modal="true" aria-labelledby="school-pin-title" className="w-full max-w-md space-y-4 rounded-2xl bg-slate-900 p-6 text-white">
          <h2 id="school-pin-title" className="text-lg font-bold">ออก PIN ใหม่</h2>
          <p>{pinStudent.name} · {pinStudent.student_id}</p><p className="text-sm text-slate-300">PIN เดิมจะใช้ไม่ได้ ส่งรหัสใหม่ให้นักเรียนโดยตรง ระบบจะไม่แสดง PIN เดิม</p>
          <label className="block text-sm">PIN ใหม่<input type="password" autoComplete="new-password" inputMode="numeric" maxLength={6} required value={newPin} onChange={e=>{setNewPin(e.target.value);resetRequest.current=generateRequestId();}} disabled={actionLoading} className="mt-1 block w-full rounded-lg bg-slate-800 p-3" /></label>
          <label className="block text-sm">ยืนยัน PIN ใหม่<input type="password" autoComplete="new-password" inputMode="numeric" maxLength={6} required value={confirmPin} onChange={e=>setConfirmPin(e.target.value)} disabled={actionLoading} className="mt-1 block w-full rounded-lg bg-slate-800 p-3" /></label>
          {pinError && <p role="alert" className="text-rose-300">{pinError}</p>}
          <div className="flex gap-3"><button type="button" disabled={actionLoading} onClick={()=>{setPinStudent(null);setNewPin('');setConfirmPin('');}} className="rounded-lg bg-slate-700 px-4 py-3">ยกเลิก</button><button disabled={actionLoading} className="rounded-lg bg-amber-600 px-4 py-3">{actionLoading?'กำลังออก PIN...':'ยืนยันออก PIN ใหม่'}</button></div>
        </form>
      </div>}

      {/* ── Modal: Edit Student Allowed Profile Fields ────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card-dark border border-sky-500/30 w-full max-w-md p-6 rounded-3xl shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit size={18} className="text-sky-400" />
                <span>แก้ไขข้อมูลโปรไฟล์นักเรียน</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  รหัสนักเรียน (Student ID) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.student_id}
                  onChange={(e) => setEditForm({ ...editForm, student_id: e.target.value })}
                  placeholder="เช่น STD-001, 65001"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">ใช้ตัวอักษรภาษาอังกฤษ A-Z, ตัวเลข 0-9, _, - สูงสุด 32 ตัวอักษร</p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  ชื่อ-นามสกุล <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ชั้นเรียน / ห้อง <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.class}
                    onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
                    placeholder="เช่น 6/1, ป.6/2"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    เลขที่ <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.number}
                    onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                    placeholder="เช่น 1, 15"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-300 text-[11px] leading-relaxed">
                ℹ️ การแก้ไขโปรไฟล์อนุญาตเฉพาะข้อมูลพื้นฐาน (รหัส, ชื่อ, ชั้น, เลขที่) ไม่กระทบต่อผลคะแนนสอบ XP หรือประวัติการเรียนเดิม
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl transition-all shadow-md shadow-sky-500/20"
                >
                  {actionLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Student Seat Audit History ─────────────────────── */}
      {showHistoryModal && historyStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card-dark border border-sky-500/30 w-full max-w-lg p-6 rounded-3xl shadow-2xl text-white space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <History size={18} className="text-sky-400" />
                <span>ประวัติที่นั่ง: {historyStudent.name}</span>
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="text-xs text-slate-400 shrink-0">
              รหัสนักเรียน: <span className="text-sky-300 font-mono font-bold">{historyStudent.student_id}</span> | ชั้น {historyStudent.class} เลขที่ {historyStudent.number}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {historyLoading ? (
                <div className="py-8 text-center text-slate-400">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-sky-400" />
                  กำลังโหลดบันทึก Audit...
                </div>
              ) : seatHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  ไม่พบประวัติการเปลี่ยนสถานะที่นั่ง
                </div>
              ) : (
                seatHistory.map((ev, i) => (
                  <div key={ev.seat_event_id || i} className="p-3 bg-slate-900/80 rounded-xl border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-md ${
                        ev.event_type.includes('ACTIVAT')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {ev.event_type}
                      </span>
                      <span className="text-slate-400 text-[10px] flex items-center gap-1 font-mono">
                        <Clock size={12} />
                        {ev.occurred_at ? new Date(ev.occurred_at).toLocaleString('th-TH') : '-'}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      ผลลัพธ์: <span className="font-bold text-white">{ev.outcome}</span> ({ev.result_code})
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>สถานะ: {ev.membership_status_before || 'NONE'} → {ev.membership_status_after || 'NONE'}</span>
                      <span>ที่นั่ง Active รวม: {ev.active_seats_after} / {ev.seat_limit || '-'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors shrink-0"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: Bulk Import Excel/CSV with Preview & Capacity ──── */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div role="dialog" aria-modal="true" aria-labelledby="student-import-title" className="glass-card-dark border border-emerald-500/30 w-full max-w-2xl p-6 rounded-3xl shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Upload size={18} className="text-emerald-400" />
                <span id="student-import-title">นำเข้านักเรียนผ่าน Excel / CSV (Bulk Import)</span>
              </h3>
              <button onClick={() => { setShowImportModal(false); setImportBatch(null); }} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
              {/* Instructions */}
              <div className="p-3 bg-slate-900/80 border border-white/10 rounded-2xl space-y-1 text-slate-300 text-[11px]">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>รูปแบบหัวตารางที่รองรับ (Header Columns):</span>
                </div>
                <p className="font-mono text-emerald-300">student_id, name, class, number</p>
                <p className="text-slate-400">หรือภาษาไทย: <span className="font-mono">รหัสนักเรียน, ชื่อ-นามสกุล, ชั้น, เลขที่</span></p>
                <p className="text-slate-400">หากแยกคอลัมน์ ใช้หัวข้อ คำนำหน้า, ชื่อ และ นามสกุล ระบบจะรวมเป็นชื่อที่แสดง โปรดตรวจตัวอย่างก่อนนำเข้า</p>
              </div>

              <label className="block text-sm font-bold">เลือกไฟล์ CSV / Excel (.xlsx)
                <input type="file" accept=".csv,.tsv,.xlsx" className="mt-2 block w-full text-xs" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{handleParseImport(await readStudentImportFile(file));}catch(error){showToast(error.message);}e.target.value='';}} />
              </label>
              {/* Paste or Type area */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  วางข้อมูลแบบข้อความ (CSV / Tab-delimited จาก Excel):
                </label>
                <textarea
                  rows="4"
                  value={importText}
                  onChange={(e) => handleParseImport(e.target.value)}
                  placeholder={`student_id,name,class,number\nSTD01,ด.ช.สมชาย ใจกล้า,6/1,1\nSTD02,ด.ญ.สมหญิง สมบูรณ์,6/1,2`}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 font-mono text-[11px] text-white focus:border-emerald-400 focus:outline-none resize-none"
                />
              </div>

              {/* Import Batch Validation Summary */}
              {importBatch && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-white/5 text-center">
                      <div className="text-slate-400 text-[10px]">จำนวนที่พบ</div>
                      <div className="text-lg font-black text-white">{importBatch.totalRows} คน</div>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-center ${importBatch.errorCount > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'}`}>
                      <div className="text-[10px]">ตรวจสอบผ่าน</div>
                      <div className="text-lg font-black">{importBatch.validCount} / {importBatch.totalRows}</div>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-center ${importBatch.exceedsCapacity ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-sky-500/10 border-sky-500/20 text-sky-300'}`}>
                      <div className="text-[10px]">ที่นั่งคงเหลือ</div>
                      <div className="text-lg font-black">{importBatch.availableSeats} ที่</div>
                    </div>
                  </div>

                  {/* Quota Exceeded Alert */}
                  {importBatch.exceedsCapacity && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                      <AlertTriangle size={18} className="shrink-0" />
                      <div>
                        <strong>จำนวนนักเรียนเกินโควตาที่นั่งคงเหลือ:</strong> ต้องการ {importBatch.validCount} ที่นั่ง แต่มีว่างเพียง {importBatch.availableSeats} ที่ กรุณาลดจำนวนหรือปิดการใช้งานนักเรียนที่ไม่ได้ใช้งานก่อน
                      </div>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-950 text-slate-400 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">รหัส</th>
                          <th className="py-2 px-3">ชื่อ</th>
                          <th className="py-2 px-3">ชั้น/เลขที่</th>
                          <th className="py-2 px-3 text-right">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {importBatch.rows.slice(0,200).map((row, idx) => (
                          <tr key={idx} className={row.isValid ? 'bg-transparent' : 'bg-rose-500/10'}>
                            <td className="py-1.5 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-1.5 px-3 font-mono font-bold text-white">{row.student_id || '-'}</td>
                            <td className="py-1.5 px-3 text-slate-200">{row.name || '-'}</td>
                            <td className="py-1.5 px-3 text-slate-400">{row.class}/{row.number}</td>
                            <td className="py-1.5 px-3 text-right">
                              {row.isValid ? (
                                <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                                  <CheckCircle2 size={12} /> ถูกต้อง
                                </span>
                              ) : (
                                <span className="text-rose-400 font-bold" title={row.errors.join(', ')}>
                                  {row.errors[0]}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Atomic Notice */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] leading-relaxed">
                    <strong>⚠️ นโยบายความปลอดภัยแบบ Atomic All-or-Nothing Commit:</strong> ข้อมูลทั้งหมดจะถูกตรวจสอบและบันทึกพร้อมกันใน 1 Transaction หากมีแถวใดข้อมูลผิดพลาดหรือที่นั่งไม่พอ ระบบจะยกเลิกการบันทึกทั้งหมดเพื่อป้องกันข้อมูลตกค้าง
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setImportBatch(null); }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleCommitImport}
                disabled={actionLoading || !importBatch?.canCommit}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                {actionLoading ? 'กำลังบันทึกข้อมูล...' : `ยืนยันนำเข้า ${importBatch?.validCount || 0} คน`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add Teacher ────────────────────────────────────── */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card-dark border border-sky-500/30 w-full max-w-md p-6 rounded-3xl shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus size={18} className="text-sky-400" />
                <span>มอบหมายสิทธิ์ครูผู้สอน</span>
              </h3>
              <button onClick={() => setShowAddTeacherModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Auth User UUID ของครู <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherUserId}
                  onChange={(e) => setTeacherUserId(e.target.value)}
                  placeholder="เช่น 00000000-0000-0000-0000-000000000000"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  ระบุ UUID บัญชีครูผู้สอนที่ผ่านการยืนยันตัวตนในระบบแล้ว
                </p>
              </div>

              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-300 text-[11px] leading-relaxed">
                ℹ️ ครูที่ได้รับมอบหมายสิทธิ์จะสามารถเข้าดูแดชบอร์ดการเรียนและวิเคราะห์คะแนน O-NET ของนักเรียนเฉพาะในโรงเรียนนี้เท่านั้น
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl transition-all shadow-md shadow-sky-500/20"
                >
                  {actionLoading ? 'กำลังดำเนินการ...' : 'มอบหมายสิทธิ์'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
