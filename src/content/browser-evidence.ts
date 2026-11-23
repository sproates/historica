import type {ReviewedEvidence} from '../domain/evidence.js';

/** Project validated research records into the fields used by the history explorer. */
export function browserEvidence(pack: ReviewedEvidence): ReviewedEvidence {
  return {
    claims: pack.claims.map(c=>({id:c.id,status:c.status,statement:c.statement,evidenceIds:[...c.evidenceIds],
      ...(c.subjectId===undefined?{}:{subjectId:c.subjectId}),
      ...(c.validity===undefined?{}:{validity:structuredClone(c.validity)}),
    })),
    evidence: pack.evidence.map(e=>({id:e.id,sourceId:e.sourceId,
      ...(e.locator===undefined?{}:{locator:e.locator}),...(e.note===undefined?{}:{note:e.note}),
    })),
    sources: pack.sources.map(s=>({id:s.id,url:s.url,title:s.title,...(s.creator===undefined?{}:{creator:s.creator})})),
  };
}
