import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import prototype from '../web/generated/content/prototype-data.js';
import {assembleHistory} from '../web/generated/domain/assemble-history.js';
import {readHistoryPacks, readPrototypeData} from '../scripts/lib/history-content.mjs';

test('reviewed revisions replace records in place while new entries append in order', () => {
  const base = {entities:[{id:'first',title:'Old'},{id:'second',title:'Unchanged'}],associations:[],relationships:[]};
  const exploration = {entities:[{id:'first',title:'Reviewed'},{id:'third',title:'New'}],associations:[{subject:'third'}],relationships:[{a:'first',b:'third'}]};
  const source = structuredClone(base), input = structuredClone(exploration), collection = {historicalOverlays:[]};
  const result = assembleHistory(base,exploration,collection);
  assert.deepEqual(result.entities.map(e => e.id),['first','second','third']);
  assert.equal(result.entities[0].title,'Reviewed'); assert.equal(result.collection,collection);
  assert.deepEqual(result.associations,exploration.associations); assert.deepEqual(result.relationships,exploration.relationships);
  result.entities[1].title = 'Changed in one view';
  assert.deepEqual(base,source); assert.deepEqual(exploration,input);
});

test('generated prototype and complete authored collection retain the same IDs and records', () => {
  const packs = readHistoryPacks();
  assert.deepEqual(readPrototypeData(packs),prototype);
  const reviewed = JSON.parse(fs.readFileSync('web/data/reviewed-exploration.json'));
  const assembled = assembleHistory(prototype,reviewed,{});
  const authored = packs.flatMap(pack => pack.data.entities);
  assert.equal(assembled.entities.length,authored.length);
  assert.deepEqual(new Set(assembled.entities.map(e => e.id)),new Set(authored.map(e => e.id)));
  for(const entity of authored) assert.deepEqual(assembled.entities.find(e => e.id===entity.id),entity);
});
