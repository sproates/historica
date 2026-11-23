import {searchEntities} from '../domain/search.js';
import type {SearchableHistory} from '../domain/search.js';
import {escapeHtml as esc} from '../presentation/html.js';

interface SearchControls {
  getEntities(): SearchableHistory[];
  formatDates(start: number, end: number): string;
  select(id: string): void;
}
export function bindSearchControls(root: Document, app: SearchControls): () => void {
  const input = root.getElementById('history-search') as HTMLInputElement | null;
  const panel = root.getElementById('search-panel'), clear = root.getElementById('search-clear');
  const results = root.getElementById('search-results'), count = root.getElementById('search-count');
  const container = root.querySelector('.collection-search');
  if (!input || !panel || !clear || !results || !count || !container) throw new Error('Missing search controls');
  const disposers: Array<() => void> = [];
  const listen = (node: EventTarget, name: string, action: EventListener): void => {
    node.addEventListener(name,action);disposers.push(() => node.removeEventListener(name,action));
  };
  function reset(): void {
    input!.value='';panel!.hidden=true;clear!.hidden=true;results!.innerHTML='';count!.textContent='';
  }
  listen(input,'input',() => {
    const query=input.value.trim();panel.hidden=!query;clear.hidden=!query;
    if (!query) {reset();return;}
    const matches=searchEntities(app.getEntities(),query);
    count.textContent=matches.length?`${matches.length} results across all dates. Choose one to change focus.`:'No matches in this collection yet. Try another name or a broader term.';
    results.innerHTML=matches.map(e=>`<li><button type="button" data-search-focus="${esc(e.id)}"><span><strong>${esc(e.title)}</strong><small>${esc(e.type==='state'?'State / kingdom':e.type)} · ${esc(app.formatDates(e.startYear,e.endYear))}</small></span><span class="search-description">${esc(e.description)}</span></button></li>`).join('');
  });
  listen(clear,'click',() => {reset();input.focus();});
  listen(results,'click',event => {
    const button=event.target instanceof Element?event.target.closest<HTMLElement>('[data-search-focus]'):null;
    if (!button?.dataset['searchFocus']) return;
    app.select(button.dataset['searchFocus']);reset();
  });
  listen(input,'keydown',event => {
    const key=(event as KeyboardEvent).key;
    if (key==='Enter'||key==='ArrowDown') {const first=results.querySelector('button');if(first){event.preventDefault();first.focus();}}
  });
  listen(container,'keydown',event => {if((event as KeyboardEvent).key==='Escape'){reset();input.focus();}});
  return () => {for(const dispose of disposers)dispose();};
}
