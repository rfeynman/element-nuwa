"""Merge source-explicit binary equations after build.py; never fill unsourced pairs."""
from pathlib import Path
from copy import deepcopy
from collections import Counter
from functools import reduce
import datetime,hashlib,json,math,re
ROOT=Path(__file__).resolve().parents[2]
EXCLUDED={
 'binary-selenium-i2-sei4':'Solid SeI4 endpoint is not corroborated by the primary selenium–iodine study (DOI 10.1021/ic00048a017).',
 'binary-selenium-f2-sef4':'Copied solid SeF4 phase conflicts with Inorganic Syntheses vol. 24, section 9; correction requires separately sourced conditions.'
}
def identity(s):return (tuple(sorted(s['composition'].items())),s['state'],s['charge'])
def canonical(r):
 terms=r['reactants']+r['products']; divisor=reduce(math.gcd,(t['coefficient'] for t in terms))
 return tuple(tuple(sorted((t['id'],t['coefficient']//divisor) for t in r[side])) for side in ('reactants','products'))
def learner_name(s,elements):
 if not re.fullmatch(r'(?:[A-Z][a-z]?|[0-9]|[()])+',s['name']):return
 c=s['composition']
 explicit={'Li2O2':'Lithium peroxide','Na2O2':'Sodium peroxide','K2O2':'Potassium peroxide','BaO2':'Barium peroxide','SrO2':'Strontium peroxide','KO2':'Potassium superoxide','RbO2':'Rubidium superoxide','CsO2':'Cesium superoxide','Co3O4':'Cobalt(II,III) oxide','Fe3O4':'Iron(II,III) oxide','Mn3O4':'Manganese(II,III) oxide','TiN':'Titanium nitride','SiO2':'Silicon dioxide'}
 formula=s['id'].rsplit('-',1)[0]
 if formula in explicit:s['name']=explicit[formula];return
 if len(c)!=2 or s['charge']!=0:return
 anions={'F':('fluoride',1),'Cl':('chloride',1),'Br':('bromide',1),'I':('iodide',1),'O':('oxide',2),'N':('nitride',3)}
 anion=next((a for a in anions if a in c),None)
 if not anion:return
 metal=next(a for a in c if a!=anion);element=next((e for e in elements if e['symbol']==metal),None)
 if not element:return
 value=c[anion]*anions[anion][1]/c[metal];roman={1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII'}
 if value not in roman:return
 fixed={'Li':1,'Na':1,'K':1,'Rb':1,'Cs':1,'Be':2,'Mg':2,'Ca':2,'Sr':2,'Ba':2,'Al':3,'Zn':2,'Sc':3,'Ag':1}
 oxidation='' if fixed.get(metal)==value else '('+roman[value]+')'
 s['name']=element['name']+oxidation+' '+anions[anion][0]
def main():
 target=ROOT/'public/data/reactions.json';data=json.loads(target.read_text());extra=json.loads((ROOT/'data/reactions/binary-elements-extra.json').read_text());elements=json.loads((ROOT/'public/data/explorer.json').read_text())['elements']
 # Re-running merges is idempotent in scientific content.
 if data['version'].endswith('.3'):raise SystemExit('Already merged. Run build.py first to rebuild the reviewed base.')
 accepted=[r for r in extra['reactions'] if r['id'] not in EXCLUDED]
 used_extra={t['id'] for r in accepted for side in ('reactants','products') for t in r[side]}
 substances=data['substances'];by_identity={identity(s):s for s in substances};ids={s['id'] for s in substances};element_z={s['elementZ'] for s in substances if 'elementZ'in s};symbol_z={e['symbol']:e['z'] for e in elements};remap={}
 for original in extra['substances']:
  if original['id'] not in used_extra:continue
  s=deepcopy(original);key=identity(s)
  if key in by_identity:remap[s['id']]=by_identity[key]['id'];continue
  original_id=s['id']
  if s['id'] in ids:s['id']='binary-'+s['id']
  if len(s['composition'])==1 and s['charge']==0:
   z=symbol_z[next(iter(s['composition']))]
   if z not in element_z:s['elementZ']=z;element_z.add(z)
   else:s.pop('elementZ',None)
  else:s.pop('elementZ',None)
  substances.append(s);ids.add(s['id']);by_identity[key]=s;remap[original_id]=s['id']
 source_urls={s['url']:s['id'] for s in data['sources']};source_ids={s['id'] for s in data['sources']};source_remap={}
 for original in extra['sources']:
  s=deepcopy(original)
  if s['url'] in source_urls:source_remap[s['id']]=source_urls[s['url']];continue
  original_id=s['id']
  if s['id'] in source_ids:s['id']='binary-'+s['id']
  s.setdefault('attribution','WebElements chemistry reference. Factual equations transcribed with original explanations; source pages and artwork are not redistributed.')
  data['sources'].append(s);source_remap[original_id]=s['id'];source_ids.add(s['id']);source_urls[s['url']]=s['id']
 known={canonical(r):r for r in data['reactions']};added=duplicates=equation_only=0
 for original in accepted:
  r=deepcopy(original)
  for side in ('reactants','products'):
   for t in r[side]:t['id']=remap[t['id']]
  r['sourceIds']=list(dict.fromkeys(source_remap[s] for s in r['sourceIds']))
  # No recorded activation method must not be misrepresented as verified ambient kinetics.
  if 'full experimental conditions are not specified' in r['conditionLabel'].lower():
   r['execution']='equation-only';r['explanation']+=' This is a sourced equation, but complete activation conditions are not supplied; the application does not assume a room-temperature reaction.';equation_only+=1
  key=canonical(r)
  if key in known:
   old=known[key];old['sourceIds']=list(dict.fromkeys(old['sourceIds']+r['sourceIds']));duplicates+=1;continue
  data['reactions'].append(r);known[key]=r;added+=1
 lookup={s['id']:s for s in substances}
 def tally(terms):
  values=Counter()
  for t in terms:
   assert isinstance(t['coefficient'],int) and t['coefficient']>0
   s=lookup[t['id']]
   for symbol,count in s['composition'].items():values[symbol]+=count*t['coefficient']
   values['charge']+=s['charge']*t['coefficient']
  return dict(sorted((k,v) for k,v in values.items() if v))
 for r in data['reactions']:assert tally(r['reactants'])==tally(r['products']),r['id']
 assert len({r['id'] for r in data['reactions']})==len(data['reactions'])
 assert len({s['elementZ'] for s in substances if 'elementZ'in s})==sum('elementZ'in s for s in substances)
 for substance in substances:learner_name(substance,elements)
 data['version']='2026.11.20-source-checked.3';data['updatedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
 candidate=target.with_suffix('.candidate');candidate.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');candidate.replace(target)
 manifest={'version':data['version'],'entries':len(data['reactions']),'modeled':sum(r.get('execution')!='equation-only' for r in data['reactions']),'equationOnly':sum(r.get('execution')=='equation-only' for r in data['reactions']),'addedBinaryEquations':added,'duplicateEquationsMerged':duplicates,'excludedBinaryEquations':EXCLUDED,'substances':len(substances),'sources':len(data['sources']),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'checks':['atom and charge conservation','unique reaction IDs','source URLs deduplicated','one elemental selection mapping per Z','unspecified activation withheld from simulation','independent selenium product/phase findings excluded with unused substances']}
 (ROOT/'data/reactions/binary-merged-validation.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps(manifest))
if __name__=='__main__':main()
