# Membership Foundation: Staging Runbook

Status: staff Auth and tenant-scoped student RPCs are implemented and tested locally,
but the migrations are NOT deployed. This is not production-safe until hosted RLS and
authorization tests pass and the legacy anonymous student access is replaced.

## Local Findings

- No SQL schema/migration history was present in the repository before this delivery.
- `src/utils/schoolStorage.js` keeps school fixtures and edits in localStorage. Those
  fixtures are not verified customer records and must not be automatically seeded.
- `src/components/TeacherLoginPage.jsx` now uses Supabase Auth; `App.jsx` revalidates
  staff sessions against the membership tables instead of trusting localStorage roles.
- Teacher Dashboard student reads and mutations use the tenant-scoped RPCs in
  `202610150001_staff_student_authorization.sql`. These fail closed until deployed.
- `src/utils/arenaStorage.js` uses a global exam session and a sentinel student row.
- There are two Supabase client modules. Integration must consolidate them before
  adding an auth listener; the service in this delivery accepts an injected client.
- Actual remote table definitions, policies, grants and Auth configuration have NOT
  been inspected. Environment variables alone do not prove the database is secure.

## Delivered Schema

`migrations/202610120001_membership_foundation.sql` creates five RLS-protected tables:

| Table | Purpose | Browser writes |
| --- | --- | --- |
| platform_admins | Trusted registry of Auth user IDs | None |
| schools | Tenant and contact data; text IDs preserve existing school IDs | None |
| school_members | Auth user, school, role, active/suspended membership | None |
| plans | Package limits, features, optional THB prices | None |
| subscriptions | One current contract per school | None |

No prices, limits or customer accounts are invented or seeded. A missing price means
unconfigured, not free. Zero quota means no capacity, not unlimited. An inactive plan
is retired from new sales but existing contracts can still read it and use its limits.
Renewal history and payment approval need separate audited server workflows.

Authenticated teachers read their own membership, school and current contract.
School admins also read their own school's roster. Suspended membership/school access
is denied. Platform admins read all tenants but still cannot mutate data from the browser.
Provisioning requires a trusted server/SQL administrator. Never use a service-role key
in a `VITE_*` variable or client bundle. Do not add `membership_private` as an exposed API schema.

## Before Applying

1. Create an isolated staging project and take a recoverable backup of the existing
   schema/data before any migration on a real project.
2. Run `audit.sql` read-only on the authorized database. Inspect every existing grant,
   policy and table conflict. This migration intentionally fails rather than silently
   adopting an incompatible `schools` or `plans` table.
3. Review legacy school mappings with the owner. Keep existing `sch_*` IDs as text;
   quarantine duplicate codes, orphan students and sentinel/system records for review.
4. Apply the migration once via the normal Supabase migration workflow or SQL editor
   on staging. Its transaction rolls back on error. Do not run this against production
   merely to make the new code available.
5. Create staff Auth users through the trusted Supabase administrative flow. Verify
   their identity before inserting a `school_members` record using their Auth UUID.
   Seed the initial `platform_admins` row through trusted SQL only, never user metadata.
6. Add owner-approved schools/plans/contracts. Do not import `DEFAULT_SCHOOLS` as
   customer data or assume their displayed subscription dates/quotas are valid.
7. Test real Auth JWTs from two schools against REST endpoints. Reproduce the local
   isolation tests, anonymous denial, suspended membership and denied writes. PGlite
   verifies SQL/RLS logic but does not emulate hosted Auth, PostgREST or API settings.

## Required Before Production Cutover

- Add a verified student identity/session mechanism. A public school code + class +
  number does not prove ownership. Do not preserve open anon policies to bypass this.
- Backfill validated `students.school_id`, introduce class ownership and add server-side
  student/exam RLS. Replace global exam sessions with school-scoped records.
- Scope reads, writes, exports and deletes; remove global reset pathways from teachers.
  Clear or namespace caches on user/school changes and sign-out.
- Apply both migrations to an isolated staging project, provision verified Auth users,
  and test teacher, school admin, platform admin, suspended and cross-school JWTs.
- Implement email recovery callback and reset-password UI with allowlisted redirect URLs.
- Do not let staff identities pass through student XP/heartbeat/storage functions.
- Implement provisioning/membership changes and quota checks on a trusted server with
  transactions/locking. Client `canAddMember()` is display logic, not race-safe enforcement.
- Provisioning mutations need authorization and audit logs; payments are not implemented.

## Verification and Rollback

Run `npm test` and `npm run build`. `membership-rls.test.mjs` runs the actual migration
in a disposable PGlite PostgreSQL database, with Supabase roles and `auth.uid()` modeled
locally. `membership.test.mjs` tests the Auth adapter and contract calculations without
network requests. PGlite is a dev dependency and is not imported into the application.

After a staging failure, keep the application on the existing flow, capture diagnostics
and restore the staging snapshot/recreate the disposable database. Do not blindly drop
tables after staff or contract data exists. Production rollback requires a reviewed
forward repair or database restore, with explicit treatment of records created since backup.

## References

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Verified Auth user lookup](https://supabase.com/docs/reference/javascript/auth-getuser)
- [Private policy helpers](https://supabase.com/docs/guides/troubleshooting/do-i-need-to-expose-security-definer-functions-in-row-level-security-policies-iI0uOw)
