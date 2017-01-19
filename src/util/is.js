export const isClass = (t) => {
  return typeof t === 'function'
    && (/^\s*class\s+/.test(t.toString()) || /_class\S+/i.test(t.toString()));
};

export const isRelationship = (module) => {
  return module.model && module.references;
};

export const isModel = (module) => {
  // simple for now, but use for the future support
  return !isRelationship(module);
};
