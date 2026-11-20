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

const require=createRequire(import.meta.url);
const directory=await mkdtemp(join(tmpdir(),'reaction-show-'));
const source=(await readFile(new URL('../src/features/reaction-vessel/ReactionShow.tsx',import.meta.url),'utf8')).replace("import './reaction-show.css';",'');
let compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
for(const id of ['react/jsx-runtime','react']) compiled=compiled.replaceAll(`from "${id}"`,`from "${pathToFileURL(require.resolve(id)).href}"`).replaceAll(`from '${id}'`,`from '${pathToFileURL(require.resolve(id)).href}'`);
await writeFile(join(directory,'show.mjs'),compiled);
const {default:ReactionShow}=await import(pathToFileURL(join(directory,'show.mjs')).href);
await rm(directory,{recursive:true,force:true});
const scenario={id:'test',title:'A sample scenario',effects:['gas'],outcome:'reaction',products:[{id:'DO-NOT-REVEAL-PRODUCT',coefficient:1}]};
const render=(changes={},props={})=>renderToStaticMarkup(createElement(ReactionShow,{runId:1,scenario:{...scenario,...changes},motion:true,onComplete:()=>{},...props}));

test('colorless gas has schematic outlines, never colored plumes or product details',()=>{
 const html=render();
 assert.match(html,/rs-gas-invisible/);
 assert.match(html,/Colorless gas shown as outlines/);
 assert.doesNotMatch(html,/rs-gas-colored|DO-NOT-REVEAL-PRODUCT/);
});
test('gas color and flame appearance require explicit supporting data',()=>{
 assert.match(render({visual:{gasColor:'#abc123'}}),/rs-gas-colored/);
 assert.doesNotMatch(render({effects:['heat']}),/class="rs-fire"/);
 assert.match(render({effects:['flame']}),/class="rs-fire"/);
});
test('cooling, freezing and physical phase changes use distinct truthful labels',()=>{
 assert.match(render({effects:['cooling']}),/>Cooling</);
 assert.doesNotMatch(render({effects:['cooling']}),/Freezing|rs-frost/);
 const freezing=render({effects:['cooling'],visual:{freezing:true},process:'physical'});
 assert.match(freezing,/>Freezing</);
 assert.match(freezing,/Phase change in progress/);
 assert.doesNotMatch(freezing,/Atoms rearranging/);
});
test('unchanged mixtures do not imply reactions; motion preference selects static presentation',()=>{
 const html=render({outcome:'no-reaction',effects:[]});
 assert.match(html,/Observing mixture/);
 assert.match(html,/Substances remain unchanged/);
 assert.doesNotMatch(html,/Atoms rearranging/);
 assert.match(render({}, {motion:false}),/rs-calm/);
 assert.match(html,/Skip animation/);
});
