import UIIcon, { UIIconText } from './UIIcon';
import { useState, useMemo } from 'react';
import { useApp } from '../App';
import {
  getAllSchools, saveSchool, deleteSchool, updateSchoolStatus,
  setActiveSchoolContext
} from '../utils/schoolStorage';

export default function SuperAdminDashboard() {
  const { navigate, showToast } = useApp();
  const [schools, setSchools] = useState(() => getAllSchools());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTargetSchool, setShareTargetSchool] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('teacher_theme') || 'dark');
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('teacher_theme', next);
  };

  // Form State
  const initialForm = {
    code: '',
    name: '',
    area: '',
    province: '',
    contactTeacher: '',
    email: '',
    phone: '',
    quota: 100,
    status: 'active',
    expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // Filtered Schools
  const filteredSchools = useMemo(() => {
    return schools.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.province && s.province.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.contactTeacher && s.contactTeacher.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [schools, searchQuery, statusFilter]);

  // Aggregate Stats
  const totalSchools = schools.length;
  const activeSchools = schools.filter(s => s.status === 'active').length;
  const totalStudents = schools.reduce((sum, s) => sum + (s.activeStudents || 0), 0);
  const totalCapacity = schools.reduce((sum, s) => sum + (s.quota || 0), 0);
  const nationalAvg = schools.length > 0
    ? Math.round((schools.reduce((sum, s) => sum + (s.avgScore || 0), 0) / schools.length) * 10) / 10
    : 0;

  // Actions
  const handleOpenAdd = () => {
    setEditingSchool(null);
    setFormData(initialForm);
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      code: school.code,
      name: school.name,
      area: school.area || '',
      province: school.province || '',
      contactTeacher: school.contactTeacher || '',
      email: school.email || '',
      phone: school.phone || '',
      quota: school.quota || 100,
      status: school.status || 'active',
      expiresAt: school.expiresAt || '',
      notes: school.notes || ''
    });
    setShowAddEditModal(true);
  };

  const handleSaveSchool = (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      showToast('⚠️ กรุณากรอกรหัสโรงเรียนและชื่อโรงเรียน');
      return;
    }

    const payload = {
      ...(editingSchool ? editingSchool : {}),
      ...formData,
      code: formData.code.trim().toUpperCase(),
      quota: Number(formData.quota) || 100
    };

    const updated = saveSchool(payload);
    setSchools(updated);
    setShowAddEditModal(false);
    showToast(editingSchool ? '✅ บันทึกการแก้ไขเรียบร้อย' : '🎉 เพิ่มโรงเรียนใหม่สำเร็จ');
  };

  const handleDelete = (id) => {
    const updated = deleteSchool(id);
    setSchools(updated);
    setConfirmDeleteId(null);
    showToast('🗑️ ลบโรงเรียนออกจากระบบแล้ว');
  };

  const handleToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const updated = updateSchoolStatus(id, nextStatus);
    setSchools(updated);
    showToast(nextStatus === 'active' ? '🟢 เปิดใช้งานโรงเรียนแล้ว' : '⏸️ ระงับการใช้งานโรงเรียนแล้ว');
  };

  const handleImpersonate = (school) => {
    setActiveSchoolContext(school);
    showToast(`🏫 สลับเข้าสู่มุมมอง: ${school.name}`);
    navigate('teacher');
  };

  const handleOpenShare = (school) => {
    setShareTargetSchool(school);
    setShowShareModal(true);
  };

  const getPortalUrl = (code) => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?school=${code}`;
  };

  const handleCopyLink = (code) => {
    const url = getPortalUrl(code);
    navigator.clipboard.writeText(url);
    showToast('📋 คัดลอกลิงก์ส่งให้โรงเรียนแล้ว!');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100 teacher-dark' : 'bg-slate-100 text-slate-800 teacher-light'} transition-colors duration-300 flex flex-col`}>

      {/* ── Top Navbar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/25">
            <UIIcon value={"👑"} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-white text-base sm:text-lg leading-tight">Super Admin Hub</h1>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Platform Master
              </span>
            </div>
            <p className="text-xs text-slate-400">ระบบควบคุม & บริหารจัดการโรงเรียนทั่วประเทศ</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              theme === 'dark'
                ? 'bg-slate-800/90 text-amber-300 border-amber-500/30 hover:bg-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="เปลี่ยนธีม"
          >
            <span><UIIconText value={theme === 'dark' ? '🌙' : '☀️'} /></span>
            <span className="hidden sm:inline">{theme === 'dark' ? 'โหมดมืด' : 'โหมดขาว'}</span>
          </button>

          {/* Back to Teacher Dashboard */}
          <button
            onClick={() => navigate('teacher')}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <span><UIIcon value={"👩‍🏫"} /></span>
            <span className="hidden sm:inline">กลับ Teacher Hub</span>
          </button>

          {/* Add School Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <span><UIIcon value={"➕"} /></span>
            <span>เพิ่มโรงเรียนใหม่</span>
          </button>
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* ── Executive Top Stat Cards ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card-dark p-4 border border-sky-500/20 rounded-2xl relative overflow-hidden group hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl"><UIIcon value={"🏫"} /></span>
              <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                {activeSchools} ใช้งานอยู่
              </span>
            </div>
            <div className="text-3xl font-black text-white">{totalSchools}</div>
            <div className="text-xs text-slate-400 mt-1">โรงเรียนทั้งหมดในระบบ</div>
          </div>

          <div className="glass-card-dark p-4 border border-violet-500/20 rounded-2xl relative overflow-hidden group hover:border-violet-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl"><UIIcon value={"🎒"} /></span>
              <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                โควตารวม {totalCapacity}
              </span>
            </div>
            <div className="text-3xl font-black text-white">{totalStudents.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">นักเรียนที่กำลังใช้งาน (Active)</div>
          </div>

          <div className="glass-card-dark p-4 border border-emerald-500/20 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl"><UIIcon value={"📈"} /></span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                เป้าหมาย &gt;60%
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-400">{nationalAvg}%</div>
            <div className="text-xs text-slate-400 mt-1">คะแนนเฉลี่ย O-NET รวมประเทศ</div>
          </div>

          <div className="glass-card-dark p-4 border border-amber-500/20 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl"><UIIcon value={"⚡"} /></span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                SaaS Ready
              </span>
            </div>
            <div className="text-3xl font-black text-amber-400">Multi-School</div>
            <div className="text-xs text-slate-400 mt-1">สถานะระบบ Cloud Database</div>
          </div>
        </div>

        {/* ── Search & Filter Controls Bar ────────────────────────── */}
        <div className="glass-card-dark p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="🔍 ค้นหาชื่อโรงเรียน, รหัส, จังหวัด, ครูผู้รับผิดชอบ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                <UIIcon value={"✕"} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto">
            <span className="text-xs text-slate-400 font-medium shrink-0">สถานะ:</span>
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'active', label: '🟢 ใช้งานอยู่' },
              { id: 'trial', label: '🟡 ทดลองใช้' },
              { id: 'suspended', label: '🔴 ระงับ' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Schools List Table ──────────────────────────────────── */}
        <div className="glass-card-dark rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-950/70">
                  <th className="py-3.5 px-4">รหัส / โรงเรียน</th>
                  <th className="py-3.5 px-4">สังกัด / จังหวัด</th>
                  <th className="py-3.5 px-4">ผู้ประสานงาน</th>
                  <th className="py-3.5 px-4 text-center">นักเรียน / โควตา</th>
                  <th className="py-3.5 px-4 text-center">O-NET เฉลี่ย</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                  <th className="py-3.5 px-4 text-center">หมดอายุ</th>
                  <th className="py-3.5 px-4 text-right">เครื่องมือจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500">
                      <div className="text-3xl mb-2"><UIIcon value={"🏫"} /></div>
                      <p className="font-bold">ไม่พบข้อมูลโรงเรียนตามเงื่อนไข</p>
                      <button
                        onClick={handleOpenAdd}
                        className="mt-3 text-xs text-amber-400 hover:underline font-bold"
                      >
                        + คลิกที่นี่เพื่อเพิ่มโรงเรียนใหม่
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school) => {
                    const usagePercent = school.quota > 0
                      ? Math.min(100, Math.round((school.activeStudents / school.quota) * 100))
                      : 0;
                    return (
                      <tr
                        key={school.id}
                        className="hover:bg-white/[0.04] transition-colors group"
                      >
                        {/* School Code & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-black text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg text-[11px]">
                              {school.code}
                            </span>
                            <div>
                              <div className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                                {school.name}
                              </div>
                              {school.notes && (
                                <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                                  {school.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Area & Province */}
                        <td className="py-3.5 px-4 text-slate-300">
                          <div>{school.area || '-'}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{school.province}</div>
                        </td>

                        {/* Contact Person */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">{school.contactTeacher || '-'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{school.phone || school.email || '-'}</div>
                        </td>

                        {/* Student Count / Quota */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="font-bold text-slate-200">
                            {school.activeStudents} <span className="text-slate-500 font-normal">/ {school.quota}</span>
                          </div>
                          <div className="w-20 h-1.5 bg-slate-800 rounded-full mx-auto mt-1 overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full ${
                                usagePercent >= 90 ? 'bg-rose-500' : usagePercent >= 70 ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </td>

                        {/* O-NET Average */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-black text-sm ${
                            school.avgScore >= 70 ? 'text-emerald-400' : school.avgScore >= 50 ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            {school.avgScore > 0 ? `${school.avgScore}%` : '-'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            school.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : school.status === 'trial'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              school.status === 'active' ? 'bg-emerald-400' : school.status === 'trial' ? 'bg-amber-400' : 'bg-rose-400'
                            }`} />
                            {school.status === 'active' ? 'ใช้งานอยู่' : school.status === 'trial' ? 'ทดลองใช้' : 'ระงับ'}
                          </span>
                        </td>

                        {/* Expiry */}
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                          {school.expiresAt || 'ไม่มีกำหนด'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Impersonate / Enter School View */}
                            <button
                              onClick={() => handleImpersonate(school)}
                              className="p-1.5 bg-sky-500/10 hover:bg-sky-500/25 text-sky-300 rounded-lg border border-sky-500/20 transition-all text-xs"
                              title="สลับเข้าดูหน้าจอโรงเรียนนี้ (Impersonate)"
                            >
                              <UIIcon value={"👁️"} />
                            </button>

                            {/* Share / Copy Portal URL */}
                            <button
                              onClick={() => handleOpenShare(school)}
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 rounded-lg border border-amber-500/20 transition-all text-xs"
                              title="แชร์ลิงก์ Portal ประจำโรงเรียน"
                            >
                              <UIIcon value={"🔗"} />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(school)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-white/10 transition-all text-xs"
                              title="แก้ไขข้อมูลโรงเรียน"
                            >
                              <UIIcon value={"✏️"} />
                            </button>

                            {/* Toggle Suspend/Active */}
                            <button
                              onClick={() => handleToggleStatus(school.id, school.status)}
                              className={`p-1.5 rounded-lg border transition-all text-xs ${
                                school.status === 'active'
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/20'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
                              }`}
                              title={school.status === 'active' ? 'ระงับโรงเรียนนี้' : 'เปิดใช้งานโรงเรียนนี้'}
                            >
                              <UIIconText value={school.status === 'active' ? '⏸️' : '▶️'} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setConfirmDeleteId(school.id)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 rounded-lg border border-rose-500/20 transition-all text-xs"
                              title="ลบโรงเรียน"
                            >
                              <UIIcon value={"🗑️"} />
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
        </div>

        {/* ── Quick School Onboarding Steps Guide ──────────────────── */}
        <div className="glass-card-dark p-5 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl"><UIIcon value={"💡"} /></span>
            <div>
              <h3 className="font-black text-white text-sm">ขั้นตอนการเปิดใช้งานระบบสำหรับโรงเรียนใหม่ (Quick Onboarding Guide)</h3>
              <p className="text-[11px] text-slate-400">คำแนะนำสำหรับ Super Admin ในการกระจายระบบไปยังโรงเรียนต่างๆ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs">1</span>
                <span className="font-bold text-white">สร้างบัญชีโรงเรียน</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                กดปุ่ม <strong>+ เพิ่มโรงเรียนใหม่</strong> กำหนดรหัส รร. (เช่น BNS01) และโควตานักเรียน
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 font-black flex items-center justify-center text-xs">2</span>
                <span className="font-bold text-white">ส่งมอบลิงก์ Portal</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                กดปุ่ม <strong><UIIcon value={"🔗"} /> คัดลอกลิงก์</strong> ส่งให้ครูประจำโรงเรียนนำไปแปะในกลุ่ม Line หรือ Facebook
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center text-xs">3</span>
                <span className="font-bold text-white">ครูนำเข้านักเรียน</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                ครูเข้าสู่ระบบเพื่อนำเข้ารายชื่อเด็กผ่านไฟล์ Excel/Sheets ข้อมูลจะผูกกับ รร. นั้นอัตโนมัติ
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-300 font-black flex items-center justify-center text-xs">4</span>
                <span className="font-bold text-white">ติดตาม & สวมสิทธิ์</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Super Admin กดปุ่ม <strong><UIIcon value={"👁️"} /></strong> เพื่อสลับเข้าไปดูผลการเรียนของโรงเรียนนั้นๆ ได้ทุกเมื่อ
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Add / Edit School Modal ───────────────────────────────── */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card-dark border border-amber-500/30 w-full max-w-lg p-6 rounded-3xl shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span><UIIconText value={editingSchool ? '✏️ แก้ไขข้อมูลโรงเรียน' : '➕ เพิ่มโรงเรียนใหม่เข้าระบบ'} /></span>
              </h2>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                <UIIcon value={"✕"} />
              </button>
            </div>

            <form onSubmit={handleSaveSchool} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    รหัสโรงเรียน (School Code) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น BNS01, WNT02"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    สถานะการใช้งาน
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="active"><UIIcon value={"🟢"} /> Active (เปิดใช้งาน)</option>
                    <option value="trial"><UIIcon value={"🟡"} /> Trial (ทดลองใช้งาน)</option>
                    <option value="suspended"><UIIcon value={"🔴"} /> Suspended (ระงับชั่วคราว)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  ชื่อโรงเรียน <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น โรงเรียนบ้านนาสาร"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">เขตพื้นที่การศึกษา (สพป./สพม.)</label>
                  <input
                    type="text"
                    placeholder="เช่น สพป.สุราษฎร์ธานี เขต 3"
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">จังหวัด</label>
                  <input
                    type="text"
                    placeholder="เช่น สุราษฎร์ธานี"
                    value={formData.province}
                    onChange={e => setFormData({ ...formData, province: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ครูผู้รับผิดชอบ / ประสานงาน</label>
                  <input
                    type="text"
                    placeholder="เช่น ครูสมชาย ใจดี"
                    value={formData.contactTeacher}
                    onChange={e => setFormData({ ...formData, contactTeacher: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">เบอร์โทรติดต่อ</label>
                  <input
                    type="text"
                    placeholder="เช่น 081-234-5678"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">โควตานักเรียนสูงสุด (คน)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="เช่น 100"
                    value={formData.quota}
                    onChange={e => setFormData({ ...formData, quota: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">วันหมดอายุสิทธิ์ (License Expiry)</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">บันทึกเพิ่มเติม</label>
                <textarea
                  rows="2"
                  placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับโรงเรียนนี้..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  {editingSchool ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มโรงเรียน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Share / Copy Portal URL Modal ─────────────────────────── */}
      {showShareModal && shareTargetSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card-dark border border-amber-500/30 w-full max-w-md p-6 rounded-3xl shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span><UIIcon value={"🔗"} /> ลิงก์ Portal ประจำโรงเรียน</span>
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                <UIIcon value={"✕"} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10 space-y-1">
                <div className="font-bold text-amber-300">{shareTargetSchool.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">รหัสโรงเรียน: {shareTargetSchool.code}</div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ลิงก์ทางเข้าสำหรับนักเรียนและครู:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getPortalUrl(shareTargetSchool.code)}
                    className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-[11px] select-all"
                  />
                  <button
                    onClick={() => handleCopyLink(shareTargetSchool.code)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shrink-0 active:scale-95"
                  >
                    คัดลอก
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5 text-emerald-300 text-[11px]">
                <div className="font-bold flex items-center gap-1">
                  <span><UIIcon value={"💡"} /> คำแนะนำการส่งต่อ:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  คุณครูสามารถส่งลิงก์นี้ลงกลุ่ม Line หรือ Facebook ของโรงเรียน เพื่อให้นักเรียนและครูคลิกเข้าใช้งานได้ทันที ระบบจะล็อกรหัสโรงเรียนนี้ให้อัตโนมัติครับ
                </p>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors mt-2"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ──────────────────────────────────── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card-dark border border-rose-500/40 w-full max-w-sm p-6 rounded-3xl shadow-2xl text-white space-y-4 text-center">
            <div className="text-4xl"><UIIcon value={"⚠️"} /></div>
            <h2 className="text-lg font-black text-white">ยืนยันการลบโรงเรียน?</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              การลบจะนำโรงเรียนนี้ออกจากระบบ Super Admin คุณแน่ใจหรือไม่ที่จะดำเนินการต่อ?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors text-xs"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
