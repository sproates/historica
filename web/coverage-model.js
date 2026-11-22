export const workflows = ['unresearched', 'gathering', 'drafted', 'checking', 'accepted'];
export const evidenceStates = ['unknown', 'substantive', 'limited'];
export function validateCoverage(data) {
  const errors = [];
  const regions = new Map(data.regions.map(r => [r.id, r]));
  const windows = new Set(data.windows.map(w => w.id));
  if (regions.size !== data.regions.length) errors.push('Duplicate region ID');
  if (windows.size !== data.windows.length) errors.push('Duplicate window ID');
  const ids = new Set(), pairs = new Set();
  for (const r of data.regions) {
    if (r.parentId && !regions.has(r.parentId)) errors.push(`Missing parent: ${r.id}`);
    for (const id of r.subregions) if (regions.get(id)?.parentId !== r.id) errors.push(`Invalid child: ${id}`);
    if (r.parentId && !regions.get(r.parentId)?.subregions.includes(r.id)) errors.push(`Unlinked child: ${r.id}`);
    const seen = new Set([r.id]); let parent = r.parentId;
    while (parent && regions.has(parent)) {
      if (seen.has(parent)) { errors.push(`Region cycle: ${r.id}`); break; }
      seen.add(parent); parent = regions.get(parent).parentId;
    }
  }
  for (const p of data.packages) {
    const pair = `${p.regionId}__${p.windowId}`;
    if (ids.has(p.id) || pairs.has(pair)) errors.push(`Duplicate package: ${p.id}`);
    ids.add(p.id); pairs.add(pair);
    if (!regions.has(p.regionId) || !windows.has(p.windowId)) errors.push(`Unknown scope: ${p.id}`);
    if (!workflows.includes(p.workflow) || !evidenceStates.includes(p.evidenceStatus)) errors.push(`Invalid status: ${p.id}`);
    if (p.workflow === 'accepted' && (p.evidenceStatus === 'unknown' || !p.accountIds?.length)) errors.push(`Acceptance needs an account and evidence outcome: ${p.id}`);
  }
  for (const r of data.regions) for (const w of data.windows) if (!pairs.has(`${r.id}__${w.id}`)) errors.push(`Missing package: ${r.id}/${w.id}`);
  return errors;
}
export function leafRegions(data, regionId) {
  const region = data.regions.find(r => r.id === regionId);
  return region.subregions.length ? region.subregions.flatMap(id => leafRegions(data, id)) : [region];
}
export function overview(data) {
  const leaves = new Set(data.regions.filter(r => !r.subregions.length).map(r => r.id));
  const active = data.packages.filter(p => leaves.has(p.regionId));
  const roots = data.regions.filter(r => !r.parentId);
  const completeOriginal = roots.reduce((count, r) => count + data.windows.filter(w => leafRegions(data, r.id).every(child => active.some(p => p.regionId === child.id && p.windowId === w.id && p.workflow === 'accepted'))).length, 0);
  return {active, completeOriginal, originalTotal: roots.length * data.windows.length,
    substantive: active.filter(p => p.workflow === 'accepted' && p.evidenceStatus === 'substantive').length,
    limited: active.filter(p => p.workflow === 'accepted' && p.evidenceStatus === 'limited').length,
    awaiting: active.filter(p => ['drafted', 'checking'].includes(p.workflow)).length,
    unresearched: active.filter(p => p.workflow === 'unresearched').length};
}
// Splits start fresh. Parent packages remain as history and no longer count as active work.
export function splitRegion(data, regionId, children) {
  const next = structuredClone(data);
  const parent = next.regions.find(r => r.id === regionId);
  if (!parent || parent.subregions.length) throw new Error('Choose an existing unsplit region');
  if (next.packages.some(p => p.regionId === regionId && p.workflow !== 'unresearched')) throw new Error('Researched areas need an explicit account migration before splitting');
  if (!Array.isArray(children) || children.length < 2) throw new Error('A split needs at least two children');
  const ids = new Set(next.regions.map(r => r.id));
  for (const child of children) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(child.id) || ids.has(child.id) || !child.name?.trim() || !child.extent?.trim()) throw new Error('Children need unique IDs, names and geographical extents');
    ids.add(child.id);
    next.regions.push({...child, group: parent.group, parentId: parent.id, extentStatus: 'defined', subregions: []});
    for (const p of next.packages.filter(p => p.regionId === regionId)) next.packages.push({...p, id: `${child.id}__${p.windowId}`, regionId: child.id, workflow: 'unresearched', evidenceStatus: 'unknown', accountIds: [], batchIds: [], unresolvedIssues: []});
  }
  parent.subregions = children.map(c => c.id);
  next.queueRevision = (next.queueRevision || 1) + 1;
  const errors = validateCoverage(next); if (errors.length) throw new Error(errors.join('\n'));
  return next;
}
export function yearLabel(year) { return `${Math.abs(year)} ${year < 0 ? 'BCE' : 'CE'}`; }
export function windowLabel(w) { return `${yearLabel(w.startYear)} – ${yearLabel(w.endYear)}`; }
