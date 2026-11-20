import type { Dataset, ElementRecord, IsotopeRecord } from '../../types';

export interface Answer { text: string; feedback: string }
export interface Question {
  id: string; objective: string; kind: 'Recall' | 'Reasoning'; prompt: string;
  answers: Answer[]; correctIndex: number; explanation: string; hints: string[];
  sourceIds: string[]; recordIds: string[];
}
export interface Progress { cursor: number; answers: (number | null)[]; hints: number[] }
export const STORAGE_KEY = 'element-atlas:challenges:v1';
const contentVersion = 'questions-1';

function question(id: string, objective: string, kind: Question['kind'], prompt: string, correct: string, distractors: Answer[], explanation: string, hints: string[], sourceIds: string[], recordIds: string[]): Question {
  const answers = [{ text: correct, feedback: 'That matches the source record and the stated rule.' }, ...distractors];
  const offset = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;
  return { id, objective, kind, prompt, answers: [...answers.slice(offset), ...answers.slice(0, offset)], correctIndex: (4 - offset) % 4, explanation, hints, sourceIds: [...new Set(sourceIds)], recordIds };
}
const wrong = (text: string, feedback: string): Answer => ({ text, feedback });

/** All facts come from the supplied snapshot; absent records omit the activity. */
export function generateQuestions(dataset: Dataset): Question[] {
  const output: Question[] = [];
  const element = (z: number) => dataset.elements.find(record => record.z === z);
  const isotope = (z: number, a: number) => dataset.isotopes.find(record => record.z === z && record.a === a && record.state === 'ground' && record.n === record.a - record.z);
  const refs = (e: ElementRecord) => [`element:${e.z}`];
  const oxygen = element(8);
  if (oxygen) output.push(question('oxygen-protons', 'Atomic number', 'Recall', `${oxygen.name} has atomic number Z = ${oxygen.z}. How many protons are in its nucleus?`, String(oxygen.z), [wrong('16', 'An isotope mass number counts protons and neutrons together.'), wrong('4', 'Atomic number is not half the proton count.'), wrong('0', 'A neutral atom has balanced charge; its nucleus still contains protons.')], `Atomic number Z is the number of protons. ${oxygen.name} has Z = ${oxygen.z}, so it has ${oxygen.z} protons.`, ['Z describes the nucleus.', 'Proton count equals Z, without a calculation.'], oxygen.sourceIds, refs(oxygen)));
  const sodium = element(11);
  if (sodium) output.push(question('sodium-symbol', 'Chemical symbols', 'Recall', `Which symbol identifies ${sodium.name.toLowerCase()} in this periodic table?`, sodium.symbol, [wrong('S', 'S is the symbol for sulfur, not sodium.'), wrong('Sn', 'Sn identifies tin.'), wrong('N', 'N identifies nitrogen.')], `The element record links ${sodium.name} to the symbol ${sodium.symbol}. Symbols are case sensitive.`, ['A symbol may come from a historical or Latin name.', 'Sodium’s symbol has two letters; the second is lowercase.'], sodium.sourceIds, refs(sodium)));
  const carbon = element(6), c12 = isotope(6, 12), c14 = isotope(6, 14);
  if (carbon && c14 && c14.n === c14.a - c14.z) output.push(question('carbon-neutrons', 'Neutron calculation', 'Reasoning', `${carbon.name}-${c14.a} has A = ${c14.a} and Z = ${c14.z}. How many neutrons does it have?`, String(c14.n), [wrong('14', 'A counts both protons and neutrons, not neutrons alone.'), wrong('6', 'Z counts protons. Neutrons are A − Z.'), wrong('20', 'Adding A and Z counts the protons twice.')], `N = A − Z = ${c14.a} − ${c14.z} = ${c14.n} neutrons. A labels this isotope; it is not the element’s standard atomic weight.`, ['Mass number A counts protons + neutrons.', 'Subtract the proton count Z from A.'], [...carbon.sourceIds, ...c14.sourceIds], [...refs(carbon), c14.id]));
  if (carbon && c12 && c14) output.push(question('carbon-isotopes', 'Isotope identity', 'Reasoning', `Compare ${carbon.name}-${c12.a} and ${carbon.name}-${c14.a}. What changes between their nuclei?`, `${c14.n - c12.n} more neutrons in ${carbon.name}-${c14.a}`, [wrong('2 more protons in carbon-14', 'Changing the proton count changes the element; both records have Z = 6.'), wrong('2 fewer neutrons in carbon-14', 'The larger mass number has more neutrons when Z stays fixed.'), wrong('No change in the nucleus', 'These isotope records have different mass numbers and neutron counts.')], `Both have Z = ${c12.z}. Their neutron counts are ${c12.n} and ${c14.n}; the difference is ${c14.n - c12.n}. Isotopes of one element share their proton count.`, ['Compare Z first, then compare A.', 'With the same proton count, a change in A is a change in neutron count.'], [...c12.sourceIds, ...c14.sourceIds], [c12.id, c14.id]));
  const statusQuestion = (iso: IsotopeRecord, name: string) => {
    const labels = ['Stable', 'Radioactive', 'Unknown / unavailable', 'Determined by chemical toxicity'];
    const correct = iso.status === 'stable' ? labels[0] : iso.status === 'radioactive' ? labels[1] : labels[2];
    output.push(question(`stability-${iso.id}`, 'Nuclear stability', 'Recall', `How is ground-state ${name}-${iso.a} classified in this local nuclear dataset?`, correct, labels.filter(label => label !== correct).map(label => wrong(label, label === labels[3] ? 'Chemical toxicity and nuclear radioactivity describe different properties.' : 'Use the explicit stability field. A missing time half-life alone does not establish stability.')), `The ${iso.id} record explicitly says “${iso.status}”. ${iso.status === 'stable' ? 'A stable record has no measured decay half-life to display.' : iso.status === 'radioactive' ? `Its displayed time half-life is ${iso.halfLife ?? 'unavailable; the stability classification remains radioactive'}.` : 'Unavailable information must remain unknown.'}`, ['Read the nuclear stability classification, not a chemical hazard label.', 'An empty half-life is not a zero half-life and does not imply stable.'], iso.sourceIds, [iso.id]));
  };
  if (c12) statusQuestion(c12, carbon?.name ?? 'Carbon');
  if (c14) statusQuestion(c14, carbon?.name ?? 'Carbon');
  const shellQuestion = (e: ElementRecord, exception = false) => {
    const shells = e.shells;
    if (!shells?.length || !shells.every(count => Number.isInteger(count) && count >= 0) || shells.reduce((sum, count) => sum + count, 0) !== e.z || !e.configuration) return;
    const count = shells[shells.length - 1];
    const choices = [count + 1, count + 2, count + 3];
    output.push(question(`outer-shell-${e.z}`, exception ? 'Configuration exceptions' : 'Shell populations', 'Reasoning', `${e.name} has sourced neutral configuration ${e.configuration}. How many electrons occupy its highest principal shell (largest n)?`, String(count), choices.map(value => wrong(String(value), 'Count only electrons with the largest principal quantum number n; do not add electrons from a lower shell.')), `The sourced shell populations, inner to outer, are ${shells.join(', ')}. The highest occupied shell has ${count} electron${count === 1 ? '' : 's'}.${exception ? ' Chromium’s sourced configuration is an exception to the simple filling-order prediction: use the record rather than assuming 4s². The 3d electrons belong to n = 3.' : ''} Rings are a simplified model, not electron paths.`, ['The leading number in an orbital label is its principal shell n.', `The highest occupied principal shell is n = ${shells.length}.`], e.electronSourceIds, refs(e)));
  };
  if (sodium) shellQuestion(sodium);
  const chromium = element(24); if (chromium) shellQuestion(chromium, true);
  const chlorine = element(17);
  if (chlorine) output.push(question('neutral-chlorine', 'Neutral atom charge', 'Reasoning', `A neutral ${chlorine.name.toLowerCase()} atom has Z = ${chlorine.z}. How many electrons does it have?`, String(chlorine.z), [wrong('18', 'One extra electron would make a negative ion, not a neutral atom.'), wrong('16', 'One fewer electron would make a positive ion.'), wrong('0', 'Neutral means total positive and negative charge balance, not no charged particles.')], `A neutral atom has the same number of electrons and protons: ${chlorine.z}. Changing isotopes changes neutron count, not this neutral-atom electron count.`, ['Each proton has +1 charge; each electron has −1 charge.', 'For zero net charge, the two counts are equal.'], chlorine.sourceIds, refs(chlorine)));
  if (carbon && c12 && carbon.weightKind === 'standard') output.push(question('mass-v-weight', 'A versus atomic weight', 'Reasoning', `${carbon.name}’s table weight is ${carbon.atomicWeight}; the isotope ${carbon.name}-${c12.a} has A = ${c12.a}. Which value is the mass number of that isotope?`, `A = ${c12.a}`, [wrong(`The table weight ${carbon.atomicWeight}`, 'Standard atomic weight describes the element’s isotopic composition; it is not the integer A of one isotope.'), wrong(`Z = ${carbon.z}`, 'Z is proton count; A counts protons plus neutrons.'), wrong(`N = ${c12.n}`, 'N counts neutrons only.')], `For ${carbon.name}-${c12.a}, A = Z + N = ${c12.z} + ${c12.n} = ${c12.a}. The standard atomic weight and an isotope mass number describe different quantities.`, ['An isotope’s name ends with its integer mass number.', 'Mass number A counts the particles in this isotope’s nucleus.'], [...carbon.sourceIds, ...c12.sourceIds], [...refs(carbon), c12.id]));
  return output.filter(q => q.answers.length === 4 && new Set(q.answers.map(a => a.text)).size === 4 && q.sourceIds.length > 0 && q.sourceIds.every(id => dataset.sources.some(source => source.id === id)));
}

