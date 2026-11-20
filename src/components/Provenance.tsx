import type {Dataset} from '../types';
export default function Provenance({dataset,sourceIds}:{dataset:Dataset;sourceIds:string[]}) {
 const sources=dataset.sources.filter(s=>sourceIds.includes(s.id));
 return <details className="provenance"><summary>Sources & data · {dataset.builtAt.slice(0,10)} UTC</summary><div>{sources.length?sources.map(s=><p key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.name} ↗</a><br/>{s.id==='iaea'?'Provider extraction date':'Source edition'}: {s.upstreamDate??'not supplied'} · Retrieved {s.retrievedAt.slice(0,10)}<br/><small>{s.attribution}</small></p>):<p>Source information unavailable for this record.</p>}<p>Local snapshot {dataset.version} · Built {dataset.builtAt.slice(0,10)}</p></div></details>
}
