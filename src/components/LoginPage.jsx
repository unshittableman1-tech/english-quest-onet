import UIIcon, { UIIconText } from './UIIcon';
import { useState } from 'react';
import { useApp } from '../App';
import { saveStudent } from '../utils/storage';

export default function LoginPage() {
  const { handleLogin, navigate } = useApp();
  const [form, setForm] = useState({ name: '', class: '', number: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name   = 'กรุณากรอกชื่อ-นามสกุล';
    if (!form.class.trim())  e.class  = 'กรุณากรอกชั้น';
    if (!form.number.trim()) e.number = 'กรุณากรอกเลขที่';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStart = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // small delay for UX
    const studentData = { name: form.name.trim(), class: form.class.trim(), number: form.number.trim(), xp: 0, level: 1, badges: [] };
    const saved = saveStudent(studentData);
    handleLogin(saved);
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleStart(); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Decorative floating orbs */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-violet-600/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-8 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-4 w-24 h-24 rounded-full bg-amber-500/15 blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Logo & Title */}
      <div className="text-center mb-8 float-anim">
        <div className="text-7xl mb-3 drop-shadow-xl"><UIIcon value={"⚔️"} /></div>
        <h1 className="text-4xl font-black tracking-tight">
          <span className="text-gradient-gold">English Quest</span>{' '}
          <span className="text-blue-400">AI</span>
        </h1>
        <p className="text-slate-600 font-semibold mt-1 text-lg">O-NET Adventure ป.6</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          {['Vocabulary','Signs','Grammar','Reading'].map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-violet-600/40 text-violet-200 font-semibold border border-amber-300">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="glass-card w-full max-w-sm p-7 mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-5 text-center"><UIIcon value={"🎮"} /> เริ่มการผจญภัย!</h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-600 mb-1.5"><UIIcon value={"👤"} /> ชื่อ-นามสกุล</label>
          <input
            className="input-field"
            type="text"
            placeholder="เช่น สมชาย ใจดี"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            onKeyDown={handleKeyDown}
            autoComplete="name"
          />
          {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Class & Number */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5"><UIIcon value={"🏫"} /> ชั้น</label>
            <input
              className="input-field"
              type="text"
              placeholder="ป.6/1"
              value={form.class}
              onChange={e => setForm(p => ({ ...p, class: e.target.value }))}
              onKeyDown={handleKeyDown}
            />
            {errors.class && <p className="text-rose-600 text-xs mt-1">{errors.class}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5"><UIIcon value={"🔢"} /> เลขที่</label>
            <input
              className="input-field"
              type="number"
              placeholder="1"
              min="1"
              max="50"
              value={form.number}
              onChange={e => setForm(p => ({ ...p, number: e.target.value }))}
              onKeyDown={handleKeyDown}
            />
            {errors.number && <p className="text-rose-600 text-xs mt-1">{errors.number}</p>}
          </div>
        </div>

        {/* Start Button */}
        <button
          className="btn-primary w-full text-xl py-4 relative overflow-hidden"
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              กำลังโหลด...
            </span>
          ) : (
            '⚔️ เริ่มภารกิจ!'
          )}
        </button>
      </div>

      {/* Teacher Button */}
      <button
        className="btn-ghost flex items-center gap-2 text-base px-8 py-3"
        onClick={() => navigate('teacher')}
      >
        <span><UIIcon value={"👩‍🏫"} /></span> Teacher Dashboard
      </button>

      {/* Footer info */}
      <p className="text-slate-800/30 text-xs mt-8 text-center">
        สะสม XP • ปลดล็อก Badge • พิชิต O-NET!<br />
        ข้อมูลบันทึกในเครื่อง ไม่ต้องสมัครสมาชิก
      </p>
    </div>
  );
}
