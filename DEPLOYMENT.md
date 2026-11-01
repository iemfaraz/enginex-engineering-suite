# ENGINEX backend deployment

## Requirements
- Node.js 24 or newer; no npm dependencies are needed.
- One running application instance with a persistent writable disk.
- HTTPS for production. GitHub Pages cannot run this backend.

## Local use
1. Install Node.js 24 LTS.
2. Open a terminal in the repository folder.
3. Run `npm start`.
4. Visit `http://localhost:3000` and select **Create an account**.

SQLite creates `data/enginex.sqlite` automatically. Restarting the server preserves accounts and backups. Do not commit or publicly expose the data directory.

## Administrator setup
Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the hosting platform environment before the first start. The password must be unique and at least 12 characters. The server creates that administrator only if the email is not already registered. Never use the example values. Changing the environment password later does not overwrite the existing password; use **My account → Change password**.

If the email already has a regular account, a trusted server operator can promote it using SQLite:

```sql
UPDATE users SET role = 'Administrator' WHERE email = 'your-registered-email@example.com';
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = 'your-registered-email@example.com');
```

Public signups always receive the Engineer role. Administrators manage roles and active status in **My account**. You cannot disable or demote your own account through the API.

## Production hosting
Deploy the repository as a Node web service or use the supplied Dockerfile. Set:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `APP_ORIGIN` | Exact external HTTPS origin, e.g. `https://enginex.example.com`, no trailing slash |
| `DATABASE_PATH` | Persistent disk path, e.g. `/data/enginex.sqlite` |
| `ADMIN_EMAIL` | Your administrator email, for initial setup |
| `ADMIN_PASSWORD` | A unique password of at least 12 characters |
| `PORT` | Set automatically by most hosts; otherwise `3000` |

Start command: `npm start`. Health check: `/api/health`. Mount a persistent disk at `/data`; an ephemeral filesystem will lose accounts after redeployment. Run one replica because this implementation uses SQLite. For multiple replicas, migrate to a shared database such as PostgreSQL first.

Docker Compose expects HTTPS to terminate at a reverse proxy and uses the named `enginex-data` volume. Configure `APP_ORIGIN`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` through the host's secret/environment settings. Do not expose the plain HTTP container directly for production.

## Account security
- scrypt with random salts; plaintext passwords are never stored in the database.
- Random server-side sessions, stored as SHA-256 digests; HttpOnly, SameSite=Strict cookies and Secure cookies in production.
- 8-hour sessions, or 7 days when Remember me is selected.
- Origin checks and per-session CSRF tokens for authenticated mutations.
- Rate limits for login, registration and password changes.
- Password changes and administrative access changes revoke existing sessions.
- Protected HTML/modules and a static-file allow-list prevent database/server file downloads.
- Authentication failure never falls back to demo credentials.

Email verification and email-based password recovery are not configured. Add an email provider before enabling those flows. An operator must handle lost-account recovery with a verified identity; do not disclose passwords or edit password hashes manually.

## Project data
The engineering engines still operate on local browser data for responsiveness. Storage is namespaced by server account, and aggregate workspace backups are saved in SQLite after changes. Opening the suite on another browser restores the latest saved backup. Cloud status is shown on Overview. Treat one active editing window/device as authoritative; concurrent editing is last-write-wins, not real-time collaboration. Keep exports for important project milestones. Browser-local data remains cached after sign-out, so use separate OS/browser profiles on shared computers.

Existing offline data is not automatically assigned to a new user. Export old projects before migrating and import the relevant project while signed into the intended account. Old browser-local users and demo passwords do not create backend accounts.

## Backups and maintenance
Back up SQLite using its online backup API or SQLite CLI `.backup`; copying only the main file while WAL is active can miss recent transactions. Encrypt backups and restrict database/disk access to the application operator. Keep Node updated and serve through an HTTPS proxy. Rate limits currently group proxy traffic by socket address rather than trusting spoofable forwarded IP headers; large deployments should use a trusted edge limiter.

## Verification
Run `npm test` for the registration, auth, authorization, CSRF, backup-isolation and session-revocation integration tests. Tests use a temporary database and do not alter production accounts.
