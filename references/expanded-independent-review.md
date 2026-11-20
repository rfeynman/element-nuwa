# Expanded corpus second-pass review

Reviewed the published snapshot containing 111 scenarios, 164 substances, and 27 source records on 2026-11-20. Snapshot SHA-256: `5daf1cc32e06c7a52a66dee1039a9f980d4b04d5582c8add52093d80d8f66dcb`.

This is a limited agent review, not independent external chemistry or teacher approval. The reviewer previously contributed the representative-element supplement; checks below therefore provide a second pass, not an independent author certification. Existing archived evidence was read; no new browser or link-availability checks were performed.

## Findings

No blocking scientific error was found in the reviewed sample. One nonblocking presentation issue remains: several supplemental substance names are formula strings rather than ordinary chemical names. Examples include `NaCl-l` (“NaCl”), `N2O4-g` (“N2O4”), `ClNO-g` (“ClNO”), and the trona hydrate. For a learner-facing picker, use phase-qualified names such as molten sodium chloride, dinitrogen tetroxide, nitrosyl chloride, and trona. The formulas and compositions themselves are consistent with the reviewed source equations.

## Whole-snapshot mechanical checks

- Independently recomputed atom and charge totals for all 111 scenarios using substance compositions. All conserve atoms and net charge, including the 13 scenarios containing explicitly charged species.
- Compared equations after normalizing coefficients by their greatest common divisor and identifying substances by composition, charge, and phase. No duplicate canonical equations were found. This identity comparison is appropriate for the reviewed inorganic entries; it is not a general isomer detector.
- Compared exact canonical ingredient sets, activation methods, and atmosphere requirements. No same-condition matching collisions were found.
- Every source reference resolves to one of the 27 source records. Source URLs are populated. This verifies reference coverage, not live URL availability or exhaustive support for every sentence.
- Reviewed all three `gasColor` entries and the sole `freezing: true` entry. No unsupported gas color or freezing flag was identified in this set.

## Targeted chemistry and evidence checks

| Topic / scenarios | Evidence read | Result |
|---|---|---|
| Water freezing, melting, boiling; dry-ice sublimation | `data/reactions/raw/openstax-10-3-phase-transitions.web.txt`, especially archived source lines L164–L181 | Freezing is physical and exothermic; external cooling removes heat. Dataset correctly distinguishes this from endothermic dissolution and labels latent-heat release. Water vapor is described as invisible; the visible plume is condensed droplets. |
| Ammonium nitrate and sucrose dissolution | Published scenario conditions and physical-process metadata; archived section 11.1 context | Solvent is explicitly implicit in aqueous states. Ammonium nitrate cooling is not tagged as freezing. Sucrose retains its molecular composition. |
| Nitric oxide oxidation; nitrogen dioxide dimerization | `data/reactions/raw/openstax-18-7-occurrence-preparation-and-properties-of-nitrogen.web.txt`, L49–L65 | Colorless NO and brown NO2 are correctly distinguished. Cooling favors N2O4 and fading color; the label correctly states that this is an equilibrium direction, not complete conversion. |
| Chlorine color in brine electrolysis and NO2/chloride redox | Section 18.11 archived evidence L49–L50; section 18.7 displayed chloride-oxidation equation L87 | Greenish-yellow chlorine is supported. Brine observations distinguish chlorine from colorless hydrogen and label separated electrode products. The single schematic gas-color field represents a named colored component, not all gas products. |
| White solid in nitric-acid dehydration | Section 18.7 archived evidence L68–L70 | N2O5 is explicitly described as white and the displayed dehydration equation supports the products. The solid-color field is a schematic aggregate and does not separately characterize every product. |
| Hydride and nitride hydrolysis; iron/acid; carbonate precipitation and carbonated-water dissolution | Published ionic equations and archived sections 18.5/18.6 | Charge signs, stoichiometry, hydronium water terms, and phases were consistent in the checked equations. Hydride-generated hydrogen is not mistaken for boiling. |
| Molten chloride electrolysis; magnesium silicon reduction; zinc roasting/decomposition; tin reduction | Section 18.2 archived equations | Full neutral-material electrolysis reactions are used, not isolated half reactions. Molten chlorides are distinct from aqueous chlorides. Vapor-removal qualification is retained for magnesium. |
| Thermal hydroxide decomposition, sodium/strontium peroxide formation, ozone formation/photolysis | Section 18.9 archived equations | Reactants/products and stated activation types match the selected source models. Peroxide cases explicitly require pure oxygen. Atomic oxygen is a distinct gas intermediate without a duplicate elemental picker mapping. |

## Modeling limits retained

The tin-reduction equation preserves the source's solid tin endpoint even though the surrounding source discussion concerns hot molten metal; the dataset label explicitly calls it the equation endpoint. The trona equation likewise preserves condensed water as a source endpoint. Neither should be read as a simultaneous in-furnace phase inventory. These are qualified schematic equations, not quantitative process models.

Binary activation and atmosphere selectors do not encode temperature, concentration, pressure, extent of reaction, phase equilibria, or competing pathways. Qualitative labels carry those restrictions. Hex colors are illustrative choices consistent with named colors, not measured spectra. The source sample above does not establish exhaustive scientific correctness for all 111 scenarios. Teacher review remains pending.
