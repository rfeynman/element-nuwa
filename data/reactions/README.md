# Curated reaction library

Run from the repository root. The build requires Python 3.8+ and SymPy for exact rational balancing. Runtime gameplay does not need Python, SymPy, network access, or an AI service.

```sh
python3 -m venv /tmp/element-atlas-reaction-env
/tmp/element-atlas-reaction-env/bin/python -m pip install -r data/reactions/requirements.txt
/tmp/element-atlas-reaction-env/bin/python data/reactions/build.py
/tmp/element-atlas-reaction-env/bin/python data/reactions/merge_binary.py
npm run test:reactions
```

The builder was verified with SymPy 1.13.3. An unconfigured system `python3` may not have SymPy. No global package installation is required.

`build.py` preserves the original 14 scenarios, applies `expansion.tsv` through `expand.py`, and merges `supplement-elements.json`. The two ambiguous phosphate endpoints and four underconstrained/obscure supplement records are deliberately excluded from publication. The TSV is a curated source transcription, not a combinatorial generator. SymPy determines positive integer coefficients for the already-specified products; it does not predict products. The builder checks all atoms and net charge before writing `public/data/reactions.json`.

`expansion-locators.json` gives per-record source locations. `raw/expansion-manifest.json` inventories 21 used evidence files from 13 additional source URLs with checksums. `.web.txt` files are browser-rendered source evidence rather than original HTML; the distinction is explicit. Legacy evidence and failed downloads remain honestly recorded in `raw/manifest.json`. The supplemental review records its source locations and evidence copies separately. Extra exploratory source files not cited in the published dataset are not counted as used evidence.

The bundled library contains factual equations and independently written teaching text. Current OpenStax source pages identify CC BY-NC-SA 4.0 terms; archived publisher pages are local provenance, not website assets. Refer to the sources for their full terms. The scientific audit is in `references/expansion-audit.md`; external teacher review remains pending.

The fixed build/retrieval labels identify this reviewed snapshot and must be updated only with a genuinely reviewed refresh; rerunning the builder is not a new source retrieval. Qualitative selectors do not model exact concentration, pressure, amount, reaction time, or temperature. Conditions in each record define the textbook scenario.

## Binary elemental expansion

After building the 111-entry base, `merge_binary.py` integrates four reviewed libraries: the prior `binary-elements-extra.json`, plus `aluminium-binary-additions.json`, `common-binary-additions.json`, and `metal-binary-additions.json`. The runtime snapshot contains **433 entries: 240 modeled and 193 equation-only**, with 532 substances and 128 source URLs. It includes 333 binary entries across 311 pairs.

The merger namespaces candidate references, deduplicates by substance composition/charge/phase and equation plus distinct conditions/execution, applies `binary-condition-corrections.json`, validates atom/charge balance and IDs, repairs canonical elemental mappings, and writes `binary-merged-validation.json`. Its target version is `2026.11.20-source-checked.5`. It refuses to merge into an already-expanded snapshot; rebuild the base first. No runtime network request or product inference occurs.

`build_aluminium_additions.py` reproduces the manually reviewed Al/group-13 gap records from explicit source facts. The common/metal evidence helpers and source downloads remain under `raw/` in the working project. The committed JSON bundles are the reviewed curation inputs; refreshing raw sources is a separate review operation. Do not treat the raw candidate or rerunning a helper as approval to publish.

The old SeI4(s)/SeF4(s) conflicts remain excluded, and disputed OsF7/PF3/TcF7 endpoints were withheld during the new audits. Thirty-three older condition records were reviewed and corrected. Full experimental conditions or controls are unavailable for 193 equations; these remain visible but non-playable. Source-specific pure-oxygen peroxide cases remain distinct from generic O2-reactant examples. The 13-entry Al/group-13 library distinguishes ambient surface passivation from bulk combustion and logs phase corrections.

Audits: `aluminium-binary-audit.md`, `common-binary-audit.md`, `metal-binary-audit.md`, and `references/binary-coverage-review.md`. All 6,903 pairs can be looked up, but coverage is not exhaustive and teacher review remains pending.

## Reviewed combustion effects

The merger applies the curated [metal–oxygen effect review](metal-oxygen-effects-review.json). Its 33 overrides preserve products, phases, activation/atmosphere requirements and execution states. Private source archives are not distributed; the scientific effect review is documented in [the audit](../../references/metal-oxygen-effects-audit.md).
