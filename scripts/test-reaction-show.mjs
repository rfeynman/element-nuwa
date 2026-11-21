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

test('the effect surface is transparent and contains no curtain or opaque panel',async()=>{
 const css=await readFile(new URL('../src/features/reaction-vessel/reaction-show.css',import.meta.url),'utf8');
 const rootRule=css.match(/\.reaction-show\{([^}]+)\}/)?.[1]??'';
 assert.match(rootRule,/background:transparent/);
 assert.match(rootRule,/pointer-events:none/);
 assert.doesNotMatch(css,/box-shadow|backdrop-filter|50vw|50dvh|100dvh|#10191a|#091414/);
 assert.doesNotMatch(render(),/rs-atmosphere|rs-header|rs-orbit|rs-horizon/);
 assert.match(render(),/width:620px;height:550px/);
});

test('viewport clamping keeps mobile effects around the actual vessel',()=>{
 const previousWindow=globalThis.window;
 try{
  globalThis.window={innerWidth:390,innerHeight:844,matchMedia:()=>({matches:false})};
  const html=render({}, {anchor:{left:100,top:320,width:190,height:160}});
  assert.match(html,/left:8px;top:130px;width:374px;height:450px/);
  assert.match(html,/--rs-origin-x:187px;--rs-origin-y:270px/);
  // A vessel near an edge still determines the origin after the surface is clamped.
  const edge=render({}, {anchor:{left:20,top:15,width:100,height:100}});
  assert.match(edge,/left:8px;top:8px;width:374px;height:450px/);
  assert.match(edge,/--rs-origin-x:62px;--rs-origin-y:57px/);
 }finally{
  if(previousWindow===undefined)delete globalThis.window;
  else globalThis.window=previousWindow;
 }
});

test('toxic markings require an explicit toxic gas effect without inventing its color',()=>{
 const toxic=render({effects:['gas','toxic']});
 assert.match(toxic,/rs-toxic/);
 assert.match(toxic,/Toxic gas/);
 assert.match(toxic,/rs-gas-invisible/);
 assert.doesNotMatch(toxic,/rs-gas-colored/);
 assert.doesNotMatch(render({effects:['gas']}),/rs-toxic/);
 assert.doesNotMatch(render({effects:['toxic']}),/rs-toxic/);
});

test('tabletop effects remain event-specific with explicit symbolic meanings',()=>{
 const fire=render({effects:['flame'],observations:['Burns with a white flame.']});
 assert.match(fire,/rs-scorch/);assert.match(fire,/--rs-fire-color:#f4f8ff/);
 assert.doesNotMatch(fire,/Illustrative flame color/);
 assert.match(render({effects:['flame']}),/Illustrative flame color/);
 const heat=render({effects:['heat']});assert.match(heat,/rs-overflow/);assert.match(heat,/Bubbles represent heat, not boiling/);
 assert.doesNotMatch(render({effects:['gas']}),/rs-overflow|rs-scorch/);
 const cooling=render({effects:['cooling']});assert.match(cooling,/rs-icefall/);assert.match(cooling,/Ice represents cooling, not freezing/);
 const poison=render({effects:['gas','toxic']});assert.match(poison,/rs-poison-mist/);assert.match(poison,/White mist marks toxicity, not actual gas color/);
 assert.doesNotMatch(render({effects:['gas','heat','flame','cooling','toxic'],outcome:'no-reaction'}),/rs-icefall|rs-overflow|rs-poison-mist|rs-scorch/);
});

test('magnesium combustion has its referenced white emission rather than an ionic flame-test guess',()=>{
 const html=render({id:'magnesium-oxygen',effects:['flame'],observations:['Bright light accompanies burning.']});
 assert.match(html,/--rs-fire-color:#f4f8ff/);assert.doesNotMatch(html,/Illustrative flame color/);
});
