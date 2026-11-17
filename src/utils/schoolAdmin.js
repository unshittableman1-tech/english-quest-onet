import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';
import { supabaseConfig } from '../config/runtimeMode.js';
import { parseDelimitedRows, normalizeClassName } from './studentImportFile.js';
import { PRICING_PLANS } from '../data/pricingPlans.js';

export const FALLBACK_PLANS = PRICING_PLANS.map((p) => ({
  id: 'plan-' + p.id,
  code: p.id,
  name: p.name,
  description: p.description,
  currency: 'THB',
  price_monthly: p.prices.monthly,
  price_yearly: p.prices.yearly,
  max_students: p.id === 'student_hero' ? 1 : p.id === 'school_micro' ? 25 : p.id === 'teacher_pro' ? 50 : p.id === 'school_starter' ? 60 : p.id === 'school_growth' ? 200 : 500,
  max_teachers: p.id === 'superpower' ? 999 : p.id === 'school_growth' ? 10 : p.id === 'school_starter' ? 3 : (p.id === 'school_micro' || p.id === 'teacher_pro') ? 1 : 0,
  max_classes: p.id === 'teacher_pro' ? 2 : p.id === 'student_hero' ? 1 : 10,
  features: { features_list: p.features, price_semester: p.prices.semester },
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

/**
 * Generate a random UUID v4 for idempotent requests.
 */
export function generateRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function requireSchoolId(schoolId) {
  if (typeof schoolId !== 'string' || !schoolId.trim()) {
    throw new Error('school_id_required');
  }
  return schoolId.trim();
}

async function callRpc(name, params) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) {
    const err = new Error(error.message || `RPC ${name} failed`);
    err.code = error.code || 'rpc_error';
    err.details = error.details;
    err.hint = error.hint;
    throw err;
  }
  return data;
}

// ── School Admin Dashboard ──────────────────────────────────────────

/**
 * Fetch verified school dashboard stats (subscription, plan, active seats, seat limit).
 */
export async function getSchoolAdminDashboard(schoolId) {
  return callRpc('school_admin_dashboard', {
    target_school_id: requireSchoolId(schoolId),
  });
}

// ── Student Management ──────────────────────────────────────────────

/**
 * List students with school-scoped identity and membership status.
 */
export async function listSchoolStudents(schoolId, searchText = '', membershipFilter = 'all') {
  const data = await callRpc('school_admin_list_students', {
    target_school_id: requireSchoolId(schoolId),
    search_text: searchText?.trim() || null,
    membership_filter: membershipFilter || 'all',
  });
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch audit seat history for a specific student.
 */
export async function getStudentSeatHistory(schoolId, learnerId) {
  if (!learnerId) throw new Error('learner_id_required');
  const data = await callRpc('school_admin_student_history', {
    target_school_id: requireSchoolId(schoolId),
    target_learner_id: learnerId,
  });
  return Array.isArray(data) ? data : [];
}

/**
 * Update allowed student profile fields (student_id, name, class, number).
 */
export async function updateStudentProfile(schoolId, identityAccountId, patch, requestId = generateRequestId()) {
  if (!identityAccountId) throw new Error('identity_account_id_required');
  if (!patch || typeof patch !== 'object') throw new Error('invalid_patch');
  return callRpc('school_admin_update_student', {
    p_target_school_id: requireSchoolId(schoolId),
    p_target_identity_account_id: identityAccountId,
    p_patch: patch,
    p_request_id: requestId,
  });
}

/**
 * Change student seat state: ACTIVATE, DEACTIVATE, or REACTIVATE.
 */
export async function changeStudentSeat(schoolId, identityAccountId, action, requestId = generateRequestId(), reasonCode = 'school_admin_request') {
  if (!identityAccountId) throw new Error('identity_account_id_required');
  if (!['ACTIVATE', 'DEACTIVATE', 'REACTIVATE'].includes(action)) {
    throw new Error('invalid_action');
  }
  return callRpc('school_student_seat_change', {
    p_school_id: requireSchoolId(schoolId),
    p_identity_account_id: identityAccountId,
    p_action: action,
    p_request_id: requestId,
    p_reason_code: reasonCode,
  });
}

/**
 * Bulk create students with atomic all-or-nothing roster creation.
 */
export async function createStudentsBulk(schoolId, rows, requestId = generateRequestId()) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('rows_array_required');
  }
  return callRpc('school_admin_create_students', {
    p_target_school_id: requireSchoolId(schoolId),
    p_rows: rows,
    p_request_id: requestId,
  });
}

