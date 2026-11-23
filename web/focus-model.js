import prototypeData from './generated/content/prototype-data.js';
import {assembleHistory} from './generated/domain/assemble-history.js';
export function buildFocusData(collection, exploration={entities:[],associations:[],relationships:[]}, base=prototypeData){
 return assembleHistory(base,exploration,collection);
}
export {initialFocus,changeFocus,encodeFocus,decodeFocus} from './generated/state/focus.js';
export {focusAssociations,distance,rankedContext,relatedEntities,temporalLabel} from './generated/domain/history-queries.js';
