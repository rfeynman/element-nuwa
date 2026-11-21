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
const require=createRequire(import.meta.url),directory=await mkdtemp(join(tmpdir(),'configuration-diagram-'));
for(const [name,path] of [['orbitals','../src/features/electrons/orbitals.ts'],['Provenance','../src/components/Provenance.tsx'],['diagram','../src/features/electrons/ElectronConfiguration.tsx']]){
 let source=await readFile(new URL(path,import.meta.url),'utf8');
 source=source.replace("import './configuration-diagram.css';",'');
 let compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 compiled=compiled.replaceAll("'./orbitals'","'./orbitals.mjs'").replaceAll("'../../components/Provenance'","'./Provenance.mjs'");
 for(const id of ['react/jsx-runtime','react'])compiled=compiled.replaceAll(`from "${id}"`,`from "${pathToFileURL(require.resolve(id)).href}"`).replaceAll(`from '${id}'`,`from '${pathToFileURL(require.resolve(id)).href}'`);
 await writeFile(join(directory,`${name}.mjs`),compiled);
}
const {default:Diagram}=await import(pathToFileURL(join(directory,'diagram.mjs')));
const {orbitalColors}=await import(pathToFileURL(join(directory,'orbitals.mjs')));
await rm(directory,{recursive:true,force:true});
const dataset=JSON.parse(await readFile(new URL('../public/data/explorer.json',import.meta.url),'utf8'));
const get=z=>dataset.elements.find(e=>e.z===z);
const render=element=>renderToStaticMarkup(createElement(Diagram,{element,dataset}));
test('carbon opens a diagonal configuration diagram rather than a cloud canvas',()=>{
 const html=render(get(6));
 assert.match(html,/Electron filling diagram/);assert.doesNotMatch(html,/<canvas|Rotate cloud|Combine clouds/);
 for(const [shell,count] of [['1s',2],['2s',2],['2p',2],['3d',0],['8s',0]])assert.ok(html.includes(`data-subshell="${shell}" data-electrons="${count}"`));
 assert.equal((html.match(/<line /g)||[]).length,8);
 for(let n=1;n<=8;n++)assert.ok(html.includes(`n = ${n}`));
});
test('occupied diagram nodes use exactly the cloud palette',()=>{
 const html=render(get(92));
 for(const [shell,type] of [['1s','s'],['2p','p'],['3d','d'],['4f','f']]){
  const group=html.match(new RegExp(`<g data-subshell="${shell}"[\\s\\S]*?</g>`))?.[0];
  assert.ok(group?.includes(`fill="${orbitalColors[type]}"`),shell);
 }
});
test('rendered electron counts preserve every sourced configuration and copper exception',()=>{
 for(const element of dataset.elements){
  const html=render(element),counts=[...html.matchAll(/data-electrons="(\d+)"/g)].map(m=>Number(m[1]));
  assert.equal(counts.reduce((sum,n)=>sum+n,0),element.z,element.name);
 }
 const copper=render(get(29));assert.match(copper,/data-subshell="3d" data-electrons="10"/);assert.match(copper,/data-subshell="4s" data-electrons="1"/);
});
test('unavailable configurations never invent occupancies and the guide retains its scope and sources',()=>{
 const html=render({...get(6),configuration:null});assert.match(html,/occupation unavailable/);assert.doesNotMatch(html,/data-electrons="\d+"/);
 assert.match(html,/8s is a guide only/);assert.match(html,/configuration exceptions/);assert.match(html,/openstax.org/);assert.ok(html.includes(dataset.version));
});
