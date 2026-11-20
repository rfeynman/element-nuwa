# Common binary-reaction coverage audit

Candidate `common-binary-additions.json`, version `2026.11.20-common-binary.1`, prepared 20 November 2026 UTC. This is a finite, source-backed addition for integration and independent review, not a claim of exhaustive chemistry or teacher approval. The published snapshot and main merger were not modified by this task.

The candidate contains **47 entries**: **25 modeled**, **22 equation-only**, **43 distinct pairs**, with **39 pairs** absent from the production snapshot inspected during preparation. It references 72 substances and 26 source URLs. Pair counts may overlap other concurrent curators; the integration owner must deduplicate by actual composition, state, charge and conditions.

## Standard omissions covered

- Si + O2 → SiO2 and high-temperature Si + N2 → Si3N4.
- P4 + O2 → P4O10; controlled P4O6 endpoint is equation-only and explicitly a cold-collected solid.
- Heated N2 + O2 → NO; later NO oxidation is a separate existing scenario.
- H2 + F2 → HF; HBr/HI and Haber NH3 are included as equations with appropriate unmodeled conditions/equilibrium labels.
- Eight direct ionic-hydride preparations: Li/Na/K/Rb/Cs and Ca/Sr/Ba. These are an explicit **named-family expansion** of OpenStax 18.5's stated reacting metals and MH/MH2 stoichiometries; they are not 8 independent experimental literature reviews or valence-based predictions for arbitrary metals.
- B2O3, BF3/BCl3/BBr3 and BN endpoints; BN remains equation-only because pressure and crystal-form selection are not represented.
- Limited-oxygen carbon monoxide; collected-liquid CS2 equation; SiC from heated elemental silicon and carbon.
- ZnS and MgS; Cu2S/CuS layer endpoints; Na2S, K2S, CaS textbook equations. MgS's isolated-endpoint example uses heat and inert atmosphere per its lecture source. Na/K/Ca activation is not inferred from the equation and remains equation-only.
- PCl3/PCl5, PBr3, PF5; sulfur SF6, S2Cl2/SCl2. Three explicit named alkali-metal peroxide alternatives follow the named K/Rb/Cs family in OpenStax 18.9, with controlled oxygen versus superoxide limits retained.

## Corrections and quarantines

1. WebElements boron/Br2 equation prints BF3. Its prose explicitly identifies BBr3. The candidate uses BBr3(l), independently corroborated by NIST identity and liquid thermochemistry/phase data. It is equation-only because activation is incomplete.
2. WebElements Si + F2 prints liquid F2 despite explicitly describing room-temperature reaction. F2(g) is corroborated by OpenStax's physical states. Likewise, heated Si chlorination uses Cl2(g), correcting source Cl2(l); its gaseous SiCl4 product is retained for the hot reaction rather than silently changed to collected liquid.
3. WebElements asserts bulk SiN(s) alongside Si3N4. Only the established Si3N4 solid endpoint is included. No new SiN phase is invented.
4. WebElements SF6(l) and orange annotation conflict with CDC/NIOSH's colorless gas and OpenStax SF6 product. The accepted SF6(g) record carries both references; no colored plume or toxicity is inferred for pure SF6.
5. OpenStax 18.11 direct P/Cl equation labels PCl5(l), while 18.8 explicitly describes the off-white solid and phase behavior. The candidate's solid endpoint is independently cross-checked within the textbook and remains equation-only, rather than presenting a hot-phase history as simulated.
6. WebElements PI3(g)/P2I4(g) endpoints are excluded pending independently reconciled phase/context evidence. WebElements PF3 direct-endpoint assertion is **quarantined**, not published merely as an equation-only major product: independent review found stronger direct P/F calorimetry for PF5(g). The candidate includes primary-backed PF5 equation-only.
7. Graphite/F2 can generate a mixture. The accepted CF4(g) equation-only endpoint is corroborated by NBS primary calorimetry identifying CF4 as major product and a small C2F6 component. No arbitrary mixture coefficients, C5F12 state or quantitative purity is invented.
8. Sulfur equations originally written using conventional S(s) are normalized to the app's S8(s) feed, with coefficients multiplied as needed; that transformation changes bookkeeping, not chemistry. Collected-liquid CS2 is explicitly separated from hot vapor production and is equation-only.
9. Silicon bromide/iodide source phase histories are not reconciled with one heat control; they remain equation-only with that limitation stated. Their formulas are directly reported by the reference, not inferred from valence.

