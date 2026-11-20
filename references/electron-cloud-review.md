# Electron cloud model — 1.3.0

Model 2026.11.20.1. References checked 2026-11-20 UTC. This is implementation/AI consistency review; external teacher review remains pending.

The repeated shell diagram is replaced by a probability cloud for one real orbital. Neutral-atom configurations remain the existing PubChem/NIST snapshot; noble-gas cores expand from those records, not from a new filling-rule generator. All 118 totals and principal-shell populations match the existing data; Cr/Cu exceptions and NIST Lr 7p1 are retained. No per-m orbital occupancy is inferred from a subshell total. Unoccupied s/p/d/f types are clearly labeled shape guides.

## Derivation and primary sources

- [OpenStax Chemistry 2e §6.3](https://openstax.org/books/chemistry-2e/pages/6-3-development-of-quantum-theory): probability interpretation, radial/angular nodes, orbital counts and shapes. No images or prose were copied.
- [TU Delft Introduction to Quantum Mechanics, hydrogen wavefunctions](https://interactivetextbooks.tudelft.nl/introduction-to-quantum-mechanics/content/equationsandconstants.html): radial wavefunctions and spherical harmonics. The renderer samples rho² exp(−rho) rho^(2l) [L_(n−l−1)^(2l+1)(rho)]², rho = 2r/(n a0), with angular distribution |Y_lm(real)|². Generalized Laguerre and associated Legendre recurrences are implemented locally.
- [MOPAC real spherical harmonics](https://openmopac.net/Manual/real_spherical_harmonics.html): real-orbital orientation forms and naming. Overall sign is immaterial for probability. Numerical normalization checks use the recurrence, not a transcription of table coefficients.

Seeded samples are repeatable. Radial CDFs use 1800 trapezoidal intervals up to rho=10n+20; display scale uses the 99.5% radial quantile. Outlying points may clip at the view edge; the UI explicitly disclaims a hard boundary. All models use hydrogen-like radial functions, not effective-Z fitting or many-electron calculations. Each orbital is scaled separately, so relative radii are not physical comparisons. Type color is not phase or charge. Summed density of a filled subshell is spherical; individual lobe patterns are not presented as whole-atom densities.

## Validation

Six focused model checks: all 118 configuration totals/shell counts; Cr/Cu/Lr cases and malformed data; numerical unit normalization of all 16 real s/p/d/f functions and p_x/p_y orthogonality; p/d/f angular and 2s radial nodes; sampled hydrogen radial mean and p_z angular second moment; finite high-n samples, repeatability and invalid quantum-number rejection. Full application checks and build pass. Browser review covers colored p/d/f clouds, keyboard rotation, rotation start/pause, 390px mobile layout without horizontal overflow, and absence of repeated shell rings in the detail tab.

Sources/configuration panel retains dataset version/date and original configuration status, including predicted records. Runtime selection uses packaged data and local math, with no third-party chemistry request.
