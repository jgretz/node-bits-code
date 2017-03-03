export const isClass = t =>
  typeof t === 'function' && (/^\s*class\s+/.test(t.toString()) || /_class\S+/i.test(t.toString()));

export const isRelationship = module => module.model && module.references;

export const isIndex = module => module.model && module.fields;

export const isMigration = (module, filePath) => filePath.includes('migrations');

export const isSeed = (module, filePath) => filePath.includes('seeds');
