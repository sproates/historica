import { parseDocument } from 'yaml';

export function parseContentYaml(text: string, filename: string): Record<string, unknown> {
  const document = parseDocument(text, { version: '1.2', uniqueKeys: true });
  if (document.errors.length || document.warnings.length) {
    throw new Error(`${filename}: ${[...document.errors, ...document.warnings].map(issue => issue.message).join('; ')}`);
  }
  const value: unknown = document.toJS({maxAliasCount: 0});
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${filename}: expected YAML metadata mapping`);
  return value as Record<string, unknown>;
}

/** Body text is preserved as prose; Markdown rendering belongs to the future static renderer. */
export function parseHistoryMarkdown(text: string, filename: string): Record<string, unknown> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text);
  if (!match || match[1] === undefined || match[2] === undefined) throw new Error(`${filename}: expected YAML front matter and history text`);
  const metadata = parseContentYaml(match[1], filename);
  if ('description' in metadata) throw new Error(`${filename}: put the description in the body, not front matter`);
  const description = match[2].replace(/\r?\n$/, '');
  if (!description.trim()) throw new Error(`${filename}: history text is empty`);
  // Keep the legacy field order during migration to avoid unrelated generated diffs.
  const entity: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    entity[key] = value;
    if (key === 'endYear') entity.description = description;
  }
  if (!('description' in entity)) entity.description = description;
  return entity;
}
