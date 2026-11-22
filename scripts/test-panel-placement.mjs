import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const directory=await mkdtemp(join(tmpdir(),'electron-panel-placement-'));
const source=await readFile(new URL('../src/features/electrons/panelPlacement.ts',import.meta.url),'utf8');
await writeFile(join(directory,'placement.mjs'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText);
const {avoidElement}=await import(pathToFileURL(join(directory,'placement.mjs')));
await rm(directory,{recursive:true,force:true});
const panel={left:334,top:74,width:360,height:560},viewport={width:1366,height:768};
const overlaps=(a,b)=>a.left<b.left+b.width&&a.left+a.width>b.left&&a.top<b.top+b.height&&a.top+a.height>b.top;
const center=r=>({x:r.left+r.width/2,y:r.top+r.height/2});
test('a fully covered tile moves the panel right and remains uncovered without bouncing',()=>{
 const tile={left:400,top:250,width:50,height:50};
 const next=avoidElement(panel,tile,viewport,334,center(tile));
 assert.ok(next);assert.ok(next.left>panel.left);assert.ok(!overlaps(next,tile));
 assert.equal(avoidElement(next,tile,viewport,334,center(tile)),null);
});
test('partly covered tile is cleared even when the cursor is on its exposed half',()=>{
 const tile={left:680,top:250,width:50,height:50},point={x:724,y:275};
 assert.ok(point.x>panel.left+panel.width);
 const next=avoidElement(panel,tile,viewport,334,point);assert.ok(next);assert.ok(!overlaps(next,tile));
});
test('right-side panel moves back left when it obstructs another element',()=>{
 const right={...panel,left:994},tile={left:1020,top:230,width:50,height:50};
 const next=avoidElement(right,tile,viewport,334,center(tile));assert.ok(next);assert.ok(next.left<right.left);assert.ok(!overlaps(next,tile));
 assert.equal(avoidElement(next,tile,viewport,334,center(tile)),null);
});
test('no movement is requested for an already clear element',()=>{
 assert.equal(avoidElement(panel,{left:800,top:250,width:50,height:50},viewport,334,{x:825,y:275}),null);
 assert.equal(avoidElement(panel,{left:400,top:700,width:50,height:50},viewport,334,{x:425,y:725}),null);
});
test('overlapping near/right positions can fall back to the far left on smaller desktops',()=>{
 const narrow={width:950,height:768},tile={left:600,top:250,width:45,height:45};
 const next=avoidElement(panel,tile,narrow,334,center(tile));assert.ok(next);assert.equal(next.left,12);assert.ok(!overlaps(next,tile));
});
test('docked panel stays inside desktop bounds and each cleared tile stays clear',()=>{
 for(const width of [901,1024,1280,1440,1920])for(let x=20;x<width-60;x+=37){
  const view={width,height:768},tile={left:x,top:220,width:45,height:50};
  const next=avoidElement(panel,tile,view,334,center(tile));
  if(!next)continue;
  assert.ok(next.left>=12&&next.left+next.width<=width-12);
  assert.ok(next.top>=12&&next.top+next.height<=view.height-12);
  assert.ok(!overlaps(next,tile));
  assert.equal(avoidElement(next,tile,view,334,center(tile)),null);
 }
});
