/**
 * User Directory & School Grouping Utility
 * Helps group, filter, and summarize accounts by school in Super Admin Hub.
 */

export const USER_ROLES = {
  platform_admin: { label: 'Platform Admin', icon: '👑', tone: 'amber' },
  school_admin: { label: 'School Admin', icon: '🛡️', tone: 'sky' },
  academic_admin: { label: 'Academic Admin', icon: '🎓', tone: 'blue' },
  teacher: { label: 'Teacher (คุณครู)', icon: '👩‍🏫', tone: 'green' },
  student: { label: 'Student (นักเรียน)', icon: '🎒', tone: 'purple' },
};

/**
 * Merge remote Supabase directory accounts with local admin storage,
 * avoiding duplicates by email or id.
 */
export function mergeDirectoryAccounts(remoteAccounts = [], localAdmins = []) {
  const merged = [...(remoteAccounts || [])];
  const seenEmails = new Set(
    merged.map((a) => a.email?.trim().toLowerCase()).filter(Boolean)
  );
  const seenKeys = new Set(merged.map((a) => a.key || a.userId));

  (localAdmins || []).forEach((adm) => {
    const emailKey = adm.email?.trim().toLowerCase();
    if (emailKey && seenEmails.has(emailKey)) {
      return; // Already present in directory
    }
    if (adm.id && seenKeys.has(adm.id)) {
      return;
    }

    if (emailKey) seenEmails.add(emailKey);
    if (adm.id) seenKeys.add(adm.id);

    merged.push({
      key: `local-admin:${adm.id}`,
      userId: adm.id,
      email: adm.email || null,
      displayName: adm.name || adm.email || 'Admin',
      role: adm.role || 'platform_admin',
      status: adm.status || 'active',
      schoolId: adm.schoolId || null,
      schoolName: adm.schoolName || (adm.role === 'platform_admin' ? 'ทั้งแพลตฟอร์ม' : 'ไม่ระบุ'),
      source: 'admin_storage',
      permissions: adm.permissions,
      isSuperOwner: adm.isSuperOwner,
    });
  });

  return merged;
}

/**
 * Build school grouping structure from schools list and merged accounts.
 */
export function buildSchoolGroups(schools = [], accounts = [], invitations = []) {
  const schoolMap = new Map();

  // 1. Initialize known schools
  (schools || []).forEach((s) => {
    schoolMap.set(String(s.id), {
      id: String(s.id),
      code: s.code || '',
      name: s.name || 'โรงเรียนไม่ระบุชื่อ',
      province: s.province || '',
      area: s.area || '',
      status: s.status || 'active',
      quota: s.quota || 0,
      activeStudents: s.activeStudents || 0,
      planName: s.planName || '',
      accounts: [],
      invitations: [],
      stats: {
        total: 0,
        admins: 0,
        teachers: 0,
        students: 0,
        active: 0,
        suspended: 0,
      },
    });
  });

  // Track platform / global accounts
  const platformAccounts = [];

  // 2. Distribute accounts into schools or platform group
  (accounts || []).forEach((acc) => {
    const isPlatform =
      !acc.schoolId ||
      acc.role === 'platform_admin' ||
      acc.schoolName === 'ทั้งแพลตฟอร์ม';

    if (isPlatform) {
      platformAccounts.push(acc);
      return;
    }

    // Try matching by schoolId
    let target = schoolMap.get(String(acc.schoolId));

    // Fallback matching by schoolName
    if (!target && acc.schoolName) {
      for (const s of schoolMap.values()) {
        if (s.name.trim().toLowerCase() === acc.schoolName.trim().toLowerCase()) {
          target = s;
          break;
        }
      }
    }

    // If still not found, create a dynamic school group so no account is lost
    if (!target) {
      const dynamicId = String(acc.schoolId || `school_${acc.schoolName}`);
      target = {
        id: dynamicId,
        code: '—',
        name: acc.schoolName || 'โรงเรียนอื่น ๆ',
        province: '—',
        area: '—',
        status: 'active',
        quota: 0,
        activeStudents: 0,
        planName: '',
        accounts: [],
        invitations: [],
        isDynamic: true,
        stats: {
          total: 0,
          admins: 0,
          teachers: 0,
          students: 0,
          active: 0,
          suspended: 0,
        },
      };
      schoolMap.set(dynamicId, target);
    }

    target.accounts.push(acc);
    target.stats.total += 1;
    if (acc.role === 'school_admin' || acc.role === 'academic_admin') {
      target.stats.admins += 1;
    } else if (acc.role === 'teacher') {
      target.stats.teachers += 1;
    } else if (acc.role === 'student') {
      target.stats.students += 1;
    }

    const st = String(acc.status || '').toLowerCase();
    if (st === 'active') {
      target.stats.active += 1;
    } else {
      target.stats.suspended += 1;
    }
  });

  // 3. Attach invitations to corresponding schools
  (invitations || []).forEach((inv) => {
    if (inv.school_id && schoolMap.has(String(inv.school_id))) {
      schoolMap.get(String(inv.school_id)).invitations.push(inv);
    }
  });

  const schoolGroups = Array.from(schoolMap.values());

  // Sort schools: schools with users first, then alphabetically by name
  schoolGroups.sort((a, b) => {
    if (b.stats.total !== a.stats.total) {
      return b.stats.total - a.stats.total;
    }
    return a.name.localeCompare(b.name, 'th');
  });

  const platformStats = {
    total: platformAccounts.length,
    admins: platformAccounts.filter((a) => a.role === 'platform_admin').length,
    active: platformAccounts.filter((a) => String(a.status).toLowerCase() === 'active').length,
    suspended: platformAccounts.filter((a) => String(a.status).toLowerCase() !== 'active').length,
  };

  const totalAccountsCount = accounts.length;
  const totalStudentsCount = accounts.filter((a) => a.role === 'student').length;
  const totalTeachersCount = accounts.filter((a) => a.role === 'teacher').length;
  const totalAdminsCount = accounts.filter(
    (a) => a.role === 'platform_admin' || a.role === 'school_admin' || a.role === 'academic_admin'
  ).length;

  return {
    schoolGroups,
    platformAccounts,
    platformStats,
    overallStats: {
      totalSchools: schoolGroups.length,
      totalAccounts: totalAccountsCount,
      totalAdmins: totalAdminsCount,
      totalTeachers: totalTeachersCount,
      totalStudents: totalStudentsCount,
      activeAccounts: accounts.filter((a) => String(a.status).toLowerCase() === 'active').length,
    },
  };
}

/**
 * Filter an accounts list by text search, role, and status.
 */
export function filterAccounts(accounts = [], { search = '', role = 'all', status = 'all' } = {}) {
  const query = search.trim().toLowerCase();

  return accounts.filter((acc) => {
    // 1. Text search
    if (query) {
      const match = [
        acc.displayName,
        acc.email,
        acc.secondaryId,
        acc.schoolName,
        acc.role,
      ].some((val) => String(val || '').toLowerCase().includes(query));
      if (!match) return false;
    }

    // 2. Role filter
    if (role !== 'all') {
      if (acc.role !== role) return false;
    }

    // 3. Status filter
    if (status !== 'all') {
      const accStatus = String(acc.status || '').toLowerCase();
      if (accStatus !== status.toLowerCase()) return false;
    }

    return true;
  });
}
