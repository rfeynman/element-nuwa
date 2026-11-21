import {useEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import type {Reaction} from '../../domain/reactions/types';
import './reaction-show.css';

export interface ReactionShowProps {
 runId:number;
 scenario:Reaction;
 onComplete:()=>void;
 motion:boolean;
 /** A reviewed scene-specific color; absent colors use an illustrative warm glow. */
 flameColor?:string;
 anchor?:{left:number;top:number;width:number;height:number};
}

/** Each run has its own timer and completion guard, including rapid repeat runs. */
export default function ReactionShow(props:ReactionShowProps){
 return <ReactionScene key={props.runId} {...props}/>;
}

function ReactionScene({runId,scenario,onComplete,motion,anchor,flameColor}:ReactionShowProps){
 const [reduced,setReduced]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const completeRef=useRef(onComplete);
 const finished=useRef(false);
 completeRef.current=onComplete;
 const calm=!motion||reduced;
 const complete=()=>{if(!finished.current){finished.current=true;completeRef.current()}};
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>setReduced(media.matches);
  media.addEventListener('change',update);
  return()=>media.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  const timer=window.setTimeout(complete,calm?250:3200);
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')complete()};
  window.addEventListener('keydown',escape);
  return()=>{window.clearTimeout(timer);window.removeEventListener('keydown',escape)};
 // Completion uses the latest callback without restarting a running scene.
 },[calm]);
 const unchanged=scenario.outcome==='no-reaction';
 const physical=scenario.process==='physical';
 const has=(effect:Reaction['effects'][number])=>!unchanged&&scenario.effects.includes(effect);
 const hot=has('flame')||has('heat')||has('blast');
 const cold=has('cooling');
 const freezing=cold&&!!scenario.visual?.freezing;
 const gas=has('gas');
 const toxicGas=gas&&has('toxic');
 // Read explicit observations, never infer emission color from a reactant's ion.
 const flameObservation=scenario.observations?.find(o=>/flame/i.test(o))??'';
 // Scenario-specific reference checked 2026-11-20: WebElements magnesium/chemistry.html.
 // White magnesium combustion is incandescence; do not infer it from Mg ion flame tests.
 const referenceColor=scenario.id==='magnesium-oxygen'?'#f4f8ff':undefined;
 const observedColor=referenceColor??(/bluish.white flame/i.test(flameObservation)?'#c6ecff':/white flame/i.test(flameObservation)?'#f4f8ff':/yellow flame/i.test(flameObservation)?'#ffe04b':/blue flame/i.test(flameObservation)?'#72baff':/green flame/i.test(flameObservation)?'#86e4a1':undefined);
 const fireColor=flameColor??observedColor??'#ffae68';
 const accent=cold?'#9be5ff':hot?'#ff974e':'#b5dbc9';
 const viewportWidth=typeof window==='undefined'?1024:window.innerWidth;
 const viewportHeight=typeof window==='undefined'?768:window.innerHeight;
 const width=Math.min(620,Math.max(0,viewportWidth-16));
 const height=Math.min(viewportWidth<=760?450:550,Math.max(0,viewportHeight-16));
 const originX=anchor?anchor.left+anchor.width/2:viewportWidth/2;
 const originY=anchor?anchor.top+anchor.height/2:viewportHeight/2;
 const left=Math.max(8,Math.min(viewportWidth-width-8,originX-width/2));
 const top=Math.max(8,Math.min(viewportHeight-height-8,originY-height*.6));
 const style={left,top,width,height,'--rs-origin-x':`${originX-left}px`,'--rs-origin-y':`${originY-top}px`,'--rs-accent':accent,'--rs-fire-color':fireColor,'--rs-gas':scenario.visual?.gasColor??'transparent','--rs-solid':scenario.visual?.solidColor??'#d5dfdf'} as CSSProperties;
 const particles=Array.from({length:28},(_,i)=>{
  // Stable arithmetic keeps paths reproducible and avoids random work on rerender.
  const seed=((runId+1)*137+i*719)%997;
  return {'--i':i,'--x':`${(seed%91)-45}%`,'--drift':`${((seed*13)%321)-160}px`,'--rise':`${180+(seed%260)}px`,'--delay':`${(i%8)*.095}s`,'--turn':`${(seed%180)-90}deg`,'--size':`${3+seed%7}px`} as CSSProperties;
 });
 const label=unchanged?'Substances remain unchanged':cold?(scenario.visual?.freezing?'Freezing':'Cooling'):has('blast')?'Rapid energy release':has('flame')?'Combustion':has('heat')?'Heat released':gas?'Gas evolving':has('solid')?'Solid forming':physical?'Phase change in progress':'Atoms rearranging';
 return <aside className={`reaction-show ${calm?'rs-calm':''} ${hot?'rs-hot':''} ${cold?'rs-cold':''}`} style={style} aria-label="Reaction animation">
  <button type="button" className="rs-skip" onClick={complete}>Skip animation <span aria-hidden="true">↗</span></button>
  <div className="rs-stage" aria-hidden="true">
   <div className="rs-origin"><div className="rs-core"/><div className="rs-halo"/>
    {has('flame')&&<><div className="rs-scorch"><i/><i/></div><div className="rs-fire">{[0,1,2,3,4,5,6].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}</div></>}
    {has('blast')&&<><div className="rs-shock rs-shock-one"/><div className="rs-shock rs-shock-two"/></>}
    {toxicGas&&<><div className="rs-poison-mist">{[0,1,2,3,4,5,6].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}</div><span className="rs-toxic">☠ <span>Toxic gas</span></span></>}
    {gas&&<div className={`rs-gas ${scenario.visual?.gasColor?'rs-gas-colored':'rs-gas-invisible'}`}>{[0,1,2,3,4,5].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}</div>}
    {has('heat')&&<div className="rs-overflow">{[0,1,2,3,4,5,6,7,8,9].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}<span/><span/></div>}
    {cold&&<div className="rs-icefall">{[0,1,2,3,4,5].map(i=><i key={i} style={{'--i':i} as CSSProperties}>{i%2?'❄':''}</i>)}</div>}
    {(hot||cold||has('solid'))&&<div className="rs-particles">{particles.map((particle,i)=><i key={i} className={cold?'rs-snow':hot?'rs-ember':'rs-grain'} style={particle}>{cold?'✧':''}</i>)}</div>}
    {(freezing||has('solid'))&&<div className={`rs-crystals ${freezing?'rs-frost':''}`}>{[0,1,2,3,4,5,6].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}</div>}
    {!hot&&!cold&&!has('solid')&&<div className="rs-molecules">{[0,1,2,3,4,5].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}</div>}
   </div>
  </div>
  <footer className="rs-footer"><div role="status"><p className="rs-scene-label">{label}</p><p>{unchanged?'Observing mixture':physical?'Phase change in progress':'Reaction in progress'}<span className="rs-dots">…</span></p></div><p className="rs-caption">Symbolic effects{has('flame')?' · Temporary table scorch': ''}{has('flame')&&!observedColor&&!flameColor?' · Illustrative flame color':''}{cold&&!freezing?' · Ice represents cooling, not freezing':''}{has('heat')?' · Bubbles represent heat, not boiling':''}{toxicGas?' · White mist marks toxicity, not actual gas color':gas&&!scenario.visual?.gasColor?' · Colorless gas shown as outlines':''}</p></footer>
 </aside>;
}
