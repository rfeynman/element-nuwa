# Reaction snapshot source audit

Snapshot: `2026.11.20-source-checked.1`; retrieved 2026-11-20T01:49:49Z.

This is an AI source audit, **not teacher approval**. Teacher/scientist review remains pending. The application snapshot contains 14 limited scenarios, not a general reaction predictor. Equations are molecular bookkeeping equations; aqueous salts represent dissolved ions, not intact molecules. No numerical energy, operating amounts, apparatus construction, or laboratory procedure is included.

## Evidence retained from source inspection

The source IDs below resolve to full publisher names and URLs in the bundled JSON. Notes are original paraphrases, not copies of source text. Search-provider publication estimates were not treated as upstream dates.

| Source ID | Inspected support and editorial decision |
| --- | --- |
| wisc-h2 | University demonstration explains that activated hydrogen combines with oxygen, forms water vapor, and produces flame/explosion. Water vapor product is gaseous; no visible white steam animation is requested. |
| okstate | ChemSource explicitly supplies equations for magnesium oxidation, sodium/water, zinc/HCl, and copper/silver nitrate. Ignition is stated for magnesium; silver deposition and hydrogen bubbling are described. Sodium's hydrogen sometimes burns, so no unconditional flame effect is assigned. |
| sydney-fes | Demonstration 8.11 gives 8Fe + S8 → 8FeS with thermal initiation and a traveling red glow. Solid sulfur is S8 rather than a fictitious monatomic gas. |
| rsc-carbon | Teaching article identifies carbon dioxide from carbon/oxygen combustion. Record deliberately constrains complete combustion and sufficient oxygen. No specific visible flame or glow is claimed for the graphitic-carbon representation. |
| harvard-hcl | Harvard's original demonstration video description explicitly identifies light-initiated explosive conversion of hydrogen/chlorine to hydrogen chloride. No operational detail copied. |
| wisc-hcl | University primary demonstration record identifies bright-light initiation and explosion, and flags acute toxicity. Chlorine-specific inhalation warning is also supported by the RSC sodium/chlorine page. |
| rsc-nacl | Primary teaching demonstration describes ignition, yellow flame, and white solid salt particles. Chlorine is marked toxic. Aerosol solid is distinguished from water vapor. |
| rsc-mg | Teaching notes give Mg + 2HCl → MgCl2 + H2 and gas evolution in aqueous acid. No quantitative rate asserted. |
| wisc-neutral | Demonstration identifies HCl/NaOH neutralization as exothermic and measures solution temperature change. |
| rsc-neutral | Supplies the molecular NaOH/HCl neutralization equation. No precipitation or steam is inferred from heat. |
| uw-fizz | Primary university demonstration identifies bicarbonate/HCl fizz as CO2. Its displayed equation accidentally omits HCl on the left; the snapshot corrects this omission with complete atom conservation and the reactant named in the source prose. |
| wisc-precip | Primary university video page identifies a blue precipitate when CuSO4 and NaOH combine. |
| pearson-precip | Official examination-board practical guide p. 87 explicitly identifies Cu(OH)2(s) and Na2SO4(aq). Condition restricted to dilute, room-temperature precipitation rather than heated or concentrated-alkali chemistry. |
| ou-noble | Original university teaching transcript identifies He/Ne as unreactive. Its broad wording about no compounds is deliberately narrowed here to ordinary room conditions; excited states and extreme pressures excluded. Page explicitly updated 2019-08-30. |

## Reuse and provenance

Publisher pages remain their publishers' copyright; no license to redistribute complete source pages or videos has been established. Only factual chemistry, original short explanations, and links are bundled. No upstream artwork, video, experiment procedure, or substantial quoted text is copied. Source excerpts were inspected via web search. A subsequent bounded archival retrieval is recorded in `data/reactions/raw/manifest.json`, with each successful raw HTML/PDF response, actual retrieval timestamp, checksum, and any failed retrieval. Raw HTML can contain only a video landing page or a site access challenge; content verification is recorded separately and a downloaded response is not itself proof of its teaching content. Unknown upstream dates are null. The local source-audit notes retain the evidence interpreted during the audit.

`data/reactions/build.py` deterministically builds the snapshot and checks atom/charge balance, positive integer coefficients, valid sources, and unique elemental mappings. `data/reactions/validation.json` records the snapshot checksum. A no-reaction case retains unchanged substances on both sides for conservation, but the interface should describe a mixture, not display them as newly formed products.

## Visual semantics and scope

- `gas`: gas is produced; does not imply colored smoke or boiling.
- `solid`: a new solid product; precipitation only where the text says so.
- `heat`: qualitative thermal release; no temperature scale prediction.
- `flame`: directly supported combustion/light observation.
- `toxic`: labeled chlorine inhalation warning, not a generic property of all products.
- `blast`: conceptual qualitative rapid gas reaction; no numeric intensity, recipe, or guarantee outside stated activation conditions.
- `steam` and `cooling`: intentionally unused; insufficient need/evidence in this snapshot.

All unlisted combinations must remain unsupported. Activation is a teaching gate rather than a real physical simulation. Qualitative condition labels further constrain each record; they must be displayed to learners. No claims are made about yield, rate, leftovers, concentrations, or universal reaction behavior.
