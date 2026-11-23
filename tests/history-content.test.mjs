import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {readHistoryPacks} from '../scripts/lib/history-content.mjs';
import {parseHistoryMarkdown} from '../web/generated/content/history-markdown.js';

const markdown = id => `---\nid: ${id}\nstartYear: -1\nendYear: 1\npoint: null\nclaimIds: []\n---\nFirst paragraph.\n\nSecond paragraph.\n`;
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'historica-content-'));
  t.after(() => fs.rmSync(root, {recursive:true, force:true}));
  fs.mkdirSync(path.join(root,'histories')); fs.mkdirSync(path.join(root,'packs'));
  fs.writeFileSync(path.join(root,'histories','example.md'), markdown('example'));
  fs.writeFileSync(path.join(root,'packs','example.yaml'), 'order: 0\nentities: [example]\nassociations: []\nrelationships: []\n');
  return root;
}

test('Markdown parsing preserves paragraphs, null locations and source metadata', () => {
  const entry = parseHistoryMarkdown(markdown('example'),'example.md');
  assert.equal(entry.description, 'First paragraph.\n\nSecond paragraph.');
  assert.equal(entry.point, null); assert.deepEqual(entry.claimIds, []);
  assert.equal(entry.startYear, -1); assert.equal(entry.endYear, 1);
});

test('ambiguous metadata and missing prose are rejected', () => {
  for (const text of [
    'id: example',
    '---\nid: one\nid: two\n---\nBody\n',
    '---\nid: example\ndescription: Hidden duplicate prose\n---\nBody\n',
    '---\nid: example\n---\n',
    '---\nid: !unrecognised example\n---\nBody\n',
  ]) assert.throws(() => parseHistoryMarkdown(text,'example.md'), /example.md/);
});

test('packs reject orphaned, missing, duplicate and mismatched histories', t => {
  const root = fixture(t);
  assert.equal(readHistoryPacks(root)[0].data.entities[0].id,'example');
  fs.writeFileSync(path.join(root,'histories','orphan.md'),markdown('orphan'));
  assert.throws(() => readHistoryPacks(root), /not assigned/);
  fs.unlinkSync(path.join(root,'histories','orphan.md'));
  fs.writeFileSync(path.join(root,'histories','example.md'),markdown('other'));
  assert.throws(() => readHistoryPacks(root), /ID must match/);
  fs.writeFileSync(path.join(root,'histories','example.md'),markdown('example'));
  fs.writeFileSync(path.join(root,'packs','second.yaml'),'order: 1\nentities: [example]\nassociations: []\nrelationships: []\n');
  assert.throws(() => readHistoryPacks(root), /more than one pack/);
  fs.unlinkSync(path.join(root,'packs','second.yaml')); fs.unlinkSync(path.join(root,'histories','example.md'));
  assert.throws(() => readHistoryPacks(root), /example.md/);
});

test('pack filenames, metadata and order cannot silently redirect or reorder content', t => {
  const root = fixture(t), file = path.join(root,'packs','example.yaml');
  fs.appendFileSync(file,'name: ../../elsewhere\n');
  assert.throws(() => readHistoryPacks(root), /unknown pack metadata/);
  fs.writeFileSync(file,'order: 0\nentities: [../outside]\nassociations: []\nrelationships: []\n');
  assert.throws(() => readHistoryPacks(root), /expected history IDs/);
  fs.writeFileSync(file,'order: 0\nentities: []\nassociations: []\nrelationships: []\n');
  fs.writeFileSync(path.join(root,'packs','second.yaml'),'order: 0\nentities: [example]\nassociations: []\nrelationships: []\n');
  assert.throws(() => readHistoryPacks(root), /Duplicate pack order/);
});

test('authored packs reproduce the legacy compatibility assets exactly', () => {
  for (const {name,data} of readHistoryPacks()) {
    assert.equal(JSON.stringify(data,null,2)+'\n',fs.readFileSync(`research/evidence/${name}-exploration.json`,'utf8'));
  }
});
