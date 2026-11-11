-- Migration: 202611110004_update_teacher_pro_pricing.sql
-- Update Teacher Pro plan with base teacher fee + per-student variable fee

update public.plans
set
  price_monthly = 199.00,
  price_yearly = 990.00,
  description = 'แพ็กเกจสำหรับครูผู้สอน (1–2 ห้องเรียน): จัดการเรียนการสอน 1–2 ห้อง มอบหมายการบ้าน และวิเคราะห์ผลเปรียบเทียบรายห้อง คิดค่าบริการฐานครู + รายหัวตามนักเรียนจริง',
  features = jsonb_build_object(
    'price_semester', 590,
    'target', 'teacher',
    'badge', 'สำหรับครูผู้สอน (1–2 ห้องเรียน)',
    'icon', '👩‍🏫',
    'per_student_fee', jsonb_build_object('monthly', 10, 'semester', 25, 'yearly', 40),
    'max_classes', 2,
    'allow_school_provisioning', false,
    'features_list', jsonb_build_array(
      'ดูแลได้ 1–2 ห้องเรียน (เช่น ป.6/1 และ ป.6/2)',
      'ค่าบริการครูพื้นฐานย่อมเยา (เริ่มต้น ฿199/ด. หรือ ฿590/เทอม)',
      'คิดค่าบริการนักเรียนตามจริง (+฿10/ด., +฿25/เทอม, +฿40/ปี ต่อคน)',
      'Teacher Hub ติดตามรายบุคคลและเปรียบเทียบระหว่างห้อง',
      'วิเคราะห์จุดอ่อนตามตัวชี้วัด สพฐ. (Strand Analytics)',
      'ระบบมอบหมายการบ้านและแบบทดสอบประจำสัปดาห์',
      'ส่งออกรายงานผลคะแนนเป็น Excel / CSV แยกห้องได้'
    )
  ),
  updated_at = now()
where code = 'teacher_pro';
