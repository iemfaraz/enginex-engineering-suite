# Project Delivery Centre

Open `portal.html#tool=professional.html`.

- Shared project/company records update the existing local project, company and quotation metadata. Voltage, PF and demand inputs are visible. Manual commercial terms/items are retained.
- Load schedule → BOQ and BOQ → quotation use selectable change reviews. Existing rates are retained. Removals and manual/drawing conflicts start unchecked. Synchronization checks for changes while the review is open. New schedule proposals start unpriced, omit invented feeder/earthing/testing quantities, and do not add an automatic cable allowance. Cable and breaker calculations remain the existing schedule engine and need engineering verification.
- The drawing tool supports reviewed base-quantity corrections with required reasons and retains measured/adjusted values in CSV. A bounded top-level insertion audit flags repeated same-name positions without removing quantities. This is not complete CAD duplicate detection or exploded-symbol recognition.
- Numbered BOQ, quotation and load calculation snapshots have a local Draft/Issued register and revision history. Issued snapshots cannot be refreshed; new revisions start as drafts. Draft snapshots can refresh from current data. Issuing requires priced, valid commercial rows. Local status is not a secure approval signature or backend audit log.
- Optional English/Arabic delivery-centre documents include editable Arabic descriptions, titles, company/project names and Arabic headings. Original quotation printing remains available in its original layout. This is not automatic translation of every tool.
- Load reports list saved kW, route lengths, phase, current, inputs and a single-phase formula. This is not a new cable/protection design or a standards certification.
- Full dashboard backups include `enginex_professional_v1`. The centre shows localStorage use and export reminders. Backup requests use the existing full-project export and restoration workflow. Browser storage and local recovery can be cleared; download external copies.
- New workspaces no longer start with sample circuits, BOQ quantities or company identities. Existing saved records remain untouched.

Suggested further production work: independent electrical calculation validation, full bilingual UI, persistent multi-user backend authentication/roles, server-side audit history, document approval permissions, external backups and accessibility/performance regression checks. GitHub Pages alone cannot supply secure shared authentication or multi-user data persistence.
