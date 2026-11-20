import type { ReactionLibrary, ReactionResult, Substance } from './types';

const effects = new Set(['heat', 'flame', 'gas', 'steam', 'solid', 'toxic', 'blast', 'cooling']);
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const positiveInteger = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) > 0;

/** Validate the complete snapshot without changing it. Drafts remain valid records but cannot run. */
export function validateLibrary(library: ReactionLibrary): string[] {
  const errors: string[] = [];
  if (!record(library)) return ['Library must be an object.'];
  for (const key of ['version', 'updatedAt']) {
    if (!nonempty(library[key as keyof ReactionLibrary])) errors.push(`Library ${key} is required.`);
  }
  const collections = ['substances', 'sources', 'reactions'] as const;
  for (const key of collections) {
    if (!Array.isArray(library[key])) errors.push(`Library ${key} must be an array.`);
  }
  if (errors.some(error => error.includes('must be an array'))) return errors;
  const ids = new Map<string, Set<string>>();
  for (const key of collections) {
    const seen = new Set<string>();
    ids.set(key, seen);
    for (const item of library[key]) {
      if (!record(item) || !nonempty(item.id)) { errors.push(`${key}: every record needs an ID.`); continue; }
      if (seen.has(item.id)) errors.push(`${key}: duplicate ID ${item.id}.`);
      seen.add(item.id);
    }
  }
  const substances = new Map<string, Substance>();
  for (const item of library.substances) {
    if (!record(item)) continue;
    const label = `Substance ${item.id}`;
    for (const key of ['name', 'formula', 'state'] as const) {
      if (!nonempty(item[key])) errors.push(`${label}: ${key} is required.`);
    }
    if (!Number.isSafeInteger(item.charge)) errors.push(`${label}: charge must be an integer.`);
    if (!record(item.composition) || !Object.keys(item.composition).length ||
        Object.entries(item.composition).some(([symbol, count]) => !/^[A-Z][a-z]?$/.test(symbol) || !positiveInteger(count))) {
      errors.push(`${label}: composition needs element symbols and positive integer atom counts.`);
    } else if (Number.isSafeInteger(item.charge)) substances.set(item.id, item);
    if (item.elementZ !== undefined && (!positiveInteger(item.elementZ) || item.elementZ > 118)) errors.push(`${label}: invalid elementZ.`);
  }
  for (const source of library.sources) {
    if (!record(source)) continue;
    for (const key of ['name', 'url', 'retrievedAt'] as const) {
      if (!nonempty(source[key])) errors.push(`Source ${source.id}: ${key} is required.`);
    }
    if (typeof source.url === 'string') {
      try { if (!['https:', 'http:'].includes(new URL(source.url).protocol)) throw new Error(); }
      catch { errors.push(`Source ${source.id}: URL must be an HTTP(S) link.`); }
    }
    if (source.upstreamDate !== null && !nonempty(source.upstreamDate)) errors.push(`Source ${source.id}: upstreamDate must be a date label or null.`);
  }
  for (const reaction of library.reactions) {
    if (!record(reaction)) continue;
    const label = `Reaction ${reaction.id}`;
    for (const key of ['title', 'conditionLabel', 'explanation'] as const) {
      if (!nonempty(reaction[key])) errors.push(`${label}: ${key} is required.`);
    }
    if (!['ambient', 'activation'].includes(reaction.condition)) errors.push(`${label}: invalid condition.`);
    if (!['reaction', 'no-reaction'].includes(reaction.outcome)) errors.push(`${label}: invalid outcome.`);
    if (!['source-checked', 'draft'].includes(reaction.reviewStatus)) errors.push(`${label}: invalid review status.`);
    if (!Array.isArray(reaction.effects) || reaction.effects.some(effect => !effects.has(effect))) errors.push(`${label}: invalid effects.`);
    if (!Array.isArray(reaction.observations) || reaction.observations.some(value => !nonempty(value))) errors.push(`${label}: invalid observations.`);
    if (!Array.isArray(reaction.sourceIds) || !reaction.sourceIds.length || reaction.sourceIds.some(id => !ids.get('sources')!.has(id)) || new Set(reaction.sourceIds).size !== reaction.sourceIds.length) {
      errors.push(`${label}: source references must be present, unique, and resolve.`);
    }
    let validSides = true;
    for (const side of ['reactants', 'products'] as const) {
      const terms = reaction[side];
      if (!Array.isArray(terms) || (side === 'reactants' && !terms.length) || (side === 'products' && reaction.outcome === 'reaction' && !terms.length)) {
        errors.push(`${label}: invalid ${side}.`); validSides = false; continue;
      }
      const seen = new Set<string>();
      for (const term of terms) {
        if (!record(term) || !nonempty(term.id) || !substances.has(term.id) || !positiveInteger(term.coefficient) || seen.has(term.id)) {
          errors.push(`${label}: ${side} need unique known substances and positive integer coefficients.`); validSides = false;
        }
        if (record(term) && typeof term.id === 'string') seen.add(term.id);
      }
    }
    if (!validSides) continue;
    if (reaction.outcome === 'no-reaction') {
      if (reaction.products.length && (reaction.products.length !== reaction.reactants.length || reaction.products.some(product => !reaction.reactants.some(reactant => reactant.id === product.id && reactant.coefficient === product.coefficient)))) {
        errors.push(`${label}: no-reaction products must be empty or unchanged.`);
      }
      continue;
    }
    const totals = new Map<string, bigint>();
    let charge = 0n;
    for (const [side, sign] of [[reaction.reactants, 1n], [reaction.products, -1n]] as const) {
      for (const term of side) {
        const substance = substances.get(term.id)!;
        const factor = BigInt(term.coefficient) * sign;
        charge += BigInt(substance.charge) * factor;
        for (const [element, count] of Object.entries(substance.composition)) totals.set(element, (totals.get(element) ?? 0n) + BigInt(count) * factor);
      }
    }
    if ([...totals.values()].some(count => count !== 0n)) errors.push(`${label}: atoms are not balanced.`);
    if (charge !== 0n) errors.push(`${label}: net charge is not balanced.`);
  }
  return errors;
}

