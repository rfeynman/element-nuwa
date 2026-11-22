export interface SpectralState {energyCm:number;energyText:string;configuration:string;term:string;j:string}
export interface SpectralLine {id:string;wavelengthNm:number;wavelengthText:string;medium:'air'|'vacuum';sourceAnchor:string;lineReference:string;lower:SpectralState|null;upper:SpectralState|null}
export interface ElementSpectrum {z:number;symbol:string;status:'available'|'outside-reference'|'reference-table-unavailable';url:string;retrievedAt?:string;lines:SpectralLine[]}
export interface SpectraDataset {schemaVersion:1;version:string;builtAt:string;source:{name:string;url:string;upstreamDate:string|null;attribution:string;wavelengthConvention:string};elements:ElementSpectrum[]}
export const visibleRange=[380,780] as const;
export const spectrumRange=[330,830] as const;
export function isVisible(line:SpectralLine){return line.wavelengthNm>=visibleRange[0]&&line.wavelengthNm<=visibleRange[1]}
export function isInSpectrumRange(line:SpectralLine){return line.wavelengthNm>=spectrumRange[0]&&line.wavelengthNm<=spectrumRange[1]}
export function linePosition(nm:number){return (nm-spectrumRange[0])/(spectrumRange[1]-spectrumRange[0])}
/** Approximate display RGB with illustrative UV/IR edge fades, not calibrated color or intensity. */
export function wavelengthColor(nm:number){
 if(nm<spectrumRange[0]||nm>spectrumRange[1])return null;
 let r=0,g=0,b=0;
 if(nm<380){r=1;b=1}else if(nm<440){r=(440-nm)/60;b=1}else if(nm<490){g=(nm-440)/50;b=1}else if(nm<510){g=1;b=(510-nm)/20}else if(nm<580){r=(nm-510)/70;g=1}else if(nm<645){r=1;g=(645-nm)/65}else r=1;
 const fade=nm<380?(nm-330)/50:nm>780?(830-nm)/50:1;
 return `rgb(${[r,g,b].map(c=>Math.round(255*c*fade)).join(', ')})`;
}
export function stateLabel(state:SpectralState|null){if(!state)return 'State assignment unavailable';return [state.configuration||'configuration unspecified',state.term,state.j?`J=${state.j}`:'',`${state.energyText} cm⁻¹`].filter(Boolean).join(' · ')}
export function transitionStates(line:SpectralLine,direction:'absorption'|'emission'){
 return direction==='absorption'?[line.lower,line.upper]:[line.upper,line.lower];
}
let snapshot:Promise<SpectraDataset>|null=null;
export function loadSpectra(){
 if(!snapshot)snapshot=fetch(`${import.meta.env.BASE_URL}data/spectra.json`).then(response=>{if(!response.ok)throw new Error('Spectral data could not be loaded.');return response.json()}).then((data:SpectraDataset)=>{if(data.schemaVersion!==1||data.elements.length!==118)throw new Error('Spectral snapshot is incompatible.');return data}).catch(error=>{snapshot=null;throw error});
 return snapshot;
}
