import _ from 'lodash';

import loadFiles from './util/load_files';
import definitionName from './util/definition_name';
import isClass from './util/is_class';

// parse the definitions from the file (allow multiple per file)
const parseDefinitions = (module, filePath) => {
  const keys = _.keys(module);

  return keys.map((key) => {
    const def = module[key];
    const name = definitionName(key, filePath);

    const implementation = isClass(def) ? new def() : def;

    return { name, implementation };
  });
};

export default (config) => {
  if (!config.path) {
    return [];
  }

  // load the files
  const files = loadFiles(config.path, 'subscribers');

  const subscribers = files.map((filePath) => {
    const module = require(filePath);
    return parseDefinitions(module, filePath);
  });

  return {
    subscribers: _.flattenDeep(subscribers),
  };
};
