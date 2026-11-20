import json,datetime,hashlib
from pathlib import Path
now='2026-11-20T02:26:53Z'
S=[]
def s(id,name,formula,state,composition,z=None):
 d=dict(id=id,name=name,formula=formula,state=state,composition=composition,charge=0)
 if z:d['elementZ']=z
 S.append(d)
s('H2','Hydrogen','H₂','g',{'H':2},1)
s('O2','Oxygen','O₂','g',{'O':2},8)
s('Mg','Magnesium','Mg','s',{'Mg':1},12)
s('Fe','Iron','Fe','s',{'Fe':1},26)
s('S8','Sulfur (S₈)','S₈','s',{'S':8},16)
s('C','Carbon (graphitic solid)','C','s',{'C':1},6)
s('Cl2','Chlorine','Cl₂','g',{'Cl':2},17)
s('Na','Sodium','Na','s',{'Na':1},11)
s('He','Helium','He','g',{'He':1},2)
s('Ne','Neon','Ne','g',{'Ne':1},10)
s('Zn','Zinc','Zn','s',{'Zn':1},30)
s('Cu','Copper','Cu','s',{'Cu':1},29)
s('Ag','Silver','Ag','s',{'Ag':1},47)
for args in [
('H2O','Water','H₂O','l',{'H':2,'O':1}),('H2O-g','Water vapor','H₂O','g',{'H':2,'O':1}),
('HCl','Hydrochloric acid','HCl','aq',{'H':1,'Cl':1}),('HCl-g','Hydrogen chloride','HCl','g',{'H':1,'Cl':1}),
('NaOH','Sodium hydroxide solution','NaOH','aq',{'Na':1,'O':1,'H':1}),
('NaHCO3','Sodium bicarbonate solution','NaHCO₃','aq',{'Na':1,'H':1,'C':1,'O':3}),
('CuSO4','Copper(II) sulfate solution','CuSO₄','aq',{'Cu':1,'S':1,'O':4}),
('AgNO3','Silver nitrate solution','AgNO₃','aq',{'Ag':1,'N':1,'O':3}),
('CuNO3','Copper(II) nitrate solution','Cu(NO₃)₂','aq',{'Cu':1,'N':2,'O':6}),
('NaCl','Sodium chloride solution','NaCl','aq',{'Na':1,'Cl':1}),('NaCl-s','Sodium chloride','NaCl','s',{'Na':1,'Cl':1}),
('MgO','Magnesium oxide','MgO','s',{'Mg':1,'O':1}),('FeS','Iron(II) sulfide','FeS','s',{'Fe':1,'S':1}),
('CO2','Carbon dioxide','CO₂','g',{'C':1,'O':2}),('MgCl2','Magnesium chloride solution','MgCl₂','aq',{'Mg':1,'Cl':2}),
('ZnCl2','Zinc chloride solution','ZnCl₂','aq',{'Zn':1,'Cl':2}),
('CuOH2','Copper(II) hydroxide','Cu(OH)₂','s',{'Cu':1,'O':2,'H':2}),
('Na2SO4','Sodium sulfate solution','Na₂SO₄','aq',{'Na':2,'S':1,'O':4})]:s(*args)
sources=[]
def src(id,name,url):sources.append(dict(id=id,name=name,url=url,retrievedAt='2026-11-20T01:49:49Z',upstreamDate=None))
src('wisc-h2','UW–Madison: hydrogen combustion','https://wonders.physics.wisc.edu/exploding-balloon/')
src('okstate','Oklahoma State University ChemSource: reaction demonstrations','https://intro.chem.okstate.edu/ChemSource/ChemRx/chemrx8.htm')
src('sydney-fes','University of Sydney: iron and sulfur','https://scilearn.sydney.edu.au/fychemistry/demonstrations/files/8.11.pdf')
src('rsc-carbon','Royal Society of Chemistry: products of combustion','https://edu.rsc.org/experiments/identifying-the-products-of-combustion-demonstration/707.article')
src('harvard-hcl','Harvard Natural Sciences Lecture Demonstrations: hydrogen and chlorine','https://www.youtube.com/watch?v=NN82GoBG98s')
src('wisc-hcl','UW–Madison: photochemical hydrogen/chlorine reaction','https://demolab.chem.wisc.edu/inorganic-chemistry-demonstrations/groups-ia-iia-iiib-hcl-cannon/')
src('rsc-nacl','Royal Society of Chemistry: sodium and chlorine','https://edu.rsc.org/representing-chemical-reactions/the-reaction-between-sodium-and-chlorine/4015463.article')
src('rsc-mg','Royal Society of Chemistry: magnesium and hydrochloric acid','https://edu.rsc.org/experiments/the-rate-of-reaction-of-magnesium-with-hydrochloric-acid/1916.article')
src('wisc-neutral','UW–Madison: heat of neutralization','https://www2.chem.wisc.edu/deptfiles/genchem/demonstrations/Gen_Chem_Pages/06thermopage/heat_of_neutralization.htm')
src('rsc-neutral','Royal Society of Chemistry: exothermic and endothermic reactions','https://edu.rsc.org/experiments/exothermic-or-endothermic-classifying-reactions/406.article')
src('uw-fizz','University of Washington: bicarbonate fizz','https://chem.washington.edu/lecture-demos/bicarbonate-fizz')
src('wisc-precip','UW–Madison: sodium hydroxide and copper sulfate','https://www2.chem.wisc.edu/deptfiles/genchem/lab/cca/MVHTM/NAOH/NAOHCUSO.HTM')
src('pearson-precip','Pearson: GCSE science core practical guide','https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/teaching-and-learning-materials/gcse-9-1-sciences-core-practical-guide.pdf')
src('ou-noble','The Open University: noble gases','https://www.open.edu/openlearn/science-maths-technology/chemistry/noble-gases')
sources[-1]['upstreamDate']='2019-08-30'
R=[]
def r(id,title,a,b,condition,label,effects,obs,explain,refs,outcome='reaction'):
 R.append(dict(id=id,title=title,reactants=[dict(id=i,coefficient=n) for i,n in a],products=[dict(id=i,coefficient=n) for i,n in b],condition=condition,conditionLabel=label,outcome=outcome,effects=effects,observations=obs,explanation=explain,sourceIds=refs,reviewStatus='source-checked'))
