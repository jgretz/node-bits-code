import glob from 'glob';
import path from 'path';

export const loadFiles = (rootPath, searchPath) =>
  glob.sync(path.join(rootPath, searchPath, '**/*.js'));