## Sources and evidence

Every scenario carries exact source IDs, original/transcribed equation and a `sourceLocator`. Current OpenStax pages are the primary teaching references; copyright/attribution and CC BY-NC-SA links are retained. WebElements equations/prose are factual references, not redistributed artwork. Government and primary research references support the identified corrections. No laboratory quantities, operational temperatures, timing recipes or animation-intensity optimization were added to the app records.

`raw/common-binary/manifest.json` inventories **browser-rendered reference evidence**, explicitly not original HTML. `download-manifest.json` records attempted direct PDF retrievals and honest failures; Germanna's PDF was retrieved with checksum, while several providers returned 403/500. Some indexed publisher text was available to the web tool even when a direct article open was blocked. The raw archive records that distinction rather than claiming successful downloads. `build-common.py` is a local reproducible transcription/validation helper; it only writes this candidate and its local evidence manifest.

Primary review additions: O'Hare & Hubbard, Trans. Faraday Soc. 62 (1966) 2709–2715, DOI 10.1039/TF9666202709 (PF5); Domalski & Armstrong, J. Res. NBS 71A (1967) 105–118, DOI 10.6028/jres.071A.015 (CF4); NBS boron-trifluoride direct-combination paper (PMC6624725). An obsolete ANL-7459 PDF URL returned 404 and was replaced by the RSC primary reference.

## Validation and integration limits

The builder checks every atom, positive integer coefficient, neutral charge, exactly two distinct elemental reactants, unique IDs and valid source references. These checks pass. No oxygen-atmosphere requirement is automatically assigned solely because O2 appears as a reactant. The complete source-specific chemical review is separate from balancing; independent reviewer findings must be resolved before promotion.

Equation-only records are deliberate source-backed display coverage, not simulated reactions. For reversible systems (Haber and HI), heat alone does not mean full conversion, and the current engine does not calculate equilibrium mixtures, pressure or catalytic kinetics. Gas/solid flags are conservative; heat/flame appear only where supported. No universal no-reaction conclusions are added for unverified pairs.

## Entry ledger

