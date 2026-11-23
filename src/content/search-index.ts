import type {SearchIndex} from '../domain/search.js';
const object=(value: unknown): value is Record<string,unknown>=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const types=new Set(['person','area','state','city','period','event']);
/** Validate the small browser contract without importing the full history validator. */
export function parseSearchIndex(value: unknown): SearchIndex {
 if(!object(value)||value.version!==1||!Array.isArray(value.entries))throw new Error('Invalid search index');
 const ids=new Set<string>();
 for(const entry of value.entries){
  if(!object(entry)||typeof entry.id!=='string'||!/^[-a-z0-9]+$/.test(entry.id)||ids.has(entry.id)||typeof entry.type!=='string'||!types.has(entry.type)||typeof entry.title!=='string'||!entry.title.trim()||typeof entry.text!=='string'||!entry.text.trim()||typeof entry.startYear!=='number'||!Number.isSafeInteger(entry.startYear)||entry.startYear===0||typeof entry.endYear!=='number'||!Number.isSafeInteger(entry.endYear)||entry.endYear===0||entry.startYear>entry.endYear)throw new Error('Invalid search entry');
  ids.add(entry.id);
 }
 return value as unknown as SearchIndex;
}
