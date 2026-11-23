import type {FocusData} from './focus.js';
import type {ExplorerSnapshot} from './view-url.js';

/** Only reuse HTML when its content matches the restored view. Camera and disclosures are independent. */
export function canEnhanceStaticHistory(id: string | undefined, data: FocusData, saved: ExplorerSnapshot): boolean {
  const focus=data.entities.find(e=>e.id===id);
  const {state,view}=saved;
  return Boolean(focus&&state.focus===focus.id&&state.start===focus.startYear&&state.end===focus.endYear&&
    state.kind==='all'&&state.area==='all'&&view.moment===null&&view.people.length===0&&
    view.comparison==='shared'&&!view.expanded&&view.lanes.length===0);
}
