import test from 'node:test';
import assert from 'node:assert/strict';
import { getSubscriptionAccess, canAddMember, createMembershipService, createStaffSession } from '../src/utils/membership.js';

const now = Date.parse('2026-10-12T00:00:00Z');
const school = { id: 'school-a', status: 'active' };
const plan = { id: 'plan-a', is_active: false, max_students: 100, max_teachers: 5, max_classes: 3,
  features: { export: true, final_exam: false } };
const subscription = { school_id: school.id, plan_id: plan.id, status: 'active',
  starts_at: '2026-10-01T00:00:00Z', ends_at: '2026-11-01T00:00:00Z', features_override: {} };
const access = (changes = {}, planChanges = {}) => getSubscriptionAccess({ ...subscription, ...changes }, { ...plan, ...planChanges }, school, now);

test('valid contracts retain retired plans and explicit zero/false overrides', () => {
  const result = access({ max_students_override: 0, features_override: { export: false, final_exam: true, unsafe: 'true' } });
  assert.equal(result.allowed, true);
  assert.equal(result.limits.students, 0);
  assert.deepEqual(result.features, { export: false, final_exam: true, unsafe: false });
  assert.equal(canAddMember(result, 'students', 0), false);
  assert.equal(canAddMember(result, 'teachers', 4), true);
  assert.equal(canAddMember(result, 'teachers', 5), false);
  assert.equal(canAddMember(result, 'teachers', -1), false);
  assert.equal(canAddMember(result, 'unknown', 0), false);
});

test('suspended, missing and mismatched school contracts fail closed', () => {
  for (const status of ['past_due', 'expired', 'suspended', 'cancelled', 'unknown']) {
    assert.equal(access({ status }).allowed, false);
  }
  assert.equal(access({ school_id: 'other' }).allowed, false);
  assert.equal(access({ plan_id: 'other' }).allowed, false);
  assert.equal(getSubscriptionAccess(subscription, plan, { ...school, status: 'suspended' }, now).allowed, false);
  assert.equal(getSubscriptionAccess(null, plan, school, now).allowed, false);
});

test('subscription start is inclusive, expiration exclusive, trial uses earlier deadline', () => {
  assert.equal(access({ starts_at: new Date(now).toISOString() }).allowed, true);
  assert.equal(access({ ends_at: new Date(now).toISOString() }).reason, 'expired');
  assert.equal(access({ starts_at: '2026-10-13T00:00:00Z' }).reason, 'not_started');
  assert.equal(access({ status: 'trialing', trial_ends_at: '2026-10-11T00:00:00Z' }).reason, 'expired');
  assert.equal(access({ status: 'trialing', trial_ends_at: '2026-10-13T00:00:00Z' }).allowed, true);
  for (const trial_ends_at of [null, 'bad-date', '2027-01-01', '2026-09-01']) {
    assert.equal(access({ status: 'trialing', trial_ends_at }).reason, 'invalid_period');
  }
  assert.equal(access({ starts_at: 'bad-date' }).reason, 'invalid_period');
});

test('invalid quota and feature payloads cannot grant access', () => {
  for (const value of [-1, 1.5, '100', Infinity, NaN]) {
    assert.equal(access({ max_students_override: value }).reason, 'invalid_limits');
  }
  assert.equal(access({ features_override: [] }).reason, 'invalid_features');
  assert.equal(access({}, { features: null }).reason, 'invalid_features');
});

function mockClient({ user = { id: 'user-a', email: 'a@example.test' }, admin = null, members, error = null, loginError = null, cleanupError = null } = {}) {
  const calls = [];
  const active = { user_id: 'user-a', school_id: school.id, role: 'teacher', status: 'active', school };
  return {
    calls,
    auth: {
      getUser: async () => { calls.push('getUser'); return { data: { user }, error }; },
      signInWithPassword: async (credentials) => { calls.push(credentials); return { data: {}, error: loginError }; },
      signOut: async () => { calls.push('signOut'); return { data: {}, error: cleanupError }; },
    },
    from(table) {
      calls.push(table);
      const response = { data: table === 'platform_admins' ? admin : table === 'school_members' ? members ?? [active] : subscription, error: null };
      const query = {
        select: () => query, eq: () => query,
        maybeSingle: async () => response,
        then: (resolve, reject) => Promise.resolve(response).then(resolve, reject),
      };
      return query;
    },
  };
}

