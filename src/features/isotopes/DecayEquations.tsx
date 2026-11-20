import type { ElementRecord, IsotopeRecord } from '../../types';
import { deriveDecayEquations, equationText, type NuclearTerm } from './nuclearDecay';

function Term({ term }: { term: NuclearTerm }) {
  return <span className="decay-term">{term.count > 1 && <span className="decay-coefficient">{term.count}</span>}<span className="decay-nuclide"><span className="decay-numbers"><span>{term.a}</span><span>{term.z < 0 ? '−' + Math.abs(term.z) : term.z}</span></span><span>{term.symbol}</span></span></span>;
}
function Side({ terms }: { terms: NuclearTerm[] }) {
  return <>{terms.map((term, index) => <span className="decay-piece" key={index}>{index > 0 && <span className="decay-plus">+</span>}<Term term={term} /></span>)}</>;
}
export default function DecayEquations({ isotope, mode, elements }: { isotope: IsotopeRecord; mode: string; elements: ElementRecord[] }) {
  const result = deriveDecayEquations(isotope, mode, elements);
  return <div className="decay-equations">{result.equations.map((equation, index) => <div key={index}>
    {result.equations.length > 1 && <p className="decay-alternative">{index ? 'or ' : ''}{equation.mode} pathway</p>}
    <div className="decay-equation" role="img" aria-label={equationText(equation)}><span aria-hidden="true" className="decay-equation-visual"><Side terms={equation.left} /><span className="decay-arrow">→</span>{equation.schematic && <span className="decay-schematic">Σ fragments + k <Term term={{ a: 1, z: 0, symbol: 'n', name: 'neutron', count: 1 }} />{equation.right.length > 0 && ' + '}</span>}<Side terms={equation.right} /></span></div>
    {equation.note && <p className="decay-note">{equation.note}</p>}
  </div>)}{result.unavailable && <p className="decay-note">{result.unavailable}</p>}</div>;
}
