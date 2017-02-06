export const isClass = (t) => {
  return typeof t === 'function'
    && (/^\s*class\s+/.test(t.toString()) || /_class\S+/i.test(t.toString()));
};

export const isRelationship = (module) => {
  return module.model && module.references;
};

export const isIndex = (module) => {
  return module.model && module.fields;
};

export const isMigration = (module, filePath) => {
  return filePath.includes('migrations');
};

export const isSeed = (module, filePath) => {
  return filePath.includes('seeds');
};
