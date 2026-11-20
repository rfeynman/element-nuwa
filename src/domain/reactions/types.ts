export interface Substance { id:string; name:string; formula:string; state:string; composition:Record<string,number>; charge:number; elementZ?:number }
export interface ReactionSource { id:string; name:string; url:string; retrievedAt:string; upstreamDate:string|null; attribution?:string; licenseUrl?:string }
export type ActivationMethod = 'none'|'heat'|'light'|'ignition'|'electricity'|'cooling';
export type Atmosphere = 'air'|'oxygen'|'inert';
export interface ReactionConditions { activation:ActivationMethod; atmosphere:Atmosphere }
export type Effect = 'heat'|'flame'|'gas'|'steam'|'solid'|'toxic'|'blast'|'cooling';
export interface Reaction { id:string; title:string; reactants:{id:string;coefficient:number}[]; products:{id:string;coefficient:number}[]; condition:'ambient'|'activation'; conditionLabel:string; process?:'chemical'|'physical'; execution?:'modeled'|'equation-only'; requiredActivation?:ActivationMethod[]; requiredAtmosphere?:Atmosphere; visual?:{gasColor?:string;solidColor?:string;solutionColor?:string;freezing?:boolean}; outcome:'reaction'|'no-reaction'; effects:Effect[]; observations:string[]; explanation:string; sourceIds:string[]; reviewStatus:'source-checked'|'draft' }
export interface ReactionLibrary { version:string; updatedAt:string; substances:Substance[]; reactions:Reaction[]; sources:ReactionSource[] }
export type ReactionResult = {kind:'reaction'|'no-reaction';scenario:Reaction}|{kind:'missing-condition';scenario:Reaction}|{kind:'choose-scenario';scenarios:Reaction[]}|{kind:'unsupported'|'invalid';message:string};
