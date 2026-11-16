/**
 * English Quest AI - Admin Management & Role-Based Access Control (RBAC)
 * 
 * Supports:
 * - Platform Admin (Super Admin)
 * - School Admin (School-specific Administrator)
 * - Academic Admin (Curriculum & Evaluation Supervisor)
 * 
 * Features:
 * - Granular Permissions Matrix with interactive checkboxes
 * - Add, Edit, Delete, and Toggle Active/Suspended status
 * - Fallback seed admins with full persistence
 */

const STORAGE_KEY = 'onet_platform_admins_v1';

export const ADMIN_PERMISSIONS = [
  {
    id: 'manage_schools',
    label: 'จัดการโรงเรียน & รหัสเข้าเรียน',
    desc: 'สิทธิ์เพิ่ม, แก้ไข, ลบข้อมูลโรงเรียน และเปิด/ระงับการใช้งานสถานศึกษา',
    category: 'school',
    icon: '🏫',
    defaultRoles: ['platform_admin']
  },
  {
    id: 'manage_subscriptions',
    label: 'จัดการแผน & สัญญาสมาชิก',
    desc: 'สิทธิ์ปรับแพ็กเกจ, กำหนดราคาข้อตกลงพิเศษ (Custom Price), และโควตานักเรียน',
    category: 'billing',
    icon: '💳',
    defaultRoles: ['platform_admin']
  },
  {
    id: 'extend_trials',
    label: 'ขยายวันทดลอง & ต่ออายุสมาชิก',
    desc: 'สิทธิ์กดปุ่มลัด +7 วัน, +15 วัน Trial Pass, +30 วัน, และ +1 ภาคเรียน',
    category: 'billing',
    icon: '⚡',
    defaultRoles: ['platform_admin']
  },
  {
    id: 'manage_applications',
    label: 'พิจารณา & อนุมัติคำขอสมัคร',
    desc: 'สิทธิ์ตรวจสอบคำขอสมัครจากโรงเรียน, อนุมัติออกโรงเรียนอัตโนมัติ, หรือปฏิเสธคำขอ',
    category: 'school',
    icon: '📋',
    defaultRoles: ['platform_admin', 'academic_admin']
  },
  {
    id: 'manage_students',
    label: 'จัดการข้อมูลนักเรียน & โควตาที่นั่ง',
    desc: 'สิทธิ์นำเข้าไฟล์ Excel นักเรียน, ปรับสถานะที่นั่ง (Active/Suspended), และรีเซ็ต PIN',
    category: 'academic',
    icon: '🎒',
    defaultRoles: ['platform_admin', 'school_admin', 'academic_admin']
  },
  {
    id: 'manage_teachers',
    label: 'จัดการคุณครู & สิทธิ์การสอน',
    desc: 'สิทธิ์แต่งตั้งครู, ระงับบัญชีครู, และออกคำเชิญสำหรับผู้สอนในสังกัด',
    category: 'academic',
    icon: '👩‍🏫',
    defaultRoles: ['platform_admin', 'school_admin']
  },
  {
    id: 'export_reports',
    label: 'ออกรายงานวิเคราะห์ & Executive PDF',
    desc: 'สิทธิ์ดาวน์โหลดรายงานวิเคราะห์สมรรถนะ O-NET เสนอ ผอ. และส่งออกผลสอบ CSV/Excel',
    category: 'report',
    icon: '📄',
    defaultRoles: ['platform_admin', 'school_admin', 'academic_admin']
  },
  {
    id: 'manage_admins',
    label: 'สิทธิ์ระดับสูงสุด: จัดการ Admin & กำหนดสิทธิ์',
    desc: 'สิทธิ์ในการเพิ่ม, ลบ, แก้ไขบัญชีผู้ดูแลระบบ และปรับเปลี่ยน Checkbox สิทธิ์การใช้งาน',
    category: 'security',
    icon: '🛡️',
    defaultRoles: ['platform_admin']
  }
];

export const ADMIN_ROLES = [
  {
    id: 'platform_admin',
    name: 'Platform Super Admin',
    desc: 'ผู้ดูแลระบบส่วนกลาง มีสิทธิ์สูงสุดดูแลทุกโรงเรียนและจัดการตั้งค่าระบบ',
    badgeTone: 'green',
    icon: '👑'
  },
  {
    id: 'school_admin',
    name: 'School Administrator',
    desc: 'ผู้ดูแลประจำโรงเรียน จัดการคุณครู นักเรียน และโควตาของโรงเรียนตนเอง',
    badgeTone: 'amber',
    icon: '🏫'
  },
  {
    id: 'academic_admin',
    name: 'Academic Coordinator',
    desc: 'ฝ่ายวิชาการและประเมินผล ติดตามผลสอบ O-NET และให้คำปรึกษาหลักสูตร',
    badgeTone: 'blue',
    icon: '🎓'
  }
];