| ID | Mode | Equation | Sources |
| --- | --- | --- | --- |
| common-hydrogen-fluorine | modeled | `H2(g)+F2(g)->2HF(g)` | common-we-hydrogen, common-os-hydrogen |
| common-hydrogen-bromine | equation-only | `H2(g)+Br2(g)->2HBr(g)` | common-os-hydrogen |
| common-hydrogen-iodine | equation-only | `H2(g)+I2(g)->2HI(g)` | common-os-equilibrium |
| common-nitrogen-hydrogen | equation-only | `N2(g)+3H2(g)->2NH3(g)` | common-os-hydrogen, common-os-equilibrium |
| common-li-hydrogen | modeled | `2Li(s)+H2(g)->2LiH(s)` | common-os-hydrogen |
| common-na-hydrogen | modeled | `2Na(s)+H2(g)->2NaH(s)` | common-os-hydrogen |
| common-k-hydrogen | modeled | `2K(s)+H2(g)->2KH(s)` | common-os-hydrogen |
| common-rb-hydrogen | modeled | `2Rb(s)+H2(g)->2RbH(s)` | common-os-hydrogen |
| common-cs-hydrogen | modeled | `2Cs(s)+H2(g)->2CsH(s)` | common-os-hydrogen |
| common-ca-hydrogen | modeled | `Ca(s)+H2(g)->CaH2(s)` | common-os-hydrogen |
| common-sr-hydrogen | modeled | `Sr(s)+H2(g)->SrH2(s)` | common-os-hydrogen |
| common-ba-hydrogen | modeled | `Ba(s)+H2(g)->BaH2(s)` | common-os-hydrogen |
| common-nitrogen-oxygen | modeled | `N2(g)+O2(g)->2NO(g)` | common-os-nitrogen |
| common-boron-oxygen | modeled | `4B(s)+3O2(g)->2B2O3(s)` | common-we-boron |
| common-boron-f2 | equation-only | `2B(s)+3F2(g)->2BF3(g)` | common-we-boron, common-primary-bf3 |
| common-boron-cl2 | equation-only | `2B(s)+3Cl2(g)->2BCl3(g)` | common-we-boron |
| common-boron-bromine | equation-only | `2B(s)+3Br2(g)->2BBr3(l)` | common-we-boron, common-nist-bbr3 |
| common-boron-nitrogen | equation-only | `2B(s)+N2(g)->2BN(s)` | common-bn-study |
| common-carbon-monoxide | modeled | `2C(s)+O2(g)->2CO(g)` | common-we-carbon |
| common-carbon-sulfur | equation-only | `4C(s)+S8(s)->4CS2(l)` | common-dcceew-cs2 |
| common-silicon-carbon | modeled | `Si(s)+C(s)->SiC(s)` | common-rsc-sic |
| common-zinc-sulfur | modeled | `8Zn(s)+S8(s)->8ZnS(s)` | common-rsc-zns |
| common-copper-sulfur-cu2s | equation-only | `16Cu(s)+S8(s)->8Cu2S(s)` | common-cu-s-study |
| common-copper-sulfur-cus | equation-only | `8Cu(s)+S8(s)->8CuS(s)` | common-cu-s-study |
| common-silicon-oxygen | modeled | `Si(s)+O2(g)->SiO2(s)` | common-we-silicon |
| common-silicon-nitrogen | modeled | `3Si(s)+2N2(g)->Si3N4(s)` | common-we-silicon |
| common-silicon-fluorine | modeled | `Si(s)+2F2(g)->SiF4(g)` | common-we-silicon, common-os-halogens |
| common-silicon-chlorine | modeled | `Si(s)+2Cl2(g)->SiCl4(g)` | common-we-silicon, common-os-halogens |
| common-silicon-bromine | equation-only | `Si(s)+2Br2(l)->SiBr4(l)` | common-we-silicon |
| common-silicon-iodine | equation-only | `Si(s)+2I2(l)->SiI4(s)` | common-we-silicon |
| common-phosphorus-oxygen-p4o10 | modeled | `P4(s)+5O2(g)->P4O10(s)` | common-we-phosphorus, common-os-phosphorus |
| common-phosphorus-oxygen-p4o6 | equation-only | `P4(s)+3O2(g)->P4O6(s)` | common-we-phosphorus, common-os-phosphorus |
| common-phosphorus-chlorine-pcl3 | modeled | `P4(s)+6Cl2(g)->4PCl3(l)` | common-we-phosphorus, common-os-phosphorus |
| common-phosphorus-chlorine-pcl5 | equation-only | `P4(s)+10Cl2(g)->4PCl5(s)` | common-os-phosphorus, common-os-halogens |
| common-phosphorus-bromine | equation-only | `P4(s)+6Br2(g)->4PBr3(l)` | common-we-phosphorus |
| common-sulfur-fluorine | modeled | `S8(s)+24F2(g)->8SF6(g)` | common-we-sulfur, common-os-halogens, common-cdc-sf6 |
| common-sulfur-chlorine-s2cl2 | equation-only | `S8(s)+4Cl2(g)->4S2Cl2(l)` | common-we-sulfur |
| common-sulfur-chlorine-scl2 | equation-only | `S8(s)+8Cl2(g)->8SCl2(l)` | common-we-sulfur, common-os-halogens |
| common-k-oxygen-peroxide | modeled | `2K(s)+O2(g)->K2O2(s)` | common-os-oxygen |
| common-rb-oxygen-peroxide | modeled | `2Rb(s)+O2(g)->Rb2O2(s)` | common-os-oxygen |
| common-cs-oxygen-peroxide | modeled | `2Cs(s)+O2(g)->Cs2O2(s)` | common-os-oxygen |
| common-magnesium-sulfur | modeled | `8Mg(s)+S8(s)->8MgS(s)` | common-unimed-sulfides |
| common-sodium-sulfur | equation-only | `16Na(s)+S8(s)->8Na2S(s)` | common-germanna-na2s |
| common-calcium-sulfur | equation-only | `8Ca(s)+S8(s)->8CaS(s)` | common-klett-cas |
| common-potassium-sulfur | equation-only | `16K(s)+S8(s)->8K2S(s)` | common-ccea-k2s |
| common-phosphorus-fluorine-pf5 | equation-only | `P4(s)+10F2(g)->4PF5(g)` | common-primary-pf5 |
| common-carbon-fluorine-cf4 | equation-only | `C(s)+2F2(g)->CF4(g)` | common-primary-cf4 |

## Integration correction

The three K/Rb/Cs peroxide entries explicitly require the oxygen-atmosphere selector because their source specifies pure oxygen. These three metadata fields were added to the frozen candidate during integration and independently rechecked.