export async function resetSchoolStudentPin(schoolId, identityAccountId, pin, requestId = generateRequestId()) {
  if (!/^\d{6}$/.test(pin)) throw new Error('กรุณากรอก PIN ใหม่เป็นตัวเลข 6 หลัก');
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error('กรุณาเข้าสู่ระบบครูอีกครั้ง');
  const response = await fetch(`${supabaseConfig.url}/functions/v1/staff-student-pin`, {
    method:'POST',headers:{'content-type':'application/json',apikey:supabaseConfig.anonKey,authorization:`Bearer ${token}`},
    body:JSON.stringify({schoolId:requireSchoolId(schoolId),accountId:identityAccountId,pin,requestId}),
  });
  const result = await response.json().catch(()=>null);
  if (!response.ok || !result?.ok) throw new Error(result?.message || 'เปลี่ยน PIN ไม่สำเร็จ กรุณาตรวจสอบสิทธิ์แล้วลองอีกครั้ง');
  return result;
}

// ── Teacher Management ──────────────────────────────────────────────

/**
 * List teachers in the specified school with membership status.
 */
export async function listSchoolTeachers(schoolId) {
  const data = await callRpc('school_admin_list_teachers', {
    target_school_id: requireSchoolId(schoolId),
  });
  return Array.isArray(data) ? data : [];
}

/**
 * Add or suspend a teacher membership for the school.
 */
export async function setTeacherMembership(schoolId, targetUserId, enabled, requestId = generateRequestId()) {
  if (!targetUserId) throw new Error('target_user_id_required');
  return callRpc('school_admin_set_teacher', {
    target_school_id: requireSchoolId(schoolId),
    target_user_id: targetUserId,
    enabled: Boolean(enabled),
    request_id: requestId,
  });
}

// ── Platform Admin Operations ───────────────────────────────────────

/**
 * List schools visible to the authenticated platform admin and enrich each
 * row with the verified school dashboard response. RLS remains authoritative.
 */
export async function platformListSchools() {
  const { data: schools, error } = await supabase
    .from('schools')
    .select('id,code,name,province,area,contact_name,contact_email,contact_phone,status,created_at,updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return Promise.all((schools || []).map(async (school) => {
    const dashboard = await getSchoolAdminDashboard(school.id);
    return {
      id: school.id,
      code: school.code,
      name: school.name,
      province: school.province || '',
      area: school.area || '',
      contactTeacher: school.contact_name || '',
      email: school.contact_email || '',
      phone: school.contact_phone || '',
      status: school.status,
      createdAt: school.created_at,
      updatedAt: school.updated_at,
      quota: dashboard?.seat_limit ?? null,
      activeStudents: dashboard?.active_seats ?? null,
      avgScore: null,
      expiresAt: dashboard?.subscription?.ends_at ?? null,
      subscriptionStatus: dashboard?.subscription?.status ?? null,
      planName: dashboard?.plan?.name ?? null,
      agreedPrice: dashboard?.subscription?.features_override?.agreed_price_thb ?? null,
    };
  }));
}

/**
 * Read plans and school subscriptions visible to the authenticated platform
 * administrator. RLS remains authoritative; this function does not mutate
 * billing data because no browser-safe mutation API currently exists.
 */
