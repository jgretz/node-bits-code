import _ from 'lodash';

import loadFiles from './util/load_files';
import definitionName from './util/definition_name';

// parse the definitions from the file (allow multiple per file)
const parseDefinitions = (schema, module, filePath) => {
  const keys = _.keys(module);

  _.forEach(keys, (key) => {
    const def = module[key];
    const name = definitionName(key, filePath);

    schema[name] = def;
  });
};

// load schema
export default (config) => {
  if (!config.path) {
    return [];
  }

  // load the schema
  const files = loadFiles(config.path, 'schema');

  const schema = {};
  _.forEach(files, (filePath) => {
    const module = require(filePath);
    parseDefinitions(schema, module, filePath);
  });

  // if we have a database go ahead and synchronize the schema
  if (config.database) {
    config.database.synchronizeSchema(schema);
  }

  return schema;
};
