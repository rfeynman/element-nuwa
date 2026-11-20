// Synthetic contract fixtures exercise matching and conservation, not scientific review.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';

const directory = await mkdtemp(join(tmpdir(), 'reaction-engine-'));
const source = await readFile(new URL('../src/domain/reactions/engine.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
await writeFile(join(directory, 'engine.mjs'), compiled);
const { validateLibrary, evaluateReaction } = await import(`file://${directory}/engine.mjs`);
await rm(directory, { recursive: true, force: true });

const ignition = { activation: 'ignition', atmosphere: 'air' };
const ambient = { activation: 'none', atmosphere: 'air' };
const fixture = () => ({
  version: 'synthetic-test-1', updatedAt: '2026-11-19',
  sources: [{ id: 'fixture', name: 'Synthetic test fixture', url: 'https://example.org/fixture', retrievedAt: '2026-11-19', upstreamDate: null }],
  substances: [
    { id: 'hydrogen', name: 'Hydrogen', formula: 'H₂', state: 'gas', composition: { H: 2 }, charge: 0 },
    { id: 'oxygen', name: 'Oxygen', formula: 'O₂', state: 'gas', composition: { O: 2 }, charge: 0 },
    { id: 'water', name: 'Water', formula: 'H₂O', state: 'liquid', composition: { H: 2, O: 1 }, charge: 0 },
    { id: 'helium', name: 'Helium', formula: 'He', state: 'gas', composition: { He: 1 }, charge: 0 },
  ],
  reactions: [{ id: 'water-fixture', title: 'Water fixture', reactants: [{ id: 'hydrogen', coefficient: 2 }, { id: 'oxygen', coefficient: 1 }], products: [{ id: 'water', coefficient: 2 }], condition: 'activation', requiredActivation: ['ignition'], conditionLabel: 'Activation', outcome: 'reaction', effects: ['heat'], observations: ['Fixture only.'], explanation: 'Synthetic balanced fixture.', sourceIds: ['fixture'], reviewStatus: 'source-checked' }],
});

test('reviewed reaction preserves identity, provenance, order and duplicate presence semantics', () => {
  const library = fixture();
  assert.deepEqual(validateLibrary(library), []);
  for (const selection of [['hydrogen', 'oxygen'], ['oxygen', 'hydrogen'], ['hydrogen', 'oxygen', 'hydrogen']]) {
    const result = evaluateReaction(library, selection, ignition);
    assert.equal(result.kind, 'reaction');
    assert.equal(result.scenario, library.reactions[0]);
    assert.deepEqual(result.scenario.sourceIds, ['fixture']);
  }
});

test('conditions, incomplete and extra sets remain distinct', () => {
  const library = fixture();
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ambient).kind, 'missing-condition');
  assert.equal(evaluateReaction(library, ['hydrogen'], ignition).kind, 'unsupported');
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen', 'helium'], ignition).kind, 'unsupported');
  assert.equal(evaluateReaction(library, ['helium'], ignition).kind, 'unsupported');
});

test('only reviewed scenarios execute', () => {
  const library = fixture();
  library.reactions[0].reviewStatus = 'draft';
  assert.deepEqual(validateLibrary(library), []);
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ignition).kind, 'unsupported');
});

test('reviewed no-reaction allows empty or explicitly unchanged products', () => {
  for (const explicit of [false, true]) {
    const library = fixture();
    const reaction = library.reactions[0];
    reaction.condition = 'ambient';
    reaction.requiredActivation = ['none'];
    reaction.outcome = 'no-reaction';
    reaction.products = explicit ? structuredClone(reaction.reactants).reverse() : [];
    assert.deepEqual(validateLibrary(library), []);
    assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ambient).kind, 'no-reaction');
    reaction.products = [{ id: 'water', coefficient: 2 }];
    assert.match(validateLibrary(library).join(' '), /unchanged/);
  }
});

test('atom conservation uses composition and charge is independently conserved', () => {
  const library = fixture();
  library.substances[2].formula = 'unparsed display label';
  assert.deepEqual(validateLibrary(library), []);
  library.reactions[0].products[0].coefficient = 1;
  assert.match(validateLibrary(library).join(' '), /atoms are not balanced/);
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ignition).kind, 'invalid');
  library.reactions[0].products[0].coefficient = 2;
  library.substances[2].charge = 1;
  assert.match(validateLibrary(library).join(' '), /net charge is not balanced/);
});

