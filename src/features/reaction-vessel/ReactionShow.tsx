import {useEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import type {Reaction} from '../../domain/reactions/types';
import './reaction-show.css';

export interface ReactionShowProps {
 runId:number;
 scenario:Reaction;
 onComplete:()=>void;
 motion:boolean;
}

/** Each run has its own timer and completion guard, including rapid repeat runs. */
export default function ReactionShow(props:ReactionShowProps){
 return <ReactionScene key={props.runId} {...props}/>;
}

function ReactionScene({runId,scenario,onComplete,motion}:ReactionShowProps){
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
 const accent=cold?'#9be5ff':hot?'#ff974e':'#b5dbc9';
 const style={'--rs-accent':accent,'--rs-gas':scenario.visual?.gasColor??'transparent','--rs-solid':scenario.visual?.solidColor??'#d5dfdf'} as CSSProperties;
 const particles=Array.from({length:28},(_,i)=>{
  // Stable arithmetic keeps paths reproducible and avoids random work on rerender.
  const seed=((runId+1)*137+i*719)%997;
  return {'--i':i,'--x':`${(seed%91)-45}%`,'--drift':`${((seed*13)%321)-160}px`,'--rise':`${180+(seed%260)}px`,'--delay':`${(i%8)*.095}s`,'--turn':`${(seed%180)-90}deg`,'--size':`${3+seed%7}px`} as CSSProperties;
 });
 const label=unchanged?'Substances remain unchanged':cold?(scenario.visual?.freezing?'Freezing':'Cooling'):has('blast')?'Rapid energy release':has('flame')?'Combustion':has('heat')?'Heat released':gas?'Gas evolving':has('solid')?'Solid forming':physical?'Phase change in progress':'Atoms rearranging';
 return <aside className={`reaction-show ${calm?'rs-calm':''} ${hot?'rs-hot':''} ${cold?'rs-cold':''}`} style={style} aria-label="Reaction animation">
  <div className="rs-atmosphere" aria-hidden="true"/>
  <header className="rs-header"><div><span className="rs-eyebrow">THE MOMENT OF CHANGE</span><p>{scenario.title}</p></div><button type="button" className="rs-skip" onClick={complete}>Skip animation <span aria-hidden="true">↗</span></button></header>
  <div className="rs-stage" aria-hidden="true">
   <div className="rs-orbit rs-orbit-one"/><div className="rs-orbit rs-orbit-two"/>
   <div className="rs-horizon"/>
   <div className="rs-origin"><div className="rs-core"/><div className="rs-halo"/>
    {has('flame')&&<div className="rs-fire">{[0,1,2,3,4].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}</div>}
    {has('blast')&&<><div className="rs-shock rs-shock-one"/><div className="rs-shock rs-shock-two"/></>}
    {gas&&<div className={`rs-gas ${scenario.visual?.gasColor?'rs-gas-colored':'rs-gas-invisible'}`}>{[0,1,2,3,4,5].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}</div>}
    {(hot||cold||has('solid'))&&<div className="rs-particles">{particles.map((particle,i)=><i key={i} className={cold?'rs-snow':hot?'rs-ember':'rs-grain'} style={particle}>{cold?'✧':''}</i>)}</div>}
    {(freezing||has('solid'))&&<div className={`rs-crystals ${freezing?'rs-frost':''}`}>{[0,1,2,3,4,5,6].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}</div>}
    {!hot&&!cold&&!has('solid')&&<div className="rs-molecules">{[0,1,2,3,4,5].map(i=><i key={i} style={{'--i':i} as CSSProperties}/>)}</div>}
   </div>
   <div className="rs-scene-label"><span/><p>{label}</p></div>
  </div>
  <footer className="rs-footer"><div role="status"><span className="rs-eyebrow">{unchanged?'OBSERVING THE MIXTURE':physical?'PHASE CHANGE IN PROGRESS':'REACTION IN PROGRESS'}</span><h2>{unchanged?'Observing mixture':physical?'Transforming':'Reacting'}<span className="rs-dots">…</span></h2><p>{unchanged?'Substances remain unchanged.':physical?'Phase change in progress. The same substance, a new state.':'Atoms rearranging. A new story taking shape.'}</p></div><div className="rs-progress" aria-hidden="true"><i/></div><p className="rs-caption">Conceptual visualization{cold&&!freezing?' · Cooling does not imply freezing':''}{gas&&!scenario.visual?.gasColor?' · Colorless gas shown as outlines':''}</p></footer>
 </aside>;
}
