import type { ElementRecord } from '../../types';

export interface NuclearTerm { a: number; z: number; symbol: string; name: string; count: number }
export interface DecayEquation { mode: string; left: NuclearTerm[]; right: NuclearTerm[]; schematic?: string; note?: string }
export interface DecayResult { equations: DecayEquation[]; unavailable?: string }
const particle = (a: number, z: number, symbol: string, name: string, count = 1): NuclearTerm => ({ a, z, symbol, name, count });
const electron = (count = 1) => particle(0, -1, 'e⁻', 'electron', count);
const positron = (count = 1) => particle(0, 1, 'e⁺', 'positron', count);
const neutrino = (anti = false, count = 1) => particle(0, 0, anti ? 'ν̅ₑ' : 'νₑ', anti ? 'electron antineutrino' : 'electron neutrino', count);
const neutron = (count = 1) => particle(1, 0, 'n', 'neutron', count);
const proton = (count = 1) => particle(1, 1, 'p', 'proton', count);
const alpha = () => particle(4, 2, 'He', 'helium-4 nucleus (alpha particle)');

/** Derive net nucleon/charge bookkeeping, not a level scheme or decay-energy prediction. */
export function deriveDecayEquations(parent: { a: number; z: number }, mode: string, elements: ElementRecord[]): DecayResult {
  const nuclide = (a: number, z: number): NuclearTerm | undefined => {
    if (!Number.isInteger(a) || !Number.isInteger(z) || a < 1 || z < 0 || z > a) return;
    if (z === 0) return a === 1 ? neutron() : undefined;
    const element = elements.find(item => item.z === z);
    return element ? particle(a, z, element.symbol, `${element.name}-${a}`) : undefined;
  };
  const original = nuclide(parent.a, parent.z);
  const unavailable = (reason: string): DecayResult => ({ equations: [], unavailable: reason });
  if (!original) return unavailable('Equation unavailable: parent nuclide is outside the supported element data.');
  if (mode === 'EC+B+' || mode === 'SF+EC+B+') {
    const alternatives = (mode === 'EC+B+' ? ['EC', 'B+'] : ['SF', 'EC', 'B+']).map(code => deriveDecayEquations(parent, code, elements));
    return { equations: alternatives.flatMap(result => result.equations), unavailable: alternatives.find(result => result.unavailable)?.unavailable };
  }
  if (mode === 'IT') return unavailable('Isomeric transition changes nuclear excitation, not A or Z. This ground-state snapshot does not specify the excited parent and final level; a state-resolved equation is unavailable.');
  const left = [original];
  const emitted: NuclearTerm[] = [];
  let remaining = mode;
  if (remaining.startsWith('2B-')) { emitted.push(electron(2), neutrino(true, 2)); remaining = remaining.slice(3); }
  else if (remaining.startsWith('2B+')) { emitted.push(positron(2), neutrino(false, 2)); remaining = remaining.slice(3); }
  else if (remaining.startsWith('2EC')) { left.push(electron(2)); emitted.push(neutrino(false, 2)); remaining = remaining.slice(3); }
  else if (remaining.startsWith('B-')) { emitted.push(electron(), neutrino(true)); remaining = remaining.slice(2); }
  else if (remaining.startsWith('B+')) { emitted.push(positron(), neutrino()); remaining = remaining.slice(2); }
  else if (remaining.startsWith('EC')) { left.push(electron()); emitted.push(neutrino()); remaining = remaining.slice(2); }
  if (remaining === 'SF') {
    const total = (terms: NuclearTerm[], key: 'a' | 'z') => terms.reduce((sum, term) => sum + term[key] * term.count, 0);
    const a = total(left, 'a') - total(emitted, 'a');
    const z = total(left, 'z') - total(emitted, 'z');
    return { equations: [{ mode, left, right: emitted, schematic: 'Σ fragments + k n', note: `Schematic fission: fragment identities and neutron count k are not supplied. ΣA(fragment) + k = ${a}; ΣZ(fragment) = ${z}.` }] };
  }
  if (remaining === 'A') emitted.push(alpha());
  else if (/^\d*[NP]$/.test(remaining)) {
    const count = Number(remaining.slice(0, -1) || 1);
    if (count < 1) return unavailable('Equation unavailable for this source code.');
    emitted.push(remaining.endsWith('N') ? neutron(count) : proton(count));
  } else if (remaining) {
    // IAEA source forms include 14C, 24NE and ENSDF-style {+22}Ne.
    const cluster = remaining.match(/^(?:\{\+(\d+)\}|(\d+))([A-Za-z]+)$/);
    const clusterElement = cluster && elements.find(item => item.symbol.toLowerCase() === cluster[3].toLowerCase());
    const term = clusterElement && nuclide(Number(cluster![1] || cluster![2]), clusterElement.z);
    if (!term) return unavailable('Equation unavailable: this source code does not specify a supported decay or an unambiguous emitted cluster mass.');
    emitted.push(term);
  } else if (!emitted.length) return unavailable('Equation unavailable for this source code.');
  const total = (terms: NuclearTerm[], key: 'a' | 'z') => terms.reduce((sum, term) => sum + term[key] * term.count, 0);
  const daughter = nuclide(total(left, 'a') - total(emitted, 'a'), total(left, 'z') - total(emitted, 'z'));
  if (!daughter) return unavailable('Equation unavailable: the derived daughter is outside the supported nuclide range.');
  return { equations: [{ mode, left, right: [daughter, ...emitted], ...(mode.startsWith('2') && /B|EC/.test(mode) ? { note: 'Conventional two-neutrino form; the source mode alone does not identify a detailed mechanism.' } : {}) }] };
}

export function equationText(equation: DecayEquation): string {
  const terms = (items: NuclearTerm[]) => items.map(item => `${item.count > 1 ? `${item.count} × ` : ''}${item.name} (A ${item.a}, charge ${item.z})`).join(' + ');
  return `${terms(equation.left)} → ${equation.schematic ? `${equation.schematic}${equation.right.length ? ' + ' : ''}` : ''}${terms(equation.right)}`;
}
