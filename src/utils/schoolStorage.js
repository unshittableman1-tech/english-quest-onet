// ── School Storage & Multi-Tenancy Management ─────────────────────

const SCHOOLS_KEY = 'eq_onet_schools';
const CURRENT_ACTIVE_SCHOOL_KEY = 'eq_onet_active_school';

export const DEFAULT_SCHOOLS = [
  {
    id: 'sch_bns_01',
    code: 'BNS01',
    name: 'โรงเรียนบ้านนาสาร',
    area: 'สพป.สุราษฎร์ธานี เขต 3',
    province: 'สุราษฎร์ธานี',
    contactTeacher: 'ครูสมชาย ใจดี',
    email: 'somchai@bns.ac.th',
    phone: '081-234-5678',
    quota: 100,
    activeStudents: 77,
    avgScore: 68.5,
    status: 'active', // 'active' | 'trial' | 'suspended'
    expiresAt: '2027-03-31',
    createdAt: '2026-05-15',
    notes: 'โรงเรียนนำร่องหลัก ใช้งานทุกสัปดาห์'
  },
  {
    id: 'sch_anb_03',
    code: 'ANB03',
    name: 'โรงเรียนอนุบาลเทศบาลนคร',
    area: 'สพป.เชียงใหม่ เขต 1',
    province: 'เชียงใหม่',
    contactTeacher: 'ครูวิภา รัตนะ',
    email: 'wipa@anb-city.ac.th',
    phone: '086-555-4321',
    quota: 150,
    activeStudents: 118,
    avgScore: 74.2,
    status: 'active',
    expiresAt: '2027-04-30',
    createdAt: '2026-06-10',
    notes: 'ห้องเรียนพิเศษ MEP/ปกติ มีผลสัมฤทธิ์สูง'
  },
  {
    id: 'sch_wnt_02',
    code: 'WNT02',
    name: 'โรงเรียนวัดหนองตม',
    area: 'สพป.พิษณุโลก เขต 3',
    province: 'พิษณุโลก',
    contactTeacher: 'ครูณิชา พัฒนา',
    email: 'nicha@wnt.ac.th',
    phone: '089-876-5432',
    quota: 60,
    activeStudents: 42,
    avgScore: 62.0,
    status: 'active',
    expiresAt: '2026-12-31',
    createdAt: '2026-08-01',
    notes: 'เน้นหมวดคำศัพท์และ Pre-test'
  },
  {
    id: 'sch_kps_04',
    code: 'KPS04',
    name: 'โรงเรียนกำแพงแสนราษฎร์พัฒนา',
    area: 'สพป.นครปฐม เขต 1',
    province: 'นครปฐม',
    contactTeacher: 'ครูเอกชัย ชนะชัย',
    email: 'ekachai@kps.ac.th',
    phone: '084-333-2211',
    quota: 50,
    activeStudents: 35,
    avgScore: 55.8,
    status: 'trial',
    expiresAt: '2026-11-15',
    createdAt: '2026-10-01',
    notes: 'ทดลองใช้งาน 1 เดือน'
  }
];

export function getAllSchools() {
  try {
    const raw = localStorage.getItem(SCHOOLS_KEY);
    if (!raw) {
      localStorage.setItem(SCHOOLS_KEY, JSON.stringify(DEFAULT_SCHOOLS));
      return DEFAULT_SCHOOLS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCHOOLS;
  } catch {
    return DEFAULT_SCHOOLS;
  }
}

export function saveSchool(schoolData) {
  const schools = getAllSchools();
  const existingIdx = schools.findIndex(s => s.id === schoolData.id || s.code === schoolData.code);
  
  let updated;
  if (existingIdx >= 0) {
    updated = [...schools];
    updated[existingIdx] = {
      ...updated[existingIdx],
      ...schoolData,
      updatedAt: new Date().toISOString()
    };
  } else {
    const newSchool = {
      id: schoolData.id || `sch_${Date.now()}`,
      code: schoolData.code.trim().toUpperCase(),
      name: schoolData.name.trim(),
      area: schoolData.area || '',
      province: schoolData.province || '',
      contactTeacher: schoolData.contactTeacher || '',
      email: schoolData.email || '',
      phone: schoolData.phone || '',
      quota: Number(schoolData.quota) || 100,
      agreedPrice: schoolData.agreedPrice != null ? Number(schoolData.agreedPrice) : null,
      customSeats: schoolData.customSeats != null ? Number(schoolData.customSeats) : null,
      activeStudents: Number(schoolData.activeStudents) || 0,
      avgScore: Number(schoolData.avgScore) || 0,
      status: schoolData.status || 'active',
      expiresAt: schoolData.expiresAt || new Date(Date.now() + 365*86400000).toISOString().split('T')[0],
      createdAt: schoolData.createdAt || new Date().toISOString().split('T')[0],
      notes: schoolData.notes || ''
    };
    updated = [newSchool, ...schools];
  }

  localStorage.setItem(SCHOOLS_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteSchool(schoolId) {
  const schools = getAllSchools();
  const filtered = schools.filter(s => s.id !== schoolId && s.code !== schoolId);
  localStorage.setItem(SCHOOLS_KEY, JSON.stringify(filtered));
  return filtered;
}

export function updateSchoolStatus(schoolId, newStatus) {
  const schools = getAllSchools();
  const updated = schools.map(s => {
    if (s.id === schoolId || s.code === schoolId) {
      return { ...s, status: newStatus, updatedAt: new Date().toISOString() };
    }
    return s;
  });
  localStorage.setItem(SCHOOLS_KEY, JSON.stringify(updated));
  return updated;
}

export function getSchoolById(schoolId) {
  const schools = getAllSchools();
  return schools.find(s => s.id === schoolId || s.code === schoolId) || null;
}

export function getSchoolByCode(code) {
  if (!code) return null;
  const clean = code.toString().trim().toUpperCase();
  const schools = getAllSchools();
  return schools.find(s => s.code.toUpperCase() === clean || s.id === code) || null;
}

export function getActiveSchoolContext() {
  try {
    const raw = localStorage.getItem(CURRENT_ACTIVE_SCHOOL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setActiveSchoolContext(school) {
  if (!school) {
    localStorage.removeItem(CURRENT_ACTIVE_SCHOOL_KEY);
  } else {
    localStorage.setItem(CURRENT_ACTIVE_SCHOOL_KEY, JSON.stringify(school));
  }
}