/** Ingredient presence only: repeats do not represent amounts, and every ingredient must match. */
export function evaluateReaction(library: ReactionLibrary, selectedIds: string[], activated: boolean): ReactionResult {
  if (!Array.isArray(selectedIds) || selectedIds.some(id => !nonempty(id)) || typeof activated !== 'boolean') {
    return { kind: 'invalid', message: 'Select valid substance IDs and an activation state.' };
  }
  const errors = validateLibrary(library);
  if (errors.length) return { kind: 'invalid', message: `Reaction library is invalid: ${errors.join(' ')}` };
  const selected = new Set(selectedIds);
  const known = new Set(library.substances.map(substance => substance.id));
  if ([...selected].some(id => !known.has(id))) return { kind: 'invalid', message: 'A selected substance is unknown.' };
  if (!selected.size) return { kind: 'invalid', message: 'Add at least one substance.' };
  const matches = library.reactions.filter(reaction => reaction.reviewStatus === 'source-checked' && reaction.reactants.length === selected.size && reaction.reactants.every(term => selected.has(term.id)));
  // Prefer the scenario for the current condition, then report a missing activation if needed.
  const eligible = matches.filter(reaction => reaction.condition === (activated ? 'activation' : 'ambient'));
  const fallback = matches.filter(reaction => reaction.condition === (activated ? 'ambient' : 'activation'));
  const candidates = eligible.length ? eligible : fallback;
  if (candidates.length > 1) return { kind: 'invalid', message: 'Multiple reviewed scenarios match these ingredients and conditions.' };
  const scenario = candidates[0];
  if (!scenario) return { kind: 'unsupported', message: 'This combination is not modeled yet.' };
  if (scenario.condition === 'activation' && !activated) return { kind: 'missing-condition', scenario };
  return { kind: scenario.outcome, scenario };
}