test('bad coefficients, duplicate IDs and unknown references fail closed', () => {
  const changes = [
    l => { l.reactions[0].products[0].coefficient = 0; },
    l => { l.reactions[0].products[0].coefficient = 1.5; },
    l => { l.reactions[0].reactants.push(l.reactions[0].reactants[0]); },
    l => { l.substances.push(l.substances[0]); },
    l => { l.sources.push(l.sources[0]); },
    l => { l.reactions.push(l.reactions[0]); },
    l => { l.reactions[0].sourceIds = ['missing']; },
    l => { l.reactions[0].sourceIds = []; },
    l => { l.reactions[0].sourceIds = ['fixture', 'fixture']; },
    l => { l.reactions[0].products[0].id = 'missing'; },
    l => { l.substances[0].composition.H = -2; },
    l => { l.substances[0].charge = Infinity; },
  ];
  for (const change of changes) {
    const library = fixture(); change(library);
    assert.ok(validateLibrary(library).length);
    assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ignition).kind, 'invalid');
  }
});

test('malformed runtime inputs return invalid without throwing', () => {
  const library = fixture();
  for (const bad of [null, {}, { ...library, substances: null }, { ...library, reactions: [null] }]) {
    assert.ok(validateLibrary(bad).length);
    assert.equal(evaluateReaction(bad, ['hydrogen'], ignition).kind, 'invalid');
  }
  for (const selection of [null, {}, [null], [''], ['unknown'], []]) {
    assert.equal(evaluateReaction(library, selection, ignition).kind, 'invalid');
  }
  assert.equal(evaluateReaction(library, ['hydrogen'], 'true').kind, 'invalid');
});

test('evaluation is repeatable and leaves a frozen snapshot unchanged', () => {
  const library = fixture();
  const before = JSON.stringify(library);
  const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  freeze(library);
  assert.deepEqual(evaluateReaction(library, ['oxygen', 'hydrogen'], ignition), evaluateReaction(library, ['hydrogen', 'oxygen'], ignition));
  assert.deepEqual(validateLibrary(library), []);
  assert.equal(JSON.stringify(library), before);
});

test('ambiguous reviewed scenarios fail closed, condition-specific scenarios win', () => {
  const library = fixture();
  library.reactions.push({ ...structuredClone(library.reactions[0]), id: 'duplicate-match' });
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ignition).kind, 'invalid');
  library.reactions[1].condition = 'ambient';
  library.reactions[1].requiredActivation = ['none'];
  library.reactions[1].outcome = 'no-reaction';
  library.reactions[1].products = [];
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ambient).kind, 'no-reaction');
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ignition).kind, 'reaction');
});

const published = JSON.parse(await readFile(new URL('../public/data/reactions.json', import.meta.url), 'utf8'));
test('published snapshot passes structural, provenance and conservation validation', () => {
  assert.ok(published.reactions.length > 14);
  assert.deepEqual(validateLibrary(published), []);
  assert.ok(published.reactions.every(scenario => scenario.reviewStatus === 'source-checked'));
});
for (const scenario of published.reactions) {
  test(`published scenario ${scenario.id}: exact matching, conditions and extra ingredients`, () => {
    const selected = scenario.reactants.map(term => term.id);
    const before = JSON.stringify(published);
    assert.ok(scenario.requiredActivation?.length, 'Published scenarios require explicit activation methods');
    const conditions = { activation: scenario.requiredActivation[0], atmosphere: scenario.requiredAtmosphere ?? 'air' };
    const result = evaluateReaction(published, [...selected].reverse(), conditions);
    assert.equal(result.kind, scenario.outcome);
    assert.equal(result.scenario, scenario);
    assert.deepEqual(result.scenario.sourceIds, scenario.sourceIds);
    assert.equal(evaluateReaction(published, [...selected, selected[0]], conditions).kind, scenario.outcome);
    for (const activation of ['none', 'heat', 'light', 'ignition', 'electricity', 'cooling']) {
      const attempt = { ...conditions, activation };
      const matching = published.reactions.filter(other => other.reviewStatus === 'source-checked' && other.reactants.length === selected.length && other.reactants.every(term => selected.includes(term.id)) && other.requiredActivation.includes(activation) && (!other.requiredAtmosphere || other.requiredAtmosphere === attempt.atmosphere));
      const actual = evaluateReaction(published, selected, attempt);
      assert.equal(actual.kind, matching.length ? matching[0].outcome : 'missing-condition');
      if (matching.length) assert.equal(actual.scenario, matching[0]);
    }
    if (scenario.requiredAtmosphere) {
      for (const atmosphere of ['air', 'oxygen', 'inert'].filter(value => value !== scenario.requiredAtmosphere)) {
        const attempt = { ...conditions, atmosphere };
        const matching = published.reactions.filter(other => other.reviewStatus === 'source-checked' && other.reactants.length === selected.length && other.reactants.every(term => selected.includes(term.id)) && other.requiredActivation.includes(attempt.activation) && (!other.requiredAtmosphere || other.requiredAtmosphere === atmosphere));
        assert.equal(evaluateReaction(published, selected, attempt).kind, matching.length ? matching[0].outcome : 'missing-condition');
      }
    }
    const extra = published.substances.find(substance => !selected.includes(substance.id)).id;
    const enlarged = [...selected, extra];
    const largerScenarioExists = published.reactions.some(other => other.reviewStatus === 'source-checked' && other.reactants.length === enlarged.length && other.reactants.every(term => enlarged.includes(term.id)));
    if (!largerScenarioExists) assert.equal(evaluateReaction(published, enlarged, conditions).kind, 'unsupported');
    assert.equal(JSON.stringify(published), before);
  });
}