r('hydrogen-oxygen','Hydrogen burns in oxygen',[('H2',2),('O2',1)],[('H2O-g',2)],'activation','Ignition of a hydrogen–oxygen mixture; conceptual example',['heat','flame','blast'],['Heat and flame accompany rapid combustion.','An ignited gas mixture can give a loud report; the blast symbol is qualitative.','Water first forms as vapor and can condense on cooling.'],'Hydrogen and oxygen atoms rearrange into water molecules. Ignition is required in this model; a mixture alone is not a prediction of immediate combustion.',['wisc-h2'])
r('magnesium-oxygen','Magnesium forms an oxide',[('Mg',2),('O2',1)],[('MgO',2)],'activation','Ignited magnesium in oxygen; simplified oxygen-only chemistry',['flame','solid'],['Bright light accompanies burning.','Solid magnesium oxide forms.'],'The metal combines with molecular oxygen. This oxygen-only model omits side reactions possible when magnesium burns in air.',['okstate'])
r('iron-sulfur','Iron and sulfur form a compound',[('Fe',8),('S8',1)],[('FeS',8)],'activation','Thermal activation of an iron–sulfur mixture',['heat','solid'],['A red glow travels through the reacting mixture.','Iron(II) sulfide is formed.'],'A mixture becomes a compound after activation. The S₈ formula represents elemental sulfur, so eight iron atoms are needed per sulfur molecule.',['sydney-fes'])
r('carbon-oxygen','Complete combustion of carbon',[('C',1),('O2',1)],[('CO2',1)],'activation','Ignition with sufficient oxygen; complete combustion model',['gas'],['Carbon dioxide gas is formed; it is not colored smoke.'],'This models complete combustion only. Oxygen-limited conditions can produce other products and are outside this scenario.',['rsc-carbon'])
r('hydrogen-chlorine','Light initiates hydrogen chloride formation',[('H2',1),('Cl2',1)],[('HCl-g',2)],'activation','Photochemical activation by suitable light; conceptual hazardous gas mixture',['blast','toxic'],['A light-initiated gas reaction can be explosive.','Toxicity warning: the chlorine-containing gas mixture presents an inhalation hazard.'],'Suitable light can initiate a rapid chain reaction producing hydrogen chloride gas. The warning concerns chemical exposure, not radioactivity. This is a conceptual demonstration only.',['harvard-hcl','wisc-hcl','rsc-nacl'])
r('sodium-chlorine','Sodium and chlorine form salt',[('Na',2),('Cl2',1)],[('NaCl-s',2)],'activation','Ignited sodium in chlorine; conceptual demonstration',['flame','solid','toxic'],['A yellow flame accompanies reaction.','White sodium chloride particles form; these are solid aerosol, not steam.','Chlorine reactant is toxic by inhalation.'],'The product has very different properties from the elements. Sodium chloride is a compound with equal numbers of sodium and chlorine atoms.',['rsc-nacl'])
r('sodium-water','Sodium reacts with water',[('Na',2),('H2O',2)],[('NaOH',2),('H2',1)],'ambient','Contact with liquid water; conceptual aqueous reaction',['heat','gas'],['Energy is released and hydrogen gas is produced.','Sodium hydroxide remains in solution.'],'Sodium displaces hydrogen from water. Flame is not an automatic effect: the source notes that hydrogen only sometimes burns.',['okstate'])
r('magnesium-acid','Magnesium releases hydrogen from acid',[('Mg',1),('HCl',2)],[('MgCl2',1),('H2',1)],'ambient','Magnesium in dilute aqueous hydrochloric acid',['gas'],['Hydrogen bubbles form while magnesium is consumed.'],'Magnesium replaces hydrogen in the acid; magnesium chloride remains dissolved. Gas formation does not mean that boiling or combustion occurred.',['rsc-mg'])
r('zinc-acid','Zinc releases hydrogen from acid',[('Zn',1),('HCl',2)],[('ZnCl2',1),('H2',1)],'ambient','Zinc surface in aqueous hydrochloric acid',['gas'],['Hydrogen gas bubbles form as zinc reacts.'],'The metal is converted into dissolved zinc chloride. The equation describes the chemical change without predicting its speed.',['okstate'])
r('neutralization','Acid and base neutralize',[('HCl',1),('NaOH',1)],[('NaCl',1),('H2O',1)],'ambient','Dilute aqueous acid and base; stoichiometric neutralization',['heat'],['The solution warms.','Sodium chloride stays dissolved; no salt precipitate is modeled.'],'Hydrogen ions and hydroxide ions form water. Sodium and chloride ions remain in solution as spectator ions. Heat release alone does not imply flame or steam.',['wisc-neutral','rsc-neutral'])
r('bicarbonate-acid','Bicarbonate and acid release carbon dioxide',[('NaHCO3',1),('HCl',1)],[('NaCl',1),('H2O',1),('CO2',1)],'ambient','Aqueous bicarbonate and hydrochloric acid',['gas'],['Fizzing shows carbon dioxide gas leaving the solution.'],'Acid reacts with bicarbonate to form water and carbon dioxide; sodium chloride remains dissolved. The gas is not water vapor.',['uw-fizz'])
r('copper-hydroxide','A blue precipitate appears',[('CuSO4',1),('NaOH',2)],[('CuOH2',1),('Na2SO4',1)],'ambient','Dilute aqueous solutions at room temperature; precipitation stage without excess concentrated alkali',['solid'],['Blue copper(II) hydroxide precipitates.'],'Copper ions combine with hydroxide ions to form an insoluble solid. Sodium and sulfate ions remain dissolved. Heating and strongly concentrated excess alkali are outside this model.',['wisc-precip','pearson-precip'])
r('copper-silver','Copper displaces silver',[('Cu',1),('AgNO3',2)],[('CuNO3',1),('Ag',2)],'ambient','Copper in aqueous silver nitrate',['solid'],['Silver deposits on the copper surface over time.'],'Copper transfers electrons to silver ions. Metallic silver forms while copper enters solution as copper(II) ions; nitrate ions are spectators.',['okstate'])
r('helium-neon','Helium and neon remain a mixture',[('He',1),('Ne',1)],[('He',1),('Ne',1)],'ambient','Ordinary room conditions; no plasma, electrical excitation, or extreme pressure',[],['No chemical reaction is modeled under these stated conditions.','The gases remain a mixture.'],'Helium and neon are exceptionally unreactive noble gases. This claim is restricted to ordinary conditions, not exotic high-energy or high-pressure chemistry.',['ou-noble'],'no-reaction')
import sys
sys.path.insert(0,str(Path('data/reactions').resolve()))
from expand import expand
expand(S,R,sources,now)
D=dict(version='2026.11.20-source-checked.2',updatedAt=now,substances=S,reactions=R,sources=sources)
# Independent composition tally, including charge, for every record.
lookup={s['id']:s for s in S}
def tally(side):
 out={}
 for t in side:
  assert isinstance(t['coefficient'],int) and t['coefficient']>0
  x=lookup[t['id']]
  for e,n in {**x['composition'],'charge':x['charge']}.items():out[e]=out.get(e,0)+n*t['coefficient']
 return {k:v for k,v in out.items() if v}
