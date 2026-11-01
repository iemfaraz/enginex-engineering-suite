# ENGINEX Engineering Suite v8.5

Professional electrical engineering tools, project controls and site documentation by Engineer Faraz Nawaz, with a Node.js backend and SQLite account database.

## Run
Install Node.js 24+, run `npm start`, then open `http://localhost:3000`. Select **Create an account** to register. No package installation or frontend build step is required.

The server must run for authentication, protected modules and database-backed account backups. GitHub Pages/static-only hosting does not run this backend. See [DEPLOYMENT.md](DEPLOYMENT.md) for HTTPS, persistent storage and first administrator configuration.

## Included
- Email/password registration and login
- scrypt password hashing, HttpOnly sessions, CSRF checks and rate limits
- Password changes with session revocation
- Administrator user-role and access management
- Separate account storage and database-backed workspace backups
- Professional responsive dashboard and searchable engineering tools
- Existing calculation engines, export tools and report layouts

## Verify
Run `npm test`. Integration tests use temporary databases.

No production credentials or default administrator password are included. Configure administrator secrets through your hosting environment. Email verification and email password recovery require an email provider and are not enabled. Project backups use last-write-wins; keep important exports and avoid simultaneous edits on multiple devices.

## Printing
Open a document, BOQ, quotation or load schedule and select **Print / Export**. The report preview uses A4 portrait for documents/BOQs/quotations and A4 landscape for load schedules. Choose the paper orientation and **Fit one page**, then **Print / Save PDF**. Short reports fit automatically; longer reports remain multi-page at readable size. Repeated table headings, wrapped descriptions and preserved current field values prevent the workspace layout from clipping content. Choose A4 and disable the browser’s own headers/footers in the system print dialog for the cleanest result.

## GitHub Pages browser edition
The public GitHub Pages website opens the engineering workspace directly. Projects stay in that browser on that device; export JSON backups and import them to move work. This edition has no server-backed accounts, cloud database or cross-device synchronization. Its local guest profile is for interface display only and is not a security boundary. The Node backend remains available in this repository for a separate backend-capable host. Quotation printing preserves the original document layout.
