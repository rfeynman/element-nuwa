import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const directory=await mkdtemp(join(tmpdir(),'binary-audit-'));
const source=await readFile(new URL('../src/domain/reactions/engine.ts',import.meta.url),'utf8');
await writeFile(join(directory,'engine.mjs'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText);
const {validateLibrary,evaluateReaction,findElementalAlternatives}=await import(pathToFileURL(join(directory,'engine.mjs')).href);
await rm(directory,{recursive:true,force:true});
const library=JSON.parse(await readFile(new URL('../public/data/reactions.json',import.meta.url),'utf8'));
const explorer=JSON.parse(await readFile(new URL('../public/data/explorer.json',import.meta.url),'utf8'));
const substances=new Map(library.substances.map(s=>[s.id,s]));
const ascii=formula=>formula.replace(/[₀₁₂₃₄₅₆₇₈₉]/g,d=>String('₀₁₂₃₄₅₆₇₈₉'.indexOf(d)));
const pair=r=>r.reactants.length===2&&r.reactants.every(t=>substances.get(t.id).charge===0&&Object.keys(substances.get(t.id).composition).length===1)?r.reactants.map(t=>Object.keys(substances.get(t.id).composition)[0]).sort().join('+'):'';
const checklist=[['Al','O','Al2O3'],['Al','Cl','AlCl3'],['Al','Br','Al2Br6'],['Al','I','Al2I6'],['Al','F','AlF3'],['Al','N','AlN'],['Al','S','Al2S3'],['Al','C','Al4C3'],['Fe','O','Fe2O3'],['Fe','O','Fe3O4'],['Fe','S','FeS'],['Mg','O','MgO'],['Mg','N','Mg3N2'],['Mg','S','MgS'],['Ca','O','CaO'],['Ca','S','CaS'],['Na','Cl','NaCl'],['Na','H','NaH'],['Na','S','Na2S'],['K','S','K2S'],['H','N','NH3'],['H','O','H2O'],['H','F','HF'],['H','Cl','HCl'],['H','Br','HBr'],['H','I','HI'],['N','O','NO'],['C','O','CO2'],['C','O','CO'],['C','S','CS2'],['Si','O','SiO2'],['Si','N','Si3N4'],['Si','C','SiC'],['P','O','P4O10'],['P','O','P4O6'],['Zn','S','ZnS'],['Cu','S','Cu2S'],['Cu','S','CuS']];
test('standard binary teaching checklist includes sourced products, not only pair placeholders',()=>{
 for(const [a,b,product] of checklist){const key=[a,b].sort().join('+');assert.ok(library.reactions.some(r=>r.reviewStatus==='source-checked'&&pair(r)===key&&r.products.some(t=>ascii(substances.get(t.id).formula)===product)),`${key} -> ${product}`)}
});
test('Al plus table oxygen works in air with separate surface oxidation and heated combustion',()=>{
 const Al=library.substances.find(s=>s.elementZ===13),O=library.substances.find(s=>s.elementZ===8),inputs=[Al.id,O.id];
 const ambient=evaluateReaction(library,inputs,{activation:'none',atmosphere:'air'});assert.equal(ambient.kind,'reaction');assert.equal(ambient.scenario.id,'aluminium-oxygen-passivation');assert.ok(!ambient.scenario.effects.includes('flame'));
 for(const activation of ['heat','ignition']){const result=evaluateReaction(library,inputs,{activation,atmosphere:'air'});assert.equal(result.kind,'reaction');assert.equal(result.scenario.id,'aluminium-oxygen-combustion');assert.ok(result.scenario.effects.includes('flame'));assert.equal(ascii(substances.get(result.scenario.products[0].id).formula),'Al2O3')}
 assert.equal(evaluateReaction(library,[Al.id],{activation:'heat',atmosphere:'oxygen'}).kind,'unsupported','atmosphere control must not invent an oxygen reactant');
});
test('all sourced neutral elemental symbols have a unique usable table mapping including Si and Sn',()=>{
 assert.deepEqual(validateLibrary(library),[]);
 const symbols=new Set(library.substances.filter(s=>s.charge===0&&Object.keys(s.composition).length===1).map(s=>Object.keys(s.composition)[0]));
 for(const symbol of symbols){const z=explorer.elements.find(e=>e.symbol===symbol).z,mapped=library.substances.filter(s=>s.elementZ===z);assert.equal(mapped.length,1,symbol);assert.deepEqual(Object.keys(mapped[0].composition),[symbol])}
 for(const z of [13,14,50])assert.ok(library.substances.some(s=>s.elementZ===z));
});
test('other-form suggestions reveal sourced Br/I examples without silently changing phases',()=>{
 const ca=library.substances.find(s=>s.elementZ===20),br=library.substances.find(s=>s.elementZ===35),inputs=[ca.id,br.id],candidates=findElementalAlternatives(library,inputs);
 assert.ok(candidates.some(r=>r.id==='binary-calcium-br2-cabr2'));
 assert.ok(candidates.every(r=>!r.reactants.every(t=>inputs.includes(t.id))));
 assert.equal(evaluateReaction(library,inputs,{activation:'heat',atmosphere:'air'},'binary-calcium-br2-cabr2').kind,'invalid');
 const candidate=candidates.find(r=>r.id==='binary-calcium-br2-cabr2');assert.equal(evaluateReaction(library,candidate.reactants.map(t=>t.id),{activation:'heat',atmosphere:'air'},candidate.id).kind,'reaction');
 assert.deepEqual(findElementalAlternatives(library,[ca.id]),[]);assert.deepEqual(findElementalAlternatives(library,[ca.id,br.id,'unknown']),[]);
});
test('pure-oxygen cases stay distinct while generic oxygen entries avoid duplicate requirements',()=>{
 for(const id of ['common-k-oxygen-peroxide','common-rb-oxygen-peroxide','common-cs-oxygen-peroxide']){const r=library.reactions.find(r=>r.id===id);assert.equal(r.requiredAtmosphere,'oxygen');assert.equal(evaluateReaction(library,r.reactants.map(t=>t.id),{activation:r.requiredActivation[0],atmosphere:'air'},r.id).kind,'missing-condition')}
 for(const id of ['binary-lithium-o2-li2o','binary-sodium-o2-na2o','binary-zinc-o2-zno']){const r=library.reactions.find(r=>r.id===id);assert.equal(r.requiredAtmosphere,undefined);assert.equal(evaluateReaction(library,r.reactants.map(t=>t.id),{activation:r.requiredActivation[0],atmosphere:'air'},r.id).kind,'reaction')}
});
test('reviewed unsupported activation and disputed products cannot become playable',()=>{
 for(const id of ['binary-manganese-f2-mnf2','binary-manganese-f2-mnf3','binary-chromium-f2-crf3','binary-chromium-cl2-crcl3'])assert.equal(library.reactions.find(r=>r.id===id).execution,'equation-only');
 for(const formula of ['SeI4','SeF4','OsF7','TcF7'])assert.ok(!library.reactions.some(r=>r.products.some(t=>ascii(substances.get(t.id).formula)===formula)),formula);
 assert.ok(!library.reactions.some(r=>r.id==='common-phosphorus-fluorine-pf3'));
 const iodide=library.reactions.find(r=>r.id==='aluminium-iodine-catalysed');assert.equal(iodide.execution,'equation-only');
});
