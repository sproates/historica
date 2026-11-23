export interface PageFingerprint {id:string;fingerprint:string;output?:string}
export interface PageManifest {shared:string;pages:Record<string,PageFingerprint>;version?:number}
import {createHash} from 'node:crypto';
export const digest=(value: unknown)=>createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');

/** Missing, changed or tampered outputs are rebuilt; removed routes are pruned only after success. */
export function planPages(models: Array<{id:string;route:string;model:unknown}>,previous: PageManifest | undefined,shared: string,readOutput: (route:string)=>string|Buffer|null){
 const changed: string[]=[],unchanged: string[]=[],pages: Record<string,PageFingerprint>={};
 for(const {id,route,model} of models){
  const fingerprint=digest([shared,model]);
  const old=previous?.pages?.[route],output=readOutput(route);
  if(old?.fingerprint===fingerprint&&output!==null&&digest(output)===old.output)unchanged.push(id);
  else changed.push(id);
  pages[route]={id,fingerprint};
 }
 return {changed,unchanged,pages,removed:Object.keys(previous?.pages||{}).filter(route=>!pages[route])};
}

/** A build manifest alone is not proof that its static tests passed. */
export function pagesNeedingChecks(manifest: PageManifest,verified?: PageManifest){
 return Object.entries(manifest.pages).filter(([route,page])=>verified?.shared!==manifest.shared||verified?.pages?.[route]?.fingerprint!==page.fingerprint||verified?.pages?.[route]?.output!==page.output).map(([,page])=>page.id);
}
