import {useEffect,useState} from 'react';
import './analytics.css';

interface AnalyticsConfig {goatcounterSite:string|null}
let configuration:Promise<AnalyticsConfig>|null=null;
export function normalizeAnalyticsSite(value:unknown):string|null{
 if(value===null||value==='')return null;
 if(typeof value!=='string')throw new Error('Analytics site must be a public site address.');
 const site=new URL(value);
 if(site.protocol!=='https:'||!/^[a-z0-9][a-z0-9-]*\.goatcounter\.com$/.test(site.hostname)||site.username||site.password||site.port||site.search||site.hash||site.pathname!=='/')throw new Error('Invalid GoatCounter site address.');
 return site.origin;
}
export function loadConfiguration(){
 if(!configuration)configuration=fetch(`${import.meta.env.BASE_URL}analytics.json`).then(async response=>{
  if(!response.ok)throw new Error('Analytics configuration unavailable.');
  const data=await response.json();return {goatcounterSite:normalizeAnalyticsSite(data.goatcounterSite)};
 }).catch(error=>{configuration=null;throw error});
 return configuration;
}
export function visitorCount(value:unknown):string{
 if(typeof value!=='string'&&typeof value!=='number')throw new Error('Invalid visit count.');
 const count=String(value).trim();
 if(!/^\d[\d,.\s]*$/.test(count)||count.length>40)throw new Error('Invalid visit count.');
 return count;
}
export function enableTracking(site:string){
 // Keep local previews out of the shared count; install once even in React Strict Mode.
 if(['localhost','127.0.0.1','[::1]','::1'].includes(location.hostname)||document.getElementById('visitor-analytics-tracker'))return;
 const script=document.createElement('script');
 script.id='visitor-analytics-tracker';script.async=true;script.src='https://gc.zgo.at/count.js';
 script.dataset.goatcounter=`${site}/count`;
 document.body.appendChild(script);
}
export default function VisitorAnalytics(){
 const [status,setStatus]=useState<'loading'|'unconfigured'|'ready'|'unavailable'>('loading'),[count,setCount]=useState<string|null>(null);
 useEffect(()=>{
  const controller=new AbortController();let active=true;
  loadConfiguration().then(async config=>{
   if(!active)return;
   if(!config.goatcounterSite){setStatus('unconfigured');return}
   enableTracking(config.goatcounterSite);
   const response=await fetch(`${config.goatcounterSite}/counter/TOTAL.json`,{signal:controller.signal,credentials:'omit'});
   if(!response.ok)throw new Error('Visit count unavailable.');
   const data=await response.json(),value=visitorCount(data.count);
   if(active){setCount(value);setStatus('ready')}
  }).catch(()=>{if(active)setStatus('unavailable')});
  return()=>{active=false;controller.abort()};
 },[]);
 return <section className="visitor-analytics" aria-labelledby="visitor-analytics-title"><div><p className="visitor-analytics-eyebrow">VISITOR ANALYTICS</p><h2 id="visitor-analytics-title">Site visits</h2><p>{status==='ready'?'Since tracking began':'Public visit count'}</p></div><div className="visitor-analytics-total" role="status" aria-live="polite"><strong>{count??'—'}</strong><p>{status==='loading'?'Loading visit statistics…':status==='ready'?'Updates periodically.':status==='unconfigured'?'Visit statistics are not available yet.':'Visit statistics are temporarily unavailable.'}</p></div>{status==='ready'&&<a className="visitor-analytics-provider" href="https://www.goatcounter.com/" target="_blank" rel="noreferrer">Analytics by GoatCounter ↗</a>}</section>;
}
