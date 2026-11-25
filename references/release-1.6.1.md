# Element Nuwa 1.6.1 — public visitor analytics

Authorized for publication by the user on 24 November 2026.

- Browser title: Element Nuwa — the best periodic table of elements.
- Public Visitor analytics / Site visits counter added to the page footer.
- Connected the user-provided GoatCounter site https://rfeynman.goatcounter.com using its official https://gc.zgo.at/count.js script.
- The public TOTAL JSON endpoint returns HTTP 200 and permits cross-origin browser reads. No password or API key is included in public assets.
- Tracking installs once per page load. Local previews do not record visits. Element hovering, panel changes and reactions do not trigger additional tracking events.
- Displayed numbers come from the shared provider, not localStorage or a preset value. Provider outages show unavailable statistics. Counts can be delayed by the provider's public-counter cache and do not represent registered users.

Validation: 535 project tests pass; TypeScript and Vite production build pass; clean release-package tests, public release/configuration and asset checksum checks are recorded after deployment. The three scientific datasets are unchanged. Raw downloads, staging records, credentials and private source archives remain excluded. Google Search Console verification HTML is preserved byte for byte.

GitHub Pages destination: https://rfeynman.github.io/element-nuwa/
Repository: https://github.com/rfeynman/element-nuwa
Publishing source: main:/docs
Rollback: revert this release to restore the previous deployed version, commit 9301b19b9e7157fc9bd8f4c3852cbe3ff71ab853. Public history must not be reset.

The user reviewed the local footer and supplied its GoatCounter site. Browser automation availability is reported in the deployment manifest; no browser-rendered validation is claimed if the browser host is unavailable. External scientific/teacher review remains pending.
