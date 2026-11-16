import React, { useState } from 'react';
import { Check, Sparkles, Building, GraduationCap, Users, Shield, FileText, ArrowRight } from 'lucide-react';
import { BILLING_CYCLES, PRICING_PLANS, formatPrice } from '../data/pricingPlans';

export default function PricingSection({ onApplySchool, onSelectPlan }) {
  const [cycle, setCycle] = useState('semester'); // Default to semester (recommended for schools)

  const activeCycle = BILLING_CYCLES.find(c => c.id === cycle) || BILLING_CYCLES[1];

  const handlePlanClick = (plan) => {
    if (onSelectPlan) {
      onSelectPlan(plan, cycle);
    } else if (onApplySchool) {
      onApplySchool(plan.id, cycle);
    }
  };

  return (
    <section className="my-16 px-4 max-w-7xl mx-auto" aria-labelledby="pricing-title">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-bold mb-4 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>อัตราค่าบริการปีการศึกษา 2027 (Pricing 2027)</span>
        </div>
        <h2 id="pricing-title" className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
          เลือกแพ็กเกจที่เหมาะกับคุณและโรงเรียน
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-400">
          เริ่มต้นยกระดับคะแนน O-NET ป.6 ด้วยเกมการเรียนรู้และ AI รองรับทั้งนักเรียนรายบุคคล คุณครู และระดับโรงเรียน
        </p>

        {/* Billing Cycle Switcher */}
        <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          {BILLING_CYCLES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCycle(c.id)}
              className={`relative px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                cycle === c.id
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
              {c.discountBadge && cycle !== c.id && (
                <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300">
                  {c.discountBadge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          รอบสิทธิ์การใช้งาน: <span className="font-semibold text-amber-400">{activeCycle.periodDesc}</span>
          {cycle === 'monthly' && ' (แพ็กเกจระดับโรงเรียนเปิดเฉพาะรอบรายเทอมและรายปีตามรอบงบประมาณ)'}
        </div>
        {/* 15-Day Free School Pass Banner */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border border-amber-400/40 text-left max-w-2xl mx-auto shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-300">15-Day Free School Pass</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">ทดลองฟรี 100%</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                เปิดสิทธิ์นักเรียน 30–50 คน และครู 1 ท่าน ใช้งานเต็มรูปแบบ 15 วัน พร้อมรับรายงานสรุปผล Pre-test เสนอ ผอ.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handlePlanClick({ id: 'school_starter' })}
            className="whitespace-nowrap px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            ขอสิทธิ์ทดลองฟรี →
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const price = plan.prices[cycle];
          const isAvailableInCycle = price !== null;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-200 ${
                plan.popular
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 border-2 border-amber-400 shadow-2xl shadow-amber-500/10'
                  : 'bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-lg'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
                  ⭐ ยอดนิยมสำหรับโรงเรียน
                </div>
              )}

              <div>
                {/* Header Info */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-2xl">{plan.icon}</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {plan.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-100">{plan.name}</h3>
                <p className="text-xs text-amber-400/90 font-medium mt-0.5">{plan.target}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 min-h-[32px]">{plan.description}</p>

                {/* Price Display */}
                <div className="my-5 pt-4 border-t border-slate-800/80">
                  {isAvailableInCycle ? (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-white">
                          {formatPrice(price)}
                        </span>
                        <span className="text-xs text-slate-400">
                          / {cycle === 'monthly' ? 'เดือน' : cycle === 'semester' ? 'เทอม (5 ด.)' : 'ปี (12 ด.)'}
                        </span>
                      </div>
                      {plan.perStudentFee && (
                        <div className="text-[11px] font-bold text-amber-300 mt-1 flex items-center gap-1">
                          <span>+ ค่าบริการนักเรียน</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black">
                            +{formatPrice(plan.perStudentFee[cycle])} / คน
                          </span>
                        </div>
                      )}
                      <div className="text-[11px] font-semibold text-emerald-400 mt-1">
                        โควต้า: {plan.quota}
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className="text-sm font-bold text-slate-400">
                        เฉพาะรายเทอม &amp; รายปี
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        เริ่มต้น ฿{plan.prices.semester?.toLocaleString()} / เทอม
                      </div>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                    plan.popular
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-lg shadow-amber-400/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Procurement Guarantee Footnote */}
      <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 grid place-items-center text-amber-300 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">เอกสารเบิกจ่ายราชการครบชุด</h4>
              <p className="text-xs text-slate-400 mt-1">
                ออกใบเสนอราคา (Quotation), ใบแจ้งหนี้, และใบเสร็จรับเงิน ใช้เบิกงบเรียนฟรี 15 ปี หรืองบอุดหนุนรายหัวได้ถูกต้องตามระเบียบ
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 grid place-items-center text-emerald-300 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">ปรับรอบเวลาตามปฏิทินการศึกษา</h4>
              <p className="text-xs text-slate-400 mt-1">
                สิทธิ์รายเทอมนับครอบคลุม 5 เดือน (พ.ค.–ก.ย. หรือ พ.ย.–มี.ค.) และรายปีนับ 12 เดือน ปรับเปลี่ยนวันเริ่มให้ตรงกับวันเปิดเทอมของโรงเรียนได้
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-400/10 border border-sky-400/20 grid place-items-center text-sky-300 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">ความปลอดภัยและข้อมูลนักเรียน</h4>
              <p className="text-xs text-slate-400 mt-1">
                ระบบ PIN 6 หลัก ปลอดภัย ไม่ต้องใช้อีเมลหรือเบอร์โทรศัพท์ส่วนตัวของนักเรียน ปฏิบัติตามมาตรฐาน PDPA สำหรับผู้เยาว์ 100%
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
