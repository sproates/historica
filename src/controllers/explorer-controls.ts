import {historical,ordinal} from '../domain/timeline.js';
import {initialFocus,isContextKind,midpoint,zoomFocus} from '../state/focus.js';
import type {FocusData,FocusState} from '../state/focus.js';

export interface ExplorerControls {
  getData(): FocusData;
  getState(): FocusState;
  getMoment(): number | null;
  setState(state: FocusState, resizeEnvelope: boolean): void;
  setMoment(moment: number | null): void;
}

/** Attach input behaviour without owning page rendering, browser history or application state. */
export function bindExplorerControls(root: Pick<Document,'getElementById'>, app: ExplorerControls): () => void {
  const disposers: Array<() => void> = [];
  const element = <T extends HTMLElement>(id: string, tag: string): T => {
    const node = root.getElementById(id);
    if (!node || node.tagName.toLowerCase() !== tag) throw new Error(`Missing ${tag} control: ${id}`);
    return node as T;
  };
  const listen = (node: HTMLElement, event: string, action: () => void): void => {
    node.addEventListener(event,action);
    disposers.push(() => node.removeEventListener(event,action));
  };
  const button = (id: string, action: () => void): void => listen(element<HTMLButtonElement>(id,'button'),'click',action);
  const input = (id: string): HTMLInputElement => element<HTMLInputElement>(id,'input');
  const start = input('start'), end = input('end'), enabled = input('year-enabled'), cursor = input('year-cursor');
  const kind = element<HTMLSelectElement>('kind','select'), area = element<HTMLSelectElement>('area','select');
  listen(start,'input',() => {
    const state = app.getState();
    app.setState({...state,start:Math.min(historical(Number(start.value)),state.end)},false);
  });
  listen(end,'input',() => {
    const state = app.getState();
    app.setState({...state,end:Math.max(historical(Number(end.value)),state.start)},false);
  });
  button('zoom-in',() => app.setState(zoomFocus(app.getState(),.5),true));
  button('zoom-out',() => app.setState(zoomFocus(app.getState(),2),true));
  button('fit',() => {
    const state = app.getState(), full = initialFocus(app.getData(),state.focus);
    app.setState({...state,start:full.start,end:full.end},true);
  });
  listen(enabled,'change',() => app.setMoment(enabled.checked?midpoint(app.getState()):null));
  listen(cursor,'input',() => app.setMoment(historical(Number(cursor.value))));
  for (const [id,step] of [['year-prev',-1],['year-next',1]] as const) button(id,() => {
    const moment = app.getMoment();
    if (moment !== null) app.setMoment(historical(ordinal(moment)+step));
  });
  listen(kind,'change',() => {
    if (isContextKind(kind.value)) app.setState({...app.getState(),kind:kind.value},false);
  });
  listen(area,'change',() => {
    if (area.value === 'all' || app.getData().entities.some(e => e.id === area.value && ['area','state','city'].includes(e.type))) {
      app.setState({...app.getState(),area:area.value},false);
    }
  });
  button('clear',() => app.setState({...app.getState(),kind:'all',area:'all'},false));
  return () => {for (const dispose of disposers) dispose();};
}
