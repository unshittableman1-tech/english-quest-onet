# Verification

Run the core regression suite with Node.js 24:

```sh
npm test
npm run build
```

The tests cover XP accumulation, ranking, tier boundaries, chapter progression,
real classroom analytics, early warnings, and final exam cache restoration.
Supabase and localStorage are isolated test doubles; no production data is used.

## Membership Foundation

`membership.test.mjs` tests the injected Auth adapter, tenant selection checks,
subscription dates, status, feature overrides and quota boundaries.
`membership-rls.test.mjs` applies the actual SQL migration in a disposable PGlite
PostgreSQL database and exercises RLS using authenticated/anonymous/service roles.
It verifies cross-school isolation, denied privilege escalation, constraints and
legacy table preservation. The local `auth.uid()` model is not a hosted Supabase
Auth/PostgREST integration test. See `supabase/README.md` for the staging gates.

## Browser Smoke Test

Start the local Vite server, then run with an available Playwright installation
and Google Chrome:

```sh
node tests/browser-smoke.mjs
```

`SMOKE_URL` defaults to `http://127.0.0.1:5173`. When Playwright is supplied by an
external runtime, set `PLAYWRIGHT_MODULE` to its `index.mjs` file URL.

The browser test verifies the landing page at five viewport sizes, teacher
filters, light/dark layouts, mobile navigation, reports, review plans, ranking,
and timed exam submission. Every external request is mocked or blocked.
Screenshots are written to `scratch/phase0-screenshots/`.

`browser-harness.jsx` is a development-only fixture imported by the test browser.
It is not imported by the production app and is not included in its build.
