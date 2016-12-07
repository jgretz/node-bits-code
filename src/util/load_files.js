import glob from 'glob';
import path from 'path';

export default (rootPath, searchPath) => {
  const target = path.join(rootPath, searchPath, '**/*.js');
  return glob.sync(target);
};
