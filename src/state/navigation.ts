import {changeFocus,focusEnvelope,clampMoment} from './focus.js';
import type {FocusData,ContextKind} from './focus.js';
import type {ExplorerSnapshot} from './view-url.js';
import type {TimeWindow} from '../domain/timeline.js';
/** A focus transition is independent of the DOM, URL and asynchronous evidence loading. */
export function nextFocus(data: FocusData, current: ExplorerSnapshot, id: string, kind: ContextKind='all', period: TimeWindow|null=null): ExplorerSnapshot {
 const state={...changeFocus(data,current.state,id),...(period??{}),kind};
 return {state,view:{...structuredClone(current.view),moment:clampMoment(current.view.moment,state),envelope:focusEnvelope(data,state),expanded:false,lanes:[]}};
}
