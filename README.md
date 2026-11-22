# Element Nuwa

Latest release: **1.6.0** — spectra explorer and main-column layout update.

Website: https://rfeynman.github.io/element-nuwa/

Repository: https://github.com/rfeynman/element-nuwa

An educational periodic table and virtual chemistry lab for high school.

- 118 elements, 3,383 ground-state isotope records, and 118 sourced electron configurations.
- Hover/focus preview, pinned selection, local scientific data, isotope half-lives, balanced nuclear decay equations, and interactive colored s/p/d/f orbital clouds.
- Tabletop drag-and-drop reaction beaker, compound shelf, 435 sourced reactions and physical processes (242 modeled scenarios, 193 equation-only records), products, balanced equations, heat/fire/gas/solid/toxicity/blast indicators, and optional water condensation.
- Ten practice questions with hints, explanations, source links, and progress stored in this browser.
- Responsive layout, keyboard controls, and reduced-motion support.

## Develop

Requires Node.js 22 and npm.

```sh
npm ci
npm test
npm run build
npm run dev
```

The `docs/` directory contains the checked static build served by GitHub Pages. To update it after code changes, run the build, replace docs with dist contents, retain docs/.nojekyll, and push main.

## Scientific data

See [source attribution](references/source-attribution.md) and [reaction evidence](references/reaction-source-audit.md). Source links, dataset versions, and dates remain in the packaged records and detailed source disclosures; selected interface metadata is hidden for a simpler classroom view. Data is packaged locally; hovering or reacting does not call third-party scientific services. Raw downloaded pages and staging records are excluded from this repository.

