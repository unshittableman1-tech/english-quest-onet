import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const migrationPaths = [
  '../supabase/migrations/202610120001_membership_foundation.sql',
  '../supabase/migrations/202610150000_students_school_scope.sql',
  '../supabase/migrations/202610170001_student_auth_foundation.sql',
  '../supabase/migrations/202610170002_dual_membership_phase1.sql',
  '../supabase/migrations/202610170003_phase1c_school_admin.sql',
  '../supabase/migrations/202611170001_school_teacher_names.sql',
];

const migrations = await Promise.all(
  migrationPaths.map((p) => readFile(new URL(p, import.meta.url), 'utf8'))
);

const users = {
  platformAdmin: '00000000-0000-0000-0000-000000000001',
  schoolAAdmin: '00000000-0000-0000-0000-000000000101',
  schoolATeacher: '00000000-0000-0000-0000-000000000102',
  schoolBAdmin: '00000000-0000-0000-0000-000000000201',
  schoolBTeacher: '00000000-0000-0000-0000-000000000202',
};

async function setupDatabase() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create function auth.jwt() returns jsonb language sql stable as $$
      select jsonb_build_object('app_metadata', jsonb_build_object(
        'student_credential_version', nullif(current_setting('request.jwt.claim.student_credential_version', true), '')
      ))
    $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    grant execute on function auth.jwt() to anon, authenticated;

    create table public.students (
      id text primary key,
      name text, class text, number text, role text, xp integer, level integer,
      "preTest" jsonb, "questProgress" jsonb, "badgeStats" jsonb, "rankingStats" jsonb,
      badges jsonb, "mistakeBank" jsonb, "finalBoss" jsonb, "arenaStats" jsonb,
      "lastActive" text, "createdAt" text, "updatedAt" text
    );
  `);

  await db.exec(`
    insert into auth.users (id, email) values
      ('${users.platformAdmin}', 'admin@platform.test'),
      ('${users.schoolAAdmin}', 'admin@school-a.test'),
      ('${users.schoolATeacher}', 'teacher@school-a.test'),
      ('${users.schoolBAdmin}', 'admin@school-b.test'),
      ('${users.schoolBTeacher}', 'teacher@school-b.test');
  `);

  for (const sql of migrations) {
    await db.exec(sql);
  }

  await db.exec(`
    insert into public.schools (id, code, name, province, area, status) values
      ('sch-a', 'AAA01', 'School Alpha', 'Bangkok', 'District 1', 'active'),
      ('sch-b', 'BBB02', 'School Beta', 'Chiang Mai', 'District 2', 'active');

    insert into public.plans (id, code, name, max_students, max_teachers, max_classes, is_active) values
      ('40000000-0000-0000-0000-000000000001', 'plan_std', 'Standard School Plan', 50, 10, 5, true);

    insert into public.subscriptions (school_id, plan_id, status, starts_at, ends_at) values
      ('sch-a', '40000000-0000-0000-0000-000000000001', 'active', '2026-10-01', '2027-10-01'),
      ('sch-b', '40000000-0000-0000-0000-000000000001', 'active', '2026-10-01', '2027-10-01');

    insert into public.school_members (school_id, user_id, role, status) values
      ('sch-a', '${users.schoolAAdmin}', 'school_admin', 'active'),
      ('sch-a', '${users.schoolATeacher}', 'teacher', 'active'),
      ('sch-b', '${users.schoolBAdmin}', 'school_admin', 'active'),
      ('sch-b', '${users.schoolBTeacher}', 'teacher', 'active');
  `);

  return db;
}

async function asRole(db, role, userId, sql, params = [], commit = false) {
  await db.exec('begin');
  try {
    await db.exec(`set local role ${role}`);
    await db.query("select set_config('request.jwt.claim.sub', $1, true)", [userId || '']);
    const res = await db.query(sql, params);
    await db.exec(commit ? 'commit' : 'rollback');
    return res;
  } catch (err) {
    await db.exec('rollback');
    throw err;
  }
}

test('School Teacher Real Names: migration, update, and listing security', async (t) => {
  const db = await setupDatabase();

  await t.test('school_admin_list_teachers returns teacher_name column and null when unset', async () => {
    const res = await asRole(
      db,
      'authenticated',
      users.schoolAAdmin,
      "select public.school_admin_list_teachers('sch-a') as list"
    );
    const teachers = res.rows[0].list;
    assert.equal(teachers.length, 2);
    const teacherA = teachers.find((u) => u.user_id === users.schoolATeacher);
    assert.ok(teacherA);
    assert.equal(teacherA.email, 'teacher@school-a.test');
    assert.equal(teacherA.teacher_name, null);
  });

  await t.test('school admin can set teacher real full name', async () => {
    await asRole(
      db,
      'authenticated',
      users.schoolAAdmin,
      "select public.school_admin_update_teacher_name('sch-a', $1, $2)",
      [users.schoolATeacher, 'ครูวรรณภา แสงทอง'],
      true
    );

    const res = await asRole(
      db,
      'authenticated',
      users.schoolAAdmin,
      "select public.school_admin_list_teachers('sch-a') as list"
    );
    const teachers = res.rows[0].list;
    const teacherA = teachers.find((u) => u.user_id === users.schoolATeacher);
    assert.equal(teacherA.teacher_name, 'ครูวรรณภา แสงทอง');
  });

  await t.test('unauthorized teacher or non-admin cannot update teacher name', async () => {
    await assert.rejects(
      async () => {
        await asRole(
          db,
          'authenticated',
          users.schoolATeacher,
          "select public.school_admin_update_teacher_name('sch-a', $1, $2)",
          [users.schoolATeacher, 'ครูผู้แอบเปลี่ยน']
        );
      },
      (err) => err.code === '42501' || err.message.includes('school_admin_forbidden')
    );
  });

  await t.test('cross-school admin cannot update teachers in another school', async () => {
    await assert.rejects(
      async () => {
        await asRole(
          db,
          'authenticated',
          users.schoolBAdmin,
          "select public.school_admin_update_teacher_name('sch-a', $1, $2)",
          [users.schoolATeacher, 'พยายามเปลี่ยนข้ามโรงเรียน']
        );
      },
      (err) => err.code === '42501' || err.message.includes('school_admin_forbidden')
    );
  });

  await t.test('rejects empty or whitespace-only teacher name', async () => {
    await assert.rejects(
      async () => {
        await asRole(
          db,
          'authenticated',
          users.schoolAAdmin,
          "select public.school_admin_update_teacher_name('sch-a', $1, $2)",
          [users.schoolATeacher, '    ']
        );
      },
      (err) => err.code === '22023' || err.message.includes('invalid_teacher_name')
    );
  });

  await t.test('updating teacher in school where member does not exist throws not found', async () => {
    await assert.rejects(
      async () => {
        await asRole(
          db,
          'authenticated',
          users.schoolAAdmin,
          "select public.school_admin_update_teacher_name('sch-a', $1, $2)",
          [users.schoolBTeacher, 'ครูข้ามโรงเรียน']
        );
      },
      (err) => err.code === 'P0002' || err.message.includes('teacher_membership_not_found')
    );
  });
});
