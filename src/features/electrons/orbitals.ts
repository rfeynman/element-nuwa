import type {ElementRecord} from '../../types';
export type OrbitalType='s'|'p'|'d'|'f';
export interface Subshell {n:number;type:OrbitalType;count:number}
export const orbitalTypes:OrbitalType[]=['s','p','d','f'];
export const orbitalColors={s:'#bd7b13',p:'#078b83',d:'#3b72cf',f:'#9855ba'};
export const orbitalNames={s:'Spherical',p:'Two lobes',d:'Clover / ring forms',f:'Complex lobes'};
export const orbitalOrientations:Record<OrbitalType,{m:number;label:string}[]>={
 s:[{m:0,label:'s'}],p:[{m:0,label:'p_z'},{m:1,label:'p_x'},{m:-1,label:'p_y'}],
 d:[{m:-2,label:'d_xy'},{m:1,label:'d_xz'},{m:-1,label:'d_yz'},{m:2,label:'d_x²−y²'},{m:0,label:'d_z²'}],
 f:[{m:-2,label:'f_xyz'},{m:0,label:'f_z³'},{m:1,label:'f_xz²'},{m:-1,label:'f_yz²'},{m:2,label:'f_z(x²−y²)'},{m:3,label:'f_x(x²−3y²)'},{m:-3,label:'f_y(3x²−y²)'}]
};
/** Expand the actual sourced noble-gas core, preserving configuration exceptions. */
export function occupiedSubshells(element:ElementRecord,elements:ElementRecord[]):Subshell[]{
 function expand(e:ElementRecord,seen:Set<number>):Subshell[]|null{
  if(!e.configuration||seen.has(e.z))return null;
  const next=new Set(seen).add(e.z),core=e.configuration.match(/\[([A-Z][a-z]?)\]/),result:Subshell[]=[];
  if(core){const reference=elements.find(item=>item.symbol===core[1]);if(!reference)return null;const inner=expand(reference,next);if(!inner)return null;result.push(...inner)}
  const text=e.configuration.replace(/\[[^\]]+\]/,'').replace(/\([^)]*\)/g,'').trim();
  const tokens=[...text.matchAll(/(\d)([spdf])\^?(\d+)/g)];
  if(text.replace(/(\d)([spdf])\^?(\d+)/g,'').trim())return null;
  for(const token of tokens){const n=Number(token[1]),type=token[2] as OrbitalType,count=Number(token[3]),l=orbitalTypes.indexOf(type);if(n<=l||n>7||count<1||count>2*(2*l+1)||result.some(s=>s.n===n&&s.type===type))return null;result.push({n,type,count})}
  return result.reduce((sum,s)=>sum+s.count,0)===e.z?result:null;
 }
 return (expand(element,new Set())??[]).sort((a,b)=>a.n-b.n||orbitalTypes.indexOf(a.type)-orbitalTypes.indexOf(b.type));
}
function factorial(n:number){let v=1;for(let k=2;k<=n;k++)v*=k;return v}
/** Normalized real spherical harmonics; phase convention does not change |Y|². */
export function realHarmonic(l:number,m:number,cosTheta:number,phi:number):number{
 const a=Math.abs(m);if(a>l)return 0;let p=1;
 for(let k=1;k<=a;k++)p*=-(2*k-1)*Math.sqrt(Math.max(0,1-cosTheta*cosTheta));
 if(l>a){let previous=p,current=cosTheta*(2*a+1)*p;for(let k=a+2;k<=l;k++){const value=((2*k-1)*cosTheta*current-(k+a-1)*previous)/(k-a);previous=current;current=value}p=current}
 const norm=Math.sqrt((2*l+1)/(4*Math.PI)*factorial(l-a)/factorial(l+a));
 return norm*p*(m===0?1:Math.SQRT2*(m>0?Math.cos(a*phi):Math.sin(a*phi)));
}
export function laguerre(k:number,alpha:number,x:number):number{
 if(k===0)return 1;let previous=1,current=1+alpha-x;
 for(let j=2;j<=k;j++){const value=((2*j-1+alpha-x)*current-(j-1+alpha)*previous)/j;previous=current;current=value}return current;
}
/** Unnormalized radial probability in rho=2r/(n a0), including the volume Jacobian. */
export function radialProbability(n:number,l:number,rho:number){return Math.exp(-rho)*rho**(2*l+2)*laguerre(n-l-1,2*l+1,rho)**2}
export interface CloudPoint{x:number;y:number;z:number}
export interface CloudSample{points:CloudPoint[];scale:number}
export function sampleOrbital(n:number,l:number,m:number,count=4200):CloudSample{
 if(!Number.isInteger(n)||n<1||n>7||!Number.isInteger(l)||l<0||l>=n||l>3||!Number.isInteger(m)||Math.abs(m)>l)throw Error('Unsupported orbital quantum numbers');
 let seed=(n*7919+l*101+m*31+4096)>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed+.5)/4294967296};
 const bins=1800,maxRho=10*n+20,step=maxRho/bins,cdf=[0];let previous=0;
 for(let i=1;i<=bins;i++){const value=radialProbability(n,l,i*step);cdf.push(cdf[i-1]+(value+previous)*step/2);previous=value}
 const total=cdf[bins];
 function quantile(q:number){const target=q*total;let low=0,high=bins;while(high-low>1){const mid=(low+high)>>1;if(cdf[mid]<target)low=mid;else high=mid}return step*(low+(target-cdf[low])/(cdf[high]-cdf[low]))}
 // Fit the 99.5% radial quantile; the small outer tail is clipped by the view, not a physical boundary.
 const scale=quantile(.995),points:CloudPoint[]=[];
 while(points.length<count){const z=2*random()-1,phi=2*Math.PI*random(),angular=realHarmonic(l,m,z,phi);if(random()*(2*l+1)/(4*Math.PI)>angular*angular)continue;const radius=quantile(random()),s=Math.sqrt(1-z*z);points.push({x:radius*s*Math.cos(phi),y:radius*s*Math.sin(phi),z:radius*z})}
 return {points,scale};
}
