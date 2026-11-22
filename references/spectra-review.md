# Absorption and emission tab review

Candidate: `2026.11.22-nist-handbook.1`, local implementation, 22 November 2026 UTC.

Disposition: ready within the source-selection and automated-check scope below. External teacher review remains pending. Browser visual verification was unavailable because the browser access host was unavailable. This note does not claim a new published deployment.

## Data and validation

- 118 element identities; 99 neutral-atom reference tables (Z = 1–99).
- 1,298 source-assigned wavelengths, including 528 in the display interval 380–780 nm.
- Ten wavelengths lack assigned lower/upper states. Those rows remain visible with an unavailable-state message and no fabricated energy arrows.
- Source component state pairs with no wavelength are excluded; neighboring wavelengths are not reused.
- Raw-source SHA-256 hashes, retrieval timestamps, source URLs and output checksum are retained in `data/manifests/spectra-manifest.json`.
- Import validation checks neutral table headers, paired states when supplied, numeric qualifiers, positive level separations and wavelength/level consistency within 0.2%. This tolerance accommodates air wavelengths, rounded levels and blends; it is not an uncertainty claim.
- All source wavelength display precision is retained through decimal Å-to-nm conversion. Numeric values support plot positions; display strings preserve significant trailing zeros.

## Scientific sampling

Hydrogen H-alpha at 656.27110 nm maps the NIST 2p, ²P°, J=1/2 lower state (82258.9191 cm⁻¹) to 3d, ²D, J=3/2 (97492.3195 cm⁻¹). The 588.9950 and 589.5924 nm sodium D lines are present. Carbon has 21 reference wavelengths and no visible lines in this selected table; the panel defaults to its UV/IR list and states the reference limitation. Cerium includes missing configuration assignments and question-mark energies without inventing them. Praseodymium includes unassigned transitions. Einsteinium has ten reference lines; fermium is explicitly outside the source coverage.

The Handbook’s convention is used: vacuum above 50,000 cm⁻¹ transition wavenumber, air below. This differs from modern ASD’s infrared display convention, so the UI identifies the medium per line. No photon energies are computed from an air wavelength as if it were vacuum.

Absorption uses lower → upper; emission uses upper → lower. The selected two-level diagram also uses vertical upward/downward arrows. Term, J and source energies distinguish states; many-electron transitions are not replaced by a guessed principal-shell jump. Source blanks and question marks remain explicit.

## Display and scope

Black absorption notches and approximate RGB emission marks share the same 380–780 nm axis. Marks have illustrative equal widths/brightness and may overlap for unresolved fine-structure components. Absorption requires population in the lower state, so the paired strips are a transition guide rather than a cold-gas prediction. Neither strip claims a complete spectrum or calibrated line strengths. UV/IR rows use neutral swatches rather than invented visible hues.

The local snapshot is fetched once and cached; selection/hover never calls NIST. Automated checks include source hashes, coverage, energy/wavelength consistency, known lines and state identities, up/down arrows, rendered strip content, unknown-state behavior and base-path-safe loading. The full project suite passes 530 tests; TypeScript and production build pass. No browser-rendered layout result is claimed.

## Display range update

The requested display interval is now 330–830 nm, containing 734 reference lines. The source dataset and its 528 visible-line count (380–780 nm) are unchanged. At the user’s request, the near-UV edge fades from black at 330 nm to violet at 380 nm; the near-IR edge fades from red at 780 nm to black at 830 nm. These edge hues are labeled illustrative, rather than claimed as visible UV/IR colors. Both strips, the range filter and the wavelength axis use the expanded interval. State-pair formatting remains one pair with rightward absorption and leftward emission arrows, and bold term/J labels.
