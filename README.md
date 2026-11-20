# Element Atlas

An educational periodic table and virtual chemistry lab for high school.

- 118 elements, 3,383 ground-state isotope records, and 118 sourced electron configurations.
- Hover/focus preview, pinned selection, local scientific data, isotope half-lives, and optional shell animations.
- Element drag basket, compound shelf, 14 sourced reaction scenarios, products, balanced equations, heat/fire/gas/solid/toxicity/blast indicators, and optional water condensation.
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
