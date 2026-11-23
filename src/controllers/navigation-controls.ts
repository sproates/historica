import {isContextKind} from '../state/focus.js';
import type {ContextKind} from '../state/focus.js';

interface NavigationControls {
  focus(id: string, kind?: ContextKind): void;
  filter(area: string): void;
  wholePeriod(): void;
  toggleContext(): void;
  back(): void;
}
export function bindNavigationControls(root: Pick<Document,'getElementById'|'querySelector'>, app: NavigationControls): () => void {
  const picker=root.getElementById('focus-picker') as HTMLSelectElement | null;
  const main=root.querySelector('main'), whole=root.getElementById('whole-period'), more=root.getElementById('more-context'), back=root.getElementById('back');
  if(!picker||!main||!whole||!more||!back)throw new Error('Missing navigation controls');
  const disposers: Array<() => void>=[];
  const listen=(node: Element,name: string,action: EventListener): void=>{node.addEventListener(name,action);disposers.push(()=>node.removeEventListener(name,action));};
  listen(picker,'change',()=>app.focus(picker.value));
  listen(main,'click',event=>{
    const button=event.target instanceof Element?event.target.closest<HTMLElement>('[data-focus],[data-filter]'):null;
    if(!button||button.hasAttribute('disabled'))return;
    const id=button.dataset['focus'],area=button.dataset['filter'],kind=button.dataset['kind'];
    if(id)app.focus(id,isContextKind(kind)?kind:'all');
    else if(area)app.filter(area);
  });
  listen(whole,'click',()=>app.wholePeriod());
  listen(more,'click',()=>app.toggleContext());
  listen(back,'click',()=>app.back());
  return ()=>{for(const dispose of disposers)dispose();};
}