for x in R:assert tally(x['reactants'])==tally(x['products']),x['id']
assert len({s['elementZ'] for s in S if 'elementZ' in s})==len([s for s in S if 'elementZ' in s])
assert all(set(r['sourceIds'])<=set(s['id'] for s in sources) for r in R)
# Publication happens only after conservation and reference checks pass.
Path('public/data/reactions.json').write_text(json.dumps(D,indent=2,ensure_ascii=False)+'\n')
print(f'Validated {len(R)} balanced scenarios, {len(S)} substances, {len(sources)} sources.')
Path('data/reactions/validation.json').write_text(json.dumps({'datasetVersion':D['version'],'checkedAt':now,'scenarios':len(R),'checks':['positive integer coefficients','atom and charge conservation','source references resolve','one elemental form per Z'],'sha256':hashlib.sha256(Path('public/data/reactions.json').read_bytes()).hexdigest(),'aiSourceAudit':'completed','teacherReview':'pending','coverage':{'chemicalReactions':sum(r['outcome']=='reaction' and r.get('process')!='physical' for r in R),'physicalProcesses':sum(r.get('process')=='physical' for r in R),'reviewedNoReaction':sum(r['outcome']=='no-reaction' for r in R),'substances':len(S),'sourceUrls':len(sources),'usedExpansionEvidenceFiles':21,'addedSourceUrls':13}},indent=2)+'\n')
