import {useEffect,useId,useState} from 'react';
import type {ElementRecord} from '../../types';
import {isInSpectrumRange,linePosition,loadSpectra,stateLabel,wavelengthColor,type SpectralLine,type SpectralState,type SpectraDataset} from './spectra';
import './spectra.css';

function StateDescription({state}:{state:SpectralState}){
 return <p className="spectral-state"><span>{state.configuration||'configuration unspecified'}</span>{(state.term||state.j)&&<strong>{[state.term,state.j?`J=${state.j}`:''].filter(Boolean).join(' · ')}</strong>}<span>{state.energyText} cm⁻¹</span></p>;
}
export function StateTransition({line}:{line:SpectralLine}){
 if(!line.lower||!line.upper)return <p className="spectrum-note">State assignments unavailable in this reference.</p>;
 return <div className="spectral-transition" aria-label="Absorption goes from the lower to the upper state; emission goes from the upper to the lower state."><StateDescription state={line.lower}/><div className="spectral-transition-directions"><span>Absorb <b aria-hidden="true">→</b></span><span><b aria-hidden="true">←</b> Emit</span></div><StateDescription state={line.upper}/></div>;
}

export function SpectrumStrips({lines,selected,onSelect}:{lines:SpectralLine[];selected:SpectralLine|null;onSelect:(id:string)=>void}){
 const gradient=useId(),visible=lines.filter(isInSpectrumRange);
 return <div className="spectrum-strips"><svg viewBox="0 0 300 133" role="group" aria-label="Absorption and emission spectra, 330 to 830 nanometers">
 <defs><linearGradient id={gradient}>{[330,355,380,420,460,500,540,580,620,660,700,740,780,805,830].map(nm=><stop key={nm} offset={`${linePosition(nm)*100}%`} stopColor={wavelengthColor(nm)??'#b6b9c5'}/>)}</linearGradient></defs>
 <text x="0" y="12">Absorption · black lines</text><rect x="5" y="21" width="290" height="30" rx="4" fill={`url(#${gradient})`}/>
 <text x="0" y="72">Emission · colored lines</text><rect x="5" y="81" width="290" height="30" rx="4" fill="#11151d"/>
 {visible.map(line=>{const x=5+290*linePosition(line.wavelengthNm);return <g key={line.id} role="button" tabIndex={0} aria-label={`Select ${line.wavelengthText} nanometers transition`} aria-pressed={selected?.id===line.id} onClick={()=>onSelect(line.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(line.id)}}}>
 <title>{`${line.wavelengthText} nm: ${stateLabel(line.lower)} ↔ ${stateLabel(line.upper)}`}</title>
 <path d={`M${x} 22v28`} stroke="#080808" strokeWidth="1.7"/><path d={`M${x} 82v28`} stroke={wavelengthColor(line.wavelengthNm)??'#b6b9c5'} strokeWidth="2"/>
 <rect x={x-3} y="20" width="6" height="92" fill="transparent"/>
 {selected?.id===line.id&&<><path d={`M${x-3} 16h6l-3 4z`} fill="currentColor"/><path d={`M${x-3} 113h6l-3 4z`} fill="currentColor"/></>}
 </g>})}
 <text x="5" y="130">330</text><text x="150" y="130" textAnchor="middle">Wavelength / nm</text><text x="295" y="130" textAnchor="end">830</text>
 </svg><p className="spectrum-note">UV and IR edge fades are illustrative.</p>{!visible.length&&<p className="spectrum-note">This reference has no lines from 330–830 nm for this atom. Its other listed transitions appear below.</p>}</div>;
}
export function EnergyJump({line}:{line:SpectralLine}){
 const marker=useId(),color=wavelengthColor(line.wavelengthNm)??'#6958a5';
 if(!line.lower||!line.upper)return <div className="spectral-jump"><strong>{line.wavelengthText} nm</strong><p className="spectrum-note">NIST lists this wavelength without a state assignment. An energy-jump diagram is unavailable.</p></div>;
 return <div className="spectral-jump"><strong>{line.wavelengthText} nm <small>({line.medium})</small></strong>
 <svg viewBox="0 0 300 137" role="img" aria-label={`Absorption: ${stateLabel(line.lower)} to ${stateLabel(line.upper)}. Emission reverses this jump. Energy levels ${line.lower.energyText} and ${line.upper.energyText} reciprocal centimeters.`}>
 <defs><marker id={marker} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill={color}/></marker></defs>
 <text x="7" y="15">Higher energy · {line.upper.energyText} cm⁻¹</text><path d="M9 29H291 M9 103H291" stroke="#547563" strokeWidth="2"/>
 <text x="7" y="126">Lower energy · {line.lower.energyText} cm⁻¹</text>
 <path d="M79 96V36" stroke={color} strokeWidth="3" markerEnd={`url(#${marker})`}/><path d="M221 36V96" stroke={color} strokeWidth="3" markerEnd={`url(#${marker})`}/>
 <text x="88" y="65">Absorb ↑</text><text x="145" y="84">Emit ↓</text>
 </svg><p className="spectrum-note">Two-level guide · spacing is schematic.</p></div>;
}
export default function SpectraView({element}:{element:ElementRecord}){
 const [data,setData]=useState<SpectraDataset|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),[selectedId,setSelectedId]=useState<string|null>(null),[range,setRange]=useState<'visible'|'all'|null>(null);
 useEffect(()=>{let active=true;setError('');loadSpectra().then(value=>{if(active)setData(value)}).catch(()=>{if(active)setError('The spectrum snapshot could not be loaded.')});return()=>{active=false}},[retry]);
 if(error)return <section className="spectra-panel"><h2>Absorption & emission</h2><p role="alert">{error}</p><button onClick={()=>setRetry(n=>n+1)}>Try again</button></section>;
 if(!data)return <section className="spectra-panel" aria-busy="true"><h2>Absorption & emission</h2><p>Loading atomic lines…</p></section>;
 const spectrum=data.elements.find(record=>record.z===element.z)!;
 const visible=spectrum.lines.filter(isInSpectrumRange),activeRange=range??(visible.length?'visible':'all'),lines=activeRange==='visible'?visible:spectrum.lines;
 const selected=lines.find(line=>line.id===selectedId)??lines[0]??null;
 return <section className="spectra-panel" aria-labelledby="spectra-heading"><h2 id="spectra-heading">Absorption & emission</h2><p className="spectra-subtitle">{element.name} · {element.symbol} I · neutral atom</p>
 <SpectrumStrips lines={spectrum.lines} selected={selected} onSelect={id=>{setRange('visible');setSelectedId(id)}}/>
 <p className="spectrum-note">Paired transition guide. Absorption requires atoms in the lower state. Line colors are approximate; brightness and widths are illustrative.</p>
 {spectrum.lines.length>0?<><div className="spectra-range" role="group" aria-label="Spectral wavelength range"><button aria-pressed={activeRange==='visible'} onClick={()=>setRange('visible')}>330–830 nm ({visible.length})</button><button aria-pressed={activeRange==='all'} onClick={()=>setRange('all')}>All reference lines ({spectrum.lines.length})</button></div>
 {selected&&<EnergyJump line={selected}/>}
 <p className="spectrum-note">Select a wavelength to see its energy jump. ↑ absorption · ↓ emission</p>
 {lines.length===0&&<p>No lines from 330–830 nm are listed in this reference. Choose All reference lines to explore the available transitions.</p>}
 <ol className="spectral-lines" aria-label="Wavelengths and state transitions">{lines.map(line=><li key={line.id} className={selected?.id===line.id?'selected':''}><button className="spectral-line-select" aria-pressed={selected?.id===line.id} onClick={()=>setSelectedId(line.id)}><span className="spectral-swatch" style={{background:wavelengthColor(line.wavelengthNm)??'#8a8e96'}}/><strong>{line.wavelengthText} nm</strong><small>{line.wavelengthNm<380?'UV':line.wavelengthNm>780?'IR':'visible'} · {line.medium}</small></button>
 <StateTransition line={line}/>
 </li>)}</ol></>:<p>{spectrum.status==='outside-reference'?'This element is outside the NIST Handbook’s coverage (Z = 1–99).':'A neutral-atom transition table is unavailable in this reference.'} No wavelengths or state assignments are inferred.</p>}
 <details className="spectra-source"><summary>Source · {data.version}</summary><p><a href={spectrum.url} target="_blank" rel="noreferrer">NIST · {element.name} reference ↗</a></p><p>{data.source.attribution}</p><p>Retrieved {spectrum.retrievedAt?.slice(0,10)??data.builtAt.slice(0,10)} UTC. Source evaluation date: {data.source.upstreamDate??'not supplied'}.</p><p>Selected persistent lines, not a complete line catalogue. Fine-structure lines may overlap on the strip. Configuration, term and J labels follow NIST; a blank term or J is left unspecified.</p><p>{data.source.wavelengthConvention} Energies are relative to the atomic ground level, in cm⁻¹.</p><a href={data.source.url} target="_blank" rel="noreferrer">How to read the NIST tables ↗</a></details>
 </section>;
}
