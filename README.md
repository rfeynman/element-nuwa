# Element Atlas

An educational periodic table and virtual chemistry lab for high school.

- 118 elements, 3,383 ground-state isotope records, and 118 sourced electron configurations.
- Hover/focus preview, pinned selection, local scientific data, isotope half-lives, balanced nuclear decay equations, and optional shell animations.
- Element drag basket, compound shelf, 223 sourced reactions and physical processes (187 modeled scenarios, 36 equation-only records), products, balanced equations, heat/fire/gas/solid/toxicity/blast indicators, and optional water condensation.
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

The large introductory banner has been removed. The library contains 216 chemical reactions, six physical processes, and one reviewed no-reaction case, using 288 substances and 54 source URLs. Search by formula, material or product. Explicit activation choices are none, heat, light, ignition, electricity and cooling; atmosphere choices are air, oxygen and inert.

Each supported run plays a 3.2-second transparent conceptual animation around the vessel, then clears it before revealing products. Replay restarts the scene; Skip/Escape completes it; Reset and condition/ingredient edits cancel it. Reduced-motion presentation lasts 250ms. Brown NO2 and chlorine colors require source metadata; colorless gases remain schematic. Freezing is explicitly distinguished from ordinary cooling.

See references/expanded-reaction-audit.md and references/expanded-independent-review.md for scope and exclusions. Build the curated formulas using data/reactions/build.py followed by data/reactions/merge_binary.py with the pinned Python requirements. Raw source archives are retained locally and excluded from this repository.

## All distinct elemental pairs

Look up all 6,903 distinct pairs of the 118 elements. This snapshot provides 123 source-backed binary entries across 115 pairs. Unknown pairs report missing evidence; products are never inferred from element valences. Multiple endpoints require choosing a scenario. Thirty-six catalogue equations lack complete activation conditions and cannot simulate products.

The 112 accepted additions are explicitly transcribed WebElements equations. Two selenium product/phase conflicts are excluded, including their unused product substances. See references/binary-independent-review.md and data/reactions/binary-merged-validation.json. All decay equations use nuclear charge/nucleon bookkeeping, with source branch percentages retained; unspecified levels or daughters remain unavailable or schematic.

## 1.2.1 reaction interaction fix

Fe + explicit O2 + heat now offers both sourced iron oxide endpoints in ordinary air, without a duplicate oxygen-atmosphere requirement. Multiple supported outcomes appear as actionable choices beside the vessel. Loaded examples preselect their stated conditions; a missing condition can be applied and run directly from the result panel. See references/iron-oxygen-fix.md.
