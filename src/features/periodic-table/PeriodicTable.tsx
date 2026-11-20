import { useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import type { ElementRecord } from '../../types';
import './periodic-table.css';

interface PeriodicTableProps {
  elements: ElementRecord[];
  selectedZ: number;
  onPreview: (z: number | null) => void;
  onSelect: (z: number) => void;
}

function categoryLabel(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function categoryColor(value: string) {
  const name = value.toLowerCase().replace(/[-_]/g, ' ');
  if (name.includes('alkaline')) return '#f2d9b9';
  if (name.includes('alkali')) return '#efc6b8';
  if (name.includes('lanthan')) return '#e1d0e9';
  if (name.includes('actin')) return '#d6c1df';
  if (name.includes('post transition') || name.includes('poor metal')) return '#d5dfc6';
  if (name.includes('transition')) return '#efdfb5';
  if (name.includes('metalloid')) return '#bcdacf';
  if (name.includes('noble')) return '#d0d9ef';
  if (name.includes('halogen')) return '#c4dfe8';
  if (name.includes('nonmetal') || name.includes('non metal')) return '#c4dfda';
  return '#e0e3df';
}

export default function PeriodicTable({ elements, selectedZ, onPreview, onSelect }: PeriodicTableProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const tiles = useRef(new Map<number, HTMLButtonElement>());
  const categories = useMemo(() => [...new Set(elements.map((element) => element.category))].sort(), [elements]);
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return elements.filter((element) =>
      (category === 'all' || element.category === category) &&
      (!search || element.name.toLowerCase().includes(search) || element.symbol.toLowerCase().includes(search) || String(element.z) === search),
    );
  }, [elements, query, category]);
  const visible = useMemo(() => new Set(filtered.map((element) => element.z)), [filtered]);
  const isFiltering = Boolean(query.trim()) || category !== 'all';

  function navigate(event: KeyboardEvent<HTMLButtonElement>, current: ElementRecord) {
    const delta = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<string, number[]>)[event.key];
    if (!delta) return;
    event.preventDefault();
    const candidates = filtered.filter((element) => {
      if (delta[0]) return element.y === current.y && (element.x - current.x) * delta[0] > 0;
      return element.x === current.x && (element.y - current.y) * delta[1] > 0;
    }).sort((a, b) => (Math.abs(a.x - current.x) + Math.abs(a.y - current.y)) - (Math.abs(b.x - current.x) + Math.abs(b.y - current.y)));
    if (candidates[0]) tiles.current.get(candidates[0].z)?.focus();
  }

  function clearFilters() {
    setQuery('');
    setCategory('all');
    onPreview(null);
  }

  return (
    <section className="periodic-table" aria-label="Interactive periodic table">
      <div className="pt-controls">
        <label className="pt-search"><span className="pt-sr-only">Search elements by name, symbol, or atomic number</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input type="search" placeholder="Search name, symbol, or number" value={query} onChange={(event) => { setQuery(event.target.value); onPreview(null); }} /></label>
        <label className="pt-category"><span>Family</span><select value={category} onChange={(event) => { setCategory(event.target.value); onPreview(null); }}><option value="all">All element families</option>{categories.map((value) => <option key={value} value={value}>{categoryLabel(value)}</option>)}</select></label>
        <span className="pt-count" role="status" aria-live="polite">{filtered.length} / {elements.length} elements</span>
        {isFiltering && <button className="pt-clear" onClick={clearFilters}>Clear filters</button>}
      </div>
      {elements.length === 0 ? <p className="pt-empty" role="status">Element records are unavailable. Please reload to try again.</p> : <>
        {filtered.length === 0 && <div className="pt-empty" role="status"><strong>No matching elements.</strong> Try another name, symbol, or atomic number, or <button onClick={clearFilters}>clear filters</button>.</div>}
        <div className="pt-scroll" role="region" aria-label="Periodic table. Scroll horizontally on a narrow screen." tabIndex={0}>
          <div className="pt-grid">
            {Array.from({ length: 18 }, (_, index) => <span key={`group-${index + 1}`} className="pt-group" style={{ gridColumn: index + 1, gridRow: 1 }} aria-label={`Group ${index + 1}`}>{index + 1}</span>)}
            <div className="pt-map-key"><span className="pt-key-number">01 <span>Atomic number</span></span><strong>H <span>Symbol</span></strong><span>Hydrogen <span>Name</span></span><span>1.008 <span>Atomic weight</span></span></div>
            <span className="pt-series-marker" style={{ gridColumn: 3, gridRow: 7 }} aria-hidden="true">57–71<span>↓</span></span>
            <span className="pt-series-marker" style={{ gridColumn: 3, gridRow: 8 }} aria-hidden="true">89–103<span>↓</span></span>
            {elements.map((element) => {
              const matches = visible.has(element.z);
              const massNumber = element.weightKind === 'mass-number';
              const weight = element.weightKind === 'unavailable' ? '—' : element.atomicWeight;
              const tileWeight = weight.split(' ± ')[0];
              return <button key={element.z} ref={(node) => { if (node) tiles.current.set(element.z, node); else tiles.current.delete(element.z); }} type="button" className={`pt-element${selectedZ === element.z ? ' is-selected' : ''}${matches ? '' : ' is-dimmed'}`} style={{ gridColumn: element.x, gridRow: element.y + 1, '--tile-color': categoryColor(element.category) } as CSSProperties} aria-label={`${element.name}, ${element.symbol}, atomic number ${element.z}, ${massNumber ? 'isotope mass number' : 'atomic weight'} ${weight}${matches ? '' : ', excluded by current filters'}`} aria-pressed={selectedZ === element.z} tabIndex={matches ? 0 : -1} disabled={!matches} draggable={matches} onDragStart={(event) => { if (!matches) { event.preventDefault(); return; } event.dataTransfer.effectAllowed = 'copy'; event.dataTransfer.setData('application/x-element-z', String(element.z)); event.dataTransfer.setData('text/plain', element.symbol); }} onPointerEnter={() => onPreview(element.z)} onPointerLeave={() => onPreview(null)} onFocus={() => onPreview(element.z)} onBlur={() => onPreview(null)} onClick={() => onSelect(element.z)} onKeyDown={(event) => navigate(event, element)} title={`${element.name} · ${categoryLabel(element.category)} · ${massNumber ? 'Isotope mass number' : 'Atomic weight'} ${weight}${massNumber ? ' · Brackets show an isotope mass number, not a standard atomic weight.' : ''}`}>
                <span className="pt-atomic-number">{element.z}{selectedZ === element.z && <span className="pt-pinned" aria-hidden="true">●</span>}</span><strong className="pt-symbol">{element.symbol}</strong><span className="pt-name">{element.name}</span><span className="pt-weight">{tileWeight}</span>
              </button>;
            })}
          </div>
        </div>
      </>}
      <div className="pt-legend" aria-label="Element families">{categories.map((value) => <span key={value}><i style={{ background: categoryColor(value) }} aria-hidden="true"/>{categoryLabel(value)}</span>)}</div>
      <div className="pt-notes"><p>Lanthanides (57–71) and actinides (89–103) continue below the main table to keep it compact.</p><p>Full atomic-weight uncertainties appear in the spotlight and tile tooltip. A single bracketed integer is an isotope mass number; ranges denote atomic-weight intervals. Use arrow keys to move between tiles; Enter or Space keeps your selection. Drag a tile into the vessel below, or select an element and use Add selected element.</p></div>
    </section>
  );
}
