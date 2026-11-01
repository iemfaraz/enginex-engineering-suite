# ENGINEX Engineering Suite — Offline Edition v5.1 Professional

This is the complete offline ENGİNEX Engineering Suite, created by Engineer Faraz Nawaz.

## Open the application
1. Extract this ZIP file to a permanent folder on your computer.
2. Keep the `app` and `assets` folders beside `index.html`.
3. Open **index.html** with Chrome, Edge, Firefox, or another modern browser.
4. Watch the professional introduction video or select **Open ENGİNEX engineering workspace**.

## Offline operation
- No internet connection, server, installation, user account, password, or Node.js is required after extraction.
- The application works directly from the extracted folder.
- Browser-local saved values (where supported by the engineering tools) are stored only on that device and browser.
- The offline package does not connect to the platform sign-in service; use the web app when Gateway-protected access is required.

## Included modules
- Load Schedule and Automatic Board Sizing
- Saudi Utility Single-Line Diagram Generator (SVG download + print/export to PDF)
- Bill of Quantities with editable section names
- Quotation and ICT Calculations
- Engineering Toolkit and QC Documents
- Transformer Suite
- Professional narrated ENGİNEX platform introduction video

## Engineering note
Automatic Board Sizing is a design-screening/planning aid based on editable assumptions. Final cable, protection, fault-duty, selectivity, installation method, and authority compliance must be reviewed by a qualified engineer for the actual project.

See `RELEASE-MANIFEST.json` for the release version and integrity checksums.


## Stable professional build
This package preserves the original engineering workspace and calculation functions. The login/cover artwork has been refreshed with ENGINEX-branded engineering PPE.

## v3.1 Home Portal & Authentication Update

- The extracted package now opens directly to the ENGINEX Home Portal / sign-in screen.
- The supplied ENGINEX cover artwork is used for the first-page visual.
- Sign In opens the engineering workspace and creates a browser-local session when “Remember me” is enabled.
- Log Out clears the browser-local session and returns to the Home Portal.
- Home Portal / Home controls in the workspace return to the sign-in portal.
- Settings remains focused on Company & Letterhead, Project Metadata, and Backup & Restore; User/Security settings are not exposed as Settings tabs.
- “Open engineering workspace”, platform introduction, offline information download, and protected-access actions are available from the portal.

> This offline build provides browser-local demo authentication. It is not a server-backed identity system and should not be treated as production security until connected to a real authentication service.

## User Access & Login

The Settings window now includes **Users & Access**. An administrator can create a user with a username, role, and password; the new account can immediately be used on the ENGINEX login portal.

Default offline accounts:
- `admin` / `admin123` — Administrator
- `tariq.elec` / `tariq123` — Engineer
- `khalid.ict` / `khalid123` — Engineer

After signing in, use **Home Portal** or **Sign Out** in the workspace header to return to the ENGINEX login page. The Home/Sign Out action also clears the active session.

> Offline limitation: account credentials are stored in the browser's localStorage so this package works without a server. For production deployment, replace this with server-side authentication, hashed passwords, sessions/tokens, and access-control rules.


## Smart Project Schedule & Controls Hub
- Added `app/enginex-smart-project-schedule.html` as an integrated workspace module.
- The workspace now shows **Smart Schedule** directly next to **Project Schedule**.
- The module opens inside the ENGINEX workspace without leaving the main application.
- Includes editable activities, dates, disciplines, weights, completion percentages, automatic scheduling, auto-updating Gantt, S-Curve, monthly progress, EVM, risk register, project settings, local saving, JSON/CSV export, and printing.
