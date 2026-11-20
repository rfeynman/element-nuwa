import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const directory=await mkdtemp(join(tmpdir(),'orbital-model-'));
const source=await readFile(new URL('../src/features/electrons/orbitals.ts',import.meta.url),'utf8');
await writeFile(join(directory,'model.mjs'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText);
const {occupiedSubshells,orbitalTypes,orbitalColors,orbitalOrientations,realHarmonic,radialProbability,sampleOrbital}=await import(pathToFileURL(join(directory,'model.mjs')).href);
await rm(directory,{recursive:true,force:true});
const data=JSON.parse(await readFile(new URL('../public/data/explorer.json',import.meta.url),'utf8'));
const get=z=>data.elements.find(e=>e.z===z);
test('all 118 sourced configurations expand to Z with correct shell populations',()=>{
 for(const element of data.elements){const occupied=occupiedSubshells(element,data.elements);assert.equal(occupied.reduce((sum,s)=>sum+s.count,0),element.z,element.name);assert.deepEqual(element.shells,Array.from({length:Math.max(...occupied.map(s=>s.n))},(_,i)=>occupied.filter(s=>s.n===i+1).reduce((sum,s)=>sum+s.count,0)),element.name)}
});
test('configuration exceptions and predicted status are not replaced by filling rules',()=>{
 for(const [z,subshell,count] of [[24,'3d',5],[24,'4s',1],[29,'3d',10],[29,'4s',1],[103,'7p',1]])assert.equal(occupiedSubshells(get(z),data.elements).find(s=>`${s.n}${s.type}`===subshell).count,count);
 assert.match(get(103).configurationStatus,/Predicted/);
 assert.deepEqual(occupiedSubshells({...get(6),configuration:null},data.elements),[]);
 assert.deepEqual(occupiedSubshells({...get(6),configuration:'[Unknown]2s2 2p2'},data.elements),[]);
 assert.deepEqual(occupiedSubshells({...get(6),configuration:'[He]2s2 2p8'},data.elements),[]);
});
test('real spherical harmonics form orthonormal s/p/d/f bases',()=>{
 // Independent numerical integration over uniform cos(theta) and phi.
 for(let l=0;l<=3;l++)for(let m=-l;m<=l;m++){
  let sum=0;for(let a=0;a<120;a++)for(let b=0;b<120;b++){const y=realHarmonic(l,m,-1+(a+.5)/60,2*Math.PI*(b+.5)/120);sum+=y*y*4*Math.PI/(120*120)}
  assert.ok(Math.abs(sum-1)<.003,`${l},${m}: ${sum}`);
 }
 let cross=0;for(let a=0;a<100;a++)for(let b=0;b<100;b++){const z=-1+(a+.5)/50,phi=2*Math.PI*(b+.5)/100;cross+=realHarmonic(1,1,z,phi)*realHarmonic(1,-1,z,phi)}assert.ok(Math.abs(cross)<1e-9);
});
test('orbital shapes have the expected nodal planes and radial nodes',()=>{
 assert.equal(realHarmonic(1,0,0,0),0); // p_z: xy plane
 assert.ok(Math.abs(realHarmonic(2,-2,.4,0))<1e-12); // d_xy: y=0
 assert.ok(Math.abs(realHarmonic(3,-2,0,Math.PI/4))<1e-12); // f_xyz: z=0
 assert.equal(radialProbability(2,0,2),0); // 2s radial node at rho=2
 assert.ok(radialProbability(2,0,1)>0&&radialProbability(2,0,3)>0);
 assert.ok(radialProbability(2,1,2)>0); // 2p has no positive radial node
});
test('probability sampling is repeatable and has hydrogenic radial/angular moments',()=>{
 const sample=sampleOrbital(1,0,0,12000),radius=sample.points.map(p=>Math.hypot(p.x,p.y,p.z));
 assert.ok(Math.abs(radius.reduce((a,b)=>a+b,0)/radius.length-3)<.09); // rho=2r/a0, mean rho=3
 assert.deepEqual(sampleOrbital(2,1,0,20),sampleOrbital(2,1,0,20));
 const p=sampleOrbital(2,1,0,12000),meanZ=p.points.reduce((sum,a)=>sum+a.z*a.z/(a.x*a.x+a.y*a.y+a.z*a.z),0)/p.points.length;
 assert.ok(Math.abs(meanZ-.6)<.02,`p_z mean cos² theta = ${meanZ}`);
 for(const point of sampleOrbital(7,3,-2,300).points)assert.ok(Object.values(point).every(Number.isFinite));
});
test('each orbital type has a unique color, correct orientation count, and no invalid quantum numbers run',()=>{
 assert.equal(new Set(Object.values(orbitalColors)).size,4);
 for(let l=0;l<4;l++)assert.equal(orbitalOrientations[orbitalTypes[l]].length,2*l+1);
 for(const q of [[1,1,0],[0,0,0],[3,2,3],[8,0,0]])assert.throws(()=>sampleOrbital(...q));
});
