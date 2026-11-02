# ENGINEX command centre

`portal.html` is the GitHub Pages landing dashboard. The main index redirects here. It follows the supplied dark reference with navy navigation, project register, real workspace metrics, activity, tasks, notifications, rule-based assistant and automation settings. It supports a light theme and responsive navigation.

## Data and honesty

- BOQ and quotation totals are computed from the current main workspace's saved data, including entered VAT. Counts come from actual registered projects, tasks and commissioning records.
- Project register progress/schedule are manually maintained. Register entries do not switch, replace or isolate the main technical workspace. The connected workspace name is edited in its own settings.
- Trend bars accumulate actual daily snapshots. No sample projects, money values, trends or fabricated activity are inserted.
- Dashboard metadata lives in IndexedDB `enginex-command-centre`, per authenticated user when configured, or `guest`. The original main workspace and engineering workbench use their existing stores and backups. Dashboard exports do not include those separate technical datasets.
- Project data comes from the browser cache; open the main workspace to fetch the latest account cloud backup on another device. The dashboard's projects/tasks are browser-local even when account authentication is configured.
- The assistant is deterministic local intent routing, not a connected generative AI. It can find tools, report totals/open RFIs, run checks, and create review tasks. It does not generate unconstrained engineering calculations or claim automatic compliance.

## Automation

Optional checks run on opening/refresh and every 60 seconds while this page is open. Rules cover entered fault/emergency/containment/selectivity limits, SLD hierarchy errors, continuous cable cuts versus drum capacity, overdue maintenance/tasks, pending material reviews, missing design references and intentional/manual quotation differences. Users can disable rule groups.

Create tasks from findings deduplicates currently open tasks. Copy BOQ into quotation requires explicit confirmation, preserves commercial terms, and overwrites quotation items only. An active configured account uses the Supabase API for that update and revalidates active access. This is not an unattended scheduler. No external messages, emails or browser-notification permissions are used. Background jobs while the page is closed require a separately deployed backend.

## Main-workspace routes

`app/workspace.html?tool=schedule|auto-sizing|boq|quotation|ict|toolkit|qc|transformer|codes` opens the corresponding existing module after its navigation mounts. All existing quotation print code and calculation functions are retained.

## Verification

`tests/portal.test.js` checks real-data metrics, zero-VAT quotations, rule disablement, overdue records, failed engineering checks, quotation/BOQ differences, task deduplication and dashboard-backup validation.
