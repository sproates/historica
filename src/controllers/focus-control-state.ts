import {ordinal,FIRST,LAST} from '../domain/timeline.js';
import type {TimeWindow} from '../domain/timeline.js';
import type {FocusState} from '../state/focus.js';

/** Synchronise form controls without replacing the generated history, timeline, map or evidence. */
export function syncFocusControls(root: Pick<Document,'getElementById'>, state: FocusState, envelope: TimeWindow, canGoBack: boolean, year: (value: number)=>string): void {
  const node=<T extends HTMLElement>(id: string): T=>{
    const value=root.getElementById(id);
    if(!value)throw new Error(`Missing focus control: ${id}`);
    return value as T;
  };
  node<HTMLButtonElement>('back').disabled=!canGoBack;
  node<HTMLSelectElement>('focus-picker').value=state.focus;
  node<HTMLSelectElement>('kind').value=state.kind;
  node<HTMLSelectElement>('area').value=state.area;
  for(const [id,value] of [['start',state.start],['end',state.end]] as const){
    const input=node<HTMLInputElement>(id);
    input.min=String(ordinal(envelope.start));input.max=String(ordinal(envelope.end));input.value=String(ordinal(value));
    input.setAttribute('aria-valuetext',year(value));
    node(`${id}-label`).textContent=year(value);
  }
  node<HTMLButtonElement>('zoom-in').disabled=state.start===state.end;
  node<HTMLButtonElement>('zoom-out').disabled=state.start===FIRST&&state.end===LAST;
}
