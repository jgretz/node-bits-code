import _ from 'lodash';
import path from 'path';

import loadFiles from './util/load_files';
import isClass from './util/is_class';

// constants
const CLASS = 'class';
const FUNC = 'func';
const OBJ = 'obj';

const GET = 'get';
const POST = 'post';
const PUT = 'put';
const DELETE = 'delete';

const verbs = [GET, POST, PUT, DELETE];

// helpers
const nameFromFile = (filePath) => path.basename(filePath, path.extname(filePath));
const isDefault = (key) => key === 'default';

const mapType = (def) => {
  if (isClass(def)) {
    return CLASS;
  }

  if (_.isFunction(def)) {
    return FUNC;
  }

  return OBJ;
};

// parse the definitions from the file (allow multiple per file)
const parseDefinitions = (module, filePath) => {
  const keys = _.keys(module);

  return keys.map((key) => {
    const def = module[key];

    return {
      name: isDefault(key) ? nameFromFile(filePath) : key,
      type: mapType(def),
      definition: def,
    };
  });
};

// map definitions in to route objects
const mapRoutes = (definitions) => {
  return definitions.map((def) => {
    // if its just a function, we assume by definition its a get
    if (def.type === FUNC) {
      return {
        verb: GET,
        route: def.name,
        implementation: { get: def.definition },
      };
    }

    // if its a class we need to create an instance
    const instance = def.type === CLASS ? new def.definition() : def.definition;

    // create route for each verb
    const verbsDefined = _.filter(verbs, (v) => instance[v]);
    return verbsDefined.map((verb) => ({
      verb,
      route: def.name,
      implementation: instance,
    }));
  });
};

// load route
export default (config) => {
  if (!config.path) {
    return [];
  }

  const files = loadFiles(config.path, 'routes');
  const routes = files.map((filePath) => {
    const module = require(filePath);
    const definitions = parseDefinitions(module, filePath);

    return mapRoutes(definitions);
  });

  return _.flattenDeep(routes);
};
