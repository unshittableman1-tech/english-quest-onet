import UIIcon, { UIIconText } from './UIIcon';
import { useState, useEffect } from 'react';
import { useApp } from '../App';
import { normalizeSchoolCode, readSchoolEntry, resolveStudentSchool, schoolEntryUrl } from '../utils/schoolEntry';
import CuteUpdateModal from './CuteUpdateModal';
import EnglishQuestLogo from './landing/EnglishQuestLogo';

export default function StudentLoginPage() {
  const { navigate, handleLogin } = useApp();
  const [form, setForm] = useState({ studentId: '', pin: '' });
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [entry, setEntry] = useState(() => readSchoolEntry(window.location));
  const [schoolCodeInput, setSchoolCodeInput] = useState(() => readSchoolEntry(window.location).code || '');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolState, setSchoolState] = useState('idle');
  const [schoolRetry, setSchoolRetry] = useState(0);

  // Show update modal only if requested via URL parameters (e.g. ?update=1)
  const [showUpdateModal, setShowUpdateModal] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('update') === '1' || params.has('forceUpdate');
  });

  useEffect(() => {
    const onPopState = () => setEntry(readSchoolEntry(window.location));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setSelectedSchool(null);
    setForm({ studentId: '', pin: '' });
    setShowPin(false);
    setErrors({});
    if (entry.kind !== 'school') {
      setSchoolState('idle');
      return () => controller.abort();
    }
    if (!entry.code) {
      setSchoolState('unavailable');
      return () => controller.abort();
    }
    setSchoolState('loading');
    resolveStudentSchool(entry.code, controller.signal)
      .then((school) => {
        if (controller.signal.aborted) return;
        setSelectedSchool(school);
        setSchoolState('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) setSchoolState('unavailable');
      });
    return () => controller.abort();
  }, [entry, schoolRetry]);

  const handleSchoolCodeSubmit = () => {
    const code = normalizeSchoolCode(schoolCodeInput);
    if (!code) {
      setErrors({ schoolCode: 'กรุณากรอกรหัสโรงเรียนที่ถูกต้อง (เช่น BNS01)' });
      return;
    }
    setSchoolCodeInput(code);
    window.history.pushState({}, '', schoolEntryUrl(window.location.origin, code));
    setEntry({ kind: 'school', code });
  };

  const handleSwitchSchool = () => {
    if (loading) return;
    window.history.pushState({}, '', '/?route=student-login');
    setSchoolCodeInput('');
    setEntry({ kind: 'general', code: null });
    setSelectedSchool(null);
    setForm({ studentId: '', pin: '' });
    setErrors({});
  };

  const handleLoginSubmit = async () => {
    const e = {};
    if (!selectedSchool || schoolState !== 'ready') e.general = 'กรุณายืนยันโรงเรียนก่อนเข้าสู่ระบบ';
    if (!form.studentId.trim()) e.studentId = 'กรุณากรอกรหัสนักเรียน';
    if (!form.pin.trim()) e.pin = 'กรุณากรอกรหัส PIN';
    else if (!/^\d{6}$/.test(form.pin.trim())) e.pin = 'รหัส PIN ต้องเป็นตัวเลข 6 หลัก';

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const { loginStudent } = await import('../utils/studentAuth');
      const result = await loginStudent({
        schoolCode: selectedSchool.code,
        studentId: form.studentId.trim(),
        pin: form.pin.trim(),
      });

      handleLogin(result.student);
    } catch (err) {
      setErrors({ general: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field] || errors.general) {
      setErrors(p => ({ ...p, [field]: '', general: '' }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">

      {/* Cute Update Modal */}
      <CuteUpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onContinue={() => {
          setShowUpdateModal(false);
          const url = new URL(window.location.href);
          url.searchParams.delete('update');
          url.searchParams.delete('forceUpdate');
          window.history.replaceState({}, '', url);
        }}
      />

      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-300/20 blur-3xl pointer-events-none rounded-b-full" />

      <div className="relative z-10 w-full max-w-sm">

        {/* Top actions bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="btn-ghost flex items-center gap-2 text-sm font-semibold px-4 py-2"
            onClick={() => navigate('landing')}
          >
            <UIIcon value={"←"} /> กลับหน้าหลัก
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="mx-auto mb-4 w-64 max-w-full"><EnglishQuestLogo /></div>
          <h1 className="text-2xl font-black text-amber-800">เข้าสู่ระบบนักเรียน</h1>
          <p className="text-slate-500 text-xs mt-1">ผจญภัยสู่ความพร้อมสอบ O-NET ภาษาอังกฤษ ป.6</p>
        </div>

        <div className="glass-card p-6 space-y-4 shadow-xl">

          <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-50 to-white p-4 text-center shadow-sm" aria-live="polite">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-800" aria-hidden="true"><UIIcon value="🏫" /></div>
            <p className="text-xs font-bold text-amber-800">ยินดีต้อนรับสู่การผจญภัย</p>
            {schoolState === 'ready' && selectedSchool ? (
              <h2 className="mt-1 break-words text-xl font-black leading-snug text-slate-900">{selectedSchool.name}</h2>
            ) : schoolState === 'loading' ? (
              <p className="mt-1 text-sm text-slate-600">กำลังตรวจสอบโรงเรียน...</p>
            ) : schoolState === 'unavailable' ? (
              <p className="mt-1 text-sm font-bold text-rose-700">ไม่สามารถเปิดหน้าโรงเรียนนี้ได้</p>
            ) : (
              <p className="mt-1 text-sm text-slate-700">กรอกรหัสโรงเรียนเพื่อเริ่มต้น</p>
            )}
            {selectedSchool && <p className="mt-1 text-xs text-slate-600">พื้นที่การเรียนรู้ของโรงเรียนคุณ</p>}
          </div>
          {schoolState === 'unavailable' && entry.code && (
            <button type="button" className="min-h-11 w-full rounded-xl border border-sky-700 px-3 text-sm font-semibold text-sky-800"
              onClick={() => setSchoolRetry(previous => previous + 1)}>
              ลองตรวจสอบโรงเรียนอีกครั้ง
            </button>
          )}

          {entry.kind === 'general' && (
            <div>
              <label htmlFor="school-code-input" className="mb-1.5 block text-xs font-bold text-slate-700">รหัสโรงเรียน</label>
              <div className="flex gap-2">
                <input id="school-code-input" className="input-field min-w-0 flex-1 text-sm uppercase" value={schoolCodeInput}
                  aria-invalid={Boolean(errors.schoolCode)} aria-describedby={errors.schoolCode ? 'school-code-error' : undefined}
                  onChange={event => { setSchoolCodeInput(event.target.value); setErrors({}); }}
                  onKeyDown={event => event.key === 'Enter' && handleSchoolCodeSubmit()} autoComplete="off" />
                <button type="button" className="rounded-xl bg-amber-400 px-3 text-xs font-bold text-amber-950" onClick={handleSchoolCodeSubmit}>ตรวจสอบ</button>
              </div>
              {errors.schoolCode && <p id="school-code-error" className="mt-1 text-xs text-rose-700" role="alert">{errors.schoolCode}</p>}
            </div>
          )}

          {/* General Error Alert */}
          {errors.general && (
            <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2 animate-shake">
              <span className="text-base shrink-0"><UIIcon value={"⚠️"} /></span>
              <span className="leading-tight">{errors.general}</span>
            </div>
          )}

          {/* Student ID */}
          <div>
            <label htmlFor="student-id-input" className="block text-xs font-bold text-slate-700 mb-1.5">
              <UIIcon value={"👤"} /> รหัสนักเรียน (Student ID) <span className="text-rose-500">*</span>
            </label>
            <input
              id="student-id-input"
              className="input-field text-sm"
              type="text"
              placeholder="เช่น STU001 หรือ เลขประจำตัว"
              value={form.studentId}
              onChange={handleChange('studentId')}
              onKeyDown={e => e.key === 'Enter' && handleLoginSubmit()}
              autoComplete="username"
              aria-required="true"
              aria-invalid={Boolean(errors.studentId)}
              aria-describedby={errors.studentId ? 'student-id-error' : undefined}
              disabled={loading || schoolState !== 'ready'}
            />
            {errors.studentId && (
              <p id="student-id-error" className="text-rose-700 text-xs mt-1 leading-tight"><UIIcon value={"⚠️"} /> {errors.studentId}</p>
            )}
          </div>

          {/* PIN Input */}
          <div>
            <label htmlFor="student-pin-input" className="block text-xs font-bold text-slate-700 mb-1.5">
              <UIIcon value={"🔑"} /> รหัสผ่าน PIN (6 หลัก) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="student-pin-input"
                className="input-field text-sm pr-16 tracking-widest font-mono"
                type={showPin ? "text" : "password"}
                placeholder="••••••"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.pin}
                onChange={handleChange('pin')}
                onKeyDown={e => e.key === 'Enter' && handleLoginSubmit()}
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={Boolean(errors.pin)}
                aria-describedby={errors.pin ? 'student-pin-error' : undefined}
                disabled={loading || schoolState !== 'ready'}
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 min-h-11 min-w-11 text-slate-600 hover:text-slate-800 text-xs font-bold cursor-pointer"
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? 'ซ่อนรหัส PIN' : 'แสดงรหัส PIN'}
                aria-pressed={showPin}
              >
                {showPin ? 'ซ่อน' : 'แสดง'}
              </button>
            </div>
            {errors.pin && (
              <p id="student-pin-error" className="text-rose-700 text-xs mt-1 leading-tight"><UIIcon value={"⚠️"} /> {errors.pin}</p>
            )}
          </div>

          <button
            id="student-login-submit-btn"
            className="btn-primary w-full text-base py-3.5 mt-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            onClick={handleLoginSubmit}
            disabled={loading || schoolState !== 'ready'}
          >
            <UIIconText value={loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ →'} />
          </button>

          <p className="text-slate-400 text-[11px] text-center pt-1">
            พบปัญหาการเข้าสู่ระบบ หรือลืมรหัส PIN กรุณาติดต่อคุณครู
          </p>
          {entry.kind === 'school' && (
            <button type="button" onClick={handleSwitchSchool} disabled={loading}
              className="block w-full text-center text-xs font-semibold text-sky-800 underline underline-offset-2 hover:text-sky-950">
              ไม่ใช่โรงเรียนของคุณ? เปลี่ยนโรงเรียน
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