export async function platformListPlansAndSubscriptions() {
  const [{ data: plans, error: plansError }, { data: subscriptions, error: subscriptionsError }] = await Promise.all([
    supabase
      .from('plans')
      .select('id,code,name,description,currency,price_monthly,price_yearly,max_students,max_teachers,max_classes,features,is_active,created_at,updated_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('id,school_id,plan_id,status,starts_at,ends_at,trial_ends_at,max_students_override,max_teachers_override,max_classes_override,features_override,created_at,updated_at')
      .order('created_at', { ascending: false }),
  ]);
  if (plansError) throw plansError;
  if (subscriptionsError) throw subscriptionsError;
  const resolvedPlans = (plans && plans.length > 0) ? plans : FALLBACK_PLANS;
  return { plans: resolvedPlans, subscriptions: subscriptions || [] };
}

/**
 * Build the platform account directory from existing server-authorized APIs.
 * Auth emails are returned only by the security-definer school member RPC;
 * student rows intentionally expose no password or PIN verifier material.
 */
export async function platformListAccountDirectory(schools = []) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const [schoolRows, invitations] = await Promise.all([
    Promise.all((schools || []).map(async (school) => {
      const [staff, students] = await Promise.all([
        listSchoolTeachers(school.id),
        listSchoolStudents(school.id),
      ]);
      return { school, staff, students };
    })),
    platformListInvitations(),
  ]);

  const accounts = [];
  if (authData?.user) {
    accounts.push({
      key: `platform:${authData.user.id}`,
      userId: authData.user.id,
      email: authData.user.email || null,
      displayName: authData.user.email || 'Platform Admin',
      role: 'platform_admin',
      status: 'active',
      schoolId: null,
      schoolName: 'ทั้งแพลตฟอร์ม',
      source: 'supabase_auth',
    });
  }

  schoolRows.forEach(({ school, staff, students }) => {
    staff.forEach((member) => accounts.push({
      key: `staff:${school.id}:${member.user_id}`,
      userId: member.user_id,
      email: member.email || null,
      displayName: member.email || member.user_id,
      role: member.role,
      status: member.status,
      schoolId: school.id,
      schoolName: school.name,
      source: 'school_members',
    }));
    students.forEach((student) => accounts.push({
      key: `student:${school.id}:${student.identity_account_id}`,
      userId: student.identity_account_id,
      email: null,
      displayName: student.name || student.student_id,
      secondaryId: student.student_id,
      role: 'student',
      status: student.membership_status,
      schoolId: school.id,
      schoolName: school.name,
      source: 'student_membership',
    }));
  });

  return { accounts, invitations };
}

/**
 * Set school status ('active', 'suspended', 'archived').
 */
export async function platformSetSchoolStatus(schoolId, newStatus) {
  return callRpc('platform_admin_set_school_status', {
    target_school_id: requireSchoolId(schoolId),
    new_status: newStatus,
  });
}

/**
 * Update school profile and subscription settings.
 */
export async function platformUpdateSchool(schoolId, params) {
  const {
    schoolName,
    schoolCode,
    schoolProvince = null,
    schoolArea = null,
    planId = null,
    maxStudentsOverride = null,
    subscriptionStatus = null,
    subscriptionEndsAt = null,
  } = params;

  return callRpc('platform_admin_update_school', {
    p_school_id: requireSchoolId(schoolId),
    p_school_name: schoolName?.trim(),
    p_school_code: schoolCode?.trim().toUpperCase(),
    p_school_province: schoolProvince?.trim() || null,
    p_school_area: schoolArea?.trim() || null,
    p_plan_id: planId || null,
    p_max_students_override: maxStudentsOverride !== null && maxStudentsOverride !== '' ? parseInt(maxStudentsOverride, 10) : null,
    p_subscription_status: subscriptionStatus || null,
    p_subscription_ends_at: subscriptionEndsAt || null,
  });
}

/**
 * Permanently delete school and all associated records.
 */
export async function platformDeleteSchool(schoolId) {
  return callRpc('platform_admin_delete_school', {
    p_school_id: requireSchoolId(schoolId),
  });
}

/**
 * Onboard school and allocate subscription plan.
 */
