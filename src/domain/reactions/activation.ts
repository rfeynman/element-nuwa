import {findReactionScenarios} from './engine';
import type {Reaction, ReactionConditions, ReactionLibrary} from './types';

/** Only offer conditions explicitly supported by modeled records for these exact inputs. */
export function activationChoices(library:ReactionLibrary, ingredients:string[]){
 const choices=new Map<string,{conditions:ReactionConditions;scenarios:Reaction[]}>();
 for(const scenario of findReactionScenarios(library,ingredients)){
  if(scenario.execution==='equation-only')continue;
  for(const activation of scenario.requiredActivation??[scenario.condition==='ambient'?'none':'ignition']){
   const conditions:ReactionConditions={activation,atmosphere:scenario.requiredAtmosphere??'air'};
   const key=`${activation}:${conditions.atmosphere}`;
   const choice=choices.get(key)??{conditions,scenarios:[]};
   choice.scenarios.push(scenario);choices.set(key,choice);
  }
 }
 return [...choices.values()];
}
