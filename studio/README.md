# ENGINEX Electrical Layout Studio

Open `portal.html#tool=electrical-studio.html` to keep the tool inside the dashboard.

1. Select source drawing units, import a DWG or ASCII DXF, and verify against a known dimension. The existing local drawing worker decodes supported 2D model-space geometry. Maximum file size is 150 MB; browser/native decoder limits still apply.
2. Detect closed axis-aligned rectangular candidates or enter spaces manually in metres. Review candidates: furniture and boundaries may also be rectangles. Irregular spaces need separate design zones; doors, furniture and wet-area restrictions are not recognized automatically.
3. Enter lighting output, loads, utilization/maintenance factors, target lux and socket assumptions. Confirm the spaces and generate the draft. Lighting counts use the lumen method; socket positions use perimeter spacing. Neither is a photometric or code compliance simulation.
4. Select, move, add or remove symbols. Edit coordinates and loads. Assign different circuit groups to points to split a space's load. Edit circuit labels, phase allocation and entered breaker ratings in the schedule. Connected W, VA and currents feed the SLD. No diversity is applied.
5. Review final/main overload notices, equipment requirements, circuit grouping, protection, earthing, voltage drop, cable routing and photometric design. Dashed links are circuit association only; switches are indicative, not a wiring diagram. Ratings start as draft defaults; they are not calculated equipment selections.
6. Confirm drawing review and export the current view as editable ASCII DXF (metres), CSV schedule or A3 landscape print/PDF. DXF includes limited reference geometry, symbolic points, space outlines and annotations. It does not preserve the original DWG in full or export native DWG. SLD is an indicative DB/final-circuit topology, not a completed construction diagram.

Drafts save per active project in `enginex_studio_v1`. Full dashboard backups/recovery include this key. Studio JSON can also be downloaded/restored independently. Uploaded CAD originals are not stored. Download backups regularly.

The demo floor is illustrative and has no standards approval. All exported drawings are marked DRAFT / NOT FOR CONSTRUCTION.

Tests: `node --test tests/electrical-studio.test.js tests/project-vault.test.js`; full suite: `npm test`.

DWG/DXF decoder notices and corresponding upstream sources: `../takeoff/NOTICE.md`.
