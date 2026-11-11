/**
 * English Quest AI - Pricing 2027 Plan Specifications
 * 
 * Supports:
 * - Student Hero (B2C)
 * - Teacher Pro (Individual Educator)
 * - School Starter (B2B School 60 seats)
 * - School Growth (B2B School 200 seats)
 * - Superpower (B2B School 500 seats)
 * 
 * Billing Cycles:
 * - monthly: 30 days (Students & Teachers only)
 * - semester: 5 months (Matches Thai academic semester)
 * - yearly: 12 months (Full academic year / Best value)
 */

export const BILLING_CYCLES = [
  { id: 'monthly', label: 'รายเดือน', periodDesc: '30 วัน', discountBadge: null },
  { id: 'semester', label: 'รายเทอม (แนะนำ) 🔥', periodDesc: '5 เดือน (1 ภาคเรียน)', discountBadge: 'ยอดนิยมสำหรับโรงเรียน' },
  { id: 'yearly', label: 'รายปี (คุ้มสุด) 💎', periodDesc: '12 เดือน (1 ปี)', discountBadge: 'ประหยัดสูงสุด' }
];

export const PRICING_PLANS = [
  {
    id: 'student_hero',
    name: 'Student Hero',
    badge: 'สำหรับนักเรียน',
    icon: '🎒',
    target: 'นักเรียน & ผู้ปกครอง',
    description: 'เหมาะสำหรับฝึกเองที่บ้าน ตะลุยด่านตามใจชอบ หรือติวเข้มโค้งสุดท้ายก่อนสอบ',
    prices: {
      monthly: 79,
      semester: 299,
      yearly: 499,
    },
    quota: '1 บัญชีนักเรียน',
    features: [
      'เข้าถึงเควสต์ O-NET ป.6 ทุกบทเรียน (4 Skills)',
      'ระบบทบทวนข้อผิดอัจฉริยะ (Review Mistakes)',
      'สะสม XP ปลดล็อก Avatar & Badges',
      'สิทธิ์ทดสอบ O-NET Arena และ Mock Exam',
      'ดูรายงานคะแนนและระดับพัฒนาการส่วนบุคคล'
    ],
    ctaText: 'สมัครแพ็กเกจนักเรียน',
    type: 'student',
    schoolApplicable: false,
  },
  {
    id: 'teacher_pro',
    name: 'Teacher Pro',
    badge: 'สำหรับครูผู้สอน (1–2 ห้องเรียน)',
    icon: '👩‍🏫',
    target: 'ครูผู้สอนภาษาอังกฤษ (1–2 ห้องเรียน)',
    description: 'จัดการเรียนการสอน 1–2 ห้อง มอบหมายการบ้าน และวิเคราะห์ผลเปรียบเทียบรายห้อง',
    prices: {
      monthly: 199,
      semester: 590,
      yearly: 990,
    },
    perStudentFee: {
      monthly: 10,
      semester: 25,
      yearly: 40,
    },
    quota: 'ค่าบริการฐานครู + คิดตามรายหัวนักเรียนจริง (+฿25/คน/เทอม)',
    baseStudents: 0,
    maxClasses: 2,
    features: [
      'ดูแลได้ 1–2 ห้องเรียน (เช่น ป.6/1 และ ป.6/2)',
      'ค่าบริการครูพื้นฐานย่อมเยา (เริ่มต้น ฿199/ด. หรือ ฿590/เทอม)',
      'คิดค่าบริการนักเรียนตามจริง (+฿10/ด., +฿25/เทอม, +฿40/ปี ต่อคน)',
      'Teacher Hub ติดตามรายบุคคลและเปรียบเทียบระหว่างห้อง',
      'วิเคราะห์จุดอ่อนตามตัวชี้วัด สพฐ. (Strand Analytics)',
      'ระบบมอบหมายการบ้านและแบบทดสอบประจำสัปดาห์',
      'ส่งออกรายงานผลคะแนนเป็น Excel / CSV แยกห้องได้'
    ],
    ctaText: 'สมัครแพ็กเกจครู',
    type: 'teacher',
    schoolApplicable: false,
  },
  {
    id: 'school_starter',
    name: 'School Starter',
    badge: 'เริ่มต้นระดับโรงเรียน',
    icon: '🏫',
    target: 'โรงเรียนขนาดเล็ก (1-2 ห้องเรียน)',
    description: 'สำหรับโรงเรียนที่เริ่มต้นนำ Gamification & AI ยกระดับคะแนนสอบ O-NET ภาษาอังกฤษ',
    prices: {
      monthly: null, // โรงเรียนไม่มีรอบรายเดือนตามระเบียบพัสดุ
      semester: 2490,
      yearly: 3900,
    },
    quota: 'นักเรียน 60 ที่นั่ง · ครู 3 ท่าน',
    features: [
      'สิทธิ์ใช้งานครบทุกบทเรียนสำหรับนักเรียน 60 คน',
      'ระบบรหัสนักเรียนและรหัส PIN 6 หลัก ปลอดภัยสูง',
      'นำเข้านักเรียนด้วยไฟล์ Excel รวดเร็วเพียงคลิกเดียว',
      'School Admin Dashboard สรุปสถิติภาพรวมโรงเรียน',
      'ออกใบเสนอราคาและเอกสารเบิกจ่ายงบราชการได้'
    ],
    ctaText: 'ขอใบเสนอราคา / สมัครแพ็กเกจ',
    popular: false,
    type: 'school',
    schoolApplicable: true,
  },
  {
    id: 'school_growth',
    name: 'School Growth',
    badge: 'ยอดนิยมสำหรับโรงเรียน ⭐',
    icon: '🚀',
    target: 'โรงเรียนขนาดกลาง / ทั้งสายชั้น ป.6',
    description: 'ครอบคลุมนักเรียนทั้งระดับชั้น พร้อมเครื่องมือวิเคราะห์เชิงลึกเพื่อเพิ่มคะแนนเฉลี่ยโรงเรียน',
    prices: {
      monthly: null,
      semester: 4590,
      yearly: 7900,
    },
    quota: 'นักเรียน 200 ที่นั่ง · ครู 10 ท่าน',
    features: [
      'สิทธิ์ใช้งานสำหรับนักเรียน 200 คน · ครู 10 คน',
      'รวมทุกฟีเจอร์ใน School Starter',
      'ระบบจำลองสอบเสมือนจริง O-NET Mock Exam จับเวลาจริง',
      'รายงานเจาะลึกตัวชี้วัด สพฐ. เพื่อเตรียมแผนสอนเสริม',
      'ระบบรีเซ็ตรหัส PIN นักเรียนทันทีเมื่อลืม',
      'ออกเอกสารจัดซื้อจัดจ้าง / เบิกงบเรียนฟรี 15 ปี'
    ],
    ctaText: 'ขอใบเสนอราคา / สมัครแพ็กเกจ',
    popular: true,
    type: 'school',
    schoolApplicable: true,
  },
  {
    id: 'superpower',
    name: 'Superpower',
    badge: 'องค์กร & โรงเรียนขนาดใหญ่ 👑',
    icon: '🏛️',
    target: 'โรงเรียนขนาดใหญ่ / ขยาย ป.4 - ป.6',
    description: 'แพ็กเกจสมบูรณ์แบบสำหรับโรงเรียนที่ต้องการยกระดับทั้งแผนก พร้อมทีมวิชาการดูแลใกล้ชิด',
    prices: {
      monthly: null,
      semester: 8900,
      yearly: 14900,
    },
    quota: 'นักเรียน 500 ที่นั่ง · ครูไม่จำกัด',
    features: [
      'นักเรียนสูงสุด 500 คน (ขยายเพิ่มได้) · ครูไม่จำกัด',
      'รวมทุกฟีเจอร์ใน School Growth',
      'ระบบออกเกียรติบัตรอิเล็กทรอนิกส์ (E-Certificate)',
      'คลังข้อสอบและเอกสารติว PDF สำหรับพิมพ์แจกในชั้น',
      'ทีมวิทยากรอบรมการใช้งานครูผ่านระบบ Zoom',
      'ชุดเอกสารจัดซื้อจัดจ้างฉบับสมบูรณ์ถูกต้องตามระเบียบพัสดุ'
    ],
    ctaText: 'ขอใบเสนอราคา / ติดต่อฝ่ายวิชาการ',
    popular: false,
    type: 'school',
    schoolApplicable: true,
  }
];

export const SCHOOL_PACKAGES = PRICING_PLANS.filter(p => p.schoolApplicable);

export function formatPrice(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);
}
