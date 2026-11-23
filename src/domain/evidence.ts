import type {ChronologyEvidence} from './exploration.js';

export interface ReviewedEvidence extends ChronologyEvidence {
  claims: Array<NonNullable<ChronologyEvidence['claims']>[number] & {subjectId?: string; status: string; statement: string; evidenceIds: string[]}>;
  evidence: Array<{id: string; sourceId: string; locator?: string; note?: string}>;
  sources: Array<{id: string; url: string; title: string; creator?: string}>;
}
