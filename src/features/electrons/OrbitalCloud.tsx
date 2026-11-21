import {useEffect,useMemo,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import {orbitalColors,orbitalTypes,sampleOrbital,sampleCombinedCloud,type OrbitalType,type Subshell} from './orbitals';
export default function OrbitalCloud({n,type,m,label,combined}:{n:number;type:OrbitalType;m:number;label:string;combined?:{subshells:Subshell[];types:OrbitalType[]}}){
 const canvas=useRef<HTMLCanvasElement>(null),drag=useRef<{x:number;y:number}|null>(null);
 const initialView={yaw:.55,tilt:type==='d'&&Math.abs(m)===2?1.15:type==='f'?.65:-.25};
 const [view,setView]=useState(initialView),[rotate,setRotate]=useState(false);
 const sample=useMemo(()=>{if(combined)return sampleCombinedCloud(combined.subshells,combined.types);const single=sampleOrbital(n,orbitalTypes.indexOf(type),m);return {...single,points:single.points.map(p=>({...p,type}))}},[n,type,m,combined]);
 useEffect(()=>{
  const node=canvas.current;if(!node)return;const ctx=node.getContext('2d');if(!ctx)return;
  let frame=0,last=0,offset=0;const media=matchMedia('(prefers-reduced-motion: reduce)');
  function paint(){if(!node||!ctx)return;const width=node.clientWidth,height=320,dpr=Math.min(devicePixelRatio||1,2);node.width=width*dpr;node.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
   const cy=Math.cos(view.yaw+offset),sy=Math.sin(view.yaw+offset),cx=Math.cos(view.tilt),sx=Math.sin(view.tilt),scale=Math.min(width,320)*.43/sample.scale;
   const project=(x:number,y:number,z:number)=>{const a=cy*x+sy*y,b=-sy*x+cy*y;return {x:width/2+a*scale,y:height/2-(cx*z-sx*b)*scale,depth:sx*z+cx*b}};
   ctx.strokeStyle='#62806c42';ctx.lineWidth=.8;ctx.fillStyle='#55715e';ctx.font='11px system-ui';
   for(const [x,y,z,name] of [[sample.scale,0,0,'x'],[0,sample.scale,0,'y'],[0,0,sample.scale,'z']] as const){const end=project(x,y,z),start=project(-x,-y,-z);ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.fillText(name,end.x+4,end.y-4)}
   const points=sample.points.map(p=>({...project(p.x,p.y,p.z),type:p.type})).sort((a,b)=>a.depth-b.depth);
   for(const p of points){ctx.fillStyle=orbitalColors[p.type];ctx.globalAlpha=.12+.42*Math.max(0,Math.min(1,(p.depth/sample.scale+1)/2));ctx.beginPath();ctx.arc(p.x,p.y,.8+.4*Math.max(0,Math.min(1,(p.depth/sample.scale+1)/2)),0,2*Math.PI);ctx.fill()}
   ctx.globalAlpha=1;ctx.fillStyle='#304f45';ctx.beginPath();ctx.arc(width/2,height/2,3,0,2*Math.PI);ctx.fill();
  }
  function tick(time:number){if(time-last>32){offset+=.007;paint();last=time}frame=requestAnimationFrame(tick)}
  function motion(){cancelAnimationFrame(frame);paint();if(rotate&&!media.matches)frame=requestAnimationFrame(tick)}
  const observer=new ResizeObserver(paint);observer.observe(node);media.addEventListener('change',motion);motion();
  return()=>{observer.disconnect();cancelAnimationFrame(frame);media.removeEventListener('change',motion)};
 },[sample,view,rotate,type]);
 return <div style={{'--cloud-color':orbitalColors[type]} as CSSProperties}>
  <div className="electron-stage"><canvas ref={canvas} className="orbital-canvas" role="img" tabIndex={0} aria-label={`${label} probability cloud. Drag or use arrow keys to rotate the view.`}
   onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY};setRotate(false)}}
   onPointerMove={e=>{if(!drag.current)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;drag.current={x:e.clientX,y:e.clientY};setView(v=>({yaw:v.yaw+dx*.012,tilt:Math.max(-1.4,Math.min(1.4,v.tilt+dy*.012))}))}}
   onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}
   onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();setRotate(false);setView(v=>({yaw:v.yaw+(e.key==='ArrowLeft'?-.16:e.key==='ArrowRight'?.16:0),tilt:Math.max(-1.4,Math.min(1.4,v.tilt+(e.key==='ArrowUp'?.16:e.key==='ArrowDown'?-.16:0)))}))}}}>
   {label}: a colored, rotatable probability distribution. The adjacent text describes its shape and quantum numbers.
  </canvas><span className="electron-stage-caption">DRAG TO ROTATE · POINTS SAMPLE PROBABILITY</span></div>
  <div className="electron-model-controls"><button onClick={()=>{setRotate(false);setView(v=>({...v,yaw:v.yaw-.35}))}} aria-label="Rotate cloud left">↶ Left</button><button onClick={()=>setRotate(v=>!v)} aria-pressed={rotate}>{rotate?'Pause rotation':'Rotate cloud'}</button><button onClick={()=>{setRotate(false);setView(initialView)}}>Reset view</button></div>
 </div>;
}
