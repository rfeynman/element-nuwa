import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const directory=await mkdtemp(join(tmpdir(),'tabletop-activation-'));
for(const name of ['engine','activation']){
 const source=await readFile(new URL(`../src/domain/reactions/${name}.ts`,import.meta.url),'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText.replace("'./engine'","'./engine.mjs'");
 await writeFile(join(directory,`${name}.mjs`),compiled);
}
const {activationChoices}=await import(pathToFileURL(join(directory,'activation.mjs')));
const {evaluateReaction}=await import(pathToFileURL(join(directory,'engine.mjs')));
await rm(directory,{recursive:true,force:true});
const library=JSON.parse(await readFile(new URL('../public/data/reactions.json',import.meta.url),'utf8'));
const pair=(...zs)=>zs.map(z=>library.substances.find(s=>s.elementZ===z).id);
test('Al/O offers only room, heat and ignition with their actual outcomes',()=>{
 const choices=activationChoices(library,pair(13,8));
 assert.deepEqual(choices.map(c=>c.conditions.activation).sort(),['heat','ignition','none']);
 for(const c of choices){assert.equal(c.conditions.atmosphere,'air');assert.equal(c.scenarios.length,1);const r=evaluateReaction(library,pair(13,8),c.conditions,c.scenarios[0].id);assert.equal(r.kind,'reaction');assert.ok(r.scenario.products.length)}
});
test('every offered activation can execute its associated exact scenario',()=>{
 for(const scenario of library.reactions.filter(r=>r.reviewStatus==='source-checked'&&r.execution!=='equation-only')){
  const ids=scenario.reactants.map(t=>t.id),choices=activationChoices(library,ids);
  assert.ok(choices.length,scenario.id);
  for(const choice of choices)for(const r of choice.scenarios){
   const result=evaluateReaction(library,ids,choice.conditions,r.id);
   assert.ok(['reaction','no-reaction'].includes(result.kind),`${r.id}: ${result.kind}`);
  }
 }
});
test('equation-only records and incomplete ingredient sets never acquire activation choices',()=>{
 const reference={...library.reactions[0],execution:'equation-only'};
 assert.deepEqual(activationChoices({...library,reactions:[reference]},reference.reactants.map(t=>t.id)),[]);
 assert.deepEqual(activationChoices(library,[]),[]);
 assert.deepEqual(activationChoices(library,['element:118']),[]);
});
test('one supported method is a single auto-start choice and multiple products remain explicit',()=>{
 const base=library.reactions.find(r=>r.execution!=='equation-only');
 const one={...base,requiredActivation:['heat'],requiredAtmosphere:'inert'};
 const ids=one.reactants.map(t=>t.id);
 const choices=activationChoices({...library,reactions:[one]},ids);
 assert.equal(choices.length,1);assert.deepEqual(choices[0].conditions,{activation:'heat',atmosphere:'inert'});
 const multi=activationChoices({...library,reactions:[one,{...one,id:'another-outcome'}]},ids);
 assert.equal(multi.length,1);assert.equal(multi[0].scenarios.length,2);
});
