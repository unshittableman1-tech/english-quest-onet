import { useState, useEffect } from 'react';
import UIIcon from './UIIcon';
import { supabase } from '../config/supabase';
import { sha256Hex, acceptSchoolAdminInvitation } from '../utils/schoolAdmin';
import { createMembershipService, createStaffSession } from '../utils/membership';

const membershipService = createMembershipService(supabase);

const THAI_ERROR_MESSAGES = {
  invitation_email_mismatch: 'อีเมลที่ระบุไม่ตรงกับอีเมลที่ได้รับคำเชิญ กรุณาใช้อีเมลที่แจ้งไว้กับแอดมิน',
  invitation_already_accepted: 'คำเชิญนี้ถูกเปิดใช้งานไปแล้ว คุณครูสามารถเข้าสู่ระบบตามปกติได้เลยครับ',
  invitation_expired: 'คำเชิญนี้หมดอายุแล้ว (อายุ 7 วัน) กรุณาติดต่อทีมงานเพื่อขอคำเชิญใหม่',
  invitation_revoked: 'คำเชิญนี้ถูกยกเลิกแล้ว กรุณาติดต่อทีมงาน',
  invitation_not_found: 'ไม่พบข้อมูลคำเชิญ หรือรหัสคำเชิญไม่ถูกต้อง',
  invalid_invitation_token: 'รหัสคำเชิญไม่ถูกต้อง',
  unauthenticated: 'กรุณากรอกอีเมลและรหัสผ่าน',
};

