// UI decisions only. Database/server authorization must independently enforce access.
export function getSubscriptionAccess(subscription, plan, school, now = Date.now()) {
  const denied = (reason) => ({ allowed: false, reason, features: {}, limits: null });
  if (!school || school.status !== 'active') return denied('school_unavailable');
  if (!subscription || !plan || subscription.school_id !== school.id || subscription.plan_id !== plan.id) {
    return denied('subscription_missing');
  }
  if (!['active', 'trialing'].includes(subscription.status)) return denied(subscription.status || 'inactive');
  const start = Date.parse(subscription.starts_at);
  const end = Date.parse(subscription.ends_at);
  const trialEnd = Date.parse(subscription.trial_ends_at);
  if (!Number.isFinite(now) || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return denied('invalid_period');
  }
  if (subscription.status === 'trialing' && (!Number.isFinite(trialEnd) || trialEnd <= start || trialEnd > end)) {
    return denied('invalid_period');
  }
  const expiresAt = subscription.status === 'trialing' ? trialEnd : end;
  if (now < start) return denied('not_started');
  if (now >= expiresAt) return denied('expired');
  const limits = {};
  for (const kind of ['students', 'teachers', 'classes']) {
    const value = subscription[`max_${kind}_override`] ?? plan[`max_${kind}`];
    if (!Number.isSafeInteger(value) || value < 0) return denied('invalid_limits');
    limits[kind] = value;
  }
  const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  if (!isObject(plan.features) || !isObject(subscription.features_override)) return denied('invalid_features');
  const features = Object.fromEntries(Object.entries({ ...plan.features, ...subscription.features_override })
    .map(([key, value]) => [key, value === true]));
  // Retired plans remain valid for existing contracts; is_active controls new sales only.
  return { allowed: true, reason: null, expiresAt, features, limits };
}

export function canAddMember(access, kind, count) {
  return access?.allowed === true && Number.isSafeInteger(count) && count >= 0
    && Number.isSafeInteger(access.limits?.[kind]) && count < access.limits[kind];
}

export class MembershipError extends Error {
  constructor(code) { super(code); this.name = 'MembershipError'; this.code = code; }
}

export function createStaffSession(identity, membershipId = null) {
  if (!identity?.userId) throw new MembershipError('unauthenticated');

  const base = {
    id: `staff_${identity.userId}`,
    user_id: identity.userId,
    email: identity.email || '',
    username: identity.email || '',
    name: identity.email || 'ผู้ใช้งาน',
    room: 'ทั้งหมด',
    isStaff: true,
    authVerified: true,
  };

  if (identity.isPlatformAdmin === true) {
    return { ...base, role: 'super_admin' };
  }

  const memberships = Array.isArray(identity.memberships) ? identity.memberships : [];
  if (!membershipId && memberships.length > 1) {
    throw new MembershipError('membership_selection_required');
  }

  const membership = membershipId
    ? memberships.find((item) => item.id === membershipId)
    : memberships[0];

  if (!membership || !['teacher', 'school_admin'].includes(membership.role)
      || membership.status !== 'active' || membership.school?.status !== 'active'
      || membership.school?.id !== membership.school_id) {
    throw new MembershipError('school_forbidden');
  }

  return {
    ...base,
    role: 'teacher',
    membership_role: membership.role,
    school_membership_id: membership.id,
    school_id: membership.school_id,
    school_code: membership.school.code,
    school_name: membership.school.name,
  };
}

// Inject the existing Supabase client; never create a second auth session/client here.
export function createMembershipService(client) {
  const check = (result) => {
    if (result.error) throw result.error;
    return result.data;
  };

  async function getIdentity() {
    const { user } = check(await client.auth.getUser());
    if (!user) throw new MembershipError('unauthenticated');
    const admin = check(await client.from('platform_admins').select('user_id').eq('user_id', user.id).maybeSingle());
    const rows = check(await client.from('school_members')
      .select('id,school_id,user_id,role,status,school:schools(id,code,name,status)')
      .eq('user_id', user.id).eq('status', 'active'));
    const memberships = (rows || []).filter((row) => row.user_id === user.id
      && row.status === 'active' && ['teacher', 'school_admin'].includes(row.role)
      && row.school?.id === row.school_id && row.school.status === 'active');
    if (admin?.user_id !== user.id && memberships.length === 0) throw new MembershipError('no_membership');
    return { userId: user.id, email: user.email, isPlatformAdmin: admin?.user_id === user.id, memberships };
  }

  return {
    getIdentity,
    async signIn(email, password) {
      if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
        throw new MembershipError('credentials_required');
      }
      check(await client.auth.signInWithPassword({ email: email.trim(), password }));
      try {
        return await getIdentity();
      } catch (error) {
        // Do not leave a successfully authenticated but unprovisioned account signed in.
        const cleanup = await client.auth.signOut({ scope: 'local' });
        if (cleanup.error) throw new MembershipError('session_cleanup_failed');
        throw error;
      }
    },
    async signOut() { check(await client.auth.signOut({ scope: 'local' })); },
    async getSchoolSubscription(schoolId) {
      const identity = await getIdentity();
      if (!identity.isPlatformAdmin && !identity.memberships.some((m) => m.school_id === schoolId)) {
        throw new MembershipError('school_forbidden');
      }
      return check(await client.from('subscriptions').select('*,plan:plans(*)').eq('school_id', schoolId).maybeSingle());
    },
  };
}
