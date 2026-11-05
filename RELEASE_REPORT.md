# Public snapshot readiness

Status: APPROVED by the repository owner on 2026-11-05 for the local release snapshot, with the presentation excluded and JPGs retained intact. No external publication is included.

## Scope and changes

Assembled from the original tracked-file allowlist, without copying Git history or ignored local files. `RELEASE_MANIFEST.txt` lists retained source paths; `RELEASE_SHA256SUMS.txt` inventories final release files. The original tracked repository is unchanged. No push or external publication was performed.

Excluded: `project-api/btr_dev.db`, the entire `project-api/uploads/` tree (three tracked documents), the presentation (`docs/Beat The Risk_Final.pptx`), local editor settings (`.vscode/`), credentials, environment overrides, dependency installations, logs, caches, and other untracked/ignored runtime artifacts. Generated synthetic PDF/XLSX fixtures remain. Runtime dependencies and inspection outputs are outside this directory.

Restored the exact historical MIT license and contributor copyright (2026 César Soto Valero); preserved bundled license comments and copied UI dependency license/notice files. Approved company branding, fonts, and retained media retain their respective rights. README now acknowledges the team hackathon and primary implementation role, explains synthetic cases/policies, links the retained demo, and removes unsupported compliance guarantees. Replaced the seeded demo account's company email with an example.com address. APIs, UI, workflow and startup behavior are otherwise unchanged. Strengthened Git exclusions and all three Docker build contexts.

## Verification

- Backend: 114 tests passed in 12.21 seconds outside the sandbox. The sandbox run hung on async SQLite setup and was time-limited.
- Ruff: lint passed; format check passed (72 files).
- UI: locked npm install and production bundle build passed. Original reviewed bundles/fonts restored after build verification to preserve shipped assets.
- npm installation reported 10 dependency vulnerabilities (1 low, 3 moderate, 5 high, 1 critical). Dependency remediation is outside this confidentiality snapshot scope.
- Complete release-directory pattern scan: 272 deliverable files scanned (temporary Ruff cache excluded from the final directory), zero matches using the credential/infrastructure patterns above. Eight representative runtime/credential paths verified ignored by Git. Original tracked worktree verified unchanged; release has no remotes.
- Original reachable history: 346 distinct blobs scanned for private keys, Google/AWS/GitHub credentials, JWTs, literal credential assignments and private infrastructure patterns; no matches. This is a bounded pattern scan, not proof that no credential ever existed. No specific rotation candidate identified.
- Source/configuration/seed/fixture review found illustrative companies and outcomes, demo credentials/default development signing key, public dependency URLs, and local/container service addresses. Demo defaults remain documented, not treated as exposed live credentials.
- PDF text and metadata, XLSX/PPTX XML, relationships, notes, metadata, embedded images, JPG/PNG images, and MP4 metadata inspected. Presentation has four slides, no embedded OLE objects and no external relationships. Synthetic fixtures intentionally include fictional confidential markings. Presentation team identities and aggregate business estimates are within approved media scope.
- Manually inspected photographs, team graphic, presentation image assets and 13 sampled video frames (10-second spacing). Sampled video shows demo cases and local application workflow. Full frame coverage and audio review are NOT complete; this prevents an unqualified media clearance.

## Owner decisions and review limitations

1. The owner explicitly approved keeping all three JPGs intact after disclosure of their GPS metadata, identifying them as whiteboard screenshots of what was built. Their bytes, including metadata, match the originals. Coordinates are not reproduced here.
2. The presentation is excluded at the owner's request. Its sensitivity-label metadata is therefore absent from the snapshot and new Git history.
3. The owner approved the release after receiving the report describing the incomplete video/audio review. The video is retained under that approval. Only sampled frames and container metadata were inspected; no complete visual/audio clearance is claimed.

A fresh initial commit contains only files listed in the final checksum inventory, plus the inventory itself. No inherited history or remote configuration is included. The owner's approval resolves the release hold; it does not expand the scope of the media review or remediate the reported dependency vulnerabilities.
