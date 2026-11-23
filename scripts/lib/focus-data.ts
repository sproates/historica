import type {HistoryDataset} from '../../src/domain/history.js';
import {readHistoryPacks,readPrototypeData} from './history-content.ts';
const prototypeData=readPrototypeData(readHistoryPacks());
import {assembleHistory} from '../../web/generated/domain/assemble-history.js';
export function buildFocusData(collection: unknown, exploration: HistoryDataset={entities:[],associations:[],relationships:[]}, base=prototypeData){
 return assembleHistory(base,exploration,collection);
}
export {initialFocus,changeFocus,encodeFocus,decodeFocus} from '../../web/generated/state/focus.js';
export {focusAssociations,distance,rankedContext,relatedEntities,temporalLabel} from '../../web/generated/domain/history-queries.js';
