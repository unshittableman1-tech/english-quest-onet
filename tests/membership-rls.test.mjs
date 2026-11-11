import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const ids = {
  teacher: '00000000-0000-0000-0000-000000000001',
  admin: '00000000-0000-0000-0000-000000000002',
  other: '00000000-0000-0000-0000-000000000003',
  platform: '00000000-0000-0000-0000-000000000004',
  suspended: '00000000-0000-0000-0000-000000000005',
  stranger: '00000000-0000-0000-0000-000000000006',
};

test('membership migration enforces tenant isolation in PostgreSQL', async (t) => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create role service_role nologin bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
      create table public.students (
        id text primary key, name text, class text, number text, role text,
        xp integer, level integer, "preTest" jsonb, "questProgress" jsonb,
        "badgeStats" jsonb, "rankingStats" jsonb, badges jsonb, "mistakeBank" jsonb,
        "finalBoss" jsonb, "arenaStats" jsonb, "lastActive" text,
        "createdAt" text, "updatedAt" text
      );
      insert into public.students (id, name, class, number, role, xp, level, "questProgress", badges)
        values ('legacy-student', 'Legacy', 'ป.6/1', '1', 'student', 900, 4, '{"vocabulary":{"pct":80}}', '["vocab"]');
    `);
    await db.exec(await readFile(new URL('../supabase/migrations/202610120001_membership_foundation.sql', import.meta.url), 'utf8'));
    for (const id of Object.values(ids)) await db.query('insert into auth.users values ($1)', [id]);
    await db.exec(`
      insert into public.schools (id, code, name) values
        ('school-a', 'AAA', 'School A'), ('school-b', 'BBB', 'School B');
      insert into public.plans (id, code, name, max_students, max_teachers, max_classes, is_active) values
        ('10000000-0000-0000-0000-000000000001', 'legacy', 'Retired plan', 100, 5, 3, false),
        ('10000000-0000-0000-0000-000000000002', 'private', 'Private plan', 100, 5, 3, false),
        ('10000000-0000-0000-0000-000000000003', 'public', 'Current plan', 100, 5, 3, true);
      insert into public.subscriptions (school_id, plan_id, status, starts_at, ends_at) values
        ('school-a', '10000000-0000-0000-0000-000000000001', 'active', '2026-10-01', '2026-11-01'),
        ('school-b', '10000000-0000-0000-0000-000000000002', 'active', '2026-10-01', '2026-11-01');
    `);
    for (const [key, school, role, status] of [
      ['teacher', 'school-a', 'teacher', 'active'], ['admin', 'school-a', 'school_admin', 'active'],
      ['other', 'school-b', 'teacher', 'active'], ['suspended', 'school-a', 'teacher', 'suspended'],
    ]) await db.query('insert into public.school_members (user_id, school_id, role, status) values ($1,$2,$3,$4)', [ids[key], school, role, status]);
    await db.query('insert into public.platform_admins (user_id) values ($1)', [ids.platform]);
    await db.exec(await readFile(new URL('../supabase/migrations/202610150000_students_school_scope.sql', import.meta.url), 'utf8'));
    await db.exec(await readFile(new URL('../supabase/migrations/202610150001_staff_student_authorization.sql', import.meta.url), 'utf8'));
    await db.exec(`
      insert into public.students (id, school_id, school_code, name, class, number, role) values
        ('student-a', 'school-a', 'AAA', 'Student A', 'ป.6/1', '1', 'student'),
        ('student-b', 'school-b', 'BBB', 'Student B', 'ป.6/1', '1', 'student');
    `);

    async function asRole(role, user, sql, params = []) {
      assert.ok(['authenticated', 'anon', 'service_role'].includes(role));
      await db.exec('begin');
      try {
        await db.exec(`set local role ${role}`);
        await db.query("select set_config('request.jwt.claim.sub', $1, true)", [user || '']);
        return await db.query(sql, params);
      } finally { await db.exec('rollback'); }
    }
    const read = (who, table) => asRole('authenticated', ids[who], `select * from public.${table}`);

    await t.test('migration leaves legacy students and their policy state unchanged', async () => {
      const legacy = (await db.query("select school_id, school_code, xp, level, \"questProgress\", badges, \"translatePermission\" from public.students where id = 'legacy-student'")).rows[0];
      assert.equal(legacy.school_id, null);
      assert.equal(legacy.school_code, null);
      assert.equal(legacy.xp, 900);
      assert.equal(legacy.level, 4);
      assert.deepEqual(legacy.questProgress, { vocabulary: { pct: 80 } });
      assert.deepEqual(legacy.badges, ['vocab']);
      assert.equal(legacy.translatePermission, 'full');
      assert.equal((await db.query("select relrowsecurity from pg_class where oid = 'public.students'::regclass")).rows[0].relrowsecurity, false);
    });
    await t.test('teachers read only their school, contract and own membership', async () => {
      assert.deepEqual((await read('teacher', 'schools')).rows.map((r) => r.id), ['school-a']);
      assert.deepEqual((await read('other', 'schools')).rows.map((r) => r.id), ['school-b']);
      assert.deepEqual((await read('teacher', 'subscriptions')).rows.map((r) => r.school_id), ['school-a']);
      assert.deepEqual((await read('teacher', 'school_members')).rows.map((r) => r.user_id), [ids.teacher]);
      assert.deepEqual((await read('teacher', 'plans')).rows.map((r) => r.code).sort(), ['legacy', 'public']);
      assert.equal((await asRole('authenticated', ids.teacher, "select * from public.schools where id = 'school-b'")).rows.length, 0);
    });
    await t.test('school admins see their roster but not the other school', async () => {
      assert.deepEqual((await read('admin', 'school_members')).rows.map((r) => r.user_id).sort(), [ids.teacher, ids.admin, ids.suspended].sort());
      assert.equal((await read('admin', 'schools')).rows.length, 1);
      assert.equal((await read('admin', 'platform_admins')).rows.length, 0);
    });
    await t.test('suspended and unprovisioned members receive no tenant data', async () => {
      for (const who of ['suspended', 'stranger']) {
        for (const table of ['schools', 'school_members', 'subscriptions']) {
          assert.equal((await read(who, table)).rows.length, 0);
        }
      }
      await db.exec("update public.schools set status = 'suspended' where id = 'school-a'");
      assert.equal((await read('teacher', 'schools')).rows.length, 0);
      assert.equal((await read('admin', 'school_members')).rows.length, 0);
      await db.exec("update public.schools set status = 'active' where id = 'school-a'");
    });
    await t.test('platform administrator can read all tenants without becoming a writable browser role', async () => {
      assert.equal((await read('platform', 'schools')).rows.length, 2);
      assert.equal((await read('platform', 'subscriptions')).rows.length, 2);
      assert.equal((await read('platform', 'platform_admins')).rows.length, 1);
      await assert.rejects(asRole('authenticated', ids.platform, "update public.schools set status = 'suspended'"), /permission denied/);
    });
    await t.test('browser roles cannot self-promote, edit billing, delete schools or call private helpers anonymously', async () => {
      for (const sql of [
        "update public.school_members set role = 'school_admin'",
        `insert into public.platform_admins values ('${ids.teacher}', now())`,
        "update public.subscriptions set status = 'active'",
        'delete from public.schools',
        "insert into public.schools (code,name) values ('FAKE','Fake school')",
        'update public.plans set max_students = 999999',
      ]) await assert.rejects(asRole('authenticated', ids.teacher, sql), /permission denied/);
      for (const table of ['schools', 'school_members', 'plans', 'subscriptions', 'platform_admins']) {
        await assert.rejects(asRole('anon', null, `select * from public.${table}`), /permission denied/);
      }
      await assert.rejects(asRole('anon', null, 'select membership_private.is_platform_admin()'), /permission denied/);
    });
    await t.test('database constraints reject negative quotas, duplicate memberships and invalid trials', async () => {
      for (const sql of [
        'update public.plans set max_students = -1',
        "update public.subscriptions set status = 'trialing', trial_ends_at = null",
        "update public.subscriptions set ends_at = starts_at",
        `insert into public.school_members (school_id,user_id,role) values ('school-a','${ids.teacher}','teacher')`,
      ]) await assert.rejects(asRole('service_role', null, sql), /constraint/);
    });
    await t.test('trusted provisioning can write and update timestamps', async () => {
      const result = await asRole('service_role', null,
        "update public.schools set name = 'Renamed', updated_at = '2000-01-01' where id = 'school-a' returning name, updated_at");
      assert.equal(result.rows[0].name, 'Renamed');
      assert.ok(new Date(result.rows[0].updated_at).getUTCFullYear() > 2000);
    });
    await t.test('staff RPCs isolate student data and reject suspended or anonymous callers', async () => {
      const teacherRows = await asRole('authenticated', ids.teacher, "select public.staff_list_students('school-a') as data");
      assert.deepEqual(teacherRows.rows[0].data.map((row) => row.id).sort(), ['student-a']);
      await assert.rejects(
        asRole('authenticated', ids.teacher, "select public.staff_list_students('school-b')"),
        /staff_school_forbidden/,
      );
      await assert.rejects(
        asRole('authenticated', ids.suspended, "select public.staff_list_students('school-a')"),
        /staff_school_forbidden/,
      );
      await assert.rejects(asRole('anon', null, "select public.staff_list_students('school-a')"), /permission denied/);
    });
    await t.test('staff mutations cannot target another tenant', async () => {
      assert.equal((await asRole('authenticated', ids.teacher,
        "select public.staff_rename_student('school-a','student-a','Renamed A') as changed")).rows[0].changed, true);
      await assert.rejects(asRole('authenticated', ids.teacher,
        "select public.staff_delete_student('school-a','student-b') as changed"), /staff_school_admin_required/);
      assert.equal((await db.query("select count(*)::int as count from public.students where id = 'student-b'")).rows[0].count, 1);
      const created = await asRole('authenticated', ids.admin,
        `select public.staff_create_student('school-a', '{"name":"New","class":"ป.6/2","number":"2"}'::jsonb) as data`);
      assert.equal(created.rows[0].data.school_id, 'school-a');
      assert.equal(created.rows[0].data.school_code, 'AAA');
      assert.equal(created.rows[0].data.role, 'student');
      assert.equal(created.rows[0].data.xp, 0);
      assert.equal(created.rows[0].data.level, 1);
      assert.deepEqual(created.rows[0].data.questProgress, {});
      assert.deepEqual(created.rows[0].data.badges, []);
      assert.match(created.rows[0].data.id, /^std_[0-9a-f-]{36}$/);
    });
    await t.test('student creation rejects forged managed fields and reserved identifiers', async () => {
      for (const payload of [
        '{"name":"Forge","class":"ป.6/1","number":"3","xp":999999}',
        '{"name":"Forge","class":"ป.6/1","number":"3","questProgress":{"grammar":{"passed":true}}}',
        '{"name":"Forge","class":"ป.6/1","number":"3","school_id":"school-b"}',
      ]) await assert.rejects(asRole('authenticated', ids.admin,
        `select public.staff_create_student('school-a', '${payload}'::jsonb)`), /student_payload_contains_forbidden_fields/);
      await assert.rejects(asRole('authenticated', ids.admin,
        `select public.staff_create_student('school-a', '{"id":"__SYSTEM_EXAM_SESSION__","name":"Reserved","class":"ป.6/1","number":"3"}'::jsonb)`),
        /reserved_student_id/);
      await assert.rejects(asRole('authenticated', ids.other,
        `select public.staff_create_student('school-a', '{"name":"Cross","class":"ป.6/1","number":"3"}'::jsonb)`),
        /staff_school_admin_required/);
    });
  } finally { await db.close(); }
});

test('staff authorization migration rejects an incompatible student schema', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
      create schema auth; create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
      create schema membership_private;
      create function membership_private.is_platform_admin() returns boolean language sql stable as $$ select false $$;
      create function membership_private.has_school_access(text, boolean default false) returns boolean language sql stable as $$ select false $$;
      create table public.schools (id text primary key, code text, status text);
      create table public.students (
        id text, name text, class text, number text, role text, xp integer, level integer,
        "preTest" jsonb, "questProgress" jsonb, "badgeStats" jsonb, "rankingStats" jsonb,
        badges jsonb, "mistakeBank" jsonb, "finalBoss" jsonb, "arenaStats" jsonb,
        "lastActive" text, "createdAt" text, "updatedAt" text,
        school_id text, school_code text, "translatePermission" boolean
      );
    `);
    await assert.rejects(
      db.exec(await readFile(new URL('../supabase/migrations/202610150001_staff_student_authorization.sql', import.meta.url), 'utf8')),
      /students table is incompatible/,
    );
  } finally { await db.close(); }
});
