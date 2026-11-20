import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';

const directory = await mkdtemp(join(tmpdir(), 'chemistry-challenges-'));
const source = await readFile(new URL('../src/features/challenges/questions.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
await writeFile(join(directory, 'questions.mjs'), compiled);
const { generateQuestions, freshProgress, serializeProgress, restoreProgress, scoreProgress } = await import(`file://${directory}/questions.mjs`);
await rm(directory, { recursive: true, force: true });
const dataset = JSON.parse(await readFile(new URL('../public/data/explorer.json', import.meta.url), 'utf8'));
const questions = generateQuestions(dataset);
const correct = id => { const q = questions.find(q => q.id === id); assert.ok(q, id); return q.answers[q.correctIndex].text; };

test('published snapshot yields ten deterministic, unique, source-linked four-answer activities', () => {
  assert.equal(questions.length, 10);
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
  assert.deepEqual(generateQuestions(dataset), questions);
  for (const q of questions) {
    assert.equal(q.answers.length, 4);
    assert.equal(new Set(q.answers.map(a => a.text)).size, 4);
    assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4);
    assert.equal(q.hints.length, 2);
    assert.ok(q.answers.every(a => a.feedback.length > 10));
    assert.ok(q.sourceIds.length && q.sourceIds.every(id => dataset.sources.some(s => s.id === id)));
    assert.ok(q.recordIds.every(id => id.startsWith('element:') ? dataset.elements.some(e => `element:${e.z}` === id) : dataset.isotopes.some(i => i.id === id)));
  }
});
test('answer keys use source fields and checked nuclear and electron arithmetic', () => {
  const carbon14 = dataset.isotopes.find(i => i.z === 6 && i.a === 14 && i.state === 'ground');
  assert.equal(correct('oxygen-protons'), String(dataset.elements.find(e => e.z === 8).z));
  assert.equal(correct('sodium-symbol'), dataset.elements.find(e => e.z === 11).symbol);
  assert.equal(correct('carbon-neutrons'), String(carbon14.a - carbon14.z));
  assert.equal(correct('stability-6-12-gs'), 'Stable');
  assert.equal(correct('stability-6-14-gs'), 'Radioactive');
  assert.equal(correct('outer-shell-11'), String(dataset.elements.find(e => e.z === 11).shells.at(-1)));
  assert.equal(correct('outer-shell-24'), '1');
  assert.equal(correct('neutral-chlorine'), '17');
  assert.equal(correct('mass-v-weight'), 'A = 12');
  assert.match(correct('carbon-isotopes'), /^2 more neutrons/);
});
test('a missing time half-life does not change radioactive classification', () => {
  const altered = structuredClone(dataset);
  altered.isotopes.find(i => i.id === '6-14-gs').halfLife = null;
  const q = generateQuestions(altered).find(q => q.id === 'stability-6-14-gs');
  assert.equal(q.answers[q.correctIndex].text, 'Radioactive');
  assert.match(q.explanation, /unavailable/);
});
test('unavailable or inconsistent source data omit affected activities safely', () => {
  assert.deepEqual(generateQuestions({ ...dataset, elements: [], isotopes: [] }), []);
  assert.deepEqual(generateQuestions({ ...dataset, sources: [] }), []);
  const altered = structuredClone(dataset);
  altered.elements.find(e => e.z === 24).shells = [2, 8, 12, 1];
  altered.isotopes.find(i => i.id === '6-14-gs').n = 999;
  const ids = generateQuestions(altered).map(q => q.id);
  assert.ok(!ids.includes('outer-shell-24'));
  assert.ok(!ids.includes('carbon-neutrons'));
});
test('generation leaves a frozen snapshot unchanged', () => {
  const before = JSON.stringify(dataset);
  const freeze = obj => { if (obj && typeof obj === 'object') { Object.values(obj).forEach(freeze); Object.freeze(obj); } return obj; };
  freeze(dataset);
  assert.deepEqual(generateQuestions(dataset), questions);
  assert.equal(JSON.stringify(dataset), before);
});
test('progress restores an answered question and hints without changing its score', () => {
  const progress = freshProgress(questions);
  progress.answers[0] = questions[0].correctIndex;
  progress.hints[0] = 2;
  assert.equal(scoreProgress(questions, progress), 1);
  assert.deepEqual(restoreProgress(serializeProgress(dataset, questions, progress), dataset, questions), progress);
  progress.cursor = 1;
  progress.answers[1] = (questions[1].correctIndex + 1) % 4;
  progress.hints[1] = 1;
  assert.equal(scoreProgress(questions, progress), 1);
  assert.deepEqual(restoreProgress(serializeProgress(dataset, questions, progress), dataset, questions), progress);
});
test('completed sessions restore, reset has no answers, score is derived from choices', () => {
  const progress = { cursor: questions.length, answers: questions.map(q => q.correctIndex), hints: questions.map(() => 2) };
  const loaded = restoreProgress(serializeProgress(dataset, questions, progress), dataset, questions);
  assert.deepEqual(loaded, progress);
  assert.equal(scoreProgress(questions, loaded), questions.length);
  const fresh = freshProgress(questions);
  assert.equal(scoreProgress(questions, fresh), 0);
  assert.ok(fresh.answers.every(a => a === null));
  assert.ok(fresh.hints.every(h => h === 0));
});
test('missing, corrupt, stale, invalid and out-of-order saved progress restart safely', () => {
  const fresh = freshProgress(questions);
  for (const raw of [null, '', '{', 'null', '[]', '{}']) assert.deepEqual(restoreProgress(raw, dataset, questions), fresh);
  const valid = serializeProgress(dataset, questions, fresh);
  assert.deepEqual(restoreProgress(valid, { ...dataset, version: 'next' }, questions), fresh);
  assert.deepEqual(restoreProgress(valid, dataset, questions.map((q, i) => i ? q : { ...q, explanation: 'Changed content' })), fresh);
  for (const change of [
    p => { p.cursor = -1; }, p => { p.cursor = questions.length + 1; }, p => { p.cursor = 1; },
    p => { p.cursor = 0.5; }, p => { p.answers[0] = 4; }, p => { p.answers[0] = '0'; },
    p => { p.answers[0] = -1; }, p => { p.answers = []; }, p => { p.answers[2] = 0; },
    p => { p.hints = null; }, p => { p.hints[0] = 3; }, p => { p.hints[3] = 1; },
  ]) {
    const saved = JSON.parse(valid); change(saved.progress);
    assert.deepEqual(restoreProgress(JSON.stringify(saved), dataset, questions), fresh);
  }
});