export async function platformCreateSchool(params) {
  const {
    schoolCode,
    schoolName,
    schoolProvince = null,
    schoolArea = null,
    planId,
    subscriptionStatus = 'active',
    startsAt = new Date().toISOString(),
    endsAt = new Date(Date.now() + 365 * 86400000).toISOString(),
    initialAdminUserId,
  } = params;

  return callRpc('platform_admin_create_school', {
    school_code: schoolCode?.trim().toUpperCase(),
    school_name: schoolName?.trim(),
    school_province: schoolProvince?.trim() || null,
    school_area: schoolArea?.trim() || null,
    target_plan_id: planId,
    subscription_status: subscriptionStatus,
    subscription_starts_at: startsAt,
    subscription_ends_at: endsAt,
    initial_admin_user_id: initialAdminUserId,
  });
}

// ── Phase 1D: School Admin Invitation Workflow ───────────────────────

/**
 * Hash a string (token) with SHA-256 in browser or Node.
 */
export async function sha256Hex(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  if (globalThis.crypto?.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback for older Node environments without subtle
  const nodeCrypto = 'crypto';
  const cryptoModule = await import(/* @vite-ignore */ nodeCrypto);
  return cryptoModule.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a cryptographically secure random invitation token.
 */
export function generateInvitationToken() {
  const bytes = new Uint8Array(32);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Onboard school with an email invitation (Phase 1D).
 * Avoids orphan schools and manual UUID entry.
 */
export async function platformCreateSchoolWithInvitation(params) {
  const {
    schoolCode,
    schoolName,
    schoolProvince = null,
    schoolArea = null,
    planId,
    subscriptionStatus = 'active',
    startsAt = new Date().toISOString(),
    endsAt = new Date(Date.now() + 365 * 86400000).toISOString(),
    adminEmail,
    tokenHash,
    maxStudentsOverride = null,
  } = params;

  if (!adminEmail || !adminEmail.includes('@')) {
    throw new Error('invalid_admin_email');
  }
  if (!tokenHash) {
    throw new Error('token_hash_required');
  }

  const cleanQuota = maxStudentsOverride ? parseInt(maxStudentsOverride, 10) : null;
  const rpcParams = {
    school_code: schoolCode?.trim().toUpperCase(),
    school_name: schoolName?.trim(),
    school_province: schoolProvince?.trim() || null,
    school_area: schoolArea?.trim() || null,
    target_plan_id: planId,
    subscription_status: subscriptionStatus,
    subscription_starts_at: startsAt,
    subscription_ends_at: endsAt,
    admin_email: adminEmail.trim().toLowerCase(),
    invitation_token_hash: tokenHash,
  };

  if (cleanQuota && cleanQuota > 0) {
    try {
      return await callRpc('platform_admin_create_school_with_invitation', {
        ...rpcParams,
        max_students_override: cleanQuota,
      });
    } catch (err) {
      if (err.message?.includes('PGRST202') || err.message?.includes('schema cache') || err.message?.includes('function')) {
        console.warn('Fallback to standard create_school_with_invitation RPC:', err.message);
        return await callRpc('platform_admin_create_school_with_invitation', rpcParams);
      }
      throw err;
    }
  }

  return callRpc('platform_admin_create_school_with_invitation', rpcParams);
}

/**
 * List pending/processed invitations for platform admin.
 */
export async function platformListInvitations(schoolId = null) {
  const data = await callRpc('platform_admin_list_invitations', {
    p_target_school_id: schoolId ? schoolId.trim() : null,
  });
  return Array.isArray(data) ? data : [];
}

/**
 * Revoke a pending invitation.
 */
export async function platformRevokeInvitation(invitationId) {
  if (!invitationId) throw new Error('invitation_id_required');
  return callRpc('platform_admin_revoke_invitation', {
    p_invitation_id: invitationId,
  });
}

/**
 * Accept a school admin invitation using the token hash.
 */
export async function acceptSchoolAdminInvitation(tokenHash) {
  if (!tokenHash) throw new Error('token_hash_required');
  return callRpc('school_admin_accept_invitation', {
    p_token_hash: tokenHash,
  });
}

/**
 * Claim an unaccepted pending invitation for the currently authenticated caller email.
 * Allows teachers who were provisioned an instant account to log in directly without a token.
 */
export async function claimPendingSchoolAdminInvitation() {
  try {
    return await callRpc('school_admin_claim_pending_invitation', {});
  } catch (err) {
    console.warn('claimPendingSchoolAdminInvitation notice:', err?.message);
    return { ok: false, error: err?.message };
  }
}

/**
 * Auto-provision an initial admin account in Supabase Auth without modifying
 * the currently logged in administrator's active session.
 */
export async function autoProvisionAdminAccount(email, password) {
  if (!email || !password || !supabaseConfig.url || !supabaseConfig.anonKey) return null;
  try {
    const isolatedClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { data, error } = await isolatedClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });
    if (error) {
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        return { ok: true, existing: true, user: data?.user };
      }
      console.warn('Auto-provision account warning:', error);
      return { ok: false, error: error.message };
    }
    return { ok: true, user: data?.user };
  } catch (err) {
    console.warn('Auto-provision account exception:', err);
    return { ok: false, error: err?.message };
  }
}

