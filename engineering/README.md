# ENGINEX electrical engineering workbench

Open `engineering.html` from the main workspace sidebar or overview. This release adds 13 functional modules:

1. Cable schedule and drum allocation, with unbroken cable-cut planning.
2. Radial single-line diagram builder and SVG export, including main load schedule import.
3. Testing and commissioning register with user-entered acceptance limits.
4. Lighting lumen-method worksheet with fixture counts and LPD.
5. Material submittal comparison, deviations and reviewer decisions.
6. Quotation and variation register, revision totals and per-line allocated payments; capture current quotation.
7. Equal-OD cable geometric area-fill and containment quantity worksheet.
8. Generator running/motor-start screening and entered ATS current comparison.
9. Fundamental lagging power-factor correction.
10. Asset/maintenance register and due dates.
11. Single-source, transformer, radial-feeder symmetrical three-phase fault estimate and breaker-duty comparison.
12. Exact-pair manufacturer-table selectivity review.
13. Imported/measured emergency lighting result and duration review.

All modules support manual records, editing, duplication, deletion with immediate undo, CSV template/import/export, project/reviewer metadata, browser-print reports, and JSON backup/restore. Attach PDF, image, CSV or XLSX supporting documents up to 2 MB per record; attachments are included in JSON backups. CSV is UTF-8 with English field keys from the tool's template. Import appends records. CSV exports do not include file bytes; use JSON for complete backup. Maximum 2,000 records per module; JSON restore limit 30 MB.

## Storage and accounts

Records and documents are saved in IndexedDB in the current browser. They are not committed to GitHub, not uploaded to a server, and not part of the old main workspace JSON backup. Use **Export all data** in the engineering workbench for its complete backup. Clearing site data deletes local records. When Supabase is configured, this workbench checks an active profile and namespaces local storage by user; cloud synchronization of the workbench is not implemented. Existing main workspace cloud saving is unchanged. No reminders are sent while the site is closed.

## Engineering scope

Each tool states its equations, inputs and limitations in the page and report. Defaults are editable examples, not mandated Saudi compliance criteria. Calculations are screening/worksheet functions, not certification or complete network studies. Review voltage, frequency, installation conditions, manufacturer data, code edition, and approval requirements. There is no arc-flash solver, harmonic study, full time-current coordination engine, photometric simulation or automatic code compliance engine in this release. The SLD is a radial concept diagram; it does not calculate power flow or check protection. Geometric containment fill is not ampacity or thermal derating.

Reference links in relevant modules point to DIALux, Schneider Electric and the Electrical Installation Guide. Before issue, a competent engineer must review source data, assumptions and outputs and record the reference/reviewer fields.

## Validation

`node --test tests/engineering.test.js` covers known numerical examples, invalid inputs, drum grouping/continuity, topology cycles/missing parents, manufacturer-table checks, CSV escaping, revision arithmetic and module registration. Browser checks cover navigation, record saving, diagram rendering and reload persistence. Live backend identity and cloud synchronization are outside this browser edition.
