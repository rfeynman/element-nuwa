import { useState } from 'react';
import type { Dataset, ElementRecord, IsotopeRecord } from '../../types';
import Provenance from '../../components/Provenance';
import './isotopes.css';

type Filter = 'all' | 'stable' | 'radioactive';
interface Props { element: ElementRecord; isotopes: IsotopeRecord[]; dataset: Dataset }

const decayLabels: Record<string, string> = {
  'B-': 'Beta-minus decay', 'B+': 'Beta-plus decay', EC: 'Electron capture',
  'EC+B+': 'Electron capture / beta-plus decay', A: 'Alpha decay', SF: 'Spontaneous fission',
  P: 'Proton emission', N: 'Neutron emission', '2P': 'Two-proton emission', '2N': 'Two-neutron emission',
  '2B-': 'Double beta-minus decay', '2B+': 'Double beta-plus decay', '2EC': 'Double electron capture',
  IT: 'Isomeric transition', ECP: 'Electron capture with delayed proton emission',
  'B+P': 'Beta-plus-delayed proton emission', 'B+2P': 'Beta-plus-delayed two-proton emission',
  'B+A': 'Beta-plus-delayed alpha emission', 'B-A': 'Beta-minus-delayed alpha emission',
  'B-P': 'Beta-minus-delayed proton emission', 'B-SF': 'Beta-minus-delayed spontaneous fission',
  ECA: 'Electron capture with delayed alpha emission', EC2P: 'Electron capture with delayed two-proton emission',
  ECSF: 'Electron capture with delayed spontaneous fission', 'SF+EC+B+': 'Spontaneous fission / electron capture / beta-plus decay',
};
function decayLabel(mode: string) {
  if (decayLabels[mode]) return `${decayLabels[mode]} (${mode})`;
  const neutrons = mode.match(/^B-(\d*)N$/);
  if (neutrons) return `Beta-minus-delayed ${neutrons[1] ? `${neutrons[1]}-neutron` : 'neutron'} emission (${mode})`;
  return `Source decay code: ${mode}`;
}

export default function IsotopeExplorer({ element, isotopes, dataset }: Props) {
  // Remount local controls with the element so a previous filter cannot conceal new coverage.
  return <IsotopePanel key={element.z} element={element} isotopes={isotopes} dataset={dataset} />;
}

