# ENGINEX updates 2–8

Update 1 (independent engineering calculation verification) is excluded. No engineering formulas are changed by this release.

- **Accounts/shared storage:** Team workspace UI, administrator user access, server-side Owner/Editor/Reviewer/Viewer roles, explicit versioned full-project snapshot uploads/downloads. See OWN-SERVER.md. Backend deployment and your HTTPS server address are still required. This is snapshot sharing, not simultaneous live editing.
- **Drawing review:** Locate objects, clear highlighting and filters for unmapped/included/nested groups. Highlighting uses the available bounded preview; it cannot display every entity in very large files. Scope exclusions remain reviewed base-quantity corrections with reasons; individual exploded-symbol selection is not implemented.
- **Approvals/revisions:** Previous-revision snapshot comparisons in the delivery centre; server review events bind each decision to a version and document-snapshot digest. Local Draft/Issued status remains a local workflow record, not a secure approval. Server reviewers cannot edit project data or permissions.
- **Arabic/accessibility:** Persistent English/Arabic switch, RTL dashboard, translated navigation/common controls and engineering field labels. User-entered content and printed document data are not automatically translated. Some legacy explanatory text and dynamically generated messages remain English. Focus outlines, skip navigation, larger mobile inputs and touch controls are included. A complete accessibility audit and every-screen translation are not claimed.
- **Excel:** Validated circuit and BOQ CSV/XLSX imports, templates and native XLSX exports. XLSX support uses the existing SheetJS CDN loader; CSV remains available if offline. Imports preview the target and require confirmation before replacement.
- **Quality/diagnostics:** CI workflow runs syntax and test checks on pushes/PRs. It does not gate the existing Pages deployment automatically. Diagnostic exports include error types/page paths, not project content or credentials, and nothing is sent automatically.

Own-server preparation is tested locally, not deployed to a server without an address or access. Secure multi-user features remain unavailable on GitHub Pages until that backend is running.
