import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const directory=await mkdtemp(join(tmpdir(),'nuwa-analytics-')),require=createRequire(import.meta.url);
await build({entryPoints:[new URL('../src/features/analytics/VisitorAnalytics.tsx',import.meta.url).pathname],outfile:join(directory,'analytics.mjs'),bundle:true,format:'esm',platform:'node',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':'"/element-nuwa/"'},plugins:[{name:'local-react',setup(b){b.onResolve({filter:/^react(?:\/jsx-runtime)?$/},args=>({path:require.resolve(args.path),external:true}))}}]});
const {normalizeAnalyticsSite,visitorCount,enableTracking,loadConfiguration}=await import(pathToFileURL(join(directory,'analytics.mjs')));
await rm(directory,{recursive:true,force:true});

test('an unconnected counter stays unconfigured and a public site address is normalized',()=>{
 assert.equal(normalizeAnalyticsSite(null),null);assert.equal(normalizeAnalyticsSite(''),null);
 assert.equal(normalizeAnalyticsSite('https://example.goatcounter.com/'),'https://example.goatcounter.com');
});
test('public analytics configuration rejects credentials, API keys and unrelated destinations',()=>{
 for(const address of ['http://example.goatcounter.com','https://example.goatcounter.com@evil.example','https://user:password@example.goatcounter.com','https://example.goatcounter.com/?api_key=secret','https://example.goatcounter.com/#secret','https://example.goatcounter.com/count','https://example.com',undefined])assert.throws(()=>normalizeAnalyticsSite(address));
});
test('counts preserve provider formatting and never turn errors or missing data into zero',()=>{
 assert.equal(visitorCount('1,234'),'1,234');assert.equal(visitorCount(0),'0');
 for(const value of [null,undefined,'',NaN,Infinity,-1,'Unavailable','<script>'])assert.throws(()=>visitorCount(value));
});
test('tracking installs once on the public site and never counts local previews',()=>{
 const oldDocument=globalThis.document,oldLocation=globalThis.location,installed=new Map();
 globalThis.document={getElementById:id=>installed.get(id),createElement:()=>({dataset:{}}),body:{appendChild:script=>installed.set(script.id,script)}};
 try{
  for(const hostname of ['localhost','127.0.0.1','[::1]']){globalThis.location={hostname};enableTracking('https://example.goatcounter.com');assert.equal(installed.size,0)}
  globalThis.location={hostname:'rfeynman.github.io'};
  enableTracking('https://example.goatcounter.com');enableTracking('https://example.goatcounter.com');
  assert.equal(installed.size,1);const script=[...installed.values()][0];
  assert.equal(script.src,'https://gc.zgo.at/count.js');assert.equal(script.dataset.goatcounter,'https://example.goatcounter.com/count');assert.equal(script.async,true);
 }finally{if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;if(oldLocation===undefined)delete globalThis.location;else globalThis.location=oldLocation}
});
test('configuration uses the packaged base path and is cached across repeated mounts',async()=>{
 const oldFetch=globalThis.fetch,calls=[];
 globalThis.fetch=async url=>{calls.push(url);return {ok:true,json:async()=>({goatcounterSite:null})}};
 try{assert.deepEqual(await loadConfiguration(),{goatcounterSite:null});assert.deepEqual(await loadConfiguration(),{goatcounterSite:null});assert.deepEqual(calls,['/element-nuwa/analytics.json'])}finally{globalThis.fetch=oldFetch}
 const config=JSON.parse(await readFile(new URL('../public/analytics.json',import.meta.url),'utf8'));
 assert.deepEqual(Object.keys(config),['goatcounterSite']);assert.doesNotThrow(()=>normalizeAnalyticsSite(config.goatcounterSite));
});
