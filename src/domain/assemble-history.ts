import type { HistoryDataset } from './history.js';

type HistoryRecords = Pick<HistoryDataset, 'entities' | 'associations' | 'relationships'>;

/** Preserve the prototype ordering while reviewed records replace matching IDs. */
export function assembleHistory(base: HistoryRecords, exploration: HistoryRecords, collection: unknown): HistoryDataset {
  const {entities, associations, relationships} = structuredClone(base);
  for (const entry of exploration.entities) {
    const index = entities.findIndex(entity => entity.id === entry.id);
    if (index < 0) entities.push(entry);
    else entities[index] = entry;
  }
  associations.push(...exploration.associations);
  relationships.push(...exploration.relationships);
  return {entities, associations, relationships, collection};
}
