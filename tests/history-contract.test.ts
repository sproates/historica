import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocusData} from '../scripts/lib/focus-data.ts';
import {parseHistory, validateHistory} from '../web/generated/content/validate-history.js';
const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const collection = read('web/data/collection.json');
const data = buildFocusData(collection, read('web/data/reviewed-exploration.json'));
const registry = {
  sourceIds: new Set(collection.sources.map(s => s.id)),
  claimIds: new Set(read('web/data/reviewed-evidence.json').claims.map(c => c.id)),
};
const fixture = () => ({
  entities: [{id:'person',type:'person',title:'A person',description:'An example.',startYear:-1,endYear:1,point:null,url:'https://example.com/source',claimIds:['claim']}],
  associations: [], relationships: [],
});

test('the existing dataset passes without losing provenance, uncertainty or missing locations', () => {
  const before = structuredClone(data);
  assert.equal(parseHistory(data, registry), data);
  assert.deepEqual(data, before);
  assert.equal(data.entities.find(e => e.id === 'global-overview').url, 'coverage.html');
  assert.ok(data.entities.some(e => e.point === null));
  assert.ok(data.entities.some(e => e.uncertainty));
});

test('invalid records report actionable paths instead of coercing values', () => {
  const cases = [
    [d => {d.entities[0].startYear = 0;}, 'entities[0].startYear'],
    [d => {d.entities[0].endYear = -2;}, 'entities[0]: startYear'],
    [d => {d.entities[0].startYear = '-1';}, 'entities[0].startYear'],
    [d => {d.entities[0].point = [181, 20];}, 'entities[0].point'],
    [d => {d.entities[0].point = new Array(2);}, 'entities[0].point'],
    [d => {d.entities[0].point = [20, NaN];}, 'entities[0].point'],
    [d => {d.entities[0].url = 'javascript:alert(1)';}, 'entities[0].url'],
    [d => {d.entities[0].type = 'king';}, 'entities[0].type'],
    [d => {d.entities.push({...d.entities[0]});}, 'entities[1].id'],
    [d => {d.entities[0].uncertainty = {start:[-1,0],end:[1,2]};}, 'entities[0].uncertainty.start'],
    [d => {d.entities[0].claimIds = ['missing'];}, 'entities[0].claimIds[0]'],
    [d => {d.entities[0].regionIds = ['missing'];}, 'entities[0].regionIds[0]'],
    [d => {d.entities[0].sourceIds = ['missing'];}, 'entities[0].sourceIds[0]'],
  ];
  for (const [mutate, path] of cases) {
    const value = fixture(); mutate(value);
    const errors = validateHistory(value, {claimIds:new Set(['claim']),sourceIds:new Set()});
    assert.ok(errors.some(error => error.includes(path)), errors.join('\n'));
    assert.throws(() => parseHistory(value, {claimIds:new Set(['claim']),sourceIds:new Set()}), /Invalid history data/);
  }
});

test('connections validate endpoints and paired dates without inventing intervals', () => {
  const value = fixture();
  value.relationships.push({a:'person',b:'person',label:'An undated connection'});
  assert.deepEqual(validateHistory(value), []);
  value.relationships[0].b = 'missing';
  value.relationships[0].startYear = -1;
  const errors = validateHistory(value);
  assert.ok(errors.some(e => e.includes('relationships[0].b')));
  assert.ok(errors.some(e => e.includes('relationships[0].endYear')));
  value.associations.push({subject:'missing',place:'person',label:'Visit',startYear:-1,endYear:1,point:null,source:'not-a-url'});
  assert.ok(validateHistory(value).some(e => e.includes('associations[0].subject')));
  assert.ok(validateHistory(value).some(e => e.includes('associations[0].source')));
});

test('malformed top-level and nested input yields errors rather than crashes', () => {
  for (const value of [null, [], {}, {entities:new Array(1),associations:[],relationships:[]}, {entities:[null],associations:'wrong',relationships:[42]}]) {
    assert.ok(validateHistory(value).length);
  }
});