test('explicit activation methods and atmosphere are independent requirements', () => {
  const library = fixture();
  const scenario = library.reactions[0];
  scenario.requiredActivation = ['heat', 'light'];
  scenario.requiredAtmosphere = 'oxygen';
  for (const activation of ['heat', 'light']) assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], { activation, atmosphere: 'oxygen' }).kind, 'reaction');
  for (const activation of ['none', 'ignition', 'electricity']) assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], { activation, atmosphere: 'oxygen' }).kind, 'missing-condition');
  for (const atmosphere of ['air', 'inert']) assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], { activation: 'heat', atmosphere }).kind, 'missing-condition');
});

test('same ingredients choose the matching explicit scenario and stable nearest missing scenario', () => {
  const library = fixture();
  library.reactions[0].requiredActivation = ['heat'];
  library.reactions[0].requiredAtmosphere = 'oxygen';
  library.reactions.push({ ...structuredClone(library.reactions[0]), id: 'a-light', requiredActivation: ['light'], requiredAtmosphere: 'inert' });
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], { activation: 'light', atmosphere: 'inert' }).scenario.id, 'a-light');
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], { activation: 'heat', atmosphere: 'oxygen' }).scenario.id, 'water-fixture');
  const pending = evaluateReaction(library, ['hydrogen', 'oxygen'], ambient);
  assert.equal(pending.kind, 'missing-condition');
  assert.equal(pending.scenario.id, 'a-light');
  library.reactions.reverse();
  assert.deepEqual(evaluateReaction(library, ['hydrogen', 'oxygen'], ambient), pending);
});

test('legacy untagged scenarios retain narrow fallback methods', () => {
  const library = fixture();
  delete library.reactions[0].requiredActivation;
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ignition).kind, 'reaction');
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], { activation: 'heat', atmosphere: 'air' }).kind, 'missing-condition');
  library.reactions[0].condition = 'ambient';
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ambient).kind, 'reaction');
  assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ignition).kind, 'missing-condition');
});

test('condition metadata and visual colors reject malformed or unsafe values', () => {
  for (const mutation of [
    r => { r.requiredActivation = []; },
    r => { r.requiredActivation = ['heat', 'heat']; },
    r => { r.requiredActivation = ['spark']; },
    r => { r.requiredActivation = 'heat'; },
    r => { r.requiredAtmosphere = 'vacuum'; },
    r => { r.process = 'mystery'; },
    r => { r.visual = null; },
    r => { r.visual = { gasColor: 'red; background:url(https://example.org)' }; },
    r => { r.visual = { solidColor: 'url(x)' }; },
    r => { r.visual = { solutionColor: '#12' }; },
    r => { r.visual = { freezing: 'true' }; },
  ]) {
    const library = fixture(); mutation(library.reactions[0]);
    assert.ok(validateLibrary(library).length);
    assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], ignition).kind, 'invalid');
  }
  const library = fixture();
  library.reactions[0].visual = { gasColor: '#abc', solidColor: '#aabbcc', solutionColor: '#AABBCC88', freezing: true };
  assert.deepEqual(validateLibrary(library), []);
  for (const conditions of [true, false, null, {}, { activation: 'heat' }, { activation: 'spark', atmosphere: 'air' }, { activation: 'none', atmosphere: 'vacuum' }]) assert.equal(evaluateReaction(library, ['hydrogen', 'oxygen'], conditions).kind, 'invalid');
});


test('cooling is an explicit activation method for physical phase changes', () => {
  const library = fixture();
  library.substances.push({ id: 'ice', name: 'Ice', formula: 'H₂O', state: 'solid', composition: { H: 2, O: 1 }, charge: 0 });
  library.reactions = [{ ...library.reactions[0], id: 'freezing-fixture', reactants: [{ id: 'water', coefficient: 1 }], products: [{ id: 'ice', coefficient: 1 }], process: 'physical', requiredActivation: ['cooling'], visual: { freezing: true, solidColor: '#e0f4ff' } }];
  assert.deepEqual(validateLibrary(library), []);
  assert.equal(evaluateReaction(library, ['water'], { activation: 'cooling', atmosphere: 'air' }).kind, 'reaction');
  for (const activation of ['none', 'heat', 'light', 'ignition', 'electricity']) assert.equal(evaluateReaction(library, ['water'], { activation, atmosphere: 'air' }).kind, 'missing-condition');
});
