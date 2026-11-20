import {useMemo,useState} from 'react';
import type {CSSProperties} from 'react';
import type {Dataset,ElementRecord} from '../../types';
import Provenance from '../../components/Provenance';
import OrbitalCloud from './OrbitalCloud';
import {occupiedSubshells,orbitalColors,orbitalNames,orbitalOrientations,orbitalTypes,type OrbitalType} from './orbitals';
import './electrons.css';

function Configuration({value}:{value:string}){
 return <span aria-label={value}>{value.split(/(\d[spdfgh]\^?\d+)/g).map((part,i)=>{const orbital=part.match(/^(\d[spdfgh])\^?(\d+)$/);return orbital?<span key={i} aria-hidden="true">{orbital[1]}<sup>{orbital[2]}</sup></span>:<span key={i} aria-hidden="true">{part}</span>})}</span>;
}
export default function ElectronView({element,dataset}:{element:ElementRecord;dataset:Dataset}){
 const occupied=useMemo(()=>occupiedSubshells(element,dataset.elements),[element,dataset.elements]);
 const initial=[...occupied].sort((a,b)=>orbitalTypes.indexOf(b.type)-orbitalTypes.indexOf(a.type)||b.n-a.n)[0];
 const [choice,setChoice]=useState(initial?`${initial.n}${initial.type}`:'1s'),[m,setM]=useState(initial?orbitalOrientations[initial.type][0].m:0);
 const type=choice.at(-1) as OrbitalType,n=Number(choice[0]),l=orbitalTypes.indexOf(type),subshell=occupied.find(s=>s.n===n&&s.type===type);
 const orientations=orbitalOrientations[type],orientation=orientations.find(o=>o.m===m)??orientations[0];
 function select(value:string){setChoice(value);setM(orbitalOrientations[value.at(-1) as OrbitalType][0].m)}
 const typePopulation=(t:OrbitalType)=>occupied.filter(s=>s.type===t).reduce((total,s)=>total+s.count,0);
 return <section className="electron-panel" aria-labelledby="electron-heading">
 <div className="electron-heading-row"><div><p className="electron-eyebrow">WHERE AN ELECTRON MAY BE FOUND</p><h2 id="electron-heading">Electron clouds</h2></div><span className="electron-neutral">Neutral atom</span></div>
 <p className="electron-intro">Explore the orbital shapes behind {element.name.toLowerCase()}’s configuration. Denser regions of dots mean a higher probability of finding an electron.</p>
 {occupied.length>0?<>
 <div className="orbital-type-picker" role="group" aria-label="Orbital type">{orbitalTypes.map(t=><button key={t} aria-pressed={type===t} style={{'--cloud-color':orbitalColors[t]} as CSSProperties} onClick={()=>{const latest=occupied.filter(s=>s.type===t).at(-1);select(`${latest?.n??orbitalTypes.indexOf(t)+1}${t}`)}}><b>{t}</b><small>{typePopulation(t)} e⁻</small></button>)}</div>
 <p className="orbital-color-note">Colors identify orbital type, not charge or wavefunction sign. Counts above are electrons in all occupied subshells of that type.</p>
 <div className="orbital-selectors"><label>Subshell<select aria-label="Electron subshell" value={choice} onChange={e=>select(e.target.value)}>{!subshell&&<option value={choice}>{choice} · shape guide (unoccupied)</option>}{occupied.map(s=><option key={`${s.n}${s.type}`} value={`${s.n}${s.type}`}>{s.n}{s.type} · {s.count} electron{s.count===1?'':'s'}</option>)}</select></label><label>Orbital orientation<select aria-label="Orbital orientation" value={orientation.m} onChange={e=>setM(Number(e.target.value))}>{orientations.map(o=><option key={o.m} value={o.m}>{o.label.replaceAll('_',' ')}</option>)}</select></label></div>
 <div className="orbital-selected-label" style={{'--cloud-color':orbitalColors[type]} as CSSProperties}><strong>{n}{type}<sup>{subshell?.count??0}</sup></strong><span>{orbitalNames[type]}<small>{subshell?`${subshell.count} electron${subshell.count===1?'':'s'} in this subshell · showing one orbital`:`Shape guide · ${choice} is unoccupied in ${element.name}`}</small></span></div>
 <OrbitalCloud key={`${choice}-${orientation.m}`} n={n} type={type} m={orientation.m} label={`${choice}, ${orientation.label.replaceAll('_',' ')}, ${orbitalNames[type]}`}/>
 <dl className="orbital-facts"><div><dt>Angular nodes</dt><dd>{l}</dd></div><div><dt>Radial nodes</dt><dd>{n-l-1}</dd></div><div><dt>Orbitals in {type}</dt><dd>{2*l+1}</dd></div></dl>
 <p className="electron-model-note">One orbital can hold up to two electrons. A subshell has {2*l+1} orbital{l?'s':''} and holds up to {2*(2*l+1)} electrons. Its total occupancy does not specify which orientations are occupied.</p>
 </>:<div className="electron-unavailable"><strong>Electron cloud unavailable</strong><p>A complete, validated sourced configuration is required to show occupied subshells.</p></div>}
 <div className="electron-config"><div className="electron-config-heading"><h3>Electron configuration</h3><span>{element.configurationStatus||'Status unavailable'}</span></div><p className="electron-config-value">{element.configuration?<Configuration value={element.configuration}/>: 'Not available in this dataset'}</p></div>
 <details className="orbital-model-details"><summary>How to read this cloud</summary><p>Dots are probability samples for one stationary orbital, not separate electrons. Rotation turns the view, not an electron’s path. The nucleus is the small central dot. The shell summary remains in Element Spotlight above.</p><p>These are hydrogen-like orbital shapes calculated from radial wavefunctions and real spherical harmonics, shown at separate display scales. They illustrate nodes and lobes; they are not calculated many-electron densities or measured atomic sizes for {element.name}. The faint outer tail is clipped by the view; a cloud has no hard boundary. Changing isotopes does not change the neutral-atom electron count.</p><p>For a filled p, d or f subshell, the combined density is spherical; this view shows a selected individual orbital, not the combined subshell or whole atom.</p></details>
 <div className="orbital-model-sources"><p>Shape references: <a href="https://openstax.org/books/chemistry-2e/pages/6-3-development-of-quantum-theory" target="_blank" rel="noreferrer">OpenStax Chemistry 2e ↗</a> · <a href="https://interactivetextbooks.tudelft.nl/introduction-to-quantum-mechanics/content/equationsandconstants.html" target="_blank" rel="noreferrer">TU Delft wavefunctions ↗</a> · <a href="https://openmopac.net/Manual/real_spherical_harmonics.html" target="_blank" rel="noreferrer">MOPAC angular functions ↗</a></p><p>Cloud model 2026.11.20.1 · References checked 2026-11-20 UTC. Configuration sources and snapshot below.</p></div>
 <Provenance dataset={dataset} sourceIds={element.electronSourceIds}/>
 </section>;
}
