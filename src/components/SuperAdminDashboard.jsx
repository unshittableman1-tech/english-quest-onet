import { useCallback, useEffect, useMemo, useState } from 'react';
import UIIcon from './UIIcon';
import { useApp } from '../App';
import { hasSupabaseConfig, supabaseConfig } from '../config/runtimeMode';
import { getAllSchools } from '../utils/schoolStorage';
import {
  generateInvitationToken, platformCreateSchoolWithInvitation, platformListAccountDirectory,
  platformListPlansAndSubscriptions, platformListSchools, platformRevokeInvitation,
  platformSetSchoolStatus, setTeacherMembership, sha256Hex,
} from '../utils/schoolAdmin';
import { listSchoolApplications, updateSchoolApplicationStatus } from '../utils/schoolApplications';

const LIVE = hasSupabaseConfig;
const ROLES = { platform_admin: 'Platform Admin', school_admin: 'School Admin', teacher: 'Teacher', student: 'Student' };
const NAV = [
  ['schools', '🏫', 'โรงเรียน'],
  ['applications', '📋', 'คำขอสมัคร'],
  ['users', '👥', 'ผู้ใช้งาน'],
  ['plans', '🧾', 'แผนและสมาชิก'],
  ['system', '🛡️', 'สถานะระบบ']
];
const fmtDate = (value) => value ? new Date(value).toLocaleDateString('th-TH') : 'ไม่พร้อมใช้งาน';
const fmtMoney = (value, currency = 'THB') => value == null ? 'ไม่ระบุ' : new Intl.NumberFormat('th-TH', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value));

