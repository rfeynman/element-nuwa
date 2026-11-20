"""Curated, source-located additions; invoked by build.py before validation."""
import re, math
from functools import reduce
import sympy as sp
from pathlib import Path

PAGES={
'4-1':'4-1-writing-and-balancing-chemical-equations','4-2':'4-2-classifying-chemical-reactions','4-exercises':'4-exercises','5-3':'5-3-enthalpy','11-1':'11-1-the-dissolution-process','10-3':'10-3-phase-transitions',
'18-2':'18-2-occurrence-and-preparation-of-the-representative-metals','18-5':'18-5-occurrence-preparation-and-compounds-of-hydrogen','18-6':'18-6-occurrence-preparation-and-properties-of-carbonates','18-7':'18-7-occurrence-preparation-and-properties-of-nitrogen','18-8':'18-8-occurrence-preparation-and-properties-of-phosphorus','18-9':'18-9-occurrence-preparation-and-compounds-of-oxygen','18-11':'18-11-occurrence-preparation-and-properties-of-halogens'}
NAMES={'Na2CO3-s':'Sodium carbonate (solid)',
'CH4':'Methane','C2H6':'Ethane','CaCO3':'Calcium carbonate','CaO':'Calcium oxide','CaCl2':'Calcium chloride','Ca(NO3)2':'Calcium nitrate','AgCl':'Silver chloride','CO2-aq':'Dissolved carbon dioxide','Na2CO3':'Sodium carbonate','KI':'Potassium iodide','Pb(NO3)2':'Lead(II) nitrate','PbI2':'Lead(II) iodide','KNO3':'Potassium nitrate','BaSO4':'Barium sulfate','PbCO3':'Lead(II) carbonate','Mg(OH)2':'Magnesium hydroxide','Ba(OH)2':'Barium hydroxide','HNO3':'Nitric acid (dilute)','Ba(NO3)2':'Barium nitrate','C2H5OH':'Ethanol','C2H2':'Acetylene','CH3OH':'Methanol','C8H18':'Isooctane','CO':'Carbon monoxide','SO2':'Sulfur dioxide','NH4NO3':'Ammonium nitrate','C12H22O11':'Sucrose','C12H22O11-aq':'Dissolved sucrose','CaH2':'Calcium hydride','Mg3N2':'Magnesium nitride','NH3':'Ammonia','H2S':'Hydrogen sulfide','Br2-aq':'Dissolved bromine','HI':'Hydroiodic acid','HBr':'Hydrobromic acid','I2-aq':'Dissolved iodine','Na2O':'Sodium oxide','Ca(OH)2-s':'Calcium hydroxide (solid)','KHCO3':'Potassium bicarbonate','KOH':'Potassium hydroxide','K2CO3':'Potassium carbonate','NO':'Nitric oxide','NO2':'Nitrogen dioxide','N2O5':'Dinitrogen pentoxide','N2O':'Nitrous oxide','N2':'Nitrogen','Li':'Lithium','Li3N':'Lithium nitride','P4O10':'Phosphorus(V) oxide','H3PO4':'Phosphoric acid','NaNO3':'Sodium nitrate','LiOH':'Lithium hydroxide','Ca':'Calcium','Ca(OH)2':'Calcium hydroxide solution','Li2O':'Lithium oxide','Al(OH)3':'Aluminum hydroxide','Zn(OH)2':'Zinc hydroxide','ZnO':'Zinc oxide','Zn-g':'Zinc vapor','Br2':'Bromine','I2':'Iodine','Cl2-aq':'Dissolved chlorine','HOCl':'Hypochlorous acid','H2O-ice':'Ice','CO2-s':'Dry ice','C4H10':'Butane','KClO3':'Potassium chlorate','KCl':'Potassium chloride','KH2PO4':'Potassium dihydrogen phosphate','K2C2O4':'Potassium oxalate','BaC2O4':'Barium oxalate','H2SO4':'Sulfuric acid (dilute)','PbSO4':'Lead(II) sulfate','CaSO4':'Calcium sulfate','CaBr2':'Calcium bromide','C6H12':'Cyclohexane','Na2S':'Sodium sulfide','K3PO4':'Potassium phosphate','NiCl2':'Nickel(II) chloride','Ni':'Nickel','C2H4':'Ethylene','ZnSO4':'Zinc sulfate','CH3COOH':'Acetic acid','Ca(CH3COO)2':'Calcium acetate','K2HPO4':'Potassium hydrogen phosphate','H2C2O4':'Oxalic acid','Na2C2O4':'Sodium oxalate','K2SO4':'Potassium sulfate',
'Ba^2+':'Barium ion','SO4^2-':'Sulfate ion','Pb^2+':'Lead(II) ion','CO3^2-':'Carbonate ion','NH4^+':'Ammonium ion','NO3^-':'Nitrate ion','H3O^+':'Hydronium ion','Fe^2+':'Iron(II) ion','Ca^2+':'Calcium ion','OH^-':'Hydroxide ion','HCO3^-':'Bicarbonate ion','Al^3+':'Aluminum ion','Zn^2+':'Zinc ion','Br^-':'Bromide ion','Cl^-':'Chloride ion','I^-':'Iodide ion','I3^-':'Triiodide ion'}
ALIASES={'Na2CO3-s':'Na2CO3','H2O-g':'H2O','CO2-aq':'CO2','C12H22O11-aq':'C12H22O11','Br2-aq':'Br2','I2-aq':'I2','Ca(OH)2-s':'Ca(OH)2','Zn-g':'Zn','Cl2-aq':'Cl2','H2O-ice':'H2O','CO2-s':'CO2','CuNO3':'Cu(NO3)2','CuOH2':'Cu(OH)2'}
Z={'Li':3,'Ca':20,'N2':7,'Ni':28,'Br2':35,'I2':53}
SUB=str.maketrans('0123456789','₀₁₂₃₄₅₆₇₈₉');SUP=str.maketrans('0123456789+-','⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻')
def composition(f):
 tokens=re.findall(r'[A-Z][a-z]?|\d+|[()]',f);stack=[{}];i=0
 while i<len(tokens):
  t=tokens[i];i+=1
  if t=='(':stack.append({});continue
  if t==')':d=stack.pop()
  else:d={t:1}
  n=1
  if i<len(tokens) and tokens[i].isdigit():n=int(tokens[i]);i+=1
  for e,v in d.items():stack[-1][e]=stack[-1].get(e,0)+v*n
 assert len(stack)==1
 return stack[0]
