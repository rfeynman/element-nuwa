export interface Substance { id:string; name:string; formula:string; state:string; composition:Record<string,number>; charge:number; elementZ?:number }
export interface ReactionSource { id:string; name:string; url:string; retrievedAt:string; upstreamDate:string|null }
export type Effect = 'heat'|'flame'|'gas'|'steam'|'solid'|'toxic'|'blast'|'cooling';
export interface Reaction { id:string; title:string; reactants:{id:string;coefficient:number}[]; products:{id:string;coefficient:number}[]; condition:'ambient'|'activation'; conditionLabel:string; outcome:'reaction'|'no-reaction'; effects:Effect[]; observations:string[]; explanation:string; sourceIds:string[]; reviewStatus:'source-checked'|'draft' }
export interface ReactionLibrary { version:string; updatedAt:string; substances:Substance[]; reactions:Reaction[]; sources:ReactionSource[] }
export type ReactionResult = {kind:'reaction'|'no-reaction';scenario:Reaction}|{kind:'missing-condition';scenario:Reaction}|{kind:'unsupported'|'invalid';message:string};
