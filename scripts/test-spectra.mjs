import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync} from 'node:fs';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=new URL('../',import.meta.url),directory=await mkdtemp(join(tmpdir(),'nuwa-spectra-'));
await build({entryPoints:[new URL('../src/features/spectra/SpectraView.tsx',import.meta.url).pathname],outfile:join(directory,'view.mjs'),bundle:true,format:'esm',platform:'node',external:['react','react/jsx-runtime'],loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':'"/element-nuwa/"'}});
// Resolve React from this project when the transient module is outside node_modules.
let code=await readFile(join(directory,'view.mjs'),'utf8');
const {writeFile}=await import('node:fs/promises');
code=code.replaceAll('from "react"',`from ${JSON.stringify(new URL('../node_modules/react/index.js',import.meta.url).href)}`).replaceAll('from "react/jsx-runtime"',`from ${JSON.stringify(new URL('../node_modules/react/jsx-runtime.js',import.meta.url).href)}`);
await writeFile(join(directory,'view.mjs'),code);
const {SpectrumStrips,EnergyJump}=await import(new URL('file://'+join(directory,'view.mjs')));
await build({entryPoints:[new URL('../src/features/spectra/spectra.ts',import.meta.url).pathname],outfile:join(directory,'logic.mjs'),bundle:true,format:'esm',platform:'node',define:{'import.meta.env.BASE_URL':'"/element-nuwa/"'}});
const {isVisible,isInSpectrumRange,linePosition,wavelengthColor,stateLabel,transitionStates,loadSpectra}=await import(new URL('file://'+join(directory,'logic.mjs')));
const payload=await readFile(new URL('public/data/spectra.json',root));
const data=JSON.parse(payload),manifest=JSON.parse(await readFile(new URL('data/manifests/spectra-manifest.json',root),'utf8'));
await rm(directory,{recursive:true,force:true});
const hydrogen=data.elements.find(e=>e.z===1),sodium=data.elements.find(e=>e.z===11),carbon=data.elements.find(e=>e.z===6);
const hAlpha=hydrogen.lines.find(l=>l.wavelengthNm===656.2711);

test('snapshot includes 118 neutral-element identities and distinguishes missing coverage',()=>{
 assert.equal(data.elements.length,118);assert.equal(new Set(data.elements.map(e=>e.z)).size,118);
 assert.equal(data.elements[117].status,'outside-reference');assert.deepEqual(data.elements[117].lines,[]);
 assert.ok(data.elements.filter(e=>e.status==='available').length>80);
 assert.equal(createHash('sha256').update(payload).digest('hex'),manifest.datasetSha256);
});
test('every assigned wavelength has two source states, a positive gap and an air-aware consistency check',()=>{
 for(const e of data.elements)for(const l of e.lines){
  if(!l.lower||!l.upper){assert.equal(l.lower,null);assert.equal(l.upper,null);continue}
  assert.ok(l.lower.energyText&&l.upper.energyText,`${e.symbol} ${l.id}`);
  const gap=l.upper.energyCm-l.lower.energyCm;assert.ok(gap>0);
  assert.ok(Math.abs(l.wavelengthNm*gap/1e7-1)<.002);
  assert.equal(l.medium,gap>50000?'vacuum':'air');
  assert.equal(Number(l.wavelengthText),l.wavelengthNm);
 }
});
test('hydrogen H-alpha and sodium D wavelengths preserve source units, precision and state identity',()=>{
 assert.ok(hAlpha);assert.equal(hAlpha.wavelengthText,'656.27110');assert.equal(hAlpha.lower.configuration,'2p');assert.equal(hAlpha.upper.configuration,'3d');
 assert.equal(hAlpha.lower.energyCm,82258.9191);assert.equal(hAlpha.upper.energyCm,97492.3195);
 assert.ok(sodium.lines.some(l=>l.wavelengthNm===588.995));assert.ok(sodium.lines.some(l=>l.wavelengthNm===589.5924));
 assert.ok(carbon.lines.some(l=>l.wavelengthNm<200));
});
test('upward absorption and downward emission reverse the same sourced pair',()=>{
 assert.deepEqual(transitionStates(hAlpha,'absorption'),[hAlpha.lower,hAlpha.upper]);
 assert.deepEqual(transitionStates(hAlpha,'emission'),[hAlpha.upper,hAlpha.lower]);
 assert.match(stateLabel(hAlpha.lower),/2p.*²P.*J=1\/2/);
 const html=renderToStaticMarkup(createElement(EnergyJump,{line:hAlpha}));
 assert.match(html,/Absorb ↑/);assert.match(html,/Emit ↓/);assert.match(html,/M79 96V36/);assert.match(html,/M221 36V96/);
 assert.match(html,/82258.9191/);assert.match(html,/97492.3195/);
});
test('strips use the 330–830 nm display range, black absorption notches and colored emission marks',()=>{
 const html=renderToStaticMarkup(createElement(SpectrumStrips,{lines:hydrogen.lines,selected:hAlpha,onSelect:()=>{}}));
 assert.match(html,/Absorption · black lines/);assert.match(html,/Emission · colored lines/);
 assert.match(html,/stroke="#080808"/);assert.match(html,/stroke="rgb\(255, 0, 0\)"/);
 assert.equal((html.match(/role="button"/g)||[]).length,hydrogen.lines.filter(isInSpectrumRange).length);
 assert.equal(linePosition(330),0);assert.equal(linePosition(830),1);
 assert.equal(isInSpectrumRange({wavelengthNm:330}),true);assert.equal(isInSpectrumRange({wavelengthNm:830}),true);
 assert.equal(isInSpectrumRange({wavelengthNm:329.99}),false);assert.equal(isInSpectrumRange({wavelengthNm:830.01}),false);
 assert.equal(wavelengthColor(200),null);assert.equal(wavelengthColor(900),null);
 assert.equal(isVisible({wavelengthNm:379.99}),false);
});
test('unassigned transitions remain unknown and do not get fabricated energy arrows',()=>{
 const unknown=data.elements.flatMap(e=>e.lines).find(l=>!l.lower);assert.ok(unknown);
 const html=renderToStaticMarkup(createElement(EnergyJump,{line:unknown}));
 assert.match(html,/without a state assignment/);assert.doesNotMatch(html,/marker-end|Absorb ↑|Emit ↓/);
});
test('provider records and available private raw reference checksums remain traceable',async t=>{
 const privateSources=existsSync(new URL('data/staging/spectra/',root));
 let count=0;
 for(const source of manifest.sources){
  if(privateSources){
   const raw=await readFile(new URL(source.path,root));
   assert.equal(createHash('sha256').update(raw).digest('hex'),source.sha256);
   assert.match(raw.toString(),/Persistent Lines of Neutral/);
  }
  const e=data.elements.find(e=>e.z===source.z);assert.equal(e.url,source.url);assert.equal(e.lines.length,source.lines);
  count+=source.lines;
 }
 assert.equal(count,manifest.lineCount);
 if(!privateSources)t.diagnostic('Private source HTML is not distributed. Normalized records, provenance and dataset checksum were checked.');
});
test('loading is cached across element changes and uses the packaged base path',async()=>{
 const original=globalThis.fetch;let calls=[];
 globalThis.fetch=async url=>{calls.push(url);return {ok:true,json:async()=>data}};
 try{assert.equal(await loadSpectra(),data);assert.equal(await loadSpectra(),data);assert.deepEqual(calls,['/element-nuwa/data/spectra.json'])}finally{globalThis.fetch=original}
});