function IsotopePanel({ element, isotopes, dataset }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const records = isotopes.filter(record => record.z === element.z).sort((a, b) => a.a - b.a);
  const stableCount = records.filter(record => record.status === 'stable').length;
  const radioactiveCount = records.filter(record => record.status === 'radioactive').length;
  const unknownCount = records.length - stableCount - radioactiveCount;
  const visible = records.filter(record => filter === 'all' || record.status === filter);
  const selected = visible.find(record => record.id === selectedId) ?? visible.find(record => record.status === 'stable') ?? visible[0];
  const neutronCount = selected && Number.isInteger(selected.a) && Number.isInteger(selected.z) && selected.a >= selected.z ? selected.a - selected.z : null;
  const sources = [...new Set(selected?.sourceIds ?? records.flatMap(record => record.sourceIds))];
  const branches = selected?.decayBranches?.length ? selected.decayBranches : selected?.decayModes.map(mode => ({ mode, percent: null, uncertainty: null })) ?? [];

  return <section className="isotope-panel" aria-labelledby="isotope-heading">
    <div className="isotope-heading-row"><div><p className="isotope-eyebrow">INSIDE THE NUCLEUS</p><h2 id="isotope-heading">Isotope explorer</h2></div><span className="isotope-scope">Ground states</span></div>
    <p className="isotope-intro">Same element. Different neutron counts. Explore the known ground-state isotopes of {element.name.toLowerCase()}.</p>
    <div className="isotope-coverage"><strong>{records.length}</strong><span>isotopes in this snapshot</span><span className="isotope-count-detail">{stableCount} stable · {radioactiveCount} radioactive{unknownCount > 0 ? ` · ${unknownCount} unknown` : ''}</span></div>
    <div className="isotope-filters" role="group" aria-label="Filter isotopes by stability">
      {(['all', 'stable', 'radioactive'] as const).map(value => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'all' ? 'All isotopes' : value === 'stable' ? 'Stable' : 'Radioactive'} <span>{value === 'all' ? records.length : value === 'stable' ? stableCount : radioactiveCount}</span></button>)}
    </div>
    {visible.length ? <>
      <label className="isotope-select-label" htmlFor="isotope-select">Choose an isotope</label>
      <select id="isotope-select" className="isotope-select" value={selected?.id ?? ''} onChange={event => setSelectedId(event.target.value)}>
        {visible.map(record => <option key={record.id} value={record.id}>{element.name}-{record.a} · {record.status}</option>)}
      </select>
      {selected && <div className="isotope-detail">
        <div className="isotope-identity"><div className="isotope-nuclide" aria-label={`${element.name} ${selected.a}`}><span className="isotope-nuclide-numbers" aria-hidden="true"><span>{selected.a}</span><span>{element.z}</span></span><span aria-hidden="true">{element.symbol}</span></div><div><h3>{element.name}-{selected.a}</h3><span className={`isotope-status isotope-status-${selected.status}`}>{selected.status === 'stable' ? 'Stable' : selected.status === 'radioactive' ? 'Radioactive' : 'Stability unknown'}</span></div></div>
        <dl className="isotope-numbers"><div><dt>Protons · Z</dt><dd>{selected.z}</dd></div><div><dt>Neutrons · N</dt><dd>{neutronCount ?? 'Unavailable'}</dd></div><div><dt>Mass number · A</dt><dd>{selected.a}</dd></div></dl>
        <dl className="isotope-facts"><div><dt>Half-life</dt><dd>{selected.status === 'stable' ? 'Stable; no measured decay half-life' : selected.halfLife ?? 'Time half-life not available in this dataset'}{selected.decayWidth && <p className="isotope-width">Source reports decay width: {[selected.decayWidth.operator, selected.decayWidth.value, selected.decayWidth.unit].filter(Boolean).join(' ')}{selected.decayWidth.uncertainty ? ` (unc. ${selected.decayWidth.uncertainty}, ENSDF notation)` : ''} — energy, not a time.</p>}</dd></div><div><dt>Decay modes</dt><dd>{selected.status === 'stable' ? 'No observed radioactive decay' : branches.length ? <ul className="isotope-decay-list">{branches.map((branch, index) => <li key={`${branch.mode}-${index}`}>{decayLabel(branch.mode)}{branch.percent !== null && <span className="isotope-branch-fraction"> · {branch.percent}%{branch.uncertainty !== null ? ` (unc. ${branch.uncertainty}, ENSDF notation)` : ''}</span>}</li>)}</ul> : 'Not available in this dataset'}</dd></div></dl>
        <p className="isotope-derivation">A = Z + N. Neutron count is calculated from the isotope’s mass number and atomic number.</p>
        <dl className="isotope-record-dates"><div><dt>Isotope evaluation cutoff</dt><dd>{selected.evaluationCutoff || 'Not supplied'}</dd></div><div><dt>Source extraction date</dt><dd>{selected.extractionDate || 'Not supplied'}</dd></div></dl>
      </div>}
    </> : <div className="isotope-empty" role="status"><strong>{records.length ? 'No matching isotopes' : 'Isotope data unavailable'}</strong><p>{records.length ? 'Choose All isotopes to explore the available records, including unknown stability.' : `This snapshot has no isotope records for ${element.name.toLowerCase()}. Missing data does not mean stable.`}</p></div>}
    <details className="isotope-explainer"><summary>What does half-life mean?</summary><p>Half-life is the time for half of a large collection of unstable nuclei to decay. It does not predict when one particular atom will decay. Source bounds, uncertainties, and units are retained above; missing decay branches are not zero.</p><p>Only nuclear ground states are included here. Nuclear decay is separate from chemical reactions. Radioactivity and chemical toxicity are different properties.</p></details>
    <details className="isotope-explainer"><summary>Read the source units & symbols</summary><p>Time units: Y = years; d = days; h = hours; m = minutes; s = seconds; ms = milliseconds; us = microseconds; ns = nanoseconds; ps = picoseconds; as = attoseconds. Uppercase forms of these source codes have the same meaning.</p><p>GT means greater than (&gt;); GE means at least (≥); LT means less than (&lt;); LE means at most (≤); AP means approximately (≈). Bounds describe a limit, not an exact half-life.</p><p>“unc.” retains the source uncertainty in the last displayed digits: 12.32 with uncertainty 2 means 12.32 ± 0.02. A +/− pair gives different upper and lower uncertainties. eV, keV, and MeV are energy-width units, not units of time. A source energy width is retained separately; no time half-life is inferred from it here.</p><p>Percentages and uncertainties are shown only where the source supplies them. Listed decay branches can overlap or be incomplete; they need not add to 100%. Decay labels explain recognized source codes. Unrecognized codes remain visible as supplied, rather than receiving a guessed interpretation.</p></details>
    <Provenance dataset={dataset} sourceIds={sources} />
  </section>;
}
