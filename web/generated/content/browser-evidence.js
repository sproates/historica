/** Project validated research records into the fields used by the history explorer. */
export function browserEvidence(pack) {
    return {
        claims: pack.claims.map(c => ({ id: c.id, status: c.status, statement: c.statement, evidenceIds: [...c.evidenceIds],
            ...(c.subjectId === undefined ? {} : { subjectId: c.subjectId }),
            ...(c.validity === undefined ? {} : { validity: structuredClone(c.validity) }),
        })),
        evidence: pack.evidence.map(e => ({ id: e.id, sourceId: e.sourceId,
            ...(e.locator === undefined ? {} : { locator: e.locator }), ...(e.note === undefined ? {} : { note: e.note }),
        })),
        sources: pack.sources.map(s => ({ id: s.id, url: s.url, title: s.title, ...(s.creator === undefined ? {} : { creator: s.creator }) })),
    };
}
/** Keep only this history’s statements and their linked passages and sources. */
export function evidenceForFocus(pack, focus) {
    const claims = pack.claims.filter(c => c.subjectId === focus.id || focus.claimIds?.includes(c.id));
    const evidenceIds = new Set(claims.flatMap(c => c.evidenceIds));
    const evidence = pack.evidence.filter(e => evidenceIds.has(e.id));
    const sourceIds = new Set(evidence.map(e => e.sourceId));
    return browserEvidence({ claims, evidence, sources: pack.sources.filter(s => sourceIds.has(s.id)) });
}
/** Small shared index used by age comparisons independently of the selected history. */
export function browserChronology(pack) {
    return { claims: pack.claims.filter(c => /chronology/.test(c.id)).map(c => ({ id: c.id, ...(c.validity === undefined ? {} : { validity: structuredClone(c.validity) }) })) };
}
