export default (t) => {
  return typeof t === 'function'
    && (/^\s*class\s+/.test(t.toString()) || /_class\S+/i.test(t.toString()));
};
