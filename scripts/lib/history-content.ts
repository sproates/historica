import type {HistoryDataset} from '../../src/domain/history.js';
import fs from 'node:fs';
import path from 'node:path';
import {parseContentYaml, parseHistoryMarkdown} from '../../web/generated/content/history-markdown.js';
const slug = (value: unknown): value is string => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

// Filesystem adapter for the typed parser. Build-time only; never loaded by the browser.
export function readHistoryPacks(root = 'content') {
  const packs = fs.readdirSync(path.join(root, 'packs')).filter(name => name.endsWith('.yaml')).map(filename => {
    const name = filename.slice(0, -5);
    if (!slug(name)) throw new Error(`Invalid pack filename: ${filename}`);
    const data = parseContentYaml(fs.readFileSync(path.join(root, 'packs', filename), 'utf8'), filename);
    if (typeof data.order !== 'number' || !Number.isSafeInteger(data.order) || data.order < 0) throw new Error(`${filename}: expected non-negative pack order`);
    if (!Array.isArray(data.entities) || !data.entities.every(slug)) throw new Error(`${filename}: expected history IDs`);
    if (!Array.isArray(data.associations) || !Array.isArray(data.relationships)) throw new Error(`${filename}: expected associations and relationships`);
    if (Object.keys(data).some(key => !['order', 'entities', 'associations', 'relationships'].includes(key))) throw new Error(`${filename}: unknown pack metadata key`);
    return {name, order:data.order, entities:data.entities as string[], associations:data.associations, relationships:data.relationships};
  }).sort((a, b) => a.order - b.order);
  if (!packs.length) throw new Error('No history packs found');
  const orders = new Set(), used = new Set();
  const result = packs.map(({name, order, ...data}) => {
    if (orders.has(order)) throw new Error(`Duplicate pack order: ${order}`);
    orders.add(order);
    const entities = data.entities.map(id => {
      if (used.has(id)) throw new Error(`History appears in more than one pack: ${id}`);
      used.add(id);
      const filename = path.join(root, 'histories', `${id}.md`);
      const entity = parseHistoryMarkdown(fs.readFileSync(filename, 'utf8'), filename);
      if (entity.id !== id) throw new Error(`${filename}: ID must match filename`);
      return entity;
    });
    // Cross-pack references are validated after assembly by validate-history.
    return {name, data:{...data, entities} as unknown as HistoryDataset};
  });
  for (const filename of fs.readdirSync(path.join(root, 'histories'))) {
    if (filename.endsWith('.md') && !used.has(filename.slice(0, -3))) throw new Error(`History is not assigned to a pack: ${filename}`);
  }
  return result;
}

/** Preserve the base record ordering while reviewed content replaces its provisional records. */
export function readPrototypeData(packs: ReturnType<typeof readHistoryPacks>, root = 'content') {
  const prototype = packs.find(pack => pack.name === 'prototype');
  if (!prototype) throw new Error('Missing prototype history pack');
  const filename = path.join(root, 'prototype-compatibility.yaml');
  const compatibility = parseContentYaml(fs.readFileSync(filename, 'utf8'), filename);
  if (Object.keys(compatibility).some(key => !['entityOrder','legacyOverrides'].includes(key))) throw new Error(`${filename}: unknown compatibility key`);
  if (!Array.isArray(compatibility.entityOrder) || !compatibility.entityOrder.every(slug) || new Set(compatibility.entityOrder).size !== compatibility.entityOrder.length) throw new Error(`${filename}: expected unique history IDs`);
  if (!Array.isArray(compatibility.legacyOverrides)) throw new Error(`${filename}: expected legacy overrides`);
  const records = new Map(packs.flatMap(pack => pack.data.entities).map(entity => [entity.id,entity]));
  const overrides = new Set();
  for (const entity of compatibility.legacyOverrides) {
    if (!entity || !slug(entity.id) || !records.has(entity.id) || !compatibility.entityOrder.includes(entity.id) || overrides.has(entity.id) || prototype.data.entities.some(row => row.id === entity.id)) throw new Error(`${filename}: invalid or duplicate legacy override`);
    overrides.add(entity.id); records.set(entity.id,entity);
  }
  for (const entity of prototype.data.entities) if (!compatibility.entityOrder.includes(entity.id)) throw new Error(`${filename}: missing prototype history ${entity.id}`);
  return {
    entities:compatibility.entityOrder.map(id => {
      if (!records.has(id)) throw new Error(`${filename}: missing history ${id}`);
      if (!prototype.data.entities.some(entity => entity.id === id) && !overrides.has(id)) throw new Error(`${filename}: reviewed history needs an explicit legacy override: ${id}`);
      return records.get(id)!;
    }),
    associations:prototype.data.associations,
    relationships:prototype.data.relationships,
  };
}
