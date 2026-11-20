# Element Atlas

An educational periodic table and virtual chemistry lab for high school.

- 118 elements, 3,383 ground-state isotope records, and 118 sourced electron configurations.
- Hover/focus preview, pinned selection, local scientific data, isotope half-lives, balanced nuclear decay equations, and interactive colored s/p/d/f orbital clouds.
- Element drag basket, compound shelf, 433 sourced reactions and physical processes (240 modeled scenarios, 193 equation-only records), products, balanced equations, heat/fire/gas/solid/toxicity/blast indicators, and optional water condensation.
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

See [source attribution](references/source-attribution.md) and [reaction evidence](references/reaction-source-audit.md). Each scientific information panel includes source links, dataset version, and dates. Data is packaged locally; hovering or reacting does not call third-party scientific services. Raw downloaded pages and staging records are excluded from this repository.

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
