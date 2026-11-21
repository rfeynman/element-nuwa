# Tabletop game interface update — 2026-11-20

The periodic table now hosts a shared reaction can in its central open area. The separate ElementPairs page is not mounted. The underlying 433-entry snapshot is unchanged.

Activation is computed from exact reviewed, modeled ingredient records. A unique activation/atmosphere combination starts automatically; multiple supported combinations open a chooser. Multiple compatible product outcomes remain a separate explicit choice. Unsupported ingredient forms and equation-only records cannot run. Required atmospheres are applied as modeled; atmospheric gas is never invented as an ingredient.

The game shares its ingredients and result with the extended lab below. The table can supports dropping tiles, adding the selected tile with a button, removing ingredients, reset, replay, and motion controls. Nonmodal condition/discovery panels focus their first button, support Escape, and restore focus when closed.

The desktop grid uses viewport-dependent row sizes, with a separate scrolling detail column. It targets common 1280×720 and larger laptop viewports. Narrow screens keep horizontal table scrolling and legible tiles. Browser visual review could not run because the computer-use browser host was unavailable; no screenshot-based fit claim is made.

## Effects

Effects remain finite (3.2 seconds, 250 ms with motion disabled/reduced), cancellable, transparent, and vessel-anchored. Products appear after the effect. The scorch is temporary decoration, not deletion of table elements. White mist means toxicity, not actual gas color. Blue ice means cooling, not necessarily freezing. Overflow/bubbles mean heat release, not necessarily boiling or a liquid mixture.

Flame colors use explicit scenario observations (sodium/chlorine yellow, aluminum/oxygen white, antimony/oxygen bluish-white). Magnesium/oxygen uses the directly checked [WebElements magnesium reaction reference](https://www.webelements.com/magnesium/chemistry.html), retrieved/reviewed 2026-11-20, which describes white combustion emission. No color is inferred merely from a reactant containing a metal ion. Other flames explicitly use an illustrative color. The large Reaction sources & snapshot block was removed at the user's request; source records remain packaged and detailed outcome cards retain references.

Single orbital is the default and first option. Electron-cloud combined mode overlays occupied s/p/d/f types with occupancy weighting and equal orientation averaging at separate display scales. It does not claim an exact many-electron density or coherent wavefunction superposition. Single-orbital controls remain available.

## Verification

Production TypeScript/Vite build and the complete automated suite pass. Added checks cover all modeled activation choices, Al/O alternatives, one-method auto-start data, multiple outcomes, equation-only exclusions, symbolic effect semantics, and combined orbital sampling. Browser connection unavailable; interactive visual verification remains pending.
