import fs from 'node:fs';
import {buildFocusData} from '../scripts/lib/focus-data.ts';
import {parseHistory} from '../web/generated/content/validate-history.js';
const read = (path: string) => JSON.parse(fs.readFileSync(path, 'utf8'));
const collection = read('web/data/collection.json');
const exploration = read('web/data/reviewed-exploration.json');
const evidence = read('web/data/reviewed-evidence.json');
const data = parseHistory(buildFocusData(collection, exploration), {
  sourceIds: new Set(collection.sources.map((source: {id:string}) => source.id)),
  claimIds: new Set(evidence.claims.map((claim: {id:string}) => claim.id)),
});
console.log(`Validated ${data.entities.length} histories, ${data.associations.length} place associations and ${data.relationships.length} relationships. Historical accuracy remains a separate evidence review.`);