function Badge({ children, tone = 'slate' }) {
  const tones = { slate: 'border-slate-600/50 bg-slate-800 text-slate-300', green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300', red: 'border-rose-500/30 bg-rose-500/10 text-rose-300', blue: 'border-sky-500/30 bg-sky-500/10 text-sky-300' };
  return <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}
function Empty({ title, detail }) {
  return <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/30 px-5 py-10 text-center"><div className="text-3xl"><UIIcon value="📭" /></div><div className="mt-2 font-black">{title}</div><div className="mt-1 text-xs text-slate-400">{detail}</div></div>;
}

export default function SuperAdminDashboard() {
  const { handleLogout, showToast } = useApp();
  const [tab, setTab] = useState('schools');
  const [schools, setSchools] = useState(() => LIVE ? [] : getAllSchools());
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const blankForm = () => {
    const defaultPlan = plans.find(p => p.is_active && (p.code === 'school_growth' || p.code === 'school_starter'))
      || plans.find(p => p.is_active);
    return {
      code: '',
      name: '',
      province: '',
      area: '',
      planId: defaultPlan?.id || '',
      subscriptionStatus: 'active',
      startsAt: new Date().toISOString().slice(0, 10),
      endsAt: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      adminEmail: '',
      applicationId: null,
    };
  };
  const [form, setForm] = useState(blankForm);

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (!LIVE) {
        setSchools(getAllSchools());
        const appRows = await listSchoolApplications();
        setApplications(appRows || []);
        setLoading(false);
        return;
      }
      const [schoolRows, billing, appRows] = await Promise.all([
        platformListSchools(),
        platformListPlansAndSubscriptions(),
        listSchoolApplications()
      ]);
      setSchools(schoolRows); setPlans(billing.plans); setSubscriptions(billing.subscriptions);
      setApplications(appRows || []);
      const directory = await platformListAccountDirectory(schoolRows);
      setAccounts(directory.accounts); setInvitations(directory.invitations);
    } catch (err) { setError(err?.message || 'ไม่สามารถโหลดข้อมูลที่ยืนยันจากเซิร์ฟเวอร์ได้'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const localStaging = typeof window !== 'undefined' && ['127.0.0.1', 'localhost', '::1'].includes(window.location.hostname) && supabaseConfig.url === 'http://127.0.0.1:54321';
  const activePlans = plans.filter(p => p.is_active);
  const visibleSchools = useMemo(() => schools.filter(s => (!search || [s.code, s.name, s.province, s.area].some(v => String(v || '').toLowerCase().includes(search.toLowerCase()))) && (filter === 'all' || s.status === filter)), [schools, search, filter]);
  const visibleAccounts = useMemo(() => accounts.filter(a => (!search || [a.displayName, a.email, a.secondaryId, a.schoolName].some(v => String(v || '').toLowerCase().includes(search.toLowerCase()))) && (filter === 'all' || a.role === filter)), [accounts, search, filter]);
  const visibleApplications = useMemo(() => applications.filter(app => (!search || [app.referenceCode, app.schoolName, app.province, app.contactName, app.contactEmail].some(v => String(v || '').toLowerCase().includes(search.toLowerCase()))) && (filter === 'all' || app.status === filter)), [applications, search, filter]);
  const verifiedStudents = schools.every(s => Number.isFinite(s.activeStudents)) ? schools.reduce((n, s) => n + s.activeStudents, 0) : null;

  const openWizard = () => { setForm(blankForm()); setStep(1); setWizard(true); };

  const openWizardWithApp = (app) => {
    const candidateCode = (app.province?.slice(0, 3) || 'SCH').toUpperCase().replace(/[^A-Z]/g, 'SCH') + String(Math.floor(10 + Math.random() * 89));
    const durationDays = app.billingCycle === 'semester' ? 152 : 365;
    const targetPlan = plans.find(p => p.is_active && (p.code === app.packageInterest || p.id === app.packageInterest))
      || plans.find(p => p.is_active && (p.code === 'school_growth' || p.code === 'school_starter'))
      || plans.find(p => p.is_active);
    setForm({
      code: candidateCode.slice(0, 6),
      name: app.schoolName || '',
      province: app.province || '',
      area: app.district || '',
      planId: targetPlan?.id || '',
      subscriptionStatus: app.packageInterest === 'trial' ? 'trialing' : 'active',
      startsAt: new Date().toISOString().slice(0, 10),
      endsAt: new Date(Date.now() + durationDays * 86400000).toISOString().slice(0, 10),
      adminEmail: app.contactEmail || '',
      applicationId: app.id,
    });
    setStep(1);
    setWizard(true);
  };

  const goNext = e => {
    e.preventDefault();
    const cleanCode = form.code.trim().toUpperCase();
    if (!cleanCode || !form.name.trim() || !form.planId || !form.startsAt || !form.endsAt) {
      return showToast('⚠️ กรุณากรอกข้อมูลโรงเรียน แผน และช่วงสมาชิกให้ครบ');
    }
    if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(cleanCode)) {
      return showToast('⚠️ รหัสโรงเรียนต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 3-32 ตัวอักษร (เช่น BNS02)');
    }
    if (new Date(form.endsAt) <= new Date(form.startsAt)) {
      return showToast('⚠️ วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น');
    }
    setStep(2);
  };

  const translateError = (msg = '') => {
    if (msg.includes('invalid_school_onboarding')) return 'รหัสโรงเรียนหรือชื่อโรงเรียนไม่ถูกต้อง (รหัสต้องเป็น A-Z หรือ 0-9 ความยาว 3-32 ตัวอักษร)';
    if (msg.includes('school_code_already_exists')) return 'รหัสโรงเรียนนี้มีอยู่ในระบบแล้ว โปรดใช้รหัสอื่น';
    if (msg.includes('invalid_school_subscription')) return 'ช่วงเวลาสมาชิกไม่ถูกต้อง วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น';
    if (msg.includes('plan_unavailable')) return 'แผนสมาชิกที่เลือกไม่พร้อมใช้งาน';
    if (msg.includes('invalid_admin_email')) return 'รูปแบบอีเมล School Admin ไม่ถูกต้อง';
    if (msg.includes('platform_admin_forbidden')) return 'สิทธิ์ไม่เพียงพอ ต้องเข้าสู่ระบบด้วยบัญชี Platform Admin';
    return msg;
  };

  const createSchool = async e => {
    e.preventDefault();
    if (!form.adminEmail.includes('@')) return showToast('⚠️ กรุณาระบุอีเมลผู้ดูแลโรงเรียนที่ถูกต้อง');
    setSaving(true);
    try {
      const token = generateInvitationToken();
      await platformCreateSchoolWithInvitation({
        schoolCode: form.code.trim().toUpperCase(),
        schoolName: form.name.trim(),
        schoolProvince: form.province?.trim() || null,
        schoolArea: form.area?.trim() || null,
        planId: form.planId,
        subscriptionStatus: form.subscriptionStatus,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        adminEmail: form.adminEmail.trim().toLowerCase(),
        tokenHash: await sha256Hex(token),
      });

      if (form.applicationId) {
        await updateSchoolApplicationStatus(form.applicationId, 'approved', {
          provisionedSchoolCode: form.code.trim().toUpperCase(),
        });
      }

      setInviteResult({ schoolName: form.name, email: form.adminEmail, link: `${window.location.origin}${window.location.pathname}?invitation_token=${token}` });
      setWizard(false);
      await refresh();
      showToast('✅ สร้างโรงเรียนและคำเชิญบนเซิร์ฟเวอร์สำเร็จแล้ว');
    } catch (err) {
      showToast(`❌ สร้างโรงเรียนไม่สำเร็จ: ${translateError(err?.message || 'เกิดข้อผิดพลาด')}`);
    } finally {
      setSaving(false);
    }
  };

  const rejectApp = async (appId) => {
    try {
      await updateSchoolApplicationStatus(appId, 'rejected');
      await refresh();
      showToast('อัปเดตสถานะคำขอเป็นปฏิเสธแล้ว');
    } catch (err) {
      showToast(`❌ ${err?.message}`);
    }
  };

  const changeSchool = async school => { try { await platformSetSchoolStatus(school.id, school.status === 'active' ? 'suspended' : 'active'); await refresh(); showToast('✅ อัปเดตสถานะโรงเรียนแล้ว'); } catch (err) { showToast(`❌ ${err?.message || 'เซิร์ฟเวอร์ปฏิเสธคำขอ'}`); } };
  const changeTeacher = async account => { try { await setTeacherMembership(account.schoolId, account.userId, account.status !== 'active'); await refresh(); showToast('✅ อัปเดตสถานะครูแล้ว'); } catch (err) { showToast(`❌ ${err?.message || 'เซิร์ฟเวอร์ปฏิเสธคำขอ'}`); } };
  const revoke = async invitation => { try { await platformRevokeInvitation(invitation.invitation_id || invitation.id); await refresh(); showToast('✅ ยกเลิกคำเชิญแล้ว'); } catch (err) { showToast(`❌ ${err?.message || 'เซิร์ฟเวอร์ปฏิเสธคำขอ'}`); } };
  const copyLink = async () => { await navigator.clipboard.writeText(inviteResult.link); showToast('📋 คัดลอกลิงก์แล้ว'); };

  return <div className="super-admin-shell min-h-screen bg-[#020617] text-slate-100">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl"><UIIcon value="👑" /></div><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-lg font-black">Super Admin Hub</h1><Badge tone="amber">PLATFORM OWNER</Badge></div><p className="text-xs text-slate-400">ศูนย์บริหารโรงเรียน คำขอสมัคร ผู้ใช้งาน และสมาชิก</p></div></div>
        <div className="flex flex-wrap items-center gap-2"><Badge tone={localStaging ? 'blue' : 'red'}>{localStaging ? 'Local Staging' : 'Environment ไม่ยืนยัน'}</Badge><button onClick={openWizard} disabled={!LIVE || activePlans.length === 0} className="min-h-11 rounded-xl bg-amber-400 px-4 text-sm font-black text-slate-950 disabled:opacity-40">+ เพิ่มโรงเรียนใหม่</button><button onClick={handleLogout} className="min-h-11 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 text-sm font-bold text-rose-300">ออกจากระบบ</button></div>
      </div>
      <nav className="mx-auto flex max-w-[1500px] gap-2 overflow-x-auto px-4 pb-3 lg:px-8" aria-label="เมนูผู้ดูแลแพลตฟอร์ม">{NAV.map(([id, icon, label]) => <button key={id} onClick={() => { setTab(id); setSearch(''); setFilter('all'); }} className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-bold ${tab === id ? 'bg-amber-400 text-slate-950' : 'border border-white/10 bg-slate-900 text-slate-300'}`}><UIIcon value={icon} /> {label}</button>)}</nav>
    </header>
    <main className="mx-auto max-w-[1500px] space-y-5 p-4 lg:p-8">
      {loading && <div role="status" className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm font-bold text-sky-200">กำลังโหลดข้อมูลที่ยืนยันจากเซิร์ฟเวอร์…</div>}
      {error && <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-bold text-rose-200">{error}</div>}
      {tab === 'schools' && <Schools schools={visibleSchools} allSchools={schools} subscriptions={subscriptions} students={verifiedStudents} local={localStaging} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} changeSchool={changeSchool} />}
      {tab === 'applications' && <Applications applications={visibleApplications} allApplications={applications} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} onApprove={openWizardWithApp} onReject={rejectApp} />}
      {tab === 'users' && <Users accounts={visibleAccounts} invitations={invitations} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} changeTeacher={changeTeacher} revoke={revoke} />}
      {tab === 'plans' && <Plans plans={plans} subscriptions={subscriptions} schools={schools} />}
      {tab === 'system' && <SystemStatus local={localStaging} error={error} />}
    </main>
    {wizard && <Wizard step={step} setStep={setStep} form={form} setForm={setForm} activePlans={activePlans} close={() => setWizard(false)} goNext={goNext} createSchool={createSchool} saving={saving} />}
    {inviteResult && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/85 p-4 backdrop-blur-md"><div className="w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-slate-900 p-6"><h2 className="text-xl font-black text-emerald-300">สร้างโรงเรียนและคำเชิญสำเร็จ</h2><p className="mt-2 text-sm">{inviteResult.schoolName} · {inviteResult.email}</p><div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200">สร้างคำเชิญแล้ว แต่ยังไม่มีบริการส่งอีเมลอัตโนมัติใน browser flow นี้ โปรดส่งลิงก์ผ่านช่องทางที่ปลอดภัย หากคัดลอกไม่สำเร็จ ให้เปิดรายการคำเชิญแทนการสร้างโรงเรียนซ้ำ</div><input readOnly value={inviteResult.link} className="mt-4 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs" /><div className="mt-4 flex gap-2"><button onClick={copyLink} className="min-h-11 flex-1 rounded-xl bg-amber-400 font-black text-slate-950">คัดลอกลิงก์</button><button onClick={() => setInviteResult(null)} className="min-h-11 rounded-xl border border-white/10 px-5 font-bold">ปิด</button></div></div></div>}
  </div>;
}

function Applications({ applications, allApplications, search, setSearch, filter, setFilter, onApprove, onReject }) {
  const pendingCount = allApplications.filter(a => a.status === 'pending_review').length;
  const approvedCount = allApplications.filter(a => a.status === 'approved').length;
  const rejectedCount = allApplications.filter(a => a.status === 'rejected').length;

  const stats = [
    ['📋', allApplications.length, 'คำขอทั้งหมด', 'ยื่นผ่านเว็บไซต์/LINE'],
    ['⏳', pendingCount, 'รอตรวจสอบ', 'รอ Super Admin อนุมัติ'],
    ['✅', approvedCount, 'อนุมัติแล้ว', 'สร้างเป็นโรงเรียนแล้ว'],
    ['❌', rejectedCount, 'ปฏิเสธแล้ว', 'ไม่ผ่านเกณฑ์'],
  ];

  return <>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(([icon, value, label, detail]) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
          <div className="text-2xl"><UIIcon value={icon} /></div>
          <div className="mt-3 text-3xl font-black">{value}</div>
          <div className="text-sm font-bold">{label}</div>
          <div className="mt-1 text-xs text-slate-500">{detail}</div>
        </div>
      ))}
    </section>

    <section className="rounded-3xl border border-white/10 bg-slate-900/75 p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h2 className="text-xl font-black">คำขอสมัครแพ็กเกจโรงเรียน</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            เมื่อกด "อนุมัติและสร้างโรงเรียน" ระบบจะดึงข้อมูลเข้าสู่ตัวช่วยสร้างโรงเรียนอัตโนมัติในคลิกเดียว
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:justify-between">
        <input
          aria-label="ค้นหาคำขอ"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อโรงเรียน, รหัสอ้างอิง, ผู้ติดต่อ, อีเมล…"
          className="min-h-11 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm md:w-96"
        />
        <select
          aria-label="กรองสถานะ"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="min-h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm"
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="pending_review">รอตรวจสอบ</option>
          <option value="approved">อนุมัติแล้ว</option>
          <option value="rejected">ปฏิเสธ</option>
        </select>
      </div>

      {applications.length === 0 ? (
        <Empty title="ไม่พบคำขอสมัคร" detail="เมื่อโรงเรียนยื่นคำขอจากหน้าแรก รายการจะปรากฏที่นี่" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-500">
                <th className="p-3">รหัส / โรงเรียน</th>
                <th className="p-3">ผู้ประสานงาน</th>
                <th className="p-3">แพ็กเกจ / ความต้องการ</th>
                <th className="p-3">วันที่ยื่น</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3">
                    <span className="font-mono text-xs font-bold text-amber-300">{app.referenceCode}</span>
                    <div className="font-bold text-white text-sm">{app.schoolName}</div>
                    {app.schoolNameEnglish && <div className="text-xs text-slate-400">{app.schoolNameEnglish}</div>}
                    <div className="text-xs text-slate-500 mt-0.5">
                      {[app.district, app.province].filter(Boolean).join(' · ')}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-200">{app.contactName}</div>
                    <div className="text-xs font-mono text-sky-400">{app.contactEmail}</div>
                    <div className="text-xs text-slate-400">{app.contactPhone}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-amber-300">{app.packageName || app.packageInterest}</div>
                    <div className="text-xs text-sky-300 mt-0.5 font-medium">
                      {app.cycleLabel || (app.billingCycle === 'yearly' ? 'รายปี (12 เดือน)' : 'รายเทอม (5 เดือน)')}
                      {app.approxPrice != null && ` · ฿${Number(app.approxPrice).toLocaleString()}`}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      นักเรียน {app.expectedStudents || '—'} คน · ครู {app.expectedTeachers || '—'} คน
                    </div>
                    {app.needQuotation && (
                      <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        📄 ขอใบเสนอราคา
                      </div>
                    )}
                    {app.notes && <div className="text-xs text-slate-500 italic mt-0.5">"{app.notes}"</div>}
                  </td>
                  <td className="p-3 text-xs text-slate-400">
                    {fmtDate(app.createdAt)}
                  </td>
                  <td className="p-3">
                    {app.status === 'pending_review' && <Badge tone="amber">รอตรวจสอบ</Badge>}
                    {app.status === 'approved' && (
                      <div>
                        <Badge tone="green">อนุมัติแล้ว</Badge>
                        {app.provisionedSchoolCode && (
                          <div className="text-[11px] font-mono text-emerald-400 mt-1 font-bold">
                            รหัส: {app.provisionedSchoolCode}
                          </div>
                        )}
                      </div>
                    )}
                    {app.status === 'rejected' && <Badge tone="red">ปฏิเสธแล้ว</Badge>}
                  </td>
                  <td className="p-3 text-right">
                    {app.status === 'pending_review' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onApprove(app)}
                          className="min-h-10 rounded-xl bg-amber-400 px-3 text-xs font-black text-slate-950 hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20"
                        >
                          ⚡ อนุมัติและสร้างโรงเรียน
                        </button>
                        <button
                          onClick={() => onReject(app.id)}
                          className="min-h-10 rounded-xl border border-rose-500/30 px-3 text-xs font-bold text-rose-300 hover:bg-rose-500/10 transition-colors"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    ) : app.status === 'approved' ? (
                      <span className="text-xs text-emerald-400 font-bold">พร้อมใช้งาน</span>
                    ) : (
                      <button
                        onClick={() => onApprove(app)}
                        className="min-h-9 rounded-xl border border-white/10 px-3 text-xs text-slate-400 hover:text-white"
                      >
                        พิจารณาใหม่
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  </>;
}

function Schools({ schools, allSchools, subscriptions, students, local, search, setSearch, filter, setFilter, changeSchool }) {
  const stats = [['🏫', allSchools.length, 'โรงเรียนทั้งหมด', `${allSchools.filter(s => s.status === 'active').length} ใช้งานอยู่`], ['🎒', students ?? '—', 'นักเรียน Active', students == null ? 'ข้อมูลไม่พร้อม' : 'ยืนยันจากสมาชิก'], ['🧾', subscriptions.length, 'สัญญาสมาชิก', 'แยกจากสถานะโรงเรียน'], ['🛡️', local ? 'Local' : 'ไม่ยืนยัน', 'Environment', 'ไม่ใช่ Production Ready']];
  return <><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([icon, value, label, detail]) => <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><div className="text-2xl"><UIIcon value={icon} /></div><div className="mt-3 text-3xl font-black">{value}</div><div className="text-sm font-bold">{label}</div><div className="mt-1 text-xs text-slate-500">{detail}</div></div>)}</section><section className="rounded-3xl border border-white/10 bg-slate-900/75 p-4"><Toolbar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} type="schools" />{schools.length === 0 ? <Empty title="ไม่พบโรงเรียน" detail="ข้อมูลจะแสดงเมื่อเซิร์ฟเวอร์อนุญาต" /> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr className="border-b border-white/10 text-xs text-slate-500"><th className="p-3">โรงเรียน</th><th className="p-3">แผน / สมาชิก</th><th className="p-3">นักเรียน / ที่นั่ง</th><th className="p-3">หมดอายุ</th><th className="p-3">สถานะโรงเรียน</th><th className="p-3 text-right">จัดการ</th></tr></thead><tbody>{schools.map(s => <tr key={s.id} className="border-b border-white/5"><td className="p-3"><b>{s.name}</b><div className="font-mono text-xs text-amber-300">{s.code}</div><div className="text-xs text-slate-500">{[s.area, s.province].filter(Boolean).join(' · ') || 'ไม่ระบุพื้นที่'}</div></td><td className="p-3">{s.planName || 'ไม่พร้อมใช้งาน'}<div className="mt-1"><Badge tone={s.subscriptionStatus === 'active' ? 'green' : 'amber'}>{s.subscriptionStatus || 'ไม่พบสมาชิก'}</Badge></div></td><td className="p-3 font-bold">{Number.isFinite(s.activeStudents) ? s.activeStudents : '—'} / {Number.isFinite(s.quota) ? s.quota : '—'}</td><td className="p-3">{fmtDate(s.expiresAt)}</td><td className="p-3"><Badge tone={s.status === 'active' ? 'green' : 'red'}>{s.status}</Badge></td><td className="p-3 text-right"><button onClick={() => changeSchool(s)} className="min-h-10 rounded-xl border border-white/10 px-3 text-xs font-bold">{s.status === 'active' ? 'ระงับโรงเรียน' : 'เปิดใช้งาน'}</button> <button disabled title="ยังไม่มี Server API" className="min-h-10 cursor-not-allowed rounded-xl border border-white/10 px-3 text-xs text-slate-600">แก้ไข</button></td></tr>)}</tbody></table></div>}</section></>;
}

function Toolbar({ search, setSearch, filter, setFilter, type }) {
  return <div className="mb-4 flex flex-col gap-3 md:flex-row md:justify-between"><input aria-label="ค้นหา" value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา…" className="min-h-11 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm md:w-96" /><select aria-label="กรอง" value={filter} onChange={e => setFilter(e.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm"><option value="all">ทั้งหมด</option>{type === 'schools' ? <><option value="active">ใช้งานอยู่</option><option value="suspended">ระงับ</option><option value="archived">เก็บถาวร</option></> : Object.entries(ROLES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>;
}

function Users({ accounts, invitations, search, setSearch, filter, setFilter, changeTeacher, revoke }) {
  return <><section className="rounded-3xl border border-white/10 bg-slate-900/75 p-5"><h2 className="text-xl font-black">User Management</h2><p className="mt-1 text-xs text-slate-400">แสดงเฉพาะขอบเขตที่ API อนุญาต ไม่แสดงรหัสผ่าน PIN verifier หรือ service credentials</p></section><section className="rounded-3xl border border-white/10 bg-slate-900/75 p-4"><Toolbar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} type="users" />{accounts.length === 0 ? <Empty title="ไม่พบบัญชี" detail="ระบบไม่อ่าน auth.users โดยตรงจากเบราว์เซอร์" /> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="border-b border-white/10 text-xs text-slate-500"><th className="p-3">บัญชี</th><th className="p-3">บทบาท</th><th className="p-3">ขอบเขต</th><th className="p-3">สถานะ</th><th className="p-3 text-right">การดำเนินการ</th></tr></thead><tbody>{accounts.map(a => <tr key={a.key} className="border-b border-white/5"><td className="p-3"><b>{a.displayName}</b>{a.secondaryId && <div className="font-mono text-xs text-slate-500">Student ID: {a.secondaryId}</div>}</td><td className="p-3"><Badge tone="blue">{ROLES[a.role] || a.role}</Badge></td><td className="p-3">{a.schoolName}</td><td className="p-3"><Badge tone={String(a.status).toLowerCase() === 'active' ? 'green' : 'amber'}>{a.status}</Badge></td><td className="p-3 text-right">{a.role === 'teacher' && <button onClick={() => changeTeacher(a)} className="min-h-10 rounded-xl border border-white/10 px-3 text-xs font-bold">{a.status === 'active' ? 'ระงับ' : 'เปิดใช้งาน'}</button>} <button disabled title="ยังไม่มี browser-safe credential reset API" className="min-h-10 cursor-not-allowed rounded-xl border border-white/10 px-3 text-xs text-slate-600">รีเซ็ตรหัสผ่าน</button></td></tr>)}</tbody></table></div>}</section><section className="rounded-3xl border border-white/10 bg-slate-900/75 p-5"><h3 className="font-black">คำเชิญ School Admin</h3><p className="mb-4 text-xs text-slate-400">สร้างและยกเลิกผ่าน RPC ที่ตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์</p>{invitations.length === 0 ? <Empty title="ไม่มีคำเชิญ" detail="สร้างพร้อมโรงเรียนใหม่จาก wizard" /> : <div className="grid gap-3 lg:grid-cols-2">{invitations.map(i => <div key={i.invitation_id || i.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"><b>{i.admin_email || i.email}</b><div className="text-xs text-slate-500">{i.status} · หมดอายุ {fmtDate(i.expires_at)}</div>{i.status === 'pending' && <button onClick={() => revoke(i)} className="mt-3 min-h-10 rounded-xl border border-rose-500/30 px-3 text-xs font-bold text-rose-300">ยกเลิกคำเชิญ</button>}</div>)}</div>}</section></>;
}

function Plans({ plans, subscriptions, schools }) {
  return <><section className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5"><h2 className="text-xl font-black">Plans & Subscriptions</h2><p className="mt-1 text-sm text-slate-300">ข้อมูลจริงจากเซิร์ฟเวอร์ การสร้างหรือแก้ไขถูกปิดเพราะยังไม่มี Server API ที่ปลอดภัย</p><button disabled className="mt-4 min-h-11 cursor-not-allowed rounded-xl border border-white/10 px-4 text-slate-600">สร้างหรือแก้ไขแผน — ยังไม่พร้อมใช้งาน</button></section><section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{plans.map(p => <article key={p.id} className="rounded-3xl border border-white/10 bg-slate-900/75 p-5"><div className="flex justify-between"><div><h3 className="text-lg font-black">{p.name}</h3><div className="font-mono text-xs text-amber-300">{p.code}</div></div><Badge tone={p.is_active ? 'green' : 'slate'}>{p.is_active ? 'Active' : 'Inactive'}</Badge></div><p className="mt-3 text-xs text-slate-400">{p.description || 'ไม่มีคำอธิบาย'}</p><div className="mt-4 grid grid-cols-3 gap-2 text-xs"><div className="rounded-xl bg-slate-950 p-2.5">รายเดือน<br /><b>{fmtMoney(p.price_monthly, p.currency)}</b></div><div className="rounded-xl bg-slate-950 p-2.5">รายเทอม<br /><b>{p.features?.price_semester ? fmtMoney(p.features.price_semester, p.currency) : '—'}</b></div><div className="rounded-xl bg-slate-950 p-2.5">รายปี<br /><b>{fmtMoney(p.price_yearly, p.currency)}</b></div></div><div className="mt-4 space-y-2 text-sm"><div>นักเรียน <b>{p.max_students}</b> <span className="text-emerald-400">บังคับใช้</span></div><div>ครู <b>{p.max_teachers}</b> <span className="text-amber-400">ยังไม่บังคับใช้</span></div><div>ห้องเรียน <b>{p.max_classes}</b> <span className="text-amber-400">ยังไม่บังคับใช้</span></div></div></article>)}</section><section className="rounded-3xl border border-white/10 bg-slate-900/75 p-4"><h3 className="mb-4 font-black">สมาชิกโรงเรียน</h3>{subscriptions.length === 0 ? <Empty title="ไม่พบสมาชิก" detail="ไม่มีค่าทดแทนหรือข้อมูลสมมติ" /> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead><tr className="border-b border-white/10 text-xs text-slate-500"><th className="p-3">โรงเรียน</th><th className="p-3">แผน</th><th className="p-3">สถานะสมาชิก</th><th className="p-3">ช่วงสัญญา</th><th className="p-3">โควตา</th></tr></thead><tbody>{subscriptions.map(s => { const school = schools.find(x => x.id === s.school_id); const plan = plans.find(x => x.id === s.plan_id); return <tr key={s.id} className="border-b border-white/5"><td className="p-3 font-bold">{school?.name || s.school_id}</td><td className="p-3">{plan?.name || 'ไม่พร้อมใช้งาน'}</td><td className="p-3"><Badge tone={s.status === 'active' ? 'green' : 'amber'}>{s.status}</Badge></td><td className="p-3 text-xs">{fmtDate(s.starts_at)} – {fmtDate(s.ends_at)}</td><td className="p-3 text-xs">นักเรียน {s.max_students_override ?? plan?.max_students ?? '—'} · ครู {s.max_teachers_override ?? plan?.max_teachers ?? '—'} · ห้อง {s.max_classes_override ?? plan?.max_classes ?? '—'}<div className="text-amber-300">ครู/ห้องยังไม่บังคับใช้</div></td></tr>; })}</tbody></table></div>}</section></>;
}

function SystemStatus({ local, error }) {
  const items = [['Environment', local ? 'Local Staging' : 'ไม่ยืนยัน', local ? 'green' : 'red', `Supabase: ${supabaseConfig.url || 'ไม่ได้กำหนด'}`], ['Database & RLS', error ? 'ตรวจสอบไม่ผ่าน' : 'เชื่อมต่อและอ่านได้', error ? 'red' : 'green', 'สิทธิ์ข้อมูลยึด RLS/RPC ฝั่งเซิร์ฟเวอร์'], ['Owner MFA', 'ยังไม่บังคับใช้', 'amber', 'เป็น blocker ก่อน production'], ['Student Seat Quota', 'บังคับใช้แล้ว', 'green', 'ตรวจที่ RPC สำหรับที่นั่งนักเรียน'], ['Teacher/Class Quota', 'ยังไม่บังคับใช้', 'amber', 'ยังไม่มี server validation'], ['Plan Mutations', 'ยังไม่มี Browser API', 'amber', 'หน้าแผนจึงเป็น read-only']];
  return <><section className="rounded-3xl border border-white/10 bg-slate-900/75 p-6"><h2 className="text-xl font-black">System Status</h2><p className="text-sm text-slate-400">แสดงเฉพาะสิ่งที่ตรวจสอบได้ ไม่สรุป Production Ready จากการเชื่อมต่อฐานข้อมูล</p></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(([title, status, tone, detail]) => <article key={title} className="rounded-3xl border border-white/10 bg-slate-900/75 p-5"><div className="flex justify-between gap-3"><b>{title}</b><Badge tone={tone}>{status}</Badge></div><p className="mt-4 text-xs text-slate-400">{detail}</p></article>)}</section><section className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-5"><h3 className="font-black text-rose-200">Operational blockers ก่อน Production</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm"><li>ยังไม่บังคับ MFA สำหรับ Platform Admin</li><li>ยังไม่มี server validation สำหรับโควตาครูและห้องเรียน</li><li>ยังไม่มี API สำหรับแก้แผน สมาชิก และรีเซ็ตรหัสบัญชีอื่น</li><li>สถานะหน้านี้ไม่ใช่การรับรอง production readiness</li></ul></section></>;
}

function Wizard({ step, setStep, form, setForm, activePlans, close, goNext, createSchool, saving }) {
  const input = 'mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3';
  const schoolPlans = activePlans.filter(p =>
    p.code?.startsWith('school_') || p.code === 'superpower' || p.features?.allow_school_provisioning === true || p.features?.target === 'school'
  );
  const otherPlans = activePlans.filter(p => !schoolPlans.some(sp => sp.id === p.id));
  const selectedPlan = activePlans.find(p => p.id === form.planId);

  const formatPlanOption = (p) => {
    const icon = p.features?.icon || (p.code === 'student_hero' ? '🎒' : p.code === 'teacher_pro' ? '👩‍🏫' : p.code === 'school_starter' ? '🏫' : p.code === 'school_growth' ? '🚀' : p.code === 'superpower' ? '🏛️' : '📋');
    const semPrice = p.features?.price_semester ? `฿${Number(p.features.price_semester).toLocaleString('th-TH')}/เทอม` : '';
    const yrPrice = p.price_yearly ? `฿${Number(p.price_yearly).toLocaleString('th-TH')}/ปี` : '';
    const priceStr = [semPrice, yrPrice].filter(Boolean).join(' · ');
    const popular = p.code === 'school_growth' ? ' ⭐ ยอดนิยม' : '';
    return `${icon} ${p.name} · ${p.max_students} ที่นั่ง ${priceStr ? `(${priceStr})` : ''}${popular}`;
  };

  const setQuickDuration = (months) => {
    const start = form.startsAt ? new Date(form.startsAt) : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    setForm(prev => ({ ...prev, endsAt: end.toISOString().slice(0, 10) }));
  };

  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md">
    <div className="w-full max-w-2xl rounded-3xl border border-amber-500/30 bg-slate-900 p-5">
      <div className="mb-5 flex justify-between">
        <div>
          <div className="text-xs font-bold text-amber-300">ขั้นตอน {step} จาก 2</div>
          <h2 className="text-xl font-black">{step === 1 ? 'ข้อมูลโรงเรียนและสมาชิก' : 'เชิญ School Admin'}</h2>
        </div>
        <button onClick={close} aria-label="ปิด" className="min-h-11 min-w-11 rounded-xl border border-white/10">✕</button>
      </div>
      {step === 1 ? (
        <form onSubmit={goNext} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold">
              รหัสโรงเรียน *
              <input
                required
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                className={`${input} font-mono`}
                placeholder="เช่น BNS02 (3–32 ตัวอักษร)"
              />
              <span className="text-[10px] text-slate-500 font-normal mt-0.5 block">ภาษาอังกฤษ/ตัวเลข/ขีดล่าง/ขีดกลาง 3-32 ตัว</span>
            </label>
            <label className="text-xs font-bold">
              ชื่อโรงเรียน *
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={input}
                placeholder="เช่น โรงเรียนบ้านน้ำใส"
              />
            </label>
            <label className="text-xs font-bold">
              จังหวัด
              <input
                value={form.province}
                onChange={e => setForm({ ...form, province: e.target.value })}
                className={input}
                placeholder="เช่น เชียงใหม่"
              />
            </label>
            <label className="text-xs font-bold">
              เขตพื้นที่
              <input
                value={form.area}
                onChange={e => setForm({ ...form, area: e.target.value })}
                className={input}
                placeholder="เช่น สพป. เขต 1"
              />
            </label>
            <label className="text-xs font-bold sm:col-span-2">
              แผนแพ็กเกจ *
              <select required value={form.planId} onChange={e => setForm({ ...form, planId: e.target.value })} className={input}>
                <option value="">-- เลือกแผนแพ็กเกจที่จะขาย --</option>
                <optgroup label="── แพ็กเกจระดับโรงเรียน ──">
                  {schoolPlans.map(p => (
                    <option key={p.id} value={p.id}>
                      {formatPlanOption(p)}
                    </option>
                  ))}
                </optgroup>
                {otherPlans.length > 0 && (
                  <optgroup label="── แพ็กเกจครู / นักเรียน ──">
                    {otherPlans.map(p => (
                      <option key={p.id} value={p.id}>
                        {formatPlanOption(p)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {selectedPlan && (
                <div className="mt-2.5 rounded-2xl border border-amber-400/30 bg-slate-950 p-4 text-xs shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{selectedPlan.features?.icon || '🏫'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <b className="text-sm text-slate-100">{selectedPlan.name}</b>
                          {selectedPlan.code === 'school_growth' && (
                            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                              ⭐ ยอดนิยม
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-amber-400 font-mono">{selectedPlan.code} · {selectedPlan.features?.badge || selectedPlan.name}</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                      {selectedPlan.max_students} ที่นั่ง
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="rounded-xl bg-slate-900 border border-white/5 p-2.5">
                      <span className="text-slate-400 block text-[10px]">นักเรียน</span>
                      <b className="text-emerald-400 text-xs">{selectedPlan.max_students} คน</b>
                    </div>
                    <div className="rounded-xl bg-slate-900 border border-white/5 p-2.5">
                      <span className="text-slate-400 block text-[10px]">ครูผู้สอน</span>
                      <b className="text-amber-300 text-xs">{selectedPlan.max_teachers ? `${selectedPlan.max_teachers} ท่าน` : 'ไม่จำกัด'}</b>
                    </div>
                    <div className="rounded-xl bg-slate-900 border border-white/5 p-2.5">
                      <span className="text-slate-400 block text-[10px]">รายเทอม (5 เดือน)</span>
                      <b className="text-white text-xs">{selectedPlan.features?.price_semester ? `฿${Number(selectedPlan.features.price_semester).toLocaleString('th-TH')}` : '—'}</b>
                    </div>
                    <div className="rounded-xl bg-slate-900 border border-white/5 p-2.5">
                      <span className="text-slate-400 block text-[10px]">รายปี (12 เดือน)</span>
                      <b className="text-white text-xs">{selectedPlan.price_yearly ? `฿${Number(selectedPlan.price_yearly).toLocaleString('th-TH')}` : '—'}</b>
                    </div>
                  </div>

                  {selectedPlan.description && (
                    <p className="mt-2.5 text-[11px] text-slate-300 border-t border-white/5 pt-2">{selectedPlan.description}</p>
                  )}
                </div>
              )}
            </label>
            <label className="text-xs font-bold">
              สถานะสมาชิก *
              <select value={form.subscriptionStatus} onChange={e => setForm({ ...form, subscriptionStatus: e.target.value })} className={input}>
                <option value="active">Active (ใช้งานปกติ)</option>
                <option value="trialing">Trialing (ทดลองใช้)</option>
              </select>
            </label>
            <div className="space-y-1">
              <label className="text-xs font-bold">
                วันเริ่ม *
                <input type="date" required value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} className={input} />
              </label>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold">
                วันสิ้นสุด *
                <input type="date" required value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} className={input} />
              </label>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setQuickDuration(5)}
                  className="rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300 hover:border-amber-400 hover:text-white"
                >
                  ⏱️ กำหนด 1 ภาคเรียน (5 เดือน)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(12)}
                  className="rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300 hover:border-amber-400 hover:text-white"
                >
                  💎 กำหนด 1 ปีการศึกษา (12 เดือน)
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button className="min-h-11 rounded-xl bg-amber-400 px-5 font-black text-slate-950">ถัดไป: เชิญผู้ดูแล →</button>
          </div>
        </form>
      ) : (
        <form onSubmit={createSchool} className="space-y-5">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <label className="text-sm font-bold text-emerald-200">
              อีเมล School Admin *
              <input
                type="email"
                required
                value={form.adminEmail}
                onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                className={`${input} min-h-12 text-white`}
                placeholder="admin@school.ac.th"
              />
            </label>
            <p className="mt-2 text-xs text-slate-400">สร้างโรงเรียน สมาชิก และคำเชิญแบบ atomic ผ่าน RPC ไม่มีช่อง UUID และไม่ส่งรหัสผ่าน</p>
          </div>
          <div className="rounded-2xl bg-slate-950 p-4 text-sm">
            <b>{form.name} ({form.code})</b>
            <div className="text-slate-400">
              {activePlans.find(p => p.id === form.planId)?.name} · {fmtDate(form.startsAt)} – {fmtDate(form.endsAt)}
            </div>
            {form.applicationId && (
              <div className="mt-2 text-xs text-amber-300">
                🔗 ผูกกับคำขอสมัครหมายเลข: {form.applicationId} (จะเปลี่ยนสถานะเป็นอนุมัติแล้วทันที)
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="min-h-11 flex-1 rounded-xl border border-white/10 font-bold">← ย้อนกลับ</button>
            <button disabled={saving} className="min-h-11 flex-1 rounded-xl bg-amber-400 font-black text-slate-950 disabled:opacity-50">
              {saving ? 'กำลังสร้าง…' : 'สร้างและออกคำเชิญ'}
            </button>
          </div>
        </form>
      )}
    </div>
  </div>;
}
