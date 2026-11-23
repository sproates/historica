import type {HistoryEntity} from '../../src/domain/history.js';
import type {HistoryPage} from '../../src/presentation/history-page.js';
/** Filesystem adapter; input records are validated before entering the typed page model. */
export function historyPage(id: string, options?: {geography?: boolean}): HistoryPage;
export {year,dates,href,xy,geometry} from '../../src/presentation/history-page.js';
export {laneView} from '../../src/domain/swimlane.js';

export function historyEntities(): HistoryEntity[];

export function selectedHistoryEntities(): HistoryEntity[];
