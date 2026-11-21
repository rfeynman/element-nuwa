import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url),directory=await mkdtemp(join(tmpdir(),'reaction-outcomes-'));
for(const [sourcePath,name] of [['src/domain/reactions/engine.ts','engine'],['src/features/reaction-vessel/ReactionOutcomes.tsx','outcomes']]){
 const source=await readFile(new URL('../'+sourcePath,import.meta.url),'utf8');
 let compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replaceAll('../../domain/reactions/engine','./engine.mjs');
 for(const id of ['react/jsx-runtime','react'])compiled=compiled.replaceAll(`from "${id}"`,`from "${pathToFileURL(require.resolve(id)).href}"`);
 await writeFile(join(directory,name+'.mjs'),compiled);
}
const {default:ReactionOutcomes}=await import(pathToFileURL(join(directory,'outcomes.mjs')).href);
const {findReactionScenarios}=await import(pathToFileURL(join(directory,'engine.mjs')).href);
await rm(directory,{recursive:true,force:true});
const library=JSON.parse(await readFile(new URL('../public/data/reactions.json',import.meta.url),'utf8'));
const render=(scenarios,conditions={activation:'heat',atmosphere:'air'},activeId)=>renderToStaticMarkup(createElement(ReactionOutcomes,{library,scenarios,conditions,activeId,onAnimate:()=>{}}));
test('iron lists both oxide products and equations even after one outcome is selected',()=>{
 const first=library.reactions.find(r=>r.id==='binary-iron-o2-fe2o3'),scenarios=findReactionScenarios(library,first.reactants.map(t=>t.id));
 const html=render(scenarios,undefined,first.id);
 assert.equal(scenarios.length,4);
 assert.equal(scenarios.filter(r=>r.requiredAtmosphere==='oxygen').length,2);
 for(const formula of ['Fe₂O₃','Fe₃O₄'])assert.ok(html.includes(formula));
 assert.match(html,/All sourced outcomes \(4\)/);assert.match(html,/Shown in vessel/);
 assert.equal((html.match(/Matches selected conditions/g)||[]).length,2);
 for(const r of scenarios)assert.ok(html.includes(r.title));
 assert.ok(html.includes(library.version));assert.match(html,/webelements.com/);
});
test('all alternatives stay listed regardless of current conditions or equation-only status',()=>{
 const first=library.reactions.find(r=>r.id==='binary-arsenic-f2-asf3'),scenarios=findReactionScenarios(library,first.reactants.map(t=>t.id));
 assert.ok(scenarios.length>1);const html=render(scenarios);
 assert.match(html,/AsF₃/);assert.match(html,/AsF₅/);assert.match(html,/Equation only/);
 assert.ok(!html.includes('<button'));
 const iron=library.reactions.find(r=>r.id==='binary-iron-o2-fe2o3');
 assert.match(render(findReactionScenarios(library,iron.reactants.map(t=>t.id)),{activation:'none',atmosphere:'air'}),/Requires heat/);
});
test('every product within a multi-product equation is listed with its name and state',()=>{
 const reaction=library.reactions.find(r=>r.products.length>2&&r.outcome==='reaction');
 const html=render([reaction]);
 for(const term of reaction.products){const s=library.substances.find(s=>s.id===term.id);assert.ok(html.includes(s.formula));assert.ok(html.includes(s.name));assert.ok(html.includes('('+s.state+')'))}
});
test('outcome lookup respects exact substance sets, excludes drafts, and stays stable',()=>{
 const first=library.reactions.find(r=>r.id==='binary-iron-o2-fe2o3'),inputs=first.reactants.map(t=>t.id),outcomes=findReactionScenarios(library,inputs);
 assert.deepEqual(findReactionScenarios({...library,reactions:[...library.reactions].reverse()},[...inputs].reverse()),outcomes);
 assert.deepEqual(findReactionScenarios(library,[]),[]);assert.deepEqual(findReactionScenarios(library,[...inputs,'unknown']),[]);
 assert.ok(!findReactionScenarios({...library,reactions:library.reactions.map(r=>r.id===first.id?{...r,reviewStatus:'draft'}:r)},inputs).some(r=>r.id===first.id));
});
