/** Optional production-only beacon. No custom events, query text or slider telemetry. */
export function startAnalytics(root: Document, hostname: string): void {
 const token=root.querySelector<HTMLMetaElement>('meta[name="historica-analytics"]')?.content;
 if(hostname!=='historica.online'||!token||!/^[a-f0-9]{32}$/i.test(token)||root.querySelector('[data-cf-beacon]'))return;
 const script=root.createElement('script');script.defer=true;
 script.src='https://static.cloudflareinsights.com/beacon.min.js';
 script.dataset['cfBeacon']=JSON.stringify({token,spa:false});
 root.head.append(script);
}
if(typeof document!=='undefined')startAnalytics(document,location.hostname);
