import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
const directory = await mkdtemp(join(tmpdir(), 'nuclear-equations-'));
const source = await readFile(new URL('../src/features/isotopes/nuclearDecay.ts', import.meta.url), 'utf8');
await writeFile(join(directory, 'equations.mjs'), ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText);
const { deriveDecayEquations: derive, equationText } = await import(`file://${directory}/equations.mjs`);
await rm(directory, { recursive: true, force: true });
const dataset = JSON.parse(await readFile(new URL('../public/data/explorer.json', import.meta.url), 'utf8'));
const result = (z, a, mode) => derive({ z, a }, mode, dataset.elements);
const equation = (z, a, mode) => result(z, a, mode).equations[0];
const total = (terms, key) => terms.reduce((sum, t) => sum + t[key] * t.count, 0);
const balanced = eq => { for (const key of ['a', 'z']) assert.equal(total(eq.left, key), total(eq.right, key), `${eq.mode}: ${key}`); };
test('canonical parent/daughter identities and beta lepton signs', () => {
  for (const [z, a, mode, daughter, symbols] of [
    [6, 14, 'B-', ['N', 14, 7], ['e⁻', 'ν̅ₑ']],
    [92, 238, 'A', ['Th', 234, 90], ['He']],
    [11, 22, 'B+', ['Ne', 22, 10], ['e⁺', 'νₑ']],
    [4, 7, 'EC', ['Li', 7, 3], ['νₑ']],
    [3, 9, 'B-N', ['Be', 8, 4], ['e⁻', 'ν̅ₑ', 'n']],
    [12, 22, 'B+P', ['Ne', 21, 10], ['e⁺', 'νₑ', 'p']],
  ]) {
    const eq = equation(z, a, mode);
    assert.deepEqual([eq.right[0].symbol, eq.right[0].a, eq.right[0].z], daughter);
    assert.deepEqual(eq.right.slice(1).map(t => t.symbol), symbols); balanced(eq);
  }
  assert.equal(equation(4, 7, 'EC').left[1].symbol, 'e⁻');
});
test('supported delayed, double, nucleon and explicit cluster modes conserve A and charge', () => {
  for (const mode of ['N','P','2N','2P','2B-','2B+','2EC','B-2N','B-7N','B-A','B-P','B+A','B+2P','ECP','EC2P','ECA','14C','24NE','34SI','{+22}Ne','{+24}Ne','{+25}Ne','{+34}Si']) {
    const eq = equation(92, 238, mode); assert.ok(eq, mode); balanced(eq);
  }
  assert.equal(equation(92, 238, '2EC').left[1].count, 2);
  assert.equal(equation(92, 238, '2B-').right.find(t => t.symbol === 'ν̅ₑ').count, 2);
});
test('combined modes are alternatives, fission is schematic, state and unknown codes are honest', () => {
  assert.deepEqual(result(11, 22, 'EC+B+').equations.map(eq => eq.mode), ['EC','B+']);
  assert.deepEqual(result(92, 238, 'SF+EC+B+').equations.map(eq => eq.mode), ['SF','EC','B+']);
  for (const mode of ['SF','B-SF','ECSF']) {
    const eq = equation(92, 238, mode); assert.match(eq.schematic, /fragments/); assert.ok(eq.right.every(t => t.a === 0)); assert.match(eq.note, /not supplied/);
  }
  for (const mode of ['IT','Mg','UNKNOWN']) { assert.equal(result(92, 238, mode).equations.length, 0); assert.ok(result(92, 238, mode).unavailable); }
  assert.ok(result(118, 294, 'B-').unavailable);
  assert.equal(equation(1, 2, 'P').right[0].symbol, 'n');
  assert.match(equationText(equation(6,14,'B-')), /Carbon-14.*Nitrogen-14.*antineutrino/);
});
test('every exact equation generated for the packaged snapshot conserves nucleons and electric charge', () => {
  let count = 0;
  for (const isotope of dataset.isotopes) for (const mode of isotope.decayModes) for (const eq of derive(isotope, mode, dataset.elements).equations) {
    if (!eq.schematic) { balanced(eq); count++; }
  }
  assert.ok(count > 3000);
});
