import glob from 'glob';
import path from 'path';

export const loadFiles = (rootPath, searchPath) => {
  const target = path.join(rootPath, searchPath, '**/*.js');
  return glob.sync(target);
};
