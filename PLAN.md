# PLAN — GET /auth/status endpoint

## 1. Scope
**In scope:**
- `GET /auth/status` returns JSON `{ authenticated: boolean, username: string | null }`.
- Uses the existing Passport session — no new auth machinery.
- Authenticated → 200 with `{ authenticated: true, username: req.user.username ?? null }`.
- Unauthenticated → 200 with `{ authenticated: false, username: null }`.

**Out of scope:**
- New auth strategies, JWT, refresh tokens, /profile changes, EJS view changes, session cookie changes.

## 2. Assumptions
- Existing Passport session middleware (cookie-session + passport.session) populates `req.user` when logged in.
- We will introduce Jest as the test runner — repo has no test infra.
- We will use `supertest` for HTTP-level testing without binding port 3000.
- We must not require `config/keys.js` to run tests (it's gitignored). Tests will mount the router in isolation, not the full `app.js`.

## 3. Test plan
1. `test_status_unauthenticated` — GET /auth/status with no session returns 200, body `{ authenticated: false, username: null }`.
2. `test_status_authenticated` — fake `req.user = { username: "alice" }` injected, returns 200, body `{ authenticated: true, username: "alice" }`.
3. **Characterization test** `test_existing_login_route_still_renders` — GET /auth/login still returns 200 after our changes (regression guard for the existing route).

## 4. File plan
| File | Change | Purpose |
|---|---|---|
| `routes/auth-routes.js` | edit | Add `router.get("/status", ...)` handler |
| `tests/auth-routes.test.js` | new | Three tests above |
| `package.json` | edit | Add `jest` + `supertest` to devDependencies; replace test script |

## 5. Out-of-scope files (legacy guard)
Files we will NOT touch in this change, even though they look related:
- `app.js` — wiring change deferred. Router can be unit-tested in isolation.
- `config/passport-setup.js` — Passport strategy is fine as-is.
- `models/user-model.js` — no schema change.
- `routes/profile-routes.js` — separate concern.
- `views/*.ejs` — no UI change.

## 6. Rollback
Single commit. `git revert HEAD` removes the new endpoint, the test file, and the package.json devDeps additions. Existing routes are untouched, so no risk to the running app's main flow.
