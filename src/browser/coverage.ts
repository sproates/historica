import {overview,workflows,evidenceStates,windowLabel,validateCoverage} from '../domain/coverage.js';
import type {CoverageRegistry,ResearchBatch} from '../domain/coverage.js';
import type {ReviewedEvidence} from '../domain/evidence.js';
import {escapeHtml as esc} from '../presentation/html.js';

export async function startCoverage(): Promise<void> {
const $=<T extends HTMLElement=HTMLElement>(id: string): T=>{
 const node=document.getElementById(id);
 if(!node)throw new Error(`Missing coverage control: ${id}`);
 return node as T;
};
const planNode=document.querySelector<HTMLDetailsElement>('.research-plan');
if(!planNode)throw new Error('Missing research plan');
const plan=planNode;
const names: Record<string,string> = {'settlement-mobility':'Settlement and mobility','livelihoods-technology-exchange':'Food, work, technology and exchange','social-political-organisation':'Social and political organisation','beliefs-knowledge-arts':'Beliefs, knowledge and material culture','change-continuity':'Change and continuity','external-connections':'Connections with other regions'};
let data: CoverageRegistry, selected: string | undefined, batches: ResearchBatch[] = [];
function detail(id: string) {
  const p = [...data.packages, ...data.supplementaryPackages].find(p => p.id === id);
  if (!p) return;
  selected = id;
  const r = data.regions.find(r => r.id === p.regionId), w = 'windowId' in p ? data.windows.find(w => w.id === p.windowId) : p;
  if(!r || !w)throw new Error('Research package scope is missing.');
  $('package-detail').innerHTML = `<p class="eyebrow">${p.pilot ? 'PILOT PACKAGE' : 'RESEARCH PACKAGE'}</p><h2>${esc(r.name)}</h2><p>${windowLabel(w)}</p><div class="detail-status">Workflow: <strong>${esc(p.workflow)}</strong><br>Evidence: <strong>${esc(p.evidenceStatus)}</strong></div><p>${esc(r.extent || 'Geographical extent and named subregions still need defining.')}</p>${p.batchIds?.length ? '<p>Draft findings appear below the table.</p>' : ''}<h3>Six themes to investigate</h3><ul>${data.requiredThemes.map(t=>`<li>${esc(names[t] || t.replaceAll('-', ' '))}</li>`).join('')}</ul><p>${p.accountIds?.length ? `${p.accountIds.length} linked account(s): ${p.accountIds.map(esc).join(', ')}` : 'No regional account has been linked yet. The regional evidence outcome has not been assessed.'}</p>${p.unresolvedIssues?.length ? `<h3>Outstanding issues</h3><ul>${p.unresolvedIssues.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>` : ''}<p class="package-id">${esc(p.id)}</p>`;
  document.querySelectorAll<HTMLElement>('[data-package]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset['package'] === id)));
  const batch = batches.find(b => b.batch.packageId === id);
  $('research-findings').innerHTML = batch ? `<p class="eyebrow">RESEARCH IN PROGRESS</p><h2>What this batch found</h2>${batch.batch.reviewedRelease?`<p class="release-note"><a href="${esc(batch.batch.reviewedRelease.url)}">Explore ${batch.batch.reviewedRelease.statementCount} reviewed statements in the timeline</a><br>${esc(batch.batch.reviewedRelease.note)}</p>`:''}<p>${batch.claims.length} candidate statements from ${batch.sources.length} inspected sources. These are drafts, not accepted timeline facts. Broad period evidence is not proof of what happened in a single year.</p><div class="findings-grid">${batch.claims.map(c=>`<article><h3>${esc(c.statement)}</h3>${c.evidenceIds.map(eid=>{const e=batch.evidence.find(e=>e.id===eid);if(!e)throw new Error('Missing research evidence');const source=batch.sources.find(s=>s.id===e.sourceId);if(!source)throw new Error('Missing research source');return `<p><a href="${esc(source.url)}">${esc(source.title)}</a><br><small>${esc(source.creator)} · ${esc(e.locator)}</small></p><p class="muted">${e.relation==='contradicts'?'Alternative chronology: ':''}${esc(e.note)}</p>`;}).join('')}</article>`).join('')}</div><p>Review: AI-assisted passage inspection; chronological and regional checks remain outstanding. Not independent expert review.</p>` : '';
  save();
}
function save() { if(!plan.open){history.replaceState(null,'',location.pathname);return;} const q = new URLSearchParams({package:selected || '', group:$<HTMLSelectElement>('group').value, workflow:$<HTMLSelectElement>('workflow').value, evidence:$<HTMLSelectElement>('evidence-filter').value, pilot:$<HTMLInputElement>('pilot').checked?'1':'0'}); history.replaceState(null,'',`${location.pathname}?${q}`); }
function render() {
  const stats = overview(data);
  const matching = stats.active.filter(p => {
    const r = data.regions.find(r => r.id === p.regionId);
    return ($<HTMLSelectElement>('group').value === 'all' || r?.group === $<HTMLSelectElement>('group').value) && ($<HTMLSelectElement>('workflow').value === 'all' || p.workflow === $<HTMLSelectElement>('workflow').value) && ($<HTMLSelectElement>('evidence-filter').value === 'all' || p.evidenceStatus === $<HTMLSelectElement>('evidence-filter').value) && (!$<HTMLInputElement>('pilot').checked || p.pilot);
  });
  const ids = new Set(matching.map(p => p.id));
  const visibleWindows = data.windows.filter(w => matching.some(p => p.windowId === w.id));
  const rows = data.regions.filter(r => !r.subregions.length && matching.some(p => p.regionId === r.id));
  $('match-count').textContent = `${matching.length} of ${stats.active.length} active packages match these filters. Worldwide totals above remain unchanged.`;
  $('matrix').innerHTML = `<caption class="sr-only">Workflow and evidence availability by region and time window</caption><thead><tr><th scope="col">Research area</th>${visibleWindows.map(w=>`<th scope="col">${windowLabel(w)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${esc(r.name)}<small>${esc(r.group)}${r.parentId ? ' · subdivided area' : ''}</small></th>${visibleWindows.map(w=>{
    const p = stats.active.find(p => p.regionId === r.id && p.windowId === w.id);
    return `<td>${p && ids.has(p.id) ? `<button class="cell" data-package="${esc(p.id)}" data-workflow="${p.workflow}" aria-pressed="${p.id === selected}" aria-label="${esc(r.name)}, ${windowLabel(w)}. Workflow: ${p.workflow}. Evidence: ${p.evidenceStatus}" title="${p.workflow} · evidence ${p.evidenceStatus}"><span>${p.workflow.charAt(0).toUpperCase()}</span><span>${p.evidenceStatus==='unknown'?'?':p.evidenceStatus.charAt(0).toUpperCase()}</span></button>` : '<span class="filtered" aria-label="Excluded by filters">—</span>'}</td>`;
  }).join('')}</tr>`).join('')}</tbody>`;
  if (!rows.length) $('match-count').textContent += ' Try widening the filters.';
  save();
}
async function init() {
  const response = await fetch('data/coverage.json'); if (!response.ok) throw new Error('Coverage registry could not be loaded.'); data = await response.json();
  const errors=validateCoverage(data);if(errors.length)throw new Error(errors.join('\n'));
  const research = await fetch('data/coverage-research.json'); if (!research.ok) throw new Error('Research batches could not be loaded.'); batches = await research.json();
  const evidenceResponse=await fetch('data/reviewed-evidence.json');
  if(evidenceResponse.ok){const evidence: ReviewedEvidence=await evidenceResponse.json();$('checked-total').textContent=`${evidence.claims.filter(c=>c.status==='accepted').length} statements currently have recorded source checks.`;}
  const stats = overview(data);
  $('totals').innerHTML = [[stats.substantive,'Accepted · substantive'],[stats.limited,'Accepted · evidence limited'],[stats.awaiting,'Drafted or awaiting review'],[stats.unresearched,'Not yet researched']].map(([n,label])=>`<div class="total"><strong>${n}</strong><span>${label}</span></div>`).join('');
  $('revision').textContent = `Queue revision ${data.queueRevision || 1} · ${stats.completeOriginal} / ${stats.originalTotal} original region–period packages complete · ${stats.active.length} active packages after subdivisions. Parent completion requires every child. Egyptian introduction tracked separately.`;
  for (const group of new Set(data.regions.map(r=>r.group))) $<HTMLSelectElement>('group').add(new Option(group,group));
  for (const w of workflows) $<HTMLSelectElement>('workflow').add(new Option(w.charAt(0).toUpperCase()+w.slice(1),w));
  for (const e of evidenceStates) $<HTMLSelectElement>('evidence-filter').add(new Option(e.charAt(0).toUpperCase()+e.slice(1),e));
  const params = new URLSearchParams(location.search.slice(1)||location.hash.slice(1));
  if(params.has('package'))plan.open=true;
  for (const [id,key] of ([['group','group'],['workflow','workflow'],['evidence-filter','evidence']] as const)) if ([...$<HTMLSelectElement>(id).options].some(o=>o.value===params.get(key))) $<HTMLSelectElement>(id).value=params.get(key)!;
  $<HTMLInputElement>('pilot').checked = params.get('pilot') === '1';
  $('supplementary').innerHTML = `<h2>Before the worldwide window</h2><p>Predynastic Egypt provides an earlier introduction. It is excluded from the 364 original worldwide packages.</p>${data.supplementaryPackages.map(p=>`<button data-package="${p.id}">Egyptian introduction · ${windowLabel(p)}<br>${p.workflow} · evidence ${p.evidenceStatus}</button>`).join('')}`;
  detail([...data.packages,...data.supplementaryPackages].some(p=>p.id===params.get('package')) ? params.get('package')! : 'britain-ireland__bce-500-251');
  render();
  plan.addEventListener('toggle',save);
  for (const id of ['group','workflow','evidence-filter','pilot']) $(id).addEventListener('change',render);
  document.addEventListener('click',event=>{const b=event.target instanceof Element?event.target.closest<HTMLElement>('[data-package]'):null;if(b?.dataset['package']) detail(b.dataset['package']);});
}
await init().catch(error=>{$('error').hidden=false;$('error').textContent=error.message;});
}
