import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { validateOwnerPassword } from '../utils/passwordPolicy';

export default function OwnerActivationPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('กำลังตรวจสอบคำเชิญ...');
  const policy = validateOwnerPassword(password, email);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.user?.email) {
        setStatus('invalid');
        setMessage('ลิงก์ยืนยันไม่ถูกต้อง หมดอายุ หรือไม่ได้เปิดจากอีเมลคำเชิญ');
        return;
      }
      setEmail(data.user.email);
      setStatus('ready');
      setMessage('ตั้งรหัสผ่านสำหรับบัญชีเจ้าของระบบ');
    });
    return () => { active = false; };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!policy.valid || password !== confirmPassword) return;
    setStatus('saving');
    setMessage('กำลังบันทึกรหัสผ่าน...');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('ready');
      setMessage('ตั้งรหัสผ่านไม่สำเร็จ กรุณาขอลิงก์ใหม่จากผู้ดูแลระบบ');
      return;
    }
    const { data: existingAdmin } = await supabase
      .from('platform_admins')
      .select('user_id')
      .maybeSingle();
    await supabase.auth.signOut({ scope: 'local' });
    setPassword('');
    setConfirmPassword('');
    setStatus('complete');
    setMessage(existingAdmin?.user_id
      ? 'เปลี่ยนรหัสผ่านสำเร็จแล้ว คุณสามารถเข้าสู่ Super Admin Hub ได้ทันที'
      : 'ยืนยันบัญชีและตั้งรหัสผ่านแล้ว โปรดแจ้ง operator ให้ finalize สิทธิ์ Platform Admin');
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-sky-500/30 bg-slate-900 p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-400">English Quest AI</p>
        <h1 className="mt-2 text-2xl font-black">เปิดใช้งานบัญชีเจ้าของระบบ</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{message}</p>
        {email && <p className="mt-4 rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-300">บัญชี: {email}</p>}

        {status === 'ready' || status === 'saving' ? (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">รหัสผ่านใหม่
              <input type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-white" />
            </label>
            <label className="block text-sm font-semibold">ยืนยันรหัสผ่าน
              <input type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-white" />
            </label>
            <ul className="grid grid-cols-2 gap-1 text-xs text-slate-400">
              <li>• อย่างน้อย 12 ตัวอักษร</li><li>• ตัวพิมพ์ใหญ่และเล็ก</li><li>• ตัวเลขอย่างน้อย 1 ตัว</li><li>• สัญลักษณ์อย่างน้อย 1 ตัว</li>
            </ul>
            {confirmPassword && password !== confirmPassword && <p className="text-sm text-rose-400">รหัสผ่านทั้งสองช่องไม่ตรงกัน</p>}
            <button disabled={status === 'saving' || !policy.valid || password !== confirmPassword} className="min-h-12 w-full rounded-lg bg-sky-600 px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">ยืนยันและตั้งรหัสผ่าน</button>
          </form>
        ) : null}
        {status === 'complete' && <a href="/?route=teacher-login" className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-slate-600 font-bold">ไปหน้าล็อกอิน</a>}
      </section>
    </main>
  );
}
