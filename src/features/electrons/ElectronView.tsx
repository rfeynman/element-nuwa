import { useId, useState } from 'react';
import type { Dataset, ElementRecord } from '../../types';
import Provenance from '../../components/Provenance';
import './electrons.css';

interface Props { element: ElementRecord; dataset: Dataset }

function Configuration({ value }: { value: string }) {
  // Preserve source text and only promote an orbital's trailing population to superscript.
  return <span aria-label={value}>{value.split(/(\d[spdfgh]\^?\d+)/g).map((part, index) => {
    const orbital = part.match(/^(\d[spdfgh])\^?(\d+)$/);
    return orbital ? <span key={index} aria-hidden="true">{orbital[1]}<sup>{orbital[2]}</sup></span> : <span key={index} aria-hidden="true">{part}</span>;
  })}</span>;
}

export default function ElectronView({ element, dataset }: Props) {
  const [animate, setAnimate] = useState(false);
  const descriptionId = useId();
  const titleId = useId();
  const shells = element.shells;
  const total = shells?.reduce((sum, count) => sum + count, 0);
  const validShells = !!shells?.length && shells.every(count => Number.isInteger(count) && count >= 0) && total === element.z;
  const hasConfiguration = !!element.configuration?.trim();
  return <section className="electron-panel" aria-labelledby="electron-heading">
    <div className="electron-heading-row"><div><p className="electron-eyebrow">AROUND THE NUCLEUS</p><h2 id="electron-heading">Electron shells</h2></div><span className="electron-neutral">Neutral atom</span></div>
    <p className="electron-intro">Meet the electrons of {element.name.toLowerCase()}. A neutral atom has one electron for each proton.</p>
    <div className="electron-stage">
      {validShells && shells ? <svg viewBox="0 0 320 320" role="img" aria-labelledby={`${titleId} ${descriptionId}`} className={`electron-diagram${animate ? ' electron-diagram-moving' : ''}`}>
        <title id={titleId}>{element.name}: simplified shell model</title>
        <desc id={descriptionId}>{element.z} electrons in {shells.length} occupied shells. Populations from inner to outer shell: {shells.join(', ')}. Rings and dots are illustrative, not electron trajectories.</desc>
        <g aria-hidden="true">
          {shells.map((count, shellIndex) => {
            const radius = shells.length === 1 ? 82 : 43 + shellIndex * (94 / Math.max(1, shells.length - 1));
            return <g key={shellIndex}>
              <circle cx="160" cy="160" r={radius} className={`electron-ring${shellIndex === shells.length - 1 ? ' electron-ring-outer' : ''}`} />
              <g className="electron-dot-orbit" style={{ animationDuration: `${40 + shellIndex * 11}s`, animationDirection: shellIndex % 2 ? 'reverse' : 'normal' }}>
                {Array.from({ length: count }, (_, index) => {
                  const angle = (index / count) * Math.PI * 2 - Math.PI / 2 + shellIndex * .19;
                  return <circle key={index} cx={160 + radius * Math.cos(angle)} cy={160 + radius * Math.sin(angle)} r={count > 18 ? 3.2 : 4.1} className={shellIndex === shells.length - 1 ? 'electron-dot electron-dot-outer' : 'electron-dot'} />;
                })}
              </g>
            </g>;
          })}
          <circle cx="160" cy="160" r="27" className="electron-nucleus" />
          <text x="160" y="164" textAnchor="middle" className="electron-symbol">{element.symbol}</text>
          <text x="160" y="179" textAnchor="middle" className="electron-protons">{element.z} p⁺</text>
        </g>
      </svg> : <div className="electron-unavailable"><span aria-hidden="true">◎</span><strong>Shell diagram unavailable</strong><p>{hasConfiguration ? 'Verified shell populations are not available in this snapshot.' : 'This snapshot does not contain a sourced electron configuration for this element.'}</p></div>}
      <span className="electron-stage-caption">SIMPLIFIED SHELL MODEL</span>
    </div>
    {validShells && shells && <>
      <div className="electron-model-controls"><span><strong>{element.z}</strong> electrons · <strong>{shells.length}</strong> shells</span><button type="button" aria-pressed={animate} onClick={() => setAnimate(value => !value)}>{animate ? 'Pause motion' : 'Animate model'}<span aria-hidden="true">{animate ? ' Ⅱ' : ' ↻'}</span></button></div>
      <dl className="electron-shell-counts" aria-label="Electron populations by shell">{shells.map((count, index) => <div key={index}><dt>n = {index + 1}</dt><dd>{count}</dd></div>)}</dl>
      <p className="electron-derived">Shell populations are grouped by principal shell from the sourced configuration. Their sum is {element.z}, the atomic number Z.</p>
    </>}
    <div className="electron-config"><div className="electron-config-heading"><h3>Electron configuration</h3><span>{element.configurationStatus || 'Status unavailable'}</span></div><p className="electron-config-value">{hasConfiguration && element.configuration ? <Configuration value={element.configuration} /> : 'Not available in this dataset'}</p></div>
    <p className="electron-model-note">Rings, dot positions, sizes, and motion are illustrative. Electrons do not follow these circular paths. Changing the isotope changes neutron count, not the electron count of a neutral atom.</p>
    <Provenance dataset={dataset} sourceIds={element.electronSourceIds} />
  </section>;
}
