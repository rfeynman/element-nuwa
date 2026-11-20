# Curated reaction library

Run from the repository root. The build requires Python 3.8+ and SymPy for exact rational balancing. Runtime gameplay does not need Python, SymPy, network access, or an AI service.

```sh
python3 -m venv /tmp/element-atlas-reaction-env
/tmp/element-atlas-reaction-env/bin/python -m pip install -r data/reactions/requirements.txt
/tmp/element-atlas-reaction-env/bin/python data/reactions/build.py
/tmp/element-atlas-reaction-env/bin/python data/reactions/archive_expansion.py
npm run test:reactions
```

The builder was verified with SymPy 1.13.3. An unconfigured system `python3` may not have SymPy. No global package installation is required.

`build.py` preserves the original 14 scenarios, applies `expansion.tsv` through `expand.py`, and merges `supplement-elements.json`. The two ambiguous phosphate endpoints and four underconstrained/obscure supplement records are deliberately excluded from publication. The TSV is a curated source transcription, not a combinatorial generator. SymPy determines positive integer coefficients for the already-specified products; it does not predict products. The builder checks all atoms and net charge before writing `public/data/reactions.json`.

`expansion-locators.json` gives per-record source locations. `raw/expansion-manifest.json` inventories 21 used evidence files from 13 additional source URLs with checksums. `.web.txt` files are browser-rendered source evidence rather than original HTML; the distinction is explicit. Legacy evidence and failed downloads remain honestly recorded in `raw/manifest.json`. The supplemental review records its source locations and evidence copies separately. Extra exploratory source files not cited in the published dataset are not counted as used evidence.

The bundled library contains factual equations and independently written teaching text. Current OpenStax source pages identify CC BY-NC-SA 4.0 terms; archived publisher pages are local provenance, not website assets. Refer to the sources for their full terms. The scientific audit is in `docs/reaction-review/expansion-audit.md`; external teacher review remains pending.

The fixed build/retrieval labels identify this reviewed snapshot and must be updated only with a genuinely reviewed refresh; rerunning the builder is not a new source retrieval. Qualitative selectors do not model exact concentration, pressure, amount, reaction time, or temperature. Conditions in each record define the textbook scenario.
