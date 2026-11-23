import {parseHistory} from './validate-history.js';
import type {HistoryDataset} from '../domain/history.js';
export interface BrowserHistory {version: 1; data: HistoryDataset; bactriaOutline: string}
/** The browser receives assembled records, not the older campaign collection. */
export function parseBrowserHistory(value: unknown): BrowserHistory {
 if(!value||typeof value!=='object')throw new Error('Invalid browser history');
 const pack=value as Record<string,unknown>;
 if(pack['version']!==1||typeof pack['bactriaOutline']!=='string')throw new Error('Invalid browser history');
 return {version:1,data:parseHistory(pack['data']),bactriaOutline:pack['bactriaOutline']};
}
