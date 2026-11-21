import {useId,useMemo} from 'react';
import type {Dataset,ElementRecord} from '../../types';
import Provenance from '../../components/Provenance';
import {occupiedSubshells,orbitalColors,orbitalTypes} from './orbitals';
import './configuration-diagram.css';

// The conventional diagonal guide through 7p, with unoccupied 8s as the next step.
const rows=[1,2,3,4,4,3,2,1];
const nodes=rows.flatMap((length,index)=>orbitalTypes.slice(0,length).map((type,l)=>({n:index+1,l,type,x:145+l*85,y:62+index*52})));
const diagonals=Array.from({length:8},(_,index)=>nodes.filter(node=>node.n+node.l===index+1).sort((a,b)=>a.n-b.n));
export default function ElectronConfiguration({element,dataset}:{element:ElementRecord;dataset:Dataset}){
 const marker=useId().replace(/[^a-zA-Z0-9_-]/g,'')+'-filling-arrow';
 const occupied=useMemo(()=>occupiedSubshells(element,dataset.elements),[element,dataset.elements]);
 const counts=new Map(occupied.map(s=>[`${s.n}${s.type}`,s.count]));
 return <section className="configuration-diagram" aria-labelledby={`${marker}-title`}>
  <h2 id={`${marker}-title`}>Electron filling diagram</h2>
  <p className="configuration-current">{element.configuration??'Configuration unavailable'}<small>{element.configurationStatus}</small></p>
  <div className="configuration-color-key" aria-label="Subshell color and maximum electron count">{orbitalTypes.map((type,l)=><span key={type}><i style={{background:orbitalColors[type]}} aria-hidden="true"/>{type} · {2*(2*l+1)} e⁻</span>)}</div>
  <svg className="configuration-diagonal-svg" viewBox="0 0 480 465" role="img" aria-label={`Diagonal electron-filling guide for ${element.name}. ${occupied.length?occupied.map(s=>`${s.n}${s.type}: ${s.count} electrons`).join('; '):'Occupations unavailable'}. Arrows show the usual filling order; actual occupations include configuration exceptions.`}>
   <defs><marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#cf3974"/></marker></defs>
   {orbitalTypes.map((type,l)=><text key={type} x={145+l*85} y={20} textAnchor="middle" fill={orbitalColors[type]} fontSize="18" fontWeight="700">{type}</text>)}
   {rows.map((_,index)=><text key={index} x="18" y={68+index*52} fill="#375d50" fontSize="20">n = {index+1}</text>)}
   {diagonals.map((line,index)=>{const start=line[0],end=line.at(-1)!;return <line key={index} x1={start.x+26} y1={start.y-16} x2={end.x-45} y2={end.y+28} stroke="#cf3974" strokeWidth="3" strokeLinecap="round" markerEnd={`url(#${marker})`}/>})}
   {nodes.map(node=>{const label=`${node.n}${node.type}`,count=counts.get(label)??0;return <g key={label} data-subshell={label} data-electrons={occupied.length?count:'unknown'}>
    <title>{`${label}: ${occupied.length?`${count} electrons${count?'':' · unoccupied guide'}`:'occupation unavailable'}`}</title>
    <circle cx={node.x} cy={node.y} r="22" fill={count?orbitalColors[node.type]:'#fffdf6'} stroke={orbitalColors[node.type]} strokeWidth={count?2:1.4} strokeDasharray={count?undefined:'3 2'}/>
    <text x={node.x} y={node.y+6} textAnchor="middle" fontSize="18" fontWeight="700" fill={count?(node.type==='s'?'#172c26':'#fff'):orbitalColors[node.type]}>{label}{count>0&&<tspan baselineShift="super" fontSize="10">{count}</tspan>}</text>
   </g>})}
  </svg>
  <p className="configuration-diagram-note">Solid circles show occupied subshells; superscripts show electron counts. Follow the diagonal arrows for the usual filling order—not electron motion. Actual counts preserve configuration exceptions; 8s is a guide only.</p>
  <p className="configuration-diagram-source">Guide: <a href="https://openstax.org/books/chemistry-2e/pages/6-4-electronic-structure-of-atoms-electron-configurations" target="_blank" rel="noreferrer">OpenStax · Electron configurations ↗</a></p>
  <Provenance dataset={dataset} sourceIds={element.electronSourceIds}/>
 </section>;
}
