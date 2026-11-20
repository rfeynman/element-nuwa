import type {Reaction,ReactionConditions,ReactionLibrary} from '../../domain/reactions/types';
import {reactionConditionsMatch} from '../../domain/reactions/engine';

export default function ReactionOutcomes({library,scenarios,conditions,activeId,onAnimate}:{library:ReactionLibrary;scenarios:Reaction[];conditions:ReactionConditions;activeId?:string;onAnimate:(reaction:Reaction)=>void}){
 const substance=(id:string)=>library.substances.find(s=>s.id===id)!;
 const side=(terms:Reaction['reactants'])=>terms.map(t=>`${t.coefficient===1?'':t.coefficient}${substance(t.id).formula} (${substance(t.id).state})`).join(' + ');
 return <section className="lab-outcome-choices" aria-label="All sourced reaction outcomes"><h4>All sourced outcomes ({scenarios.length})</h4><p>Alternative outcomes may require different conditions. Each equation lists the products formed together in that example.</p>
 {scenarios.map(r=>{const equationOnly=r.execution==='equation-only',ready=reactionConditionsMatch(r,conditions);return <article key={r.id} aria-label={r.title}>
 <strong>{r.title}</strong>{r.id===activeId&&<span className="lab-current-outcome"> · Shown in vessel</span>}
 <ul className="lab-outcome-products">{(r.outcome==='no-reaction'?r.reactants:r.products).map(t=>{const s=substance(t.id);return <li key={s.id}><b>{s.formula}</b> — {s.name} ({s.state})</li>})}</ul>
 <p className="lab-equation">{side(r.reactants)} {r.outcome==='no-reaction'?'⇢ unchanged mixture':`→ ${side(r.products)}`}</p>
 <p><b>Conditions:</b> {r.conditionLabel}</p>
 <p className="lab-outcome-readiness">{equationOnly?'Equation only · full conditions unavailable':ready?'Matches selected conditions':`Requires ${(r.requiredActivation??[r.condition==='ambient'?'none':'ignition']).join(' or ')}${r.requiredAtmosphere?` · ${r.requiredAtmosphere} atmosphere`:''}`}</p>
 {!equationOnly&&<button onClick={()=>onAnimate(r)}>{ready?'Animate this outcome':'Apply conditions & animate'}</button>}
 <p>{r.sourceIds.map(id=>{const source=library.sources.find(s=>s.id===id)!;return <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a>})}</p>
 </article>})}<p className="lab-panel-source">Local snapshot {library.version} · {library.updatedAt.slice(0,10)} UTC. These are the sourced outcomes in this catalogue; coverage is not exhaustive.</p></section>;
}
