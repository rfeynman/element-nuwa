# Independent binary coverage and interaction review

Review date: 2026-11-20 UTC. Initial runtime candidate: `2026.11.20-source-checked.4`, 223 entries / 115 covered distinct elemental pairs. This is a targeted AI-assisted review, not external teacher approval or certification of all possible elemental chemistry. The initial review reads actual source passages and the matching/build code, rather than accepting a source URL as evidence by itself.

## Findings reported to integration lead

### 1. Missing Al/O is a source-curation failure, not an unknown reaction

The earlier audit deliberately omitted the entire aluminium page because some equation phases were erroneous (for example O2(l) and Cl2(l)). Omitting a defective transcription is preferable to reproducing it, but the subsequent work did not seek an independent source for a foundational reaction. The user-facing result therefore incorrectly exposed a catalogue coverage gap for the ordinary oxide-formation case. The required correction is an independently supported `4Al(s) + 3O2(g) → 2Al2O3(s)` scenario, with oxide-film/passivation context and a distinct ignited/heated combustion example, not a blanket claim that bulk Al instantly burns in room air. The lead owns that source corroboration and integration.

The cited [WebElements aluminium page](https://www.webelements.com/aluminium/chemistry.html), reaction-with-air section, does identify aluminium oxide and a bright flame, but its O2 liquid state is not an acceptable normal oxygen combustion transcription. Correcting that phase needs the separate source recorded with the correction. Do not treat the gas/liquid typo as proof that aluminum/oxygen chemistry is unavailable.

### 2. Oxygen reactant and oxygen-atmosphere control are incorrectly double-counted in existing generated records

The original extraction helper sets `requiredAtmosphere='oxygen'` for every O2 equation. That generic rule is not justified by the equation alone. The previous Fe correction removed it for only two records, leaving the same interaction problem elsewhere.

Clear source contradictions include:

- `binary-lithium-o2-li2o` and `binary-lithium-o2-li2o2`: [lithium source](https://www.webelements.com/lithium/chemistry.html), air section, describes combustion in air, with oxide principal and peroxide additional.
- `binary-sodium-o2-na2o`: [sodium source](https://www.webelements.com/sodium/chemistry.html), air section, gives oxide alongside peroxide from burning in air.
- `binary-zinc-o2-zno`: [zinc source](https://www.webelements.com/zinc/chemistry.html), air section, describes burning in air, not a separate pure-oxygen prerequisite.
- `binary-lead-o2-pbo`: [lead source](https://www.webelements.com/lead/chemistry.html), air section, specifically describes heated reaction with oxygen in air.
- `binary-titanium-o2-tio2`: [titanium source](https://www.webelements.com/titanium/chemistry.html), air section, describes ignition in air with oxide/nitride formation; the isolated oxide endpoint is an educational simplification.

Recommendation: remove automatically inferred atmosphere restrictions, while keeping explicit O2 reactant identity and required activation. Preserve independently sourced pure-oxygen requirements such as the baseline peroxide examples. Do not conflate removing a duplicate UI condition with asserting that oxygen is unnecessary.

### 3. Gas-phase bromine/iodine records are not reachable from ordinary table selections

The initial dataset has **34 neutral binary scenarios** whose reactants use Br2(g) and/or I2(g), while the periodic-table element mapping supplies Br2(l) / I2(s). Thus a supported pair can appear unmodeled when manually mixed from the table, despite appearing in the pair explorer. These are distinct modeled forms, not interchangeable identifiers.

Recommendation: explicitly offer the sourced alternative forms and their conditions next to an unmatched selection, with a clear action such as **Load sourced forms & conditions**. Preserve the phase shown in the equation. The action should replace only the exact corresponding elemental inputs, not match a convenient subset or discard a third ingredient. The pair browser should continue showing all source scenarios irrespective of current form. Add regression cases for ordinary Na+Br and Zn+I table selections, supported gas-form loading, and an extra-substance negative case. A silent form equivalence would erase scientific meaning.

The 34-row figure excludes charged bromide/iodide reactions; single-element composition alone is not sufficient to call an ion an elemental reactant.

### 4. Incomplete activation descriptions remain executable under special-case labels

`binary-manganese-f2-mnf2` and `binary-manganese-f2-mnf3` have requiredActivation none and remain executable, although their labels explicitly say full conditions selecting proportions are unavailable. The source gives both fluoride equations but not a sufficient endpoint-control description. The merger only recognizes one exact phrase for equation-only promotion; custom wording bypasses it. Mark these equation-only unless an independent source supplies the missing conditions. The source is [WebElements manganese](https://www.webelements.com/manganese/chemistry.html), halogen section.

More generally, Br2(g)/I2(g) in an equation is not proof that selecting **Heat** is a complete activation model. Vapor can be present under multiple conditions, and endpoint selection can depend on details absent from the page. Examples needing conservative equation-only treatment or separate corroboration include the controlled As/Bi trihalides and Se tetrahalides, and the Zn halides if only the current brief source assertion is used. Explicit heat is supported in the inspected source text for Ca Br/I, Sr Br/I, and Ti halides. Product equations can remain visible without making unsupported kinetics executable.

`binary-chromium-f2-crf3` and `binary-chromium-cl2-crcl3` say heating is specified, but [the chromium page](https://www.webelements.com/chromium/chemistry.html) only gives a relative sequence of milder conditions after the high-valent fluorides. The generic heat selection is not an independently established complete preparation condition for those endpoints. Keep the source-backed equation, but either corroborate the activation or mark equation-only.

### 5. An explicitly sourced ambient reaction is unnecessarily withheld

`binary-lead-f2-pbf2` is equation-only under a generic label, but the [lead source](https://www.webelements.com/lead/chemistry.html), halogen section, explicitly gives fluorination at room temperature and contrasts chlorination on warming. It can be promoted to a none/room-condition scenario within the qualitative model after updating the per-record condition label. This illustrates why exact-string classification is insufficient for a detailed scientific review.

### 6. Prior excluded selenium products must remain excluded

The previous independent findings on unsupported bulk SeI4(s) and incorrectly phased SeF4(s) remain applicable. Product identities/phases must be corroborated before any replacement. Merely classifying these as equation-only does not cure a disputed chemical product. See `binary-independent-review.md`.

## Evidence and review scope

Fresh source HTML for 20 cited element chemistry pages is stored locally under `data/reactions/raw/binary-review/`. Its `manifest.json` records URL, retrieval date and SHA-256. These raw pages are provenance, not public website assets. Existing local WebElements pages for the remaining prior binary set were read to compare activation prose against generated metadata. No existing source artwork or experimental procedure is incorporated into the app by this review.

This pass verifies the stated issues and representative endpoint/phase claims. It does not establish that every old record is correct, every conceivable compound is reachable by direct elemental combination, or every elemental pair has one unique product. Source-backed additions should be tested for exact state/form reachability and provenance, not only integer atom conservation.

## Candidate expansion review

A machine-readable per-record patch recommendation is in `binary-record-corrections.json` (33 records). It preserves product identities and phases; the corresponding source passages were inspected. Six gas-halogen rows with explicit heat/warming source support are listed separately and are not changed.

### Metal candidate, initial pass

Initial candidate `2026.11.20-metal-audit.1` contained 147 records. Independent structural/conservation checks passed for every initial record: positive integer atom/charge balance, exactly two neutral elemental reactants, unique IDs and resolved source references. This is mathematical/schema evidence, separate from identity validation.

A blocking unsupported product was found: `metal-audit-osmium-f2-osf7` / OsF7(s). The primary reinvestigation by Drews et al., [“Osmium(VII) Fluorine Compounds,” DOI 10.1021/ic0608290](https://pubs.acs.org/doi/10.1021/ic0608290), [PubMed record](https://pubmed.ncbi.nlm.nih.gov/16961386/), reports failure to reproduce the original OsF7 preparation and recovery of OsF6 instead. The curator was notified and is removing the row. Equation-only status would not resolve the product-identity conflict.

The nine binary transition-metal hexafluoride identities are independently supported by Drews et al., [“Solid State Molecular Structures of Transition Metal Hexafluorides,” DOI 10.1021/ic052029f](https://pubs.acs.org/doi/10.1021/ic052029f), [PubMed record](https://pubmed.ncbi.nlm.nih.gov/16634614/). This is a low-temperature crystal study; it does not by itself justify labeling every MF6 as a room-temperature solid. Current candidate MoF6(l), WF6(g), and retained Os/Ru/Rh/Ir/Pt/Tc hexafluoride solid labels have no additional obvious phase conflict in this targeted pass; ReF6(s) was conservatively withheld by the curator.

Direct source-passage inspection confirms Hf/Zr/Nb/Ta halide warming descriptions, MoF6/WF6 room-condition descriptions, and heated TcF6/ReF7 as selected nonexclusive endpoints. Pr6O11 and Tb4O7 are explicitly labeled approximate mixed-valence compositions. The corrected HfCl4/ZrCl4/NbCl5/TaCl5 solids are described as isolated products after cooling, with independent phase references rather than silent alteration of source liquid labels. Final metal candidate has 150 records, 145 distinct pairs, 51 modeled and 99 equation-only. OsF7 is absent, and extra CeO2/Pr6O11/Tb4O7 phase references are attached. Four explicit OpenStax halogen equations (CdCl2, liquid-Ga bromination, SnCl2/SnCl4) are included as equation-only. Repeated independent structural/conservation checks pass for all 150. Final candidate SHA-256: `99527c05acd136a642b988fbe9ae4783efcc58d5cea7f43dc48cca36941456b5`. Within this targeted source/identity/phase review, no remaining release-blocking metal-candidate finding was identified; unexamined details are not thereby certified.

### Aluminium candidate

The initial nine-record `aluminium-binary-additions.json` candidate independently passes positive-integer atom/charge balance, exact-two-neutral-element inputs, unique IDs and source-reference resolution. The Grade 11 primary textbook PDF, page 80 / printed page 72, was visually inspected: both the general heated-direct-combination paragraph and heat-arrow equations support the Al/halogen, sulfide, nitride and carbide examples. The explicit AlCl3, Al2S3, AlN and Al4C3 equations have states. Conversion of the textbook S(s) formula to canonical S8(s) changes coefficients but not the chemical endpoint.

The TTU gas-oxygen oxide equation plus the WebElements combustion/passivation descriptions support the corrected Al/O gas reactant and distinguish slow limited surface passivation from heated/ignited bulk combustion. The two records preserve that distinction in labels and observations; the passivation record assigns no flame or bulk energetic effect. Sulfide/nitride energy claims have additional cited sources. Al2Br6 dimer notation is retained from the cited endpoint equation, with generic heated-halogen support from the textbook. Water-catalysed iodine and incompletely specified fluorination remain equation-only. No uncorroborated direct AlH3 reaction is included.

The final lead candidate has 13 records, SHA-256 `5a6bd1850bb4c277abe4dbb909b2a522f5fd8d65c14061ea2e99e966ddddb241`. Added handbook-backed AlP and Al2Se3 remain equation-only with unspecified allotropes explicitly retained as P(s) / Se(s), rather than inventing molecular allotropes. The requested correction from Se8 to separate source-unspecified Se(s) was applied. Heated In2O3 has a direct textbook reaction/state reference. Liquid-Ga native oxidation to Ga2O3 is a primary-study equation-only record, with kinetic limits stated; a thermodynamic GaN equation was not promoted as proof of direct nitridation. The retained primary Ga source was inspected locally: it distinguishes its thermodynamic equations from experiments and reports the native oxide-covered liquid interface.

All 13 lead records pass repeated independent balance/reference checks. No blocking scientific finding was identified within this scope. Normal source/matching/browser tests remain the integration lead’s responsibility.

### Common-element candidate, initial pass

The initial 42 records independently pass the same structural/conservation checks. OpenStax §18.5 explicitly covers the heated hydride class for group 1 and Ca/Sr/Ba, making this a source-defined class transcription rather than a valence-based product prediction. OpenStax §18.9 explicitly covers K/Rb/Cs peroxides under controlled oxygen supply. These selected endpoints must keep their source-control caveats and not become universal products at every mixture ratio.

A repair was requested for the weak standalone PF3-from-P/F claim: add the directly supported PF5 endpoint using the primary O’Hare/Hubbard calorimetry study [DOI 10.1039/TF9666202709](https://pubs.rsc.org/en/content/articlepdf/1966/tf/tf9666202709), and quarantine the uncorroborated isolated PF3 endpoint rather than silently substitute a product. The primary abstract reports combustion of white/red phosphorus in fluorine with PF5(g). A historical secondary account suggests PF3 can occur alongside PF5, but this does not establish an isolated direct PF3 preparation under the listed controls.

The P4O6(s) selected equation needs explicit cold-collected-solid context because its near-room melting behavior makes a generic room-temperature solid interpretation unreliable. This is a phase-history clarification for a known oxide, distinct from endorsing every source condition or predicting a pure oxidation product. The final common candidate has 47 records, SHA-256 `3b0d9db42a1836569886e8715f70e172723bd8b33481b8df889472bfdd87d33f`. PF3 was removed; primary-supported PF5 and CF4 equations were added with incomplete-condition/nonexclusive-product caveats. P4O6 is explicitly a cold-collected crystalline endpoint rather than a hot or generic room-temperature solid prediction. MgS has the source-specific inert/heat context; Na2S, K2S and CaS stay equation-only where their teaching sources provide equations without sufficient activation context. SiBr4/SiI4 formula/state assertions remain exactly phase-qualified equation-only records; they do not execute a guessed heat-only phase history.

A missing explicit oxygen-atmosphere field for K/Rb/Cs peroxide examples was reported by the curator and confirmed against OpenStax §18.9. The integration lead added `requiredAtmosphere=oxygen` only to these three source-specific records. This is distinct from the rejected automatic rule for every oxide equation. Repeated independent checks pass for all 47: positive integer atom/charge conservation, exactly two distinct neutral elemental inputs, source references and IDs; the quarantined PF3 product is absent. No remaining common-candidate release blocker was identified in this scoped pass. Candidate-specific findings and final reviewed hashes will be recorded here after inspection. The reviewer owns only this report and its raw evidence directory; datasets, merger, engine and UI are owned by the integration lead/curators.

## Integrated snapshot disposition

**Ready within the reviewed scope**, subject to the integration lead’s application/browser verification. This is not an exhaustive independent experimental validation of every old/new reaction and is not teacher approval.

Reviewed runtime file: `public/data/reactions.json`, version **2026.11.20-source-checked.5**, SHA-256 **a698d540b9ef18dd5bbd4928b90e6407bf7142752b4770dd3a6a92fb5f8f30ee**. Independently counted: **433 entries**, **240 modeled / 193 equation-only**, **333 binary entries over 311 distinct elemental pairs**, **532 substances**, **128 source URLs**, and **79 unique canonical elemental mappings**. All 6,903 pairs remain lookup coverage, not 6,903 chemically verified outcomes.

The actual merged file was checked, not merely the proposed patch:

- All 33 machine-readable old-record corrections are applied exactly.
- The three source-specific K/Rb/Cs peroxide oxygen requirements are present; sampled spurious generic oxide atmosphere restrictions are absent.
- Separate Al/O passivation and combustion records are retained. AlSe uses the separate source-unspecified Se(s) token.
- Si(s) and Sn(s) have canonical table mappings; all 79 mappings are neutral, single-element, unique in Z, and agree with the Explorer symbol for that Z.
- Unsupported SeI4(s), incorrectly phased SeF4(s), unconfirmed OsF7(s), and the quarantined direct PF3 endpoint are absent, including unused product substances.
- Every runtime source/substance reference resolves and all records retain source-checked status; no drafts were promoted.
- The alternative-form helper was read: it requires exactly two distinct neutral elemental selections, rejects ions/compounds and extra ingredients, and offers other recorded phases/allotropes separately. The exact scenario matcher does not silently equate those forms.

The integration lead reports 486 application tests and a TypeScript/Vite build passing; these are separate from this reviewer’s independent source/structural checks. Final visual/public deployment evidence is supplied by the lead. Runtime behavior remains an educational ingredient-presence model, not quantitative yields, rate/equilibrium prediction, or a universal reaction solver.
