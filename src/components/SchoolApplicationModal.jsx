import React, { useState, useEffect } from 'react';
import { School, CheckCircle2, Copy, X, Sparkles, User, Building, ShieldCheck, FileText, Check, GraduationCap } from 'lucide-react';
import { submitSchoolApplication } from '../utils/schoolApplications';
import { PRICING_PLANS, BILLING_CYCLES, formatPrice } from '../data/pricingPlans';

export default function SchoolApplicationModal({
  isOpen,
  onClose,
  initialPlanId = 'student_hero',
  initialCycle = 'monthly'
}) {
  const [category, setCategory] = useState('student'); // 'student' | 'teacher' | 'school'
  const [selectedPlanId, setSelectedPlanId] = useState('student_hero');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [needQuotation, setNeedQuotation] = useState(false);

  const [form, setForm] = useState({
    schoolName: '',
    schoolNameEnglish: '',
    province: '',
    district: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    expectedStudents: 1,
    expectedTeachers: 0,
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialPlanId === 'teacher_pro') {
      setCategory('teacher');
      setSelectedPlanId('teacher_pro');
      setBillingCycle(initialCycle || 'semester');
      setForm(prev => ({ ...prev, expectedStudents: 40, expectedTeachers: 1 }));
    } else if (initialPlanId && (initialPlanId.startsWith('school_') || initialPlanId === 'superpower')) {
      setCategory('school');
      setSelectedPlanId(initialPlanId);
      setBillingCycle(initialCycle && initialCycle !== 'monthly' ? initialCycle : 'semester');
      setForm(prev => ({ ...prev, expectedStudents: 150, expectedTeachers: 5 }));
      setNeedQuotation(true);
    } else {
      // Default: Student Hero
      setCategory('student');
      setSelectedPlanId('student_hero');
      setBillingCycle(initialCycle || 'monthly');
      setForm(prev => ({ ...prev, expectedStudents: 1, expectedTeachers: 0 }));
      setNeedQuotation(false);
    }
  }, [initialPlanId, initialCycle, isOpen]);

  if (!isOpen) return null;

  const currentPlan = PRICING_PLANS.find(p => p.id === selectedPlanId) || PRICING_PLANS[3];
  const basePrice = currentPlan.prices[billingCycle] ?? currentPlan.prices.semester;

  // Teacher Pro Pricing Logic: Base Platform Fee + Per-Student Fee for all students
  const studentCount = Number(form.expectedStudents) || 0;
  let perStudentRate = 0;
  let perStudentTotal = 0;
  if (category === 'teacher') {
    perStudentRate = currentPlan.perStudentFee?.[billingCycle] ?? (billingCycle === 'monthly' ? 10 : billingCycle === 'yearly' ? 40 : 25);
    perStudentTotal = studentCount * perStudentRate;
  }
  const price = basePrice + perStudentTotal;

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat === 'student') {
      setSelectedPlanId('student_hero');
      setForm(prev => ({ ...prev, expectedStudents: 1, expectedTeachers: 0 }));
    } else if (newCat === 'teacher') {
      setSelectedPlanId('teacher_pro');
      setForm(prev => ({ ...prev, expectedStudents: 15, expectedTeachers: 1 }));
    } else {
      setSelectedPlanId('school_growth');
      if (billingCycle === 'monthly') setBillingCycle('semester');
      setForm(prev => ({ ...prev, expectedStudents: 150, expectedTeachers: 5 }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (category === 'school' && !form.schoolName.trim()) return setError('กรุณาระบุชื่อโรงเรียน หรือสถานศึกษา');
    if (!form.province.trim()) return setError('กรุณาระบุจังหวัด');
    if (!form.contactName.trim()) return setError('กรุณาระบุชื่อผู้สมัคร / ผู้ประสานงาน');
    if (!form.contactEmail.trim() || !form.contactEmail.includes('@')) {
      return setError('กรุณาระบุอีเมลที่ถูกต้อง');
    }
    if (!form.contactPhone.trim()) return setError('กรุณาระบุเบอร์โทรศัพท์');

    setSaving(true);
    try {
      const cycleText = billingCycle === 'monthly' ? 'รายเดือน (30 วัน)' : billingCycle === 'semester' ? 'รายเทอม (5 เดือน)' : 'รายปี (12 เดือน)';
      const result = await submitSchoolApplication({
        ...form,
        applicantType: category,
        packageInterest: currentPlan.id,
        packageName: currentPlan.name,
        billingCycle: billingCycle,
        cycleLabel: cycleText,
        approxPrice: price,
        needQuotation: needQuotation,
      });
      setSuccessResult(result);
    } catch (err) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการส่งคำขอ โปรดลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  const copyRef = async () => {
    if (successResult?.referenceCode) {
      await navigator.clipboard.writeText(successResult.referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-xl border border-white/10 grid place-items-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="ปิด"
        >
          <X size={20} />
        </button>

        {successResult ? (
          /* Success Screen */
          <div className="text-center py-6 space-y-5 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 grid place-items-center mx-auto text-3xl">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-emerald-300">
                {category === 'student' ? 'ส่งคำขอสมัครแพ็กเกจนักเรียนสำเร็จ' : category === 'teacher' ? 'ส่งคำขอสมัครแพ็กเกจครูสำเร็จ' : 'ยื่นคำขอรับแพ็กเกจโรงเรียนเรียบร้อยแล้ว'}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                ข้อมูลของ <span className="font-bold text-white">{successResult.contactName} {successResult.schoolName && `(${successResult.schoolName})`}</span> ถูกส่งเข้าสู่ระบบเรียบร้อยแล้ว
              </p>
            </div>

            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2.5">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">รหัสอ้างอิงคำขอ (Reference Code)</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-amber-300">{successResult.referenceCode}</span>
                <button
                  onClick={copyRef}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-300 transition-colors shadow-md"
                >
                  <Copy size={14} /> {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                </button>
              </div>
              <div className="pt-2 text-xs text-slate-400 border-t border-white/5 space-y-1">
                <div>แพ็กเกจ: <span className="text-white font-bold">{successResult.packageName}</span> ({successResult.cycleLabel || billingCycle})</div>
                <div>อัตราค่าบริการ: <span className="text-amber-400 font-bold">{formatPrice(successResult.approxPrice)}</span></div>
                {successResult.needQuotation && (
                  <div className="text-sky-300 flex items-center gap-1 font-medium">
                    <FileText size={12} /> ขอรับใบเสนอราคา / เอกสารสำหรับเบิกจ่าย
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-left">
              💡 <b>ขั้นตอนถัดไป:</b> ทีมงานจะตรวจสอบและจัดส่งข้อมูลการเข้าใช้งาน พร้อมเอกสารใบเสนอราคา (กรณีขอไว้) ไปยังอีเมล <b>{successResult.contactEmail}</b> ภายใน 24 ชม.
            </div>

            <button
              onClick={onClose}
              className="min-h-12 w-full max-w-md mx-auto bg-amber-400 text-slate-950 font-black rounded-xl hover:bg-amber-300 transition-all block"
            >
              เสร็จสิ้น
            </button>
          </div>
        ) : (
          /* Application Form */
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center text-slate-950 text-2xl shadow-lg shadow-amber-500/20">
                {category === 'student' ? '🎒' : category === 'teacher' ? '👩‍🏫' : <School size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">
                    {category === 'student' ? 'สมัครแพ็กเกจ Student Hero (นักเรียน)' : category === 'teacher' ? 'สมัครแพ็กเกจ Teacher Pro (คุณครู)' : 'สมัครขอรับแพ็กเกจโรงเรียน & ขอใบเสนอราคา'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Pricing 2027
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {category === 'student'
                    ? 'ปลดล็อกเควสต์ทุกบท ทบทวนข้อผิด และเตรียมสอบ O-NET ป.6 ด้วยตนเอง'
                    : category === 'teacher'
                    ? 'จัดการเรียนการสอนในห้อง ให้การบ้าน และติดตามผลนักเรียนสูงสุด 40 คน'
                    : 'เลือกแพ็กเกจที่ต้องการ พร้อมออกใบเสนอราคาเพื่อเบิกงบประมาณโรงเรียน'}
                </p>
              </div>
            </div>

            {/* Category Segmented Tabs: 1. นักเรียน, 2. ครู, 3. โรงเรียน */}
            <div className="flex p-1 bg-slate-950/80 border border-white/10 rounded-2xl mb-4 gap-1">
              <button
                type="button"
                onClick={() => handleCategoryChange('student')}
                className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  category === 'student'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🎒</span> 1. นักเรียน (Student Hero)
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('teacher')}
                className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  category === 'teacher'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👩‍🏫</span> 2. ครูผู้สอน (Teacher Pro)
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('school')}
                className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  category === 'school'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🏫</span> 3. ระดับโรงเรียน (School)
              </button>
            </div>

            {error && (
              <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold animate-shake">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. เลือกแพ็กเกจ และรอบชำระ */}
              <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles size={14} /> 1. รายละเอียดแพ็กเกจและรอบชำระเงิน
                  </div>

                  {/* Billing Cycle Switcher */}
                  <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
                    {category !== 'school' && (
                      <button
                        type="button"
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          billingCycle === 'monthly'
                            ? 'bg-amber-400 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        รายเดือน (30 วัน)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setBillingCycle('semester')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        billingCycle === 'semester'
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      รายเทอม (5 ด.)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('yearly')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        billingCycle === 'yearly'
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      รายปี (12 ด. - คุ้มสุด)
                    </button>
                  </div>
                </div>

                {/* Cards rendering based on category */}
                {category === 'school' ? (
                  <div className="grid gap-2 sm:grid-cols-3">
                    {PRICING_PLANS.filter(p => p.schoolApplicable).map(plan => {
                      const planPrice = plan.prices[billingCycle];
                      const isSelected = selectedPlanId === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`text-left p-3 rounded-2xl border transition-all relative ${
                            isSelected
                              ? 'border-amber-400 bg-amber-400/10 text-white shadow-md shadow-amber-500/10'
                              : 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          {plan.popular && (
                            <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] bg-amber-400 text-slate-950 font-black">
                              ยอดนิยม
                            </span>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{plan.icon}</span>
                            <span className="text-xs font-black text-amber-300">{plan.name}</span>
                          </div>
                          <div className="text-base font-black text-white mt-1.5">
                            {formatPrice(planPrice)}
                            <span className="text-[10px] text-slate-400 font-normal"> / {billingCycle === 'semester' ? 'เทอม' : 'ปี'}</span>
                          </div>
                          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">{plan.quota}</div>
                        </button>
                      );
                    })}
                  </div>
                ) : category === 'teacher' ? (
                  /* Teacher Pro Detailed Card */
                  <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-400/10 via-slate-900 to-slate-900 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">👩‍🏫</span>
                          <span className="text-lg font-black text-white">Teacher Pro</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                            สำหรับครูภาษาอังกฤษ
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {currentPlan.description}
                        </p>
                        <div className="text-xs font-bold text-emerald-400 mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span>✓ 1 บัญชีครู · ดูแลได้ 1–2 ห้องเรียน</span>
                          <span className="px-2 py-0.5 rounded bg-sky-400/20 text-sky-300 border border-sky-400/30 text-[11px]">
                            + รายหัวนักเรียน {formatPrice(perStudentRate)} / คน / {billingCycle === 'monthly' ? 'ด.' : billingCycle === 'semester' ? 'เทอม' : 'ปี'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          คิดค่าบริการครูพื้นฐาน + รายหัวตามจำนวนนักเรียนที่ดูแลจริง จ่ายตามจำนวนเด็กจริง
                        </p>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <div className="text-2xl sm:text-3xl font-black text-amber-300">
                          {formatPrice(price)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          / {billingCycle === 'monthly' ? 'เดือน' : billingCycle === 'semester' ? 'เทอม (5 เดือน)' : 'ปี (12 เดือน)'}
                        </div>
                        {studentCount > 0 && (
                          <div className="text-[10px] text-sky-300 mt-0.5 font-medium">
                            (ฐาน {formatPrice(basePrice)} + {studentCount} คน)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Student Hero Detailed Card */
                  <div className="rounded-2xl border-2 border-sky-400 bg-gradient-to-r from-sky-400/10 via-slate-900 to-slate-900 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎒</span>
                          <span className="text-lg font-black text-white">Student Hero</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-400 text-slate-950">
                            สำหรับนักเรียน &amp; ผู้ปกครอง
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {currentPlan.description}
                        </p>
                        <div className="text-xs font-bold text-sky-300 mt-1.5">
                          ✓ โควต้า: 1 บัญชีผู้เรียน (ปลดล็อกเควสต์ทุกบท, ทบทวนข้อผิด, XP, Arena)
                        </div>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <div className="text-2xl sm:text-3xl font-black text-sky-300">
                          {formatPrice(price)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          / {billingCycle === 'monthly' ? 'เดือน' : billingCycle === 'semester' ? 'เทอม (5 เดือน)' : 'ปี (12 เดือน)'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. ข้อมูลสถาบัน / ผู้เรียน */}
              <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Building size={14} /> 2. {category === 'student' ? 'ข้อมูลผู้เรียน' : category === 'teacher' ? 'ข้อมูลโรงเรียนที่สังกัด' : 'ข้อมูลโรงเรียน / สถานศึกษา'}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">
                      {category === 'student' ? 'โรงเรียนที่กำลังศึกษาอยู่ (ถ้ามี)' : 'ชื่อโรงเรียน *'}
                    </label>
                    <input
                      required={category !== 'student'}
                      value={form.schoolName}
                      onChange={e => setForm({ ...form, schoolName: e.target.value })}
                      placeholder={category === 'student' ? 'เช่น โรงเรียนบ้านน้ำใส' : 'เช่น โรงเรียนบ้านน้ำใส'}
                      className="w-full min-h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">จังหวัด *</label>
                    <input
                      required
                      value={form.province}
                      onChange={e => setForm({ ...form, province: e.target.value })}
                      placeholder="เช่น เชียงใหม่, กรุงเทพมหานคร"
                      className="w-full min-h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">
                      {category === 'student' ? 'ระดับชั้น / ห้องเรียน' : 'อำเภอ / เขตพื้นที่การศึกษา'}
                    </label>
                    <input
                      value={form.district}
                      onChange={e => setForm({ ...form, district: e.target.value })}
                      placeholder={category === 'student' ? 'เช่น ป.6/1' : 'เช่น สพป. เชียงใหม่ เขต 1'}
                      className="w-full min-h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">
                      {category === 'student' ? 'จำนวนผู้เรียน (คน)' : category === 'teacher' ? 'จำนวนนักเรียนที่ดูแลรวมทุกห้อง (คน)' : 'จำนวนนักเรียน ป.6 โดยประมาณ'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={category === 'student' ? '1' : category === 'teacher' ? '200' : undefined}
                      value={form.expectedStudents}
                      onChange={e => setForm({ ...form, expectedStudents: Number(e.target.value) || '' })}
                      className="w-full min-h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white focus:border-amber-400 outline-none"
                    />
                    {category === 'teacher' && (
                      <div className="mt-2 text-xs">
                        {studentCount > 0 ? (
                          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-slate-300 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">
                                ค่าแพ็กเกจครูพื้นฐาน ({billingCycle === 'monthly' ? 'รายเดือน' : billingCycle === 'semester' ? 'รายเทอม' : 'รายปี'}):
                              </span>
                              <span className="font-semibold text-slate-200">{formatPrice(basePrice)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-sky-300 font-medium">
                                + ค่าบริการนักเรียนรายหัว ({studentCount} คน × {formatPrice(perStudentRate)}):
                              </span>
                              <span className="font-bold text-sky-400">+{formatPrice(perStudentTotal)}</span>
                            </div>
                            <div className="pt-1.5 border-t border-white/10 flex justify-between items-center text-xs font-bold">
                              <span className="text-amber-300">รวมชำระสุทธิ:</span>
                              <span className="text-amber-400 text-sm font-black">{formatPrice(price)}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] block mt-1">
                            * ค่าบริการครูพื้นฐาน {formatPrice(basePrice)} + บวกรายหัวนักเรียนคนละ {formatPrice(perStudentRate)} / {billingCycle === 'monthly' ? 'ด.' : billingCycle === 'semester' ? 'เทอม' : 'ปี'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. ข้อมูลผู้ติดต่อ & รับสิทธิ์ */}
              <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <User size={14} /> 3. ข้อมูลผู้สมัคร / ผู้ติดต่อ
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">
                      {category === 'student' ? 'ชื่อ-นามสกุล (ผู้เรียน/ผู้ปกครอง) *' : category === 'teacher' ? 'ชื่อ-นามสกุลคุณครู *' : 'ชื่อผู้ประสานงาน *'}
                    </label>
                    <input
                      required
                      value={form.contactName}
                      onChange={e => setForm({ ...form, contactName: e.target.value })}
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full min-h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">อีเมลสำหรับรับบัญชีใช้งาน *</label>
                    <input
                      type="email"
                      required
                      value={form.contactEmail}
                      onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                      placeholder="your.email@example.com"
                      className="w-full min-h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">เบอร์โทรศัพท์ติดต่อ *</label>
                    <input
                      type="tel"
                      required
                      value={form.contactPhone}
                      onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                      placeholder="08x-xxx-xxxx"
                      className="w-full min-h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                  <input
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="เช่น ต้องการเริ่มใช้งานทันที หรือข้อซักถามเพิ่มเติม"
                    className="w-full min-h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* 4. ความต้องการเอกสาร */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-400/5 border border-amber-400/20 cursor-pointer hover:bg-amber-400/10 transition-colors">
                <input
                  type="checkbox"
                  checked={needQuotation}
                  onChange={e => setNeedQuotation(e.target.checked)}
                  className="mt-0.5 rounded text-amber-400 focus:ring-amber-400 w-4 h-4 bg-slate-900 border-white/20"
                />
                <div className="text-xs">
                  <span className="font-bold text-amber-300 block">
                    {category === 'school'
                      ? 'ต้องการรับใบเสนอราคา (Quotation) ทางอีเมลเพื่อดำเนินการเบิกงบประมาณโรงเรียน'
                      : 'ต้องการรับใบเสร็จรับเงินอิเล็กทรอนิกส์ (E-Receipt) ทางอีเมล'}
                  </span>
                  <span className="text-slate-400 mt-0.5 block">
                    {category === 'school'
                      ? 'ทีมงานจะจัดส่งเอกสารใบเสนอราคาในนามสถานศึกษาเพื่อใช้แนบขออนุมัติโครงการงบประมาณโรงเรียน'
                      : 'ทีมงานจะจัดส่งเอกสารยืนยันและใบเสร็จให้ทางอีเมลที่คุณระบุ'}
                  </span>
                </div>
              </label>

              <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>ข้อมูลปลอดภัยตามมาตรฐาน PDPA 100% ไม่ส่งต่อให้บุคคลภายนอก</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-12 flex-1 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-12 flex-[2] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-400/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'กำลังส่งข้อมูล…' : category === 'school' ? 'ยื่นขอรับแพ็กเกจ & ใบเสนอราคา →' : `ยืนยันสมัคร ${currentPlan.name} (${formatPrice(price)}) →`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
