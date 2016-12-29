import _ from 'lodash';
import path from 'path';

import loadFiles from './util/load_files';
import isClass from './util/is_class';
import definitionName from './util/definition_name';

import {
  CLASS, FUNC, OBJ,
  GET, VERBS,
} from 'node-bits';

// helpers
const defineRoute = (path, name) => `${path}${name}`;

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
const parseDefinitions = (module, rootPath, filePath) => {
  const keys = _.keys(module);

  return keys.map((key) => {
    const def = module[key];

    // this needs to be any folders below {root}/routes so we can match that structure in the url
    const relativePath = filePath.replace(rootPath, '')
      .replace('/routes', '')
      .replace(path.basename(filePath), '');

    return {
      path: relativePath,
      name: definitionName(key, filePath),
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
        route: defineRoute(def.path, def.name),
        implementation: { get: def.definition },
      };
    }

    // if its a class we need to create an instance
    const instance = def.type === CLASS ? new def.definition() : def.definition;

    // create route for each verb
    const verbsDefined = _.filter(VERBS, (v) => instance[v]);
    return verbsDefined.map((verb) => ({
      verb,
      route: defineRoute(def.path, def.name),
      implementation: instance,
    }));
  });
};

const registerDatabase = (routes, config) => {
  _.forEach(routes, route => {
    // pass in the database if defined and requested
    if (route.implementation.registerDatabase && config.database) {
      route.implementation.registerDatabase(config.database);
    }
  });
};

// load route
export default (config) => {
  const files = loadFiles(config.path, 'routes');

  // create the routes
  const rawRoutes = files.map((filePath) => {
    const module = require(filePath);
    const definitions = parseDefinitions(module, config.path, filePath);

    return mapRoutes(definitions);
  });
  const routes = _.flattenDeep(rawRoutes);

  // let the routes now about the database
  registerDatabase(routes, config);

  // return
  return routes;
};
