import type {ElementRecord} from '../../types';
import type {ReactionLibrary,Reaction} from '../../domain/reactions/types';
export interface ElementPair {key:string;first:ElementRecord;second:ElementRecord;reactions:Reaction[]}
export function pairKey(a:number,b:number){return `${Math.min(a,b)}-${Math.max(a,b)}`}
/** Index elemental starting materials, never infer products from valence or formula existence. */
export function buildElementPairs(elements:ElementRecord[],library:ReactionLibrary):ElementPair[]{
 const bySymbol=new Map(elements.map(e=>[e.symbol,e]));
 const elementalZ=new Map<string,number>();
 for(const s of library.substances){const symbols=Object.keys(s.composition);if(s.charge===0&&symbols.length===1){const element=bySymbol.get(symbols[0]);if(element)elementalZ.set(s.id,element.z)}}
 const scenarios=new Map<string,Reaction[]>();
 for(const r of library.reactions){if(r.reviewStatus!=='source-checked'||r.process==='physical'||r.reactants.length!==2)continue;const a=elementalZ.get(r.reactants[0].id),b=elementalZ.get(r.reactants[1].id);if(a===undefined||b===undefined||a===b)continue;const key=pairKey(a,b);scenarios.set(key,[...(scenarios.get(key)??[]),r])}
 const sorted=[...elements].sort((a,b)=>a.z-b.z),pairs:ElementPair[]=[];
 for(let a=0;a<sorted.length;a++)for(let b=a+1;b<sorted.length;b++){const key=pairKey(sorted[a].z,sorted[b].z);pairs.push({key,first:sorted[a],second:sorted[b],reactions:scenarios.get(key)??[]})}
 return pairs;
}
export function searchPairs(pairs:ElementPair[],query:string){
 const terms=query.trim().toLowerCase().split(/[\s+,]+/).filter(Boolean);
 const matches=(e:ElementRecord,t:string)=>e.symbol.toLowerCase()===t||String(e.z)===t||(t.length>2&&e.name.toLowerCase().includes(t));
 return pairs.filter(p=>terms.every(t=>matches(p.first,t)||matches(p.second,t)));
}
