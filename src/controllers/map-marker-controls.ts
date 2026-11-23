/** Identify a map place before following it, including on touch-only screens. */
export function bindMapMarkers(svg: SVGSVGElement): void {
  const doc=svg.ownerDocument;
  const tooltip=doc.createElement('div');
  tooltip.className='map-place-tooltip';tooltip.id='map-place-tooltip';tooltip.role='tooltip';tooltip.hidden=true;
  const panel=doc.createElement('div');panel.className='map-place-preview';panel.hidden=true;
  panel.setAttribute('aria-label','Selected map place');panel.setAttribute('role','region');
  const name=doc.createElement('strong');
  const explore=doc.createElement('button');explore.type='button';
  const close=doc.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Close place preview');
  panel.append(name,explore,close);svg.after(panel);doc.body.append(tooltip);
  let described: Element | null=null;
  const marker=(target: EventTarget | null): Element | null=>target instanceof Element?target.closest('.map-marker[data-focus]'):null;
  const label=(node: Element): string=>(node.getAttribute('aria-label')||node.querySelector('title')?.textContent||'Place').replace(/^Focus on /,'');
  function hideTooltip(){tooltip.hidden=true;described?.removeAttribute('aria-describedby');described=null;}
  function dismiss(){hideTooltip();panel.hidden=true;}
  function showTooltip(node: Element){
    hideTooltip();tooltip.textContent=label(node);tooltip.hidden=false;described=node;node.setAttribute('aria-describedby',tooltip.id);
    const rect=node.getBoundingClientRect(),tip=tooltip.getBoundingClientRect();
    tooltip.style.left=`${Math.max(8,Math.min(window.innerWidth-tip.width-8,rect.left+rect.width/2-tip.width/2))}px`;
    tooltip.style.top=`${Math.max(8,rect.top-tip.height-8)}px`;
  }
  svg.addEventListener('pointerover',event=>{const node=marker(event.target);if(node&&event.pointerType==='mouse')showTooltip(node);});
  svg.addEventListener('pointerout',hideTooltip);
  svg.addEventListener('focusin',event=>{const node=marker(event.target);if(node)showTooltip(node);});
  svg.addEventListener('focusout',hideTooltip);
  svg.addEventListener('pointerdown',dismiss);
  svg.addEventListener('wheel',dismiss,{passive:true});
  // Map gesture controls suppress drag/pinch clicks before this bubbling listener.
  svg.addEventListener('click',event=>{
    const node=marker(event.target);if(!node){dismiss();return;}
    event.stopPropagation();hideTooltip();
    name.textContent=label(node);explore.textContent=`Explore ${label(node)} →`;
    explore.dataset.focus=node.getAttribute('data-focus')!;panel.hidden=false;
    if(event.detail===0)explore.focus();
  });
  close.addEventListener('click',()=>{dismiss();svg.focus({preventScroll:true});});
  doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){dismiss();svg.focus({preventScroll:true});}else if(event.key==='Escape')hideTooltip();});
  doc.addEventListener('pointerdown',event=>{if(event.target instanceof Node&&!svg.contains(event.target)&&!panel.contains(event.target))dismiss();});
  window.addEventListener('scroll',hideTooltip,true);window.addEventListener('resize',hideTooltip);
  // A changed focus/year replaces the markers: never leave a stale destination open.
  new MutationObserver(dismiss).observe(svg,{childList:true});
}
