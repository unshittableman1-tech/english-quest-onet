import { supabase } from '../config/supabase.js';
import { hasSupabaseConfig } from '../config/runtimeMode.js';

const STORAGE_KEY = 'onet_school_applications_v1';

// Initial synthetic seed data if storage is completely empty
const DEFAULT_APPLICATIONS = [
  {
    id: 'app-seed-001',
    referenceCode: 'APP-2569-001',
    schoolName: 'โรงเรียนอนุบาลสายรุ้งวิทยา',
    schoolNameEnglish: 'Sairung Wittaya School',
    province: 'กรุงเทพมหานคร',
    district: 'เขตดุสิต',
    contactName: 'อ. นภา แจ่มใส',
    contactEmail: 'napa.sairung@gmail.com',
    contactPhone: '081-234-5678',
    packageInterest: 'standard',
    packageName: 'Standard School Plan',
    expectedStudents: 120,
    expectedTeachers: 8,
    status: 'pending_review',
    notes: 'สนใจเริ่มใช้งานภาคเรียนที่ 2',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    provisionedSchoolCode: null,
  },
  {
    id: 'app-seed-002',
    referenceCode: 'APP-2569-002',
    schoolName: 'โรงเรียนบ้านดอยงามพัฒนา',
    schoolNameEnglish: 'Bandoi Ngam School',
    province: 'เชียงใหม่',
    district: 'แม่ริม',
    contactName: 'ผอ. สมศักดิ์ ก้าวหน้า',
    contactEmail: 'somsak.bandoi@gmail.com',
    contactPhone: '089-876-5432',
    packageInterest: 'trial',
    packageName: 'ทดลองใช้งานฟรี 30 วัน',
    expectedStudents: 65,
    expectedTeachers: 4,
    status: 'pending_review',
    notes: 'ขอทดลองใช้กับนักเรียนชั้น ป.6 จำนวน 2 ห้อง',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    provisionedSchoolCode: null,
  }
];

function getLocalStore() {
  if (typeof window === 'undefined') return DEFAULT_APPLICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APPLICATIONS));
      return DEFAULT_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_APPLICATIONS;
  } catch {
    return DEFAULT_APPLICATIONS;
  }
}

function setLocalStore(items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
}

export function generateApplicationReference() {
  const year = 2569;
  const num = Math.floor(100 + Math.random() * 900);
  return `APP-${year}-${num}`;
}

/**
 * Submit a new school package application
 */
export async function submitSchoolApplication(formData) {
  if (!formData.schoolName?.trim()) throw new Error('กรุณาระบุชื่อโรงเรียน');
  if (!formData.province?.trim()) throw new Error('กรุณาระบุจังหวัด');
  if (!formData.contactName?.trim()) throw new Error('กรุณาระบุชื่อผู้ประสานงาน');
  if (!formData.contactEmail?.trim() || !formData.contactEmail.includes('@')) {
    throw new Error('กรุณาระบุอีเมลที่ถูกต้อง');
  }
  if (!formData.contactPhone?.trim()) throw new Error('กรุณาระบุเบอร์โทรศัพท์ที่ติดต่อได้');

  const record = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `app-${Date.now()}`,
    referenceCode: generateApplicationReference(),
    schoolName: formData.schoolName.trim(),
    schoolNameEnglish: formData.schoolNameEnglish?.trim() || '',
    province: formData.province.trim(),
    district: formData.district?.trim() || '',
    contactName: formData.contactName.trim(),
    contactEmail: formData.contactEmail.trim().toLowerCase(),
    contactPhone: formData.contactPhone.trim(),
    packageInterest: formData.packageInterest || 'school_growth',
    packageName: formData.packageName || 'School Growth',
    billingCycle: formData.billingCycle || 'semester',
    cycleLabel: formData.cycleLabel || (formData.billingCycle === 'yearly' ? 'รายปี (12 เดือน)' : 'รายเทอม (5 เดือน)'),
    approxPrice: formData.approxPrice != null ? Number(formData.approxPrice) : null,
    needQuotation: Boolean(formData.needQuotation),
    isTrial: Boolean(formData.isTrial),
    trialDays: formData.trialDays ? Number(formData.trialDays) : (formData.isTrial ? 15 : null),
    expectedStudents: Number(formData.expectedStudents) || 150,
    expectedTeachers: Number(formData.expectedTeachers) || 5,
    status: 'pending_review',
    notes: formData.notes?.trim() || '',
    createdAt: new Date().toISOString(),
    provisionedSchoolCode: null,
  };

  // Try Supabase if configured and table exists
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase.from('school_applications').insert([record]).select();
      if (!error && data?.[0]) {
        // Also sync local cache
        const local = getLocalStore();
        setLocalStore([data[0], ...local]);
        return data[0];
      }
    } catch {
      // Fallback silently to local store
    }
  }

  // Local fallback
  const current = getLocalStore();
  const updated = [record, ...current];
  setLocalStore(updated);
  return record;
}

/**
 * List all school applications for Super Admin Hub
 */
export async function listSchoolApplications() {
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('school_applications')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback to local
    }
  }

  return getLocalStore();
}

/**
 * Update application status (approved, rejected, pending_review)
 */
export async function updateSchoolApplicationStatus(id, newStatus, extra = {}) {
  if (hasSupabaseConfig) {
    try {
      await supabase
        .from('school_applications')
        .update({ status: newStatus, ...extra, updatedAt: new Date().toISOString() })
        .eq('id', id);
    } catch {
      // Continue to local update
    }
  }

  const current = getLocalStore();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        status: newStatus,
        ...extra,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });

  setLocalStore(updated);
  return updated.find(item => item.id === id);
}