Abridged standard atomic weights © CIAAW 2024, [Abridged Standard Atomic Weights 2024](https://ciaaw.org/abridged-atomic-weights.htm). Other sources include PubChem/NCBI, IAEA LiveChart/ENSDF, and NIST. Provider acknowledgement does not imply endorsement.

## Educational limits

Reaction examples are condition-specific and model ingredient presence, not quantities. Unsupported combinations stay unmodeled rather than receiving invented results. Metastable nuclear states are excluded. Electron rings are a simplified model, not trajectories. Effects are symbolic. Teacher/scientist review remains pending; source checks and automated tests are documented separately. No student accounts or remote progress collection.

## Reaction library and visual update

The large introductory banner has been removed. The library contains 426 chemical reactions, six physical processes, and one reviewed no-reaction case, using 532 substances and 128 source URLs. Search by formula, material or product. Explicit activation choices are none, heat, light, ignition, electricity and cooling; atmosphere choices are air, oxygen and inert.

Each supported run plays a 3.2-second transparent conceptual animation around the vessel, then clears it before revealing products. Replay restarts the scene; Skip/Escape completes it; Reset and condition/ingredient edits cancel it. Reduced-motion presentation lasts 250ms. Brown NO2 and chlorine colors require source metadata; colorless gases remain schematic. Freezing is explicitly distinguished from ordinary cooling.

See references/expanded-reaction-audit.md and references/expanded-independent-review.md for scope and exclusions. Build the curated formulas using data/reactions/build.py followed by data/reactions/merge_binary.py with the pinned Python requirements. Raw source archives are retained locally and excluded from this repository.

## All distinct elemental pairs

Look up all 6,903 distinct pairs of the 118 elements. This snapshot provides 333 source-backed binary entries across 311 pairs. Unknown pairs report missing evidence; products are never inferred from element valences. Multiple endpoints require choosing a scenario. 193 catalogue entries remain equation-only because full conditions are missing or not represented by the classroom controls.

The 112 accepted additions are explicitly transcribed WebElements equations. Two selenium product/phase conflicts are excluded, including their unused product substances. See references/binary-independent-review.md and data/reactions/binary-merged-validation.json. All decay equations use nuclear charge/nucleon bookkeeping, with source branch percentages retained; unspecified levels or daughters remain unavailable or schematic.

## 1.2.1 reaction interaction fix

Fe + explicit O2 + heat now offers both sourced iron oxide endpoints in ordinary air, without a duplicate oxygen-atmosphere requirement. Multiple supported outcomes appear as actionable choices beside the vessel. Loaded examples preselect their stated conditions; a missing condition can be applied and run directly from the result panel. See references/iron-oxygen-fix.md.

## All product outcomes (1.2.2)

The result panel now lists every source-checked scenario for the exact ingredients and substance forms, including alternatives requiring different conditions and equation-only records. All products within each equation include name, formula, and state. Alternatives remain visible after a selected animation completes. Individual cards show conditions, source links, and snapshot version/date; equation-only outcomes remain non-playable. This is complete for matching records in the local catalogue, not a claim to enumerate every chemical possibility.

270 application tests pass, including all alternatives after a selected Fe2O3 outcome, AsF3/AsF5 equation-only evidence, multi-product equations, exact-set matching, source review filtering, and ordering. Desktop and 390px phone browser checks passed with no horizontal document overflow.

## Electron clouds (1.3.0)

The Electron clouds tab replaces the repeated shell diagram with rotatable, colored probability clouds: s gold, p teal, d blue, f violet. The compact shell summary remains in Element Spotlight. Choose an occupied subshell from the sourced configuration and an individual orbital orientation; unoccupied types are labeled shape guides. Drag or use arrow keys, rotation and reset controls. Optional rotation respects reduced-motion settings.

The original local renderer samples hydrogen-like wavefunctions, including radial and angular nodes, and uses individual display scales. These are teaching models, not calculated many-electron densities or measured sizes; points are probability samples rather than individual electrons. Type color does not represent wavefunction sign or charge. Source links, model version/date, and configuration provenance appear in the panel. See references/electron-cloud-review.md.

276 application tests pass, including every sourced configuration total, known exceptions, numerical angular normalization, nodes, and sampled probability moments. Desktop and mobile browser checks cover the new cloud controls and layout.

## Detailed binary audit (1.4.0)

The reviewed snapshot .5 adds 210 entries and covers 311 distinct binary pairs with 333 binary scenarios; total library 433 entries, 240 modeled and 193 equation-only. This includes the missing Al/O2 equation and wider common nonmetal, hydride, sulfide, oxide and metal-halide coverage. Al/O2 has distinct room-condition protective-film and heated combustion examples; Heat or Ignition with explicit O2 works in ordinary air.

33 earlier condition records were corrected. Source-specific pure-oxygen peroxide cases retain their requirement. Different phase/allotrope examples appear beside the vessel with Load sourced forms & conditions, preserving exact substance matching. All source-used neutral elemental forms now have a unique table mapping where missing, including Si/Sn. Missing conditions do not produce guessed animations, and unsupported/disputed source products stay excluded.

492 application tests pass, including a standard-reaction checklist, Al/O2 ambient/combustion, explicit-phase suggestions, canonical mappings and disputed-product exclusions. Browser checks verify table-added Al/O2 with heat/air and explicit Ca/Br vapor-form loading. See references/binary-coverage-review.md and the three new source ledgers. External teacher review remains pending; neither the coverage audit nor the pair index claims exhaustive chemistry.

## Latest classroom interface — 1.5.0

The periodic table has an embedded drag-and-drop reaction can and a restored tile key. Only supported activation choices are shown; a single choice starts automatically. Reactions started in the extended lab animate beside its own vessel without jumping to the table. Finite flame/scorch, toxic mist/skull, cooling snow/ice, and heat overflow effects clear before products appear. Animation footer text is visually hidden. Effects are symbolic, not quantitative predictions. Source-observed flame colors are used where available.

The table is more compact, the original full-height left panel has no internal vertical scrollbar, and tile names and weights are slightly larger. Single orbital is the first/default electron-cloud view; Combine clouds offers independent occupied s/p/d/f overlays. The separate element-pair browser and selected explanatory/metadata blocks are removed.

500 automated tests and the production build pass. Browser visual verification was unavailable for this update. Scientific datasets are unchanged. Private raw-source archives and cleanup tools are excluded from the repository and deployed website.

## Naming update — 1.5.1

The website is now named Element Nuwa. Header, footer, loading screen, accessible page heading, and browser title use the new name. The existing repository/website URLs and browser progress-storage key are retained so shared links and saved learning progress continue to work. All 500 tests and the production build pass.

## Five-colored stone — 1.5.2

A five-colored faceted stone now replaces the concentric-circle brand mark in the header, loading screen, footer, and browser icon. Production build and SVG validation pass. No scientific data or reaction logic changed.

## Icon cache correction — 1.5.3

The header/loading/footer mark and browser favicon now share a Vite-managed SVG with a content-hashed filename. This avoids reusing the previously cached favicon.svg URL. Existing website and progress links remain unchanged. Production build and emitted SVG/reference validation pass; scientific data and reaction logic are unchanged.

## Combustion update — 1.5.4

Lithium/oxygen now displays sourced red combustion with heat. Fine iron in pure oxygen has separate heat/ignition cases with an incandescent spark shower and the documented oxide alternatives. A systematic review corrects 33 additional combustion-effect mappings; where a gas flame is not documented, burning metals use a solid glow. Reported white/bluish-white flames retain their observed colors. Generic oxidation and protective surface passivation remain distinct.

Solid products appear as deposits rather than ice. Cooling remains separately flagged. Reaction effects are brighter and more opaque; the burn-hole effect is removed. All 509 tests and the production build pass. Browser visual inspection is unavailable; live deployment files are verified directly. The snapshot contains 435 entries, 242 modeled and 193 equation-only, and 131 sources.

## Electron configuration guide — 1.5.5

Shell-preview electrons use the same gold s, teal p, blue d and violet f palette as the cloud model. Colors are assigned from sourced subshell populations, preserving configuration exceptions and all 118 shell totals. Unknown configurations are not guessed.

The bottom of Element Spotlight now links to a diagonal filling-order diagram beside the spotlight, with n=1–8 rows, directional arrows, matching subshell colors, occupied-node electron counts and an unoccupied 8s guide. Actual counts retain known configuration exceptions. This side diagram contains no cloud canvas; the separate Electron clouds tab remains available. Close with the button or Escape. On smaller screens, the panel becomes a dismissible overlay.

All 516 application tests and the production build pass. Scientific datasets are unchanged. Browser visual inspection remains unavailable; deployed assets are compared directly against the checked build.

## Diagram arrow adjustment — 1.5.6

Diagonal arrows extend further beyond the s circles, with arrowheads 25% smaller and line endpoints inset into the arrowheads. This avoids clipping by circles or a line protruding through the arrow tip. Production build and all four configuration-diagram tests pass. Other behavior and scientific data are unchanged; the previous full-suite baseline is 516 passing tests.

## Website address — 1.5.7

The repository and project site are now named element-nuwa. Use https://rfeynman.github.io/element-nuwa/. All built asset links remain relative and work under the renamed project path. The internal browser-progress key is retained for compatibility. Four diagram tests and the production build pass; scientific data and application behavior are unchanged.

## Google Search Console verification

Keep the original Google verification HTML in `public/googlea3b2da7159d02bfb.html` and the deployed `docs/` root. Its bytes and name must remain unchanged, and future builds must retain it so Google can periodically confirm site ownership.

## Spectra and layout update — 1.6.0

**Absorption & emission** is the third element-detail tab. Two strips span **330–830 nm**, with black absorption notches, colored emission lines, and illustrative black-to-violet/red-to-black edge fades. Each pair of states is listed once, with rightward absorption and leftward emission arrows and bold term/J values. Select a wavelength for an energy-jump diagram. The default range contains 734 lines; **All reference lines** includes the other downloaded UV/IR transitions.

The local NIST Handbook snapshot includes **1,298 reference wavelengths across 99 neutral elements**. Ten wavelengths have no assigned state pair and remain explicitly unavailable. This is a selected persistent-line reference, not a complete spectrum. Absorption requires atoms in the lower state; colors, widths and brightness are illustrative. Sources, dates, energy labels, air/vacuum convention and unknown assignments are retained. See [spectra review](references/spectra-review.md), [source attribution](references/source-attribution.md) and [manifest](data/manifests/spectra-manifest.json). Raw HTML remains private; only normalized data is deployed.

The reaction lab, Chemistry challenges and field guide now follow the periodic table’s main column independently of sidebar height. The smaller electron filling diagram clears hovered element tiles and glides between sides in **0.3 seconds**, respecting reduced motion.

All **530 tests** and the production build pass. Browser automation was unavailable; the user reviewed the local appearance before authorizing this release. External teacher/scientist review remains pending. See [release evidence](references/release-1.6.0.md).

To refresh spectra, use Python with `beautifulsoup4==4.12.3`, run `python3 scripts/data/import_spectra.py --download`, review the staged snapshot and manifest, then run `python3 scripts/data/import_spectra.py --promote`. Re-run `npm test` and `npm run build`. Failed imports leave the previous production snapshot intact. Public-source tests verify packaged data and provenance; they additionally verify raw-source checksums when the private original evidence folder is present.