export function getDefaultPermissionsForRole(roleId) {
  const perms = {};
  ADMIN_PERMISSIONS.forEach(p => {
    perms[p.id] = p.defaultRoles.includes(roleId);
  });
  return perms;
}

const DEFAULT_ADMINS = [
  {
    id: 'adm_master_001',
    name: 'Super Admin ส่วนกลาง',
    email: 'admin@englishquest.ai',
    role: 'platform_admin',
    schoolId: null,
    schoolName: 'ทุกโรงเรียน (ระบบส่วนกลาง)',
    status: 'active',
    isSuperOwner: true,
    permissions: Object.fromEntries(ADMIN_PERMISSIONS.map(p => [p.id, true])),
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    lastLogin: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'adm_school_002',
    name: 'อ. กัญญารัตน์ ศรีสุข (Admin BNS)',
    email: 'admin.bns@gmail.com',
    role: 'school_admin',
    schoolId: 'sch_bns_01',
    schoolName: 'โรงเรียนบ้านน้ำใส (BNS01)',
    status: 'active',
    isSuperOwner: false,
    permissions: {
      manage_schools: false,
      manage_subscriptions: false,
      extend_trials: false,
      manage_applications: false,
      manage_students: true,
      manage_teachers: true,
      export_reports: true,
      manage_admins: false
    },
    createdAt: '2026-10-15T08:30:00.000Z',
    updatedAt: new Date().toISOString(),
    lastLogin: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'adm_academic_003',
    name: 'ดร. ธีรภัทร วิชาการ',
    email: 'academic.onet@gmail.com',
    role: 'academic_admin',
    schoolId: null,
    schoolName: 'ฝ่ายนิเทศและประเมินผล',
    status: 'active',
    isSuperOwner: false,
    permissions: {
      manage_schools: false,
      manage_subscriptions: false,
      extend_trials: false,
      manage_applications: true,
      manage_students: true,
      manage_teachers: false,
      export_reports: true,
      manage_admins: false
    },
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
    lastLogin: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export function getAllAdmins() {
  if (typeof localStorage === 'undefined') return DEFAULT_ADMINS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ADMINS));
      return DEFAULT_ADMINS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ADMINS;
  } catch {
    return DEFAULT_ADMINS;
  }
}

export function saveAdmin(adminData) {
  const admins = getAllAdmins();
  const existingIdx = admins.findIndex(a => a.id === adminData.id || (adminData.email && a.email?.toLowerCase() === adminData.email?.toLowerCase()));

  let updated;
  if (existingIdx >= 0) {
    updated = [...admins];
    const prev = updated[existingIdx];
    updated[existingIdx] = {
      ...prev,
      ...adminData,
      permissions: {
        ...(prev.permissions || {}),
        ...(adminData.permissions || {})
      },
      updatedAt: new Date().toISOString()
    };
  } else {
    const newAdmin = {
      id: adminData.id || `adm_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      name: adminData.name?.trim() || 'Admin User',
      email: adminData.email?.trim().toLowerCase() || '',
      role: adminData.role || 'school_admin',
      schoolId: adminData.schoolId || null,
      schoolName: adminData.schoolName || 'ระบบส่วนกลาง',
      status: adminData.status || 'active',
      isSuperOwner: false,
      permissions: adminData.permissions || getDefaultPermissionsForRole(adminData.role || 'school_admin'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };
    updated = [newAdmin, ...admins];
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function deleteAdmin(adminId) {
  const admins = getAllAdmins();
  // Prevent deleting the super owner
  const target = admins.find(a => a.id === adminId);
  if (target?.isSuperOwner) {
    throw new Error('ไม่สามารถลบบัญชี Super Owner หลักของระบบได้');
  }

  const filtered = admins.filter(a => a.id !== adminId);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
  return filtered;
}

export function toggleAdminStatus(adminId) {
  const admins = getAllAdmins();
  const target = admins.find(a => a.id === adminId);
  if (target?.isSuperOwner) {
    throw new Error('ไม่สามารถระงับบัญชี Super Owner หลักของระบบได้');
  }

  const updated = admins.map(a => {
    if (a.id === adminId) {
      return {
        ...a,
        status: a.status === 'active' ? 'suspended' : 'active',
        updatedAt: new Date().toISOString()
      };
    }
    return a;
  });

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}