export function freshProgress(questions: Question[]): Progress { return { cursor: 0, answers: questions.map(() => null), hints: questions.map(() => 0) }; }
function signature(dataset: Dataset, questions: Question[]): string { return JSON.stringify([contentVersion, dataset.version, questions]); }
export function serializeProgress(dataset: Dataset, questions: Question[], progress: Progress): string { return JSON.stringify({ signature: signature(dataset, questions), progress }); }
export function restoreProgress(raw: string | null, dataset: Dataset, questions: Question[]): Progress {
  const fresh = freshProgress(questions);
  try {
    const saved = JSON.parse(raw ?? 'null');
    if (saved?.signature !== signature(dataset, questions)) return fresh;
    const p = saved.progress as Progress;
    if (!p || !Number.isInteger(p.cursor) || p.cursor < 0 || p.cursor > questions.length || !Array.isArray(p.answers) || !Array.isArray(p.hints) || p.answers.length !== questions.length || p.hints.length !== questions.length) return fresh;
    if (!p.answers.every((answer, i) => (answer === null || Number.isInteger(answer) && answer >= 0 && answer < 4) && (i < p.cursor ? answer !== null : i > p.cursor ? answer === null : true))) return fresh;
    if (!p.hints.every((hint, i) => Number.isInteger(hint) && hint >= 0 && hint <= questions[i].hints.length && (i <= p.cursor || hint === 0))) return fresh;
    return { cursor: p.cursor, answers: [...p.answers], hints: [...p.hints] };
  } catch { return fresh; }
}
export function scoreProgress(questions: Question[], progress: Progress): number { return questions.reduce((score, q, i) => score + (progress.answers[i] === q.correctIndex ? 1 : 0), 0); }