// ── Client-side CSV/Excel Parsing and Validation ─────────────────────

const STUDENT_ID_REGEX = /^[A-Z0-9][A-Z0-9_-]{0,31}$/;

/**
 * Parse CSV / tab-delimited text for student bulk import.
 * Detects headers: student_id, name, class, number.
 */
export function parseStudentCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = parseDelimitedRows(csvText);
  if (!lines.length) return [];
  const headerCols = lines[0].map(c=>c.toLowerCase());
  let hasHeader = false;
  let idIdx = -1;
  let nameIdx = -1;
  let fullNameIdx = -1;
  let prefixIdx = -1;
  let surnameIdx = -1;
  let classIdx = -1;
  let numberIdx = -1;

  headerCols.forEach((col, idx) => {
    const key = col.normalize('NFC').replace(/[\s_.\-\/]/g, '');
    if (['คำนำหน้า','คำนำหน้าชื่อ','prefix','title','honorific','nametitle'].includes(key)) prefixIdx = idx;
    else if (['นามสกุล','สกุล','lastname','surname','familyname'].includes(key)) surnameIdx = idx;
    else if (['ชื่อสกุล','ชื่อนามสกุล','ชื่อและนามสกุล','fullname','studentname'].includes(key)) fullNameIdx = idx;
    else if (['ชื่อ','ชื่อตัว','firstname','givenname','name'].includes(key)) nameIdx = idx;
    else if (col.includes('id') || col.includes('รหัส') || col.includes('student_id')) idIdx = idx;
    else if (col.includes('name') || col.includes('ชื่อ')) nameIdx = idx;
    else if (col.includes('class') || col.includes('ชั้น') || col.includes('ห้อง')) classIdx = idx;
    else if (col.includes('number') || col.includes('เลขที่') || col.includes('ลำดับ')) numberIdx = idx;
  });

  if ((nameIdx !== -1 || fullNameIdx !== -1) && classIdx !== -1) {
    hasHeader = true;
  }

  const startIndex = hasHeader ? 1 : 0;
  const parsedRows = [];

  for (let i = startIndex; i < lines.length; i += 1) {
    const cols = lines[i];
    if (cols.length === 0 || cols.every((c) => !c)) continue;
    if (cols[0] && (String(cols[0]).trim().startsWith('#') || String(cols[0]).trim().startsWith('//'))) continue;

    let studentId = '';
    let name = '';
    let className = '';
    let number = '';

    if (hasHeader) {
      studentId = idIdx !== -1 ? cols[idIdx] || '' : '';
      const fullName = fullNameIdx !== -1 ? (cols[fullNameIdx] || '').trim() : '';
      const givenName = nameIdx !== -1 ? (cols[nameIdx] || '').trim() : '';
      const surname = surnameIdx !== -1 ? (cols[surnameIdx] || '').trim() : '';
      const prefix = prefixIdx !== -1 ? (cols[prefixIdx] || '').trim() : '';
      name = fullName || [givenName, surname].filter(Boolean).join(' ');
      if (prefix && name && !name.startsWith(prefix)) name = `${prefix} ${name}`;
      className = classIdx !== -1 ? cols[classIdx] || '' : '';
      number = numberIdx !== -1 ? cols[numberIdx] || '' : '';
    } else {
      // Positional heuristic:
      // If 4 cols: [student_id, name, class, number] or [number, name, class, student_id]
      if (cols.length >= 4) {
        if (STUDENT_ID_REGEX.test(cols[0].toUpperCase()) && isNaN(cols[0])) {
          studentId = cols[0];
          name = cols[1];
          className = cols[2];
          number = cols[3];
        } else {
          number = cols[0];
          name = cols[1];
          className = cols[2];
          studentId = cols[3];
        }
      } else if (cols.length === 3) {
        // [name, class, number]
        name = cols[0];
        className = cols[1];
        number = cols[2];
      }
    }

    parsedRows.push({
      student_id: studentId.trim(),
      name: name.trim(),
      class: normalizeClassName(className),
      number: number.trim(),
      originalIndex: i + 1,
    });
  }

  return parsedRows;
}