export default function AcceptInvitationModal({ token, onClose, onSuccess, showToast }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Check initial Supabase Auth session on mount
  useEffect(() => {
    let active = true;
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (active) {
          setCurrentUser(user || null);
          if (user?.email) {
            setEmail(user.email);
          }
        }
      } catch (err) {
        if (active) setCurrentUser(null);
      } finally {
        if (active) setLoadingUser(false);
      }
    }
    checkAuth();
    return () => { active = false; };
  }, []);

  // Generate an easy-to-read suggested password
  const generateSuggestedPassword = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const randomL = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const randomN = Array.from({ length: 3 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
    const generated = `Onet@${randomL}${randomN}`;
    setPassword(generated);
    setShowPassword(true);
  };

  // Magic 1-Click Activation Handler
  const handleMagicActivate = async (e) => {
    e?.preventDefault();
    if (!token) {
      setErrorMessage('ไม่พบรหัสคำเชิญ (Token missing)');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      let activeUser = currentUser;

      // 1. Authenticate user: try signIn first, then fallback to signUp
      if (!activeUser || activeUser.email?.toLowerCase() !== cleanEmail) {
        // Try sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!signInError && signInData?.user) {
          activeUser = signInData.user;
          setCurrentUser(activeUser);
        } else {
          // If sign in fails, attempt sign up
          const redirectUrl = typeof window !== 'undefined'
            ? `${window.location.origin}${window.location.pathname}?invitation_token=${encodeURIComponent(token)}`
            : 'https://english-o-net-adventure.web.app';

          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              emailRedirectTo: redirectUrl,
            },
          });

          if (signUpError) {
            if (signUpError.message?.toLowerCase().includes('invalid login credentials')) {
              throw new Error('อีเมลนี้เคยลงทะเบียนไว้แล้ว กรุณากรอกรหัสผ่านที่ถูกต้อง หรือติดต่อแอดมิน');
            }
            throw signUpError;
          }

          if (signUpData?.user) {
            activeUser = signUpData.user;
            setCurrentUser(activeUser);
          }
        }
      }

      // 2. Hash token with SHA-256
      const tokenHash = await sha256Hex(token);

      // 3. Call authoritative acceptance RPC
      const acceptResult = await acceptSchoolAdminInvitation(tokenHash);

      // 4. Reload verified identity
      const identity = await membershipService.getIdentity();

      // 5. Select the school admin membership
      const targetMembership = identity.memberships.find(
        (m) => m.school_id === acceptResult.school_id && m.role === 'school_admin'
      ) || identity.memberships[0];

      if (!targetMembership) {
        throw new Error('ไม่พบสิทธิ์ผู้ดูแลโรงเรียนที่ได้รับการอนุมัติ');
      }

      // 6. Create verified session
      const verifiedSession = createStaffSession(identity, targetMembership.id);

      setSuccessData({
        schoolId: acceptResult.school_id,
        role: acceptResult.role || 'school_admin',
        session: verifiedSession,
      });

      showToast?.('🎉 เปิดใช้งานโรงเรียนสำเร็จ ยินดีต้อนรับสู่ระบบ!');

      // Automatically transition to school admin dashboard
      setTimeout(() => {
        onSuccess(verifiedSession);
      }, 1200);

    } catch (err) {
      console.error('Magic activation failed:', err);
      const rawCode = err?.code || err?.message || '';
      const matched = Object.keys(THAI_ERROR_MESSAGES).find((k) => rawCode.includes(k));
      setErrorMessage(matched ? THAI_ERROR_MESSAGES[matched] : (err.message || 'เปิดใช้งานไม่สำเร็จ'));
    } finally {
      setSubmitting(false);
    }
  };

  // Logged-in user quick accept handler
  const handleQuickAccept = async () => {
    if (!token) {
      setErrorMessage('ไม่พบรหัสคำเชิญ (Token missing)');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');

    try {
      const tokenHash = await sha256Hex(token);
      const acceptResult = await acceptSchoolAdminInvitation(tokenHash);
      const identity = await membershipService.getIdentity();
      const targetMembership = identity.memberships.find(
        (m) => m.school_id === acceptResult.school_id && m.role === 'school_admin'
      ) || identity.memberships[0];

      if (!targetMembership) {
        throw new Error('ไม่พบสิทธิ์ผู้ดูแลโรงเรียนที่ได้รับการอนุมัติ');
      }

      const verifiedSession = createStaffSession(identity, targetMembership.id);
      setSuccessData({
        schoolId: acceptResult.school_id,
        role: acceptResult.role || 'school_admin',
        session: verifiedSession,
      });

      showToast?.('🎉 ตอบรับสิทธิ์ผู้ดูแลโรงเรียนสำเร็จแล้ว!');
      setTimeout(() => {
        onSuccess(verifiedSession);
      }, 1000);
    } catch (err) {
      console.error('Quick accept failed:', err);
      const rawCode = err?.code || err?.message || '';
      const matched = Object.keys(THAI_ERROR_MESSAGES).find((k) => rawCode.includes(k));
      setErrorMessage(matched ? THAI_ERROR_MESSAGES[matched] : (err.message || 'ตอบรับสิทธิ์ไม่สำเร็จ'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setPassword('');
      setErrorMessage('');
      showToast?.('ออกจากระบบเรียบร้อย');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-card-dark border border-amber-500/40 w-full max-w-lg p-6 rounded-3xl shadow-2xl text-white space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl"><UIIcon value="🏫" /></span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-amber-300">เปิดใช้งานระบบโรงเรียน</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Magic Activation
                </span>
              </div>
              <p className="text-[11px] text-slate-400">School Admin 1-Click Onboarding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl p-1 rounded-lg transition-colors"
            title="ปิดหน้าต่าง"
          >
            <UIIcon value="✕" />
          </button>
        </div>

        {/* Loading State */}
        {loadingUser && (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <div className="inline-block animate-spin text-amber-400 text-2xl">⏳</div>
            <p>กำลังเตรียมความพร้อมของระบบ...</p>
          </div>
        )}

        {/* Success State */}
        {!loadingUser && successData && (
          <div className="py-6 text-center space-y-3">
            <div className="text-5xl animate-bounce">🎉</div>
            <h3 className="text-lg font-black text-emerald-400">เปิดใช้งานโรงเรียนเรียบร้อยแล้ว!</h3>
            <p className="text-xs text-slate-300">
              คุณได้รับสิทธิ์ <strong>ผู้ดูแลระบบโรงเรียน (School Admin)</strong> เรียบร้อยแล้ว<br />
              กำลังนำคุณเข้าสู่แผงควบคุมโรงเรียน...
            </p>
            <div className="pt-2">
              <button
                onClick={() => onSuccess(successData.session)}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg active:scale-95"
              >
                เข้าสู่แผงควบคุมทันที ➜
              </button>
            </div>
          </div>
        )}

        {/* Active Flow */}
        {!loadingUser && !successData && (
          <>
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in">
                <span className="text-base shrink-0"><UIIcon value="⚠️" /></span>
                <div className="flex-1 leading-relaxed">
                  <div className="font-bold text-rose-200">ไม่สามารถเปิดใช้งานได้</div>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Mode A: User is already logged in */}
            {currentUser ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-2">
                  <div className="text-slate-400 text-[11px] font-medium">เข้าสู่ระบบอยู่ในปัจจุบัน:</div>
                  <div className="flex items-center justify-between">
                    <div className="font-mono font-bold text-amber-300 text-sm">{currentUser.email}</div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-bold border border-emerald-500/30">
                      เข้าสู่ระบบแล้ว ✓
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-200 leading-relaxed">
                  กดปุ่มด้านล่างเพื่อผูกสิทธิ์เป็น <strong>ผู้ดูแลระบบโรงเรียน</strong> และเริ่มนำเข้านักเรียนได้ทันทีใน 1 คลิกครับ
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={submitting}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors text-xs text-center"
                  >
                    สลับบัญชีอื่น
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickAccept}
                    disabled={submitting}
                    className="flex-1 py-3.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin text-sm">⏳</span>
                        <span>กำลังเปิดใช้งาน...</span>
                      </>
                    ) : (
                      <>
                        <span><UIIcon value="🚀" /></span>
                        <span>ยืนยันและเปิดใช้งานโรงเรียนทันที</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Mode B: Seamless Magic Form (NO TABS!) */
              <form onSubmit={handleMagicActivate} className="space-y-4 text-xs">
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-200 text-[11px] leading-relaxed flex items-start gap-2.5">
                  <span className="text-base shrink-0">✨</span>
                  <div>
                    <strong>ไม่ต้องตรวจสอบอีเมล!</strong> กรอกรหัสผ่านเพื่อเปิดใช้งานโรงเรียนและเข้าสู่ระบบได้ทันทีในคลิกเดียว
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px]">
                    อีเมลที่ได้รับคำเชิญ:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="krusomsri@school.ac.th"
                    className="w-full bg-slate-950/80 border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all placeholder:text-slate-500 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-bold text-[11px]">
                      รหัสผ่านสำหรับเข้าใช้งาน:
                    </label>
                    <button
                      type="button"
                      onClick={generateSuggestedPassword}
                      className="text-[10px] text-amber-300 hover:text-amber-200 underline font-bold"
                    >
                      🎲 สุ่มรหัสผ่านแนะนำ
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                      className="w-full bg-slate-950/80 border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all placeholder:text-slate-500 pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
                      title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    ใช้สำหรับเข้าสู่ระบบในครั้งต่อไป (คุณครูสามารถเปลี่ยนรหัสได้ภายหลัง)
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin text-sm">⏳</span>
                        <span>กำลังเปิดใช้งานและเข้าสู่ระบบ...</span>
                      </>
                    ) : (
                      <>
                        <span><UIIcon value="🚀" /></span>
                        <span>เปิดใช้งานโรงเรียนและเริ่มใช้งานทันที</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}
