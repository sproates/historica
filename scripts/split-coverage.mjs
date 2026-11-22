import fs from 'node:fs';
import {splitRegion} from '../web/coverage-model.js';
const [regionId, definitionPath] = process.argv.slice(2);
if (!regionId || !definitionPath) throw new Error('Usage: node scripts/split-coverage.mjs REGION children.json');
const path = 'research/programme/coverage.json';
const result = splitRegion(JSON.parse(fs.readFileSync(path, 'utf8')), regionId, JSON.parse(fs.readFileSync(definitionPath, 'utf8')));
fs.writeFileSync(path, JSON.stringify(result, null, 2) + '\n');
console.log(`Split ${regionId}; queue revision ${result.queueRevision}. Run npm run build:coverage to update the preview.`);
