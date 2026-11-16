export function getSessionRole(session) {
  if (!session) return null;
  if (session.role === 'student') return 'student';
  if (session.authVerified !== true) return null;
  if (session.role === 'super_admin') return 'platform_admin';
  if (session.role === 'teacher' && session.membership_role === 'school_admin') return 'school_admin';
  if (session.role === 'teacher' && session.membership_role === 'teacher') return 'teacher';
  return null;
}

export function canAccessPage(session, page) {
  if (page === 'demo') return true;
  if (session?.isGuestDemo && ['teacher', 'school-admin', 'super-admin', 'report', 'ranking'].includes(page)) {
    return false;
  }
  const role = getSessionRole(session);
  if (page === 'student') return role === 'student';
  if (page === 'teacher') return role === 'teacher' || role === 'school_admin';
  if (page === 'school-admin') return role === 'teacher' || role === 'school_admin' || role === 'platform_admin';
  if (page === 'super-admin') return role === 'platform_admin';
  return false;
}

export function canManageSchoolStudents(session, schoolId = session?.school_id) {
  const role = getSessionRole(session);
  if (role === 'platform_admin') return typeof schoolId === 'string' && Boolean(schoolId.trim());
  return ['teacher', 'school_admin'].includes(role) && typeof schoolId === 'string'
    && Boolean(schoolId.trim()) && session.school_id === schoolId;
}