test('sign-in verifies the user and loads database memberships, never user metadata roles', async () => {
  const client = mockClient({ user: { id: 'user-a', user_metadata: { role: 'super_admin' } } });
  const result = await createMembershipService(client).signIn(' a@example.test ', ' password ');
  assert.deepEqual(client.calls[0], { email: 'a@example.test', password: ' password ' });
  assert.equal(result.isPlatformAdmin, false);
  assert.equal(result.memberships[0].school_id, school.id);
  assert.ok(client.calls.includes('getUser'));
});

test('no membership cleans up the auth session and never accepts foreign rows', async () => {
  for (const members of [[], [{ user_id: 'other', school_id: school.id, role: 'teacher', status: 'active', school }],
    [{ user_id: 'user-a', school_id: school.id, role: 'super_admin', status: 'active', school }]]) {
    const client = mockClient({ members });
    await assert.rejects(createMembershipService(client).signIn('a@example.test', 'pw'), { code: 'no_membership' });
    assert.equal(client.calls.at(-1), 'signOut');
  }
});

test('auth failures propagate and cleanup failure is explicit', async () => {
  const client = mockClient({ loginError: new Error('invalid login') });
  await assert.rejects(createMembershipService(client).signIn('a@example.test', 'wrong'), /invalid login/);
  assert.equal(client.calls.includes('getUser'), false);
  const failed = mockClient({ error: new Error('offline') });
  await assert.rejects(createMembershipService(failed).signIn('a@example.test', 'pw'), /offline/);
  assert.equal(failed.calls.at(-1), 'signOut');
  await assert.rejects(createMembershipService(mockClient({ members: [], cleanupError: new Error('offline') }))
    .signIn('a@example.test', 'pw'), { code: 'session_cleanup_failed' });
});

test('subscription reads reject a foreign school before querying its data', async () => {
  const client = mockClient();
  const service = createMembershipService(client);
  await assert.rejects(service.getSchoolSubscription('school-b'), { code: 'school_forbidden' });
  assert.equal(client.calls.includes('subscriptions'), false);
  assert.equal((await service.getSchoolSubscription(school.id)).school_id, school.id);
});

test('platform access comes only from the verified user registry entry', async () => {
  assert.equal((await createMembershipService(mockClient({ admin: { user_id: 'user-a' }, members: [] })).getIdentity()).isPlatformAdmin, true);
  await assert.rejects(createMembershipService(mockClient({ admin: { user_id: 'other' }, members: [] })).getIdentity(), { code: 'no_membership' });
  await assert.rejects(createMembershipService(mockClient({ user: null })).getIdentity(), { code: 'unauthenticated' });
});

test('verified platform administrators receive only a server-backed admin session', () => {
  const session = createStaffSession({ userId: 'admin-a', email: 'admin@example.test', isPlatformAdmin: true, memberships: [] });
  assert.equal(session.role, 'super_admin');
  assert.equal(session.authVerified, true);
  assert.equal(session.user_id, 'admin-a');
});

test('active school membership produces a school-scoped teacher session', () => {
  const member = { id: 'member-a', user_id: 'user-a', school_id: school.id, role: 'school_admin', status: 'active',
    school: { ...school, code: 'SCH01', name: 'School One' } };
  const session = createStaffSession({ userId: 'user-a', email: 'teacher@example.test', isPlatformAdmin: false, memberships: [member] });
  assert.equal(session.role, 'teacher');
  assert.equal(session.membership_role, 'school_admin');
  assert.equal(session.school_id, school.id);
  assert.equal(session.school_code, 'SCH01');
});

test('staff session creation fails closed for ambiguous or invalid memberships', () => {
  const valid = { id: 'member-a', user_id: 'user-a', school_id: school.id, role: 'teacher', status: 'active',
    school: { ...school, code: 'SCH01', name: 'School One' } };
  assert.throws(() => createStaffSession(null), { code: 'unauthenticated' });
  assert.throws(() => createStaffSession({ userId: 'user-a', memberships: [valid, { ...valid, id: 'member-b' }] }),
    { code: 'membership_selection_required' });
  assert.throws(() => createStaffSession({ userId: 'user-a', memberships: [{ ...valid, status: 'suspended' }] }),
    { code: 'school_forbidden' });
  assert.throws(() => createStaffSession({ userId: 'user-a', memberships: [valid] }, 'foreign'),
    { code: 'school_forbidden' });
});
