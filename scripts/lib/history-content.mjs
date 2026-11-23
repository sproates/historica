import fs from 'node:fs';
import path from 'node:path';
import {parseContentYaml, parseHistoryMarkdown} from '../../web/generated/content/history-markdown.js';
const slug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

// Filesystem adapter for the typed parser. Build-time only; never loaded by the browser.
export function readHistoryPacks(root = 'content') {
  const packs = fs.readdirSync(path.join(root, 'packs')).filter(name => name.endsWith('.yaml')).map(filename => {
    const name = filename.slice(0, -5);
    if (!slug(name)) throw new Error(`Invalid pack filename: ${filename}`);
    const data = parseContentYaml(fs.readFileSync(path.join(root, 'packs', filename), 'utf8'), filename);
    if (!Number.isSafeInteger(data.order) || data.order < 0) throw new Error(`${filename}: expected non-negative pack order`);
    if (!Array.isArray(data.entities) || !data.entities.every(slug)) throw new Error(`${filename}: expected history IDs`);
    if (!Array.isArray(data.associations) || !Array.isArray(data.relationships)) throw new Error(`${filename}: expected associations and relationships`);
    if (Object.keys(data).some(key => !['order', 'entities', 'associations', 'relationships'].includes(key))) throw new Error(`${filename}: unknown pack metadata key`);
    return {...data, name};
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
    return {name, data:{...data, entities}};
  });
  for (const filename of fs.readdirSync(path.join(root, 'histories'))) {
    if (filename.endsWith('.md') && !used.has(filename.slice(0, -3))) throw new Error(`History is not assigned to a pack: ${filename}`);
  }
  return result;
}