/**
 * Validate parsed student rows against rules, intra-batch duplicates,
 * existing school student duplicates, and seat capacity.
 */
export function validateStudentImportBatch(rows, existingStudents = [], seatLimit = null, activeSeats = 0) {
  const seenInBatch = new Set();
  const existingSet = new Set(
    existingStudents.map((s) => (s.student_id || s.student_id_normalized || '').toUpperCase().trim()).filter(Boolean)
  );

  const validatedRows = rows.map((row, idx) => {
    const errors = [];
    const normalizedId = (row.student_id || '').toUpperCase().trim();

    if (!row.student_id) {
      errors.push('ขาดรหัสนักเรียน (Student ID)');
    } else if (!STUDENT_ID_REGEX.test(normalizedId)) {
      errors.push('รหัสนักเรียนไม่ถูกต้อง (ใช้ A-Z, 0-9, _, - สูงสุด 32 ตัวอักษร)');
    } else if (seenInBatch.has(normalizedId)) {
      errors.push('รหัสนักเรียนซ้ำในไฟล์ที่อัปโหลด');
    } else if (existingSet.has(normalizedId)) {
      errors.push('รหัสนักเรียนซ้ำกับนักเรียนที่มีอยู่แล้วในโรงเรียน');
    }

    if (normalizedId) {
      seenInBatch.add(normalizedId);
    }

    if (!row.name || !row.name.trim()) {
      errors.push('ขาดชื่อ-นามสกุล');
    }
    if (!row.class || !row.class.trim()) {
      errors.push('ขาดชั้นเรียน');
    }
    if (!row.number || !row.number.trim()) {
      errors.push('ขาดเลขที่');
    }

    return {
      ...row,
      student_id: normalizedId,
      name: (row.name || '').trim(),
      class: normalizeClassName(row.class),
      number: (row.number || '').trim(),
      isValid: errors.length === 0,
      errors,
    };
  });

  const validCount = validatedRows.filter((r) => r.isValid).length;
  const errorCount = validatedRows.length - validCount;
  const availableSeats = typeof seatLimit === 'number' ? Math.max(0, seatLimit - activeSeats) : null;
  const exceedsCapacity = availableSeats !== null && validCount > availableSeats;

  return {
    rows: validatedRows,
    totalRows: validatedRows.length,
    validCount,
    errorCount,
    availableSeats,
    exceedsCapacity,
    exceedsBatchLimit: validatedRows.length > 200,
    canCommit: validCount > 0 && validCount <= 200 && errorCount === 0 && availableSeats !== null && !exceedsCapacity,
  };
}