def expand(S,R,sources,now):
 lookup={x['id']:x for x in S};locators=[]
 for sec,page in PAGES.items():sources.append(dict(id='openstax-'+sec,name='OpenStax Chemistry 2e — '+sec,url='https://openstax.org/books/chemistry-2e/pages/'+page,retrievedAt='2026-11-20T02:26:53Z',upstreamDate='2019-02-14'))
 def substance(token):
  m=re.fullmatch(r'(.+)\((aq|s|l|g)\)',token);assert m,token
  id,state=m.groups()
  if id in lookup:
   assert lookup[id]['state']==state,(id,state,lookup[id]['state'])
   return lookup[id]
  formula=ALIASES.get(id,id);charge=0
  if '^' in formula:
   formula,ch=formula.split('^');charge=int(ch[:-1] or '1')*(1 if ch[-1]=='+' else -1)
  display=formula.translate(SUB)+(('' if abs(charge)==1 else str(abs(charge)))+('+' if charge>0 else '-')).translate(SUP) if charge else formula.translate(SUB)
  d=dict(id=id,name=NAMES.get(id,id),formula=display,state=state,composition=composition(formula),charge=charge)
  if id in Z:d['elementZ']=Z[id]
  S.append(d);lookup[id]=d;return d
 for line in Path('data/reactions/expansion.tsv').read_text().splitlines():
  if not line or line.startswith('#'):continue
  id,title,eq,activation,sec,locator,condition,explain=line.split('|')
  # These endpoints share the same selectable inputs and cannot currently be distinguished.
  if id in {'phosphoric-acid-partial','phosphoric-second-endpoint'}:continue
  left,right=eq.split('>')
  # A separator follows a state, never an ionic charge.
  a=[substance(x) for x in re.split(r'(?<=\))\+',left)];b=[substance(x) for x in re.split(r'(?<=\))\+',right)]
  elements=sorted(set().union(*(x['composition'] for x in a+b)))+['charge']
  matrix=sp.Matrix([[x.get('charge',0) if e=='charge' else x['composition'].get(e,0) for x in a]+[-(x.get('charge',0) if e=='charge' else x['composition'].get(e,0)) for x in b] for e in elements])
  basis=matrix.nullspace();assert len(basis)==1,id
  vector=basis[0];multiple=sp.ilcm(*[v.q for v in vector]);coeff=[int(v*multiple) for v in vector];assert all(v>0 for v in coeff),id
  effects=[];obs=[];visual={}
  if any(x['state']=='g' for x in b):effects.append('gas');obs.append('Gaseous products: '+', '.join(x['name'] for x in b if x['state']=='g')+'.')
  if any(x['state']=='s' for x in b):effects.append('solid');obs.append('Solid products: '+', '.join(x['name'] for x in b if x['state']=='s')+'.')
  if activation=='ignition' and 'combustion' in id:effects+=['heat','flame'];obs.append('Combustion releases heat and light after ignition.')
  if id in {'ammonium-nitrate-dissolving','dry-ice-sublimation'}:effects.append('cooling');obs.append('The process absorbs heat from its surroundings; cooling is not automatic freezing.')
  if id=='water-freezing':effects=['cooling','solid'];visual={'freezing':True};obs=['External cooling produces ice. The phase change releases latent heat to the surroundings.']
  if id=='water-boiling':effects=['gas','steam'];obs=['Water becomes invisible vapor. The pale plume represents condensed water droplets above the heated water.']
  if id=='lead-iodide':visual['solidColor']='#f4cc29';obs.append('The precipitate is yellow.')
  if id=='nitric-oxide-oxidation':visual['gasColor']='#9b4f2e';obs.append('Nitrogen dioxide gives the gas a brown color; equilibrium with its dimer affects the intensity.')
  if id=='brine-electrolysis':visual['gasColor']='#bdca45';obs.append('The chlorine electrode product is greenish-yellow; hydrogen is colorless.')
  if any(x['id'] in {'H2S','Cl2','NO2'} for x in b):effects.append('toxic');obs.append('The gas product presents an inhalation hazard. This is a conceptual example, not an experimental procedure.')
  if not obs:obs=['The equation describes the stated change; no visible flame or gas release is implied.']
  d=dict(id=id,title=title,reactants=[dict(id=x['id'],coefficient=n) for x,n in zip(a,coeff[:len(a)])],products=[dict(id=x['id'],coefficient=n) for x,n in zip(b,coeff[len(a):])],condition='ambient' if activation=='none' else 'activation',conditionLabel=condition,requiredActivation=[activation],outcome='reaction',effects=list(dict.fromkeys(effects)),observations=obs,explanation=explain,sourceIds=['openstax-'+sec],reviewStatus='source-checked')
  if visual:d['visual']=visual
  if id in {'ammonium-nitrate-dissolving','sucrose-dissolving','water-freezing','water-boiling','ice-melting','dry-ice-sublimation'}:d['process']='physical'
  if id=='brine-electrolysis':d['sourceIds'].append('openstax-18-11')
  R.append(d);locators.append(dict(id=id,source='openstax-'+sec,locator=locator,sourceEquation=eq))
 Path('data/reactions/expansion-locators.json').write_text(__import__('json').dumps(locators,indent=2)+'\n')
 activations={'hydrogen-oxygen':'ignition','magnesium-oxygen':'ignition','iron-sulfur':'heat','carbon-oxygen':'ignition','hydrogen-chlorine':'light','sodium-chlorine':'ignition'}
 for r in R:
  if 'requiredActivation' not in r:r['requiredActivation']=[activations.get(r['id'],'none')]
  if r['id']=='copper-hydroxide':r['visual']={'solidColor':'#52aadd'}
  if r['id']=='sodium-chlorine':r['visual']={'solidColor':'#f1f5f9'}
  if r['id']=='magnesium-oxygen':r['requiredAtmosphere']='oxygen'
 # Merge the independently curated representative-elements supplement.
 import json,copy
 supplement=json.loads(Path('data/reactions/supplement-elements.json').read_text())
 def identity(x):return (tuple(sorted(x['composition'].items())),x['state'],x['charge'])
 by_identity={identity(x):x for x in S};remap={};source_remap={}
 for x in supplement['substances']:
  key=identity(x)
  if key in by_identity:remap[x['id']]=by_identity[key]['id']
  else:S.append(x);by_identity[key]=x;remap[x['id']]=x['id']
 for x in supplement['sources']:
  old=next((y for y in sources if y['url']==x['url']),None)
  if old:source_remap[x['id']]=old['id']
  else:sources.append(x);source_remap[x['id']]=x['id']
 for x in supplement['reactions']:
  x=copy.deepcopy(x)
  for side in ('reactants','products'):
   for t in x[side]:t['id']=remap[t['id']]
  x['sourceIds']=[source_remap[v] for v in x['sourceIds']]
  # Exclude chemistry that needs an absent catalyst/temperature control or is needlessly obscure.
  if x['id'] in {'elements-potassium-nitrate-reduction','elements-lithium-hydroxide-reduction','elements-phosphorus-no','elements-no2-carbon-monoxide'}:continue
  if x['id']=='elements-no2-hydrochloric':
   x['visual']={'gasColor':'#bdca45'};x['sourceIds'].append('openstax-18-11');x['observations']=['Chlorine is greenish-yellow; the nitric oxide product is colorless. Toxic gases present an inhalation hazard.']
  notes={
   'elements-nacl-electrolysis':'Molten sodium chloride conducts through mobile ions. Electricity converts sodium ions to sodium and chloride ions to chlorine.',
   'elements-mgcl2-electrolysis':'Electricity converts molten magnesium chloride into magnesium and chlorine; this differs from electrolysis of an aqueous solution.',
   'elements-magnesium-silicon':'Silicon takes oxygen from magnesium oxide. Removing magnesium vapor helps drive the industrial reduction.',
   'elements-zinc-sulfide-roasting':'Oxygen converts a metal sulfide into a metal oxide and sulfur dioxide.',
   'elements-zinc-carbonate-decomposition':'Heat breaks zinc carbonate into zinc oxide and carbon dioxide.',
   'elements-tin-oxide-carbon':'Carbon removes oxygen from tin oxide. The displayed tin phase is the cooled textbook endpoint.',
   'elements-manganese-reduction':'Hydrogen takes oxygen from the metal oxide and forms water.',
   'elements-hydrogen-sulfur':'Heating permits hydrogen and elemental sulfur to combine; the textbook describes a low-yield process.',
   'elements-trona-decomposition':'Heating the hydrated carbonate mineral releases water and carbon dioxide, leaving sodium carbonate.',
   'elements-no2-dimerization':'Cooling favors association of two nitrogen dioxide molecules into one dinitrogen tetroxide molecule. Both remain present at equilibrium.',
   'elements-nitric-dehydration':'Phosphorus(V) oxide removes water chemically from nitric acid, yielding its acid anhydride.',
   'elements-nitrosyl-chloride':'Nitric oxide is oxidized as it combines with chlorine to form nitrosyl chloride.',
   'elements-no2-hydrochloric':'Nitrogen dioxide oxidizes chloride to chlorine while being reduced to nitric oxide.',
   'elements-phosphorus-extraction':'Carbon reduces phosphate in the presence of silica; the equation is an overall industrial process, not room-temperature mixing.',
   'elements-ozone-formation':'Electrical energy allows molecular oxygen to form ozone, a different molecular form of the same element.',
   'elements-ozone-photolysis':'Ultraviolet light breaks an ozone molecule into molecular oxygen and a short-lived oxygen atom; this is one step in atmospheric ozone chemistry.',
   'elements-aluminium-hydroxide-decomposition':'Heating drives water out of aluminum hydroxide and leaves aluminum oxide.',
   'elements-sodium-peroxide':'Under the stated oxygen-rich conditions, sodium forms a peroxide containing an oxygen-oxygen unit.',
   'elements-sodium-oxide-peroxide':'Further oxidation adds oxygen to sodium oxide, making sodium peroxide.',
   'elements-strontium-peroxide':'Oxygen converts strontium oxide into the corresponding peroxide under the stated heated conditions.',
   'elements-sulfur-dioxide-oxidation':'Sulfur dioxide takes up more oxygen to form sulfur trioxide. The uncatalyzed process is slow; the equation does not promise a rapid classroom effect.',
   'elements-hydrogen-sulfide-oxidation':'Complete oxidation produces sulfur dioxide and water. The source equation shows water after condensation.'}
  x['explanation']=notes[x['id']]
  if x['observations']==['Products follow the displayed source equation.']:
   x['observations']=['The displayed products describe the specified conditions. The equation alone does not predict reaction speed or a visible flame.']
  R.append(x)
 # Only substances used by published scenarios are selectable.
 used={t['id'] for x in R for side in ('reactants','products') for t in x[side]}
 S[:]=[x for x in S if x['id'] in used]
 names={'NaCl-l':'Molten sodium chloride','Na-l':'Liquid sodium','Mg-l':'Liquid magnesium','Si-s':'Silicon','Mg-g':'Magnesium vapor','ZnS-s':'Zinc sulfide','Sn-s':'Tin','MnO-s':'Manganese(II) oxide','N2O4-g':'Dinitrogen tetroxide','HNO3-l':'Liquid nitric acid','HPO3-s':'Metaphosphoric acid','ClNO-g':'Nitrosyl chloride','P4-g':'Tetraphosphorus vapor','O3-g':'Ozone','O-g':'Atomic oxygen','SrO-s':'Strontium oxide','SO3-g':'Sulfur trioxide'}
 for x in S:
  if x['id'] in names:x['name']=names[x['id']]
 for x in sources:
  if x['id'].startswith('openstax-'):
   x['attribution']='Chemistry 2e, Paul Flowers, Klaus Theopold, Richard Langley, William R. Robinson; OpenStax, Rice University. Current source license: CC BY-NC-SA 4.0. Factual equations with independently written explanations.'
   x['licenseUrl']='https://creativecommons.org/licenses/by-nc-sa/4.0/'
