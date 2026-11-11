import UIIcon, { UIIconText } from './UIIcon';
import { useState } from 'react';
import { useApp } from '../App';
import ClearCacheBtn from './ClearCacheBtn';
import { supabase } from '../config/supabase';
import { createMembershipService, createStaffSession } from '../utils/membership';

const membershipService = createMembershipService(supabase);

const AUTH_ERRORS = {
  credentials_required: 'กรุณากรอกอีเมลและรหัสผ่าน',
  unauthenticated: 'ไม่พบเซสชันผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่',
  no_membership: 'บัญชีนี้ยังไม่ได้รับสิทธิ์ครูหรือผู้ดูแลระบบ',
  school_forbidden: 'ไม่สามารถยืนยันสิทธิ์ของโรงเรียนนี้ได้',
  session_cleanup_failed: 'ไม่สามารถปิดเซสชันที่ไม่ผ่านสิทธิ์ได้ กรุณาลองใหม่',
};

export default function TeacherLoginPage() {
  const { navigate, handleTeacherLogin } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [pendingIdentity, setPendingIdentity] = useState(null);

  const finishLogin = (identity, membershipId = null) => {
    const session = createStaffSession(identity, membershipId);
    handleTeacherLogin(session);
  };

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password) {
      setError(AUTH_ERRORS.credentials_required);
      return;
    }
    setLoading(true);
    setError('');
    setPendingIdentity(null);

    // Support developer / test aliases smoothly
    let loginEmail = form.email.trim();
    let loginPassword = form.password;
    if (loginEmail.toLowerCase() === 'teacher@englishquest.school' && (loginPassword === 'Teacher123' || !loginPassword)) {
      loginEmail = 'teacher.synthetic@onet.local';
      loginPassword = 'LocalTeacher!123456';
    }

    try {
      const identity = await membershipService.signIn(loginEmail, loginPassword);
      if (!identity.isPlatformAdmin && identity.memberships.length > 1) {
        setPendingIdentity(identity);
      } else {
        finishLogin(identity);
      }
    } catch (loginError) {
      setError(AUTH_ERRORS[loginError?.code] || 'เข้าสู่ระบบไม่สำเร็จ หรือไม่สามารถยืนยันสิทธิ์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSelection = (membershipId) => {
    setError('');
    try {
      finishLogin(pendingIdentity, membershipId);
    } catch (selectionError) {
      setError(AUTH_ERRORS[selectionError?.code] || 'ไม่สามารถยืนยันสิทธิ์ของโรงเรียนนี้ได้');
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-emerald-300/15 blur-3xl pointer-events-none rounded-b-full" />

      <div className="relative z-10 w-full max-w-sm">

        {/* Back */}
        <div className="flex items-center justify-between mb-6">
          <button
            className="btn-ghost flex items-center gap-2 text-sm font-semibold px-4 py-2"
            onClick={() => navigate('landing')}
          >
            <UIIcon value={"←"} /> กลับหน้าหลัก
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3 float-anim"><UIIcon value={"👩‍🏫"} /></div>
          <h1 className="text-2xl font-black text-amber-800">Teacher Login</h1>
          <p className="text-slate-500 text-sm mt-1">เข้าสู่ระบบเพื่อดู Teacher Dashboard</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 space-y-4">

          {/* Email */}
          <div>
            <label htmlFor="teacher-email" className="block text-sm font-bold text-slate-700 mb-1.5">
              <UIIcon value={"👤"} /> Email
            </label>
            <input
              id="teacher-email"
              className="input-field"
              type="email"
              placeholder="teacher@school.ac.th"
              value={form.email}
              onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError(''); setPendingIdentity(null); }}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              autoFocus
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="teacher-password" className="block text-sm font-bold text-slate-700 mb-1.5">
              <UIIcon value={"🔒"} /> Password
            </label>
            <div className="relative">
              <input
                id="teacher-password"
                className="input-field pr-12"
                type={showPw ? 'text' : 'password'}
                placeholder="••••"
                value={form.password}
                onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); setPendingIdentity(null); }}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label={showPw ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                aria-pressed={showPw}
                className="absolute right-1 top-1/2 -translate-y-1/2 min-h-11 min-w-11 text-slate-500 hover:text-slate-700 text-sm transition-colors px-1"
                onClick={() => setShowPw(v => !v)}
              >
                <UIIconText value={showPw ? '🙈' : '👁️'} />
              </button>
            </div>
          </div>

          {/* Quick Fill Test Account */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => {
                setForm({ email: 'teacher@englishquest.school', password: 'Teacher123' });
                setError('');
              }}
              className="w-full text-xs text-amber-900 bg-amber-100/70 hover:bg-amber-200/80 border border-amber-300 rounded-lg py-1.5 px-3 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UIIcon value={"🔑"} /> กรอกบัญชีครูทดสอบอัตโนมัติ (คลิกเดียว)
            </button>
          </div>

          {pendingIdentity && (
            <div className="pt-1 space-y-2" role="group" aria-label="เลือกโรงเรียน">
              <div className="text-xs font-bold text-slate-600">เลือกโรงเรียนที่ต้องการจัดการ</div>
              {pendingIdentity.memberships.map((membership) => (
                <button
                  key={membership.id}
                  type="button"
                  onClick={() => handleSchoolSelection(membership.id)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-amber-50 hover:border-amber-400 text-left transition-all"
                >
                  <div className="font-bold text-slate-800 text-sm">{membership.school.name}</div>
                  <div className="text-xs text-slate-500">{membership.school.code} · {membership.role}</div>
                </button>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div role="alert" className="bg-rose-100 border border-rose-300 rounded-xl px-4 py-3 text-rose-700 text-sm font-semibold animate-slide-up">
              <UIIcon value={"⚠️"} /> {error}
            </div>
          )}

          {/* Login Button */}
          <button
            className="btn-primary w-full text-lg py-4 mt-1 cursor-pointer"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                กำลังเข้าสู่ระบบ...
              </span>
            ) : '🏫 เข้าสู่ Teacher Dashboard'}
          </button>

          {/* Quick Demo Access */}
          <div className="pt-2 border-t border-slate-200/60 mt-2 text-center">
            <a
              href="http://127.0.0.1:5180/?demo=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold bg-amber-100/80 text-amber-900 hover:bg-amber-200/90 border border-amber-300 transition-all text-sm shadow-sm"
            >
              <UIIcon value={"👩‍🏫"} /> เปิด Teacher Dashboard เดโมทันที (ไม่ต้องล็อกอิน) →
            </a>
          </div>

        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          สิทธิ์การใช้งานตรวจสอบผ่านระบบโรงเรียนที่ได้รับอนุญาต
        </p>
      </div>
    </div>
  );
}
