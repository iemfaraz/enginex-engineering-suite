# ENGINEX: GitHub Pages + your own backend

The website stays on GitHub Pages. The new Team workspace connects to an HTTPS backend you operate. Account registration, administrator access, project membership, snapshot version checks and document-review audit records are enforced by that server, not local browser roles.

## Server requirements

- Node.js 24 with built-in SQLite, or Docker using the supplied Dockerfile/compose.yaml.
- Persistent storage for `/data/enginex.sqlite` and its WAL files.
- HTTPS reverse proxy terminating TLS in front of port 3000. Never expose production credentials over HTTP.
- Configure an exact allowed frontend origin. For this site it is `https://iemfaraz.github.io` (no repository path or trailing slash).

## Configuration

Copy `.env.example` to a private `.env` file on your server. Set `APP_ORIGIN=https://iemfaraz.github.io`, a unique `ADMIN_EMAIL` and strong `ADMIN_PASSWORD`. Set `CROSS_SITE_COOKIES=true`. Docker Compose reads `.env` for interpolation; the plain Node process requires exported environment variables. Do not commit the real `.env` file.

Run `docker compose up -d --build` on your server. Proxy an HTTPS hostname to port 3000. Configure regular external database backups, restore drills and OS updates. Use SQLite's backup API or stop the service for a consistent file backup; do not copy only the main file while WAL writes are in flight.

The first configured administrator is created only if that email does not already exist. Changing the environment password does not reset an existing account. Registration creates Engineers; clients cannot choose Administrator. There is no email-based verification or password-recovery email service in this release.

## GitHub Pages connection

1. Open Team workspace in the dashboard.
2. Enter your backend HTTPS origin (e.g. `https://api.example.com`), confirm you trust that destination, and connect.
3. Register or sign in. Passwords are sent only to that entered server. HttpOnly sessions are used; a short-lived bearer session is also returned for the cross-site client and kept in JavaScript memory only, so browsers blocking third-party cookies can still work during that session. Reloading may require sign-in again. Tokens/passwords are never saved to localStorage.
4. Create a shared project. Other members must register on the same server first. The owner assigns Editor, Reviewer or Viewer access.
5. Download a full project backup from the dashboard, then explicitly upload it into the chosen shared project. Uploads are version checked. Download server snapshots and restore through Reports & backups; there is no automatic live merge or background upload.
6. Owners/Reviewers can record decisions against captured delivery documents. Each event includes the server version and document-snapshot digest. A decision is not a professional signature or statutory approval. Changed snapshots need new review.

## Roles

- Owner: uploads, membership, reviews, reads and audit history.
- Editor: uploads, reads and audit history.
- Reviewer: reviews, reads and audit history.
- Viewer: reads and audit history.

Removing a member or deactivating an account removes server access immediately. Local/downloaded copies already held by that person cannot be remotely erased.

## Validation and publishing

Run `npm test` and `node scripts/check-syntax.mjs`. The GitHub quality workflow runs these checks for pushes and pull requests. Existing GitHub Pages publication is not automatically gated by this separate workflow; configure repository branch protection and a deployment dependency if you require enforced release gates.

The backend is prepared and tested locally, but it is not deployed until you install it on your own server and provide its HTTPS address.
