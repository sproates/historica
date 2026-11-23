import fs from 'node:fs';
import {validateEvidence} from './lib/evidence.ts';
import {validateCoverage} from '../web/generated/domain/coverage.js';
const data = JSON.parse(fs.readFileSync('research/programme/coverage.json', 'utf8'));
const batch = JSON.parse(fs.readFileSync('research/batches/britain-ireland-500-251.json', 'utf8'));
const errors = [...validateCoverage(data), ...validateEvidence(batch)];
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else { fs.writeFileSync('web/data/coverage-research.json', JSON.stringify([batch], null, 2) + '\n'); fs.writeFileSync('web/data/coverage.json', JSON.stringify(data, null, 2) + '\n'); console.log(`Built coverage dashboard data: ${data.packages.length} packages.`); }
