import React, { useMemo, useState } from 'react';
import UIIcon from './UIIcon';
import {
  USER_ROLES,
  mergeDirectoryAccounts,
  buildSchoolGroups,
  filterAccounts,
} from '../utils/userDirectory';

function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-600/50 bg-slate-800 text-slate-300',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    red: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    blue: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    purple: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  };
  return (
    <span
      className={`inline-flex min-h-6 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
        tones[tone] || tones.slate
      }`}
    >
      {children}
    </span>
  );
}

const fmtDate = (value) => (value ? new Date(value).toLocaleDateString('th-TH') : 'ไม่พร้อมใช้งาน');

export default function SchoolUsersView({
  schools = [],
  accounts = [],
  invitations = [],
  adminsList = [],
  initialSelectedSchool = 'all',
  changeTeacher,
  revoke,
  showToast = () => {},
}) {
  // 1. Merge remote accounts with local admins to ensure complete visibility
  const allMergedAccounts = useMemo(
    () => mergeDirectoryAccounts(accounts, adminsList),
    [accounts, adminsList]
  );

  // 2. Build grouped data
  const {
    schoolGroups,
    platformAccounts,
    platformStats,
    overallStats,
  } = useMemo(
    () => buildSchoolGroups(schools, allMergedAccounts, invitations),
    [schools, allMergedAccounts, invitations]
  );

  // 3. Selection state: 'all' | 'platform' | schoolId
  const [selectedGroupId, setSelectedGroupId] = useState(initialSelectedSchool || 'all');

  React.useEffect(() => {
    if (initialSelectedSchool) {
      setSelectedGroupId(initialSelectedSchool);
    }
  }, [initialSelectedSchool]);

  // 4. Filtering states
  const [schoolFilterQuery, setSchoolFilterQuery] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter the school list on the left
  const visibleSchoolGroups = useMemo(() => {
    if (!schoolFilterQuery.trim()) return schoolGroups;
    const q = schoolFilterQuery.trim().toLowerCase();
    return schoolGroups.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.province.toLowerCase().includes(q)
    );
  }, [schoolGroups, schoolFilterQuery]);

  // Determine current active group data
  const currentGroup = useMemo(() => {
    if (selectedGroupId === 'all') {
      return {
        id: 'all',
        type: 'all',
        title: 'ผู้ใช้งานทั้งหมดในระบบ',
        subtitle: 'แสดงรวมทุกโรงเรียนและแพลตฟอร์มส่วนกลาง',
        icon: '🌐',
        accounts: allMergedAccounts,
        invitations: invitations,
        stats: {
          total: overallStats.totalAccounts,
          admins: overallStats.totalAdmins,
          teachers: overallStats.totalTeachers,
          students: overallStats.totalStudents,
          active: overallStats.activeAccounts,
        },
      };
    }

    if (selectedGroupId === 'platform') {
      return {
        id: 'platform',
        type: 'platform',
        title: 'แพลตฟอร์มส่วนกลาง (Platform Admins)',
        subtitle: 'ผู้ดูแลระบบระดับสูงสุด มีสิทธิ์บริหารจัดการทั้งระบบ',
        icon: '👑',
        accounts: platformAccounts,
        invitations: [],
        stats: platformStats,
      };
    }

    const foundSchool = schoolGroups.find((s) => s.id === selectedGroupId);
    if (foundSchool) {
      return {
        id: foundSchool.id,
        type: 'school',
        school: foundSchool,
        title: foundSchool.name,
        subtitle: `รหัส: ${foundSchool.code || '—'} · ${foundSchool.province || ''} ${
          foundSchool.area ? `· ${foundSchool.area}` : ''
        }`,
        icon: '🏫',
        accounts: foundSchool.accounts,
        invitations: foundSchool.invitations,
        stats: foundSchool.stats,
      };
    }

    return {
      id: 'all',
      type: 'all',
      title: 'ผู้ใช้งานทั้งหมด',
      subtitle: '',
      icon: '🌐',
      accounts: allMergedAccounts,
      invitations: invitations,
      stats: overallStats,
    };
  }, [
    selectedGroupId,
    allMergedAccounts,
    invitations,
    platformAccounts,
    platformStats,
    overallStats,
    schoolGroups,
  ]);

  // Filter accounts within the currently selected group
  const filteredAccounts = useMemo(() => {
    return filterAccounts(currentGroup.accounts, {
      search: userSearch,
      role: roleFilter,
      status: statusFilter,
    });
  }, [currentGroup.accounts, userSearch, roleFilter, statusFilter]);

  const copyText = (txt, label = 'ข้อความ') => {
    if (!txt) return;
    navigator.clipboard?.writeText(txt);
    showToast(`📋 คัดลอก ${label} เรียบร้อยแล้ว`);
  };

  const resetFilters = () => {
    setUserSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Cards */}
      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-md shadow-amber-500/20">
              <UIIcon value="👥" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">ระบบจัดการผู้ใช้งาน (User Management)</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                จัดหมวดหมู่ผู้ใช้ตามกลุ่มโรงเรียน คลิกเลือกโรงเรียนทางซ้ายเพื่อดูผู้ใช้เฉพาะของโรงเรียนนั้น
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300">
              <span>🏫</span>
              <span>โรงเรียน:</span>
              <strong className="text-amber-300">{overallStats.totalSchools}</strong>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300">
              <span>👥</span>
              <span>ผู้ใช้ทั้งหมด:</span>
              <strong className="text-sky-300">{overallStats.totalAccounts}</strong>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300">
              <span>⚡</span>
              <span>Active:</span>
              <strong className="text-emerald-300">{overallStats.activeAccounts}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Two-Column Layout (School Selector + User Table) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: School Selector (~4 cols on desktop) */}
        <aside className="lg:col-span-4 xl:col-span-4 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 font-black text-sm text-slate-200">
                <span className="text-base">🏫</span>
                <span>กลุ่มโรงเรียน & ขอบเขต</span>
              </div>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-300 border border-white/5">
                {schoolGroups.length} โรงเรียน
              </span>
            </div>

            {/* Quick School Search Box */}
            <div className="relative">
              <input
                type="text"
                value={schoolFilterQuery}
                onChange={(e) => setSchoolFilterQuery(e.target.value)}
                placeholder="🔍 ค้นหาโรงเรียน หรือ รหัส..."
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
              {schoolFilterQuery && (
                <button
                  onClick={() => setSchoolFilterQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Special Platform & All Views */}
            <div className="space-y-1.5 pt-1">
              {/* Option 1: All Users */}
              <button
                type="button"
                onClick={() => {
                  setSelectedGroupId('all');
                  resetFilters();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedGroupId === 'all'
                    ? 'border-amber-400/80 bg-gradient-to-r from-amber-500/20 to-amber-600/10 shadow-lg shadow-amber-500/10 text-white ring-1 ring-amber-400/30'
                    : 'border-white/5 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-xl text-sm ${
                      selectedGroupId === 'all'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    🌐
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs truncate">ผู้ใช้ทั้งหมดในระบบ</div>
                    <div className="text-[10px] text-slate-400">ทุกโรงเรียน & แพลตฟอร์ม</div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    selectedGroupId === 'all'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {overallStats.totalAccounts}
                </span>
              </button>

              {/* Option 2: Platform Admins */}
              <button
                type="button"
                onClick={() => {
                  setSelectedGroupId('platform');
                  resetFilters();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedGroupId === 'platform'
                    ? 'border-amber-400/80 bg-gradient-to-r from-amber-500/20 to-amber-600/10 shadow-lg shadow-amber-500/10 text-white ring-1 ring-amber-400/30'
                    : 'border-white/5 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-xl text-sm ${
                      selectedGroupId === 'platform'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs truncate">แพลตฟอร์มส่วนกลาง</div>
                    <div className="text-[10px] text-slate-400">Platform Super Admins</div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    selectedGroupId === 'platform'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {platformStats.total}
                </span>
              </button>
            </div>

            {/* School Section Divider */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 mb-2">
                <span>รายชื่อโรงเรียน ({visibleSchoolGroups.length})</span>
                <span className="text-[10px] text-slate-500">คลิกเพื่อดูผู้ใช้</span>
              </div>

              {/* Scrollable School List */}
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {visibleSchoolGroups.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/10 bg-slate-950/40 text-center text-xs text-slate-400">
                    ไม่พบโรงเรียนที่ตรงกับคำค้นหา
                  </div>
                ) : (
                  visibleSchoolGroups.map((school) => {
                    const isSelected = selectedGroupId === school.id;
                    const hasUsers = school.stats.total > 0;

                    return (
                      <button
                        key={school.id}
                        type="button"
                        onClick={() => {
                          setSelectedGroupId(school.id);
                          resetFilters();
                        }}
                        className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'border-amber-400/90 bg-gradient-to-r from-amber-500/25 to-slate-900 shadow-xl shadow-amber-500/10 text-white ring-1 ring-amber-400/40'
                            : 'border-white/5 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60 hover:border-white/15'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">🏫</span>
                              <span className="font-bold text-xs text-white truncate">
                                {school.name}
                              </span>
                              {school.status === 'active' ? (
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" title="Active" />
                              ) : (
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" title={school.status} />
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                              {school.code && (
                                <span className="font-mono font-bold text-amber-300/90 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                                  {school.code}
                                </span>
                              )}
                              {school.province && <span>{school.province}</span>}
                              {school.planName && <span>· {school.planName}</span>}
                            </div>
                          </div>

                          {/* User Counter Badge */}
                          <div className="shrink-0 text-right">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 font-black'
                                  : hasUsers
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-800/80 text-slate-500'
                              }`}
                            >
                              <span>👥</span>
                              <span>{school.stats.total}</span>
                            </span>
                          </div>
                        </div>

                        {/* Breakdown pills if has users */}
                        {hasUsers && (
                          <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-slate-400 pt-1.5 border-t border-white/5">
                            {school.stats.admins > 0 && (
                              <span className="text-sky-300">🛡️ {school.stats.admins} Admin</span>
                            )}
                            {school.stats.teachers > 0 && (
                              <span className="text-emerald-300">👩‍🏫 {school.stats.teachers} ครู</span>
                            )}
                            {school.stats.students > 0 && (
                              <span className="text-purple-300">🎒 {school.stats.students} นร.</span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Selected School User Directory (~8 cols on desktop) */}
        <main className="lg:col-span-8 xl:col-span-8 space-y-4">
          {/* Active School Banner & Quick Stats */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-xl space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-800 text-2xl border border-white/10">
                  <UIIcon value={currentGroup.icon} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-white">{currentGroup.title}</h3>
                    {currentGroup.school?.code && (
                      <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                        {currentGroup.school.code}
                      </span>
                    )}
                    {currentGroup.type === 'school' && (
                      <Badge tone={currentGroup.school?.status === 'active' ? 'green' : 'amber'}>
                        {currentGroup.school?.status || 'active'}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{currentGroup.subtitle}</p>
                </div>
              </div>

              {/* Seat Quota for School if available */}
              {currentGroup.school?.quota ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-right">
                  <div className="text-[10px] text-amber-300 font-bold">โควตานักเรียน</div>
                  <div className="text-sm font-black text-white">
                    {currentGroup.school.activeStudents ?? currentGroup.stats.students} / {currentGroup.school.quota} ที่นั่ง
                  </div>
                </div>
              ) : null}
            </div>

            {/* Quick KPI Stat Chips */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-3">
                <div className="text-[11px] font-bold text-slate-400">ผู้ใช้ทั้งหมด</div>
                <div className="mt-1 text-2xl font-black text-white">{currentGroup.stats.total}</div>
                <div className="text-[10px] text-slate-500">ในกลุ่มนี้</div>
              </div>
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-3">
                <div className="text-[11px] font-bold text-sky-300">Admin ผู้ดูแล</div>
                <div className="mt-1 text-2xl font-black text-sky-400">{currentGroup.stats.admins}</div>
                <div className="text-[10px] text-slate-500">สิทธิ์บริหาร</div>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="text-[11px] font-bold text-emerald-300">คุณครู</div>
                <div className="mt-1 text-2xl font-black text-emerald-400">{currentGroup.stats.teachers || 0}</div>
                <div className="text-[10px] text-slate-500">ครูผู้สอน</div>
              </div>
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3">
                <div className="text-[11px] font-bold text-purple-300">นักเรียน</div>
                <div className="mt-1 text-2xl font-black text-purple-400">{currentGroup.stats.students || 0}</div>
                <div className="text-[10px] text-slate-500">ผู้เรียน</div>
              </div>
            </div>
          </section>

          {/* User Filter Toolbar */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/75 p-4 shadow-xl space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Search input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="🔍 ค้นหาชื่อ, อีเมล, รหัสนักเรียน (Student ID)..."
                  className="w-full min-h-11 rounded-xl border border-white/10 bg-slate-950 px-4 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
                {userSearch && (
                  <button
                    onClick={() => setUserSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="min-h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
                >
                  <option value="all">บทบาททั้งหมด</option>
                  <option value="platform_admin">Platform Admin</option>
                  <option value="school_admin">School Admin</option>
                  <option value="academic_admin">Academic Admin</option>
                  <option value="teacher">Teacher (ครู)</option>
                  <option value="student">Student (นักเรียน)</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="active">Active (ใช้งานอยู่)</option>
                  <option value="suspended">Suspended (ระงับ)</option>
                </select>

                {(userSearch || roleFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="min-h-11 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
                  >
                    ล้างตัวกรอง
                  </button>
                )}
              </div>
            </div>

            {/* User List Table */}
            {filteredAccounts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-10 text-center space-y-2">
                <div className="text-3xl">📭</div>
                <div className="font-bold text-slate-200 text-sm">
                  {currentGroup.accounts.length === 0
                    ? `ยังไม่มีผู้ใช้งานใน ${currentGroup.title}`
                    : 'ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา'}
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {currentGroup.accounts.length === 0
                    ? 'เมื่อคุณครูหรือนักเรียนลงทะเบียนหรือถูกเพิ่มเข้ามาในโรงเรียนนี้ รายการจะปรากฏที่นี่โดยอัตโนมัติ'
                    : 'ลองปรับคำค้นหาหรือเปลี่ยนตัวกรองบทบาท/สถานะ'}
                </p>
                {(userSearch || roleFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="mt-2 text-xs font-bold text-amber-400 hover:underline"
                  >
                    ล้างคำค้นหาและแสดงทั้งหมด
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="p-3">บัญชี / ผู้ใช้งาน</th>
                      <th className="p-3">บทบาท</th>
                      <th className="p-3">สังกัด / ขอบเขต</th>
                      <th className="p-3">สถานะ</th>
                      <th className="p-3 text-right">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => {
                      const roleConfig = USER_ROLES[account.role] || {
                        label: account.role,
                        icon: '👤',
                        tone: 'slate',
                      };

                      return (
                        <tr
                          key={account.key || account.userId}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Name & Account Details */}
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{roleConfig.icon}</span>
                              <div className="min-w-0">
                                <div className="font-black text-white text-xs truncate">
                                  {account.displayName}
                                </div>
                                {account.email && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                                    <span>{account.email}</span>
                                    <button
                                      type="button"
                                      onClick={() => copyText(account.email, 'อีเมล')}
                                      className="text-slate-500 hover:text-amber-400"
                                      title="คัดลอกอีเมล"
                                    >
                                      📋
                                    </button>
                                  </div>
                                )}
                                {account.secondaryId && (
                                  <div className="mt-0.5 inline-flex items-center gap-1 rounded bg-purple-500/10 px-1.5 py-0.2 font-mono text-[10px] text-purple-300 border border-purple-500/20">
                                    <span>ID:</span>
                                    <span>{account.secondaryId}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="p-3">
                            <Badge tone={roleConfig.tone}>
                              <span>{roleConfig.icon}</span>
                              <span>{roleConfig.label}</span>
                            </Badge>
                          </td>

                          {/* School / Scope */}
                          <td className="p-3">
                            <div className="text-slate-300 font-medium">
                              {account.schoolName || 'ทั้งแพลตฟอร์ม'}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="p-3">
                            <Badge
                              tone={
                                String(account.status).toLowerCase() === 'active'
                                  ? 'green'
                                  : 'amber'
                              }
                            >
                              <span
                                className={`inline-block h-1.5 w-1.5 rounded-full ${
                                  String(account.status).toLowerCase() === 'active'
                                    ? 'bg-emerald-400'
                                    : 'bg-amber-400'
                                }`}
                              />
                              <span>{account.status}</span>
                            </Badge>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {account.role === 'teacher' && changeTeacher && (
                                <button
                                  type="button"
                                  onClick={() => changeTeacher(account)}
                                  className="min-h-8 rounded-lg border border-white/10 bg-slate-800 px-2.5 text-[11px] font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                                >
                                  {account.status === 'active' ? 'ระงับครู' : 'เปิดใช้งาน'}
                                </button>
                              )}

                              <button
                                disabled
                                title="ยังไม่มี browser-safe credential reset API สำหรับ Super Admin"
                                className="min-h-8 cursor-not-allowed rounded-lg border border-white/5 bg-slate-950 px-2.5 text-[11px] font-bold text-slate-600"
                              >
                                รีเซ็ตรหัสผ่าน
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Invitations Section for this School / Group */}
          {currentGroup.invitations && currentGroup.invitations.length > 0 && (
            <section className="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📩</span>
                  <h4 className="font-black text-sm text-white">
                    คำเชิญ School Admin ({currentGroup.invitations.length} รายการ)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  {currentGroup.type === 'school' ? `สำหรับ ${currentGroup.title}` : 'ทั้งหมด'}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {currentGroup.invitations.map((inv) => (
                  <div
                    key={inv.invitation_id || inv.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate">
                          {inv.admin_email || inv.email}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          สถานะ:{' '}
                          <span
                            className={
                              inv.status === 'pending'
                                ? 'text-amber-300 font-bold'
                                : 'text-slate-300'
                            }
                          >
                            {inv.status}
                          </span>{' '}
                          · หมดอายุ {fmtDate(inv.expires_at)}
                        </div>
                      </div>

                      {inv.status === 'pending' && revoke && (
                        <button
                          type="button"
                          onClick={() => revoke(inv)}
                          className="shrink-0 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                        >
                          ยกเลิกคำเชิญ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
