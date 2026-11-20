import type {ElementRecord} from '../types';
export default function ElectronPreview({element,onExpand}:{element:ElementRecord;onExpand:()=>void}){
 const shells=element.shells;
 return <div className="electron-preview"><svg viewBox="0 0 110 110" aria-hidden="true"><circle cx="55" cy="55" r="9" fill="#346e53"/>{shells?.map((count,index)=>{const radius=17+index*(32/Math.max(1,shells.length-1));return <g key={index}><circle cx="55" cy="55" r={radius} fill="none" stroke="#a3b9a1" strokeWidth=".8"/>{Array.from({length:count},(_,i)=>{const angle=i/count*Math.PI*2+index*.2;return <circle key={i} cx={55+radius*Math.cos(angle)} cy={55+radius*Math.sin(angle)} r={1.6} fill="#3c6d51"/>})}</g>})}</svg><div><strong>Inside a neutral atom</strong><p>{shells?`${shells.join(' · ')} electrons by shell`:'Electron configuration not available'}</p><small>Simplified shell model</small><button onClick={onExpand}>Explore electron shells →</button></div></div>
}
