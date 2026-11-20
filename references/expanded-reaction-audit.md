# Expanded reaction snapshot audit

Snapshot `2026.11.20-source-checked.2`, built 2026-11-20. Published coverage: **111 scenarios, 164 substances, 27 source URLs**. This consists of **104 positive chemical scenarios, six explicitly labeled physical processes, and one reviewed no-reaction case**. It is not a claim of 111 distinct chemical reactions or of exhaustive chemistry coverage.

## Sources and provenance

The original 14 records and their source references remain. Seventy-five selected additions come from OpenStax Chemistry 2e §§4.1–4.2, chapter 4 exercises, §5.3, §10.3, §11.1, and §§18.2, 18.5–18.9, 18.11. Twenty-two additions are retained from an independently curated 26-record representative-elements supplement. Source product sets are transcribed or taken from explicit prose descriptions; there is no enumeration of arbitrary reactant pairs.

The primary expansion manifest inventories **21 evidence files spanning 13 added source URLs**. These include original downloaded HTML and explicitly labeled browser-rendered text. SHA-256 checksums, URLs, source publication date, retrieval label, and current reuse notes are retained. The original manifest records nine successful archived publisher files and five failed HTTP retrievals; failures are not counted as source snapshots. The supplemental archive contains nine evidence copies, which overlap source URLs and are not additional distinct sources. Exploratory pages not used by the published library are excluded from the used-evidence count.

OpenStax's retrieved current footer says CC BY-NC-SA 4.0, rather than assuming the textbook's earlier license. Published equations are factual chemical relationships; explanatory prose is independently written. Publisher text and page images are not included in the browser's public data bundle. This review does not grant rights beyond the publishers' terms.

## Scientific review decisions

- Preserved atom identities, physical states, positive integer stoichiometry, and charge. Net ionic equations are explicitly labeled and do not add redundant full/ionic versions of one equation merely to increase the count.
- Sulfur uses S8 rather than isolated S atoms. The coefficients were adjusted accordingly.
- Excluded the textbook's direct N2/O2-to-N2O5 balancing exercise as a viable mixing scenario. Also excluded exercises with misleading physical-state labels or missing activation context rather than blindly importing all displayed equations.
- Kept one complete phosphoric-acid neutralization endpoint. Two other sourced endpoints are retained in the staging TSV but excluded because ingredient-presence controls cannot distinguish their required ratios.
- Excluded four supplemental candidates: potassium/nitrate reduction, lithium/hydroxide reduction, phosphorus/NO, and NO2/CO. Their activation or operating constraints are insufficiently represented, or their value is limited for the current teaching scope.
- Removed duplicate substance identities during supplement merge. There are no ambiguous same-ingredient/same-condition executable scenarios. Water alone has three outcomes distinguished by electricity, heat, or cooling.
- Every record has explicit activation requirements. Heat, ignition, light, electricity, cooling, and no activation are not interchangeable. Oxygen atmosphere is required only where explicitly scoped; an O2 reactant remains necessary when present in the equation.
- Brown gas is sourced NO2; greenish-yellow gas is chlorine. A gas symbol alone does not imply visible colored smoke. The blue copper hydroxide and yellow lead iodide precipitates have source-supported colors. Hex colors are schematic representations, not measured spectral values.
- Ammonium nitrate dissolution absorbs heat but is not marked freezing. Water freezing is a separate physical process requiring cooling, with latent-heat release explained. Other physical entries are boiling, melting, dry-ice sublimation, and sucrose dissolution. Mist above boiling water is labeled condensed droplets, not visible water vapor.
- Combustion scenarios show water vapor before condensation even when a thermochemical source tabulates the liquid endpoint. No numerical enthalpy is copied across that phase change.
- Industrial examples retain qualifiers such as molten salt, vapor removal, or slow uncatalyzed reaction. They are qualitative overall textbook changes, not instructions, recipes, or quantitative kinetics predictions. Equilibrium directions explicitly do not promise complete conversion.

## Validation and review status

The Python builder validates all 111 scenarios for atom and charge conservation, positive coefficients, source resolution, and unique elemental-selection mapping before publishing. The production engine test suite passed **126 reaction tests**, including execution of every scenario with its stated activation/atmosphere and rejection of extra ingredients. Parent integration tests are recorded separately.

The source audit is AI-assisted, with independent supplemental curation and integration review. **External chemistry-teacher review is pending.** Missing combinations still mean “not modeled,” not “no reaction.” This library is intentionally curated and finite, rather than a general-purpose chemical prediction engine.
