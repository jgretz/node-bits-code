import _ from 'lodash';
import Ajv from 'ajv';
import path from 'path';
import {CLASS, FUNC, OBJ, GET, VERBS} from 'node-bits';

import {loadFiles, isClass, definitionName} from './util';

// helpers
const defineRoute = (path, name) => {
  if (name instanceof RegExp) {
    return new RegExp(path + name);
  }
  return `${path}${name}`;
};

const mapType = def => {
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

  return keys.map(key => {
    const def = module[key];

    // this needs to be any folders below {root}/routes so we can match that structure in the url
    const relativePath = filePath.replace(rootPath.replace(/\\/g, '/'), '')
      .replace(/\/routes/, '')
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
const mapRoutes = definitions =>
  definitions.map(def => {
    // if its just a function, we assume by definition its a get
    if (def.type === FUNC) {
      return {
        verb: GET,
        route: defineRoute(def.path, def.name),
        implementation: {get: def.definition},
      };
    }

    // if its a class we need to create an instance
    const instance = def.type === CLASS ? new def.definition() : def.definition; // eslint-disable-line

    // create route for each verb
    const verbsDefined = _.filter(VERBS, v => instance[v]);
    return verbsDefined.map(verb => {

      let route = instance.getRoute ? defineRoute(def.path, instance.getRoute(verb)) : null;
      if (!route) {
        route = defineRoute(def.path, def.name);
      }

      return {
        verb,
        route,
        implementation: instance,
      };
    });
  });

const registerDatabase = (routes, config) => {
  _.forEach(routes, route => {
    // pass in the database if defined and requested
    if (route.implementation.registerDatabase && config.database) {
      route.implementation.registerDatabase(config.database);
    }
  });
};

// Add additionalProperties = false to the body schema by default
// to ensure that unknown properties are removed.
// There's no way to globally set this in Ajv
const disableAdditionalProperties = schema => {
  // addtionalProperities is only valid on the same object that has the properties property
  if (_.has(schema, 'properties')) {
    _.defaults(schema, {additionalProperties: false});
  }

  // The properties property can appear, and be nested, at different levels
  // If the schema has a property named properties in it, we will needlessly add
  // An additionalProperties: false to the schema defintion, but that will not affect validation
  if (_.isObject(schema)) {
    _.forOwn(schema, disableAdditionalProperties);
  }
};

const addRequestSchemaValidation = routes => {
  const ajv = new Ajv({removeAdditional: true, allErrors: true, coerceTypes: true});

  _.forEach(routes, route => {
    const {implementation, verb} = route;

    const requestSchema = implementation.requestSchema ? _.cloneDeep(implementation.requestSchema(verb)) : null;
    if (requestSchema) {
      disableAdditionalProperties(requestSchema);
      route.implementation = {};
      route.implementation[verb] = (req, res) => {
        if (ajv.validate(requestSchema, req.body)) {
          implementation[verb](req, res);
        } else {
          res.status(400).json(ajv.errorsText(ajv.errors, {separator: '\n'}).split('\n'));
        }
      };
    }
  });
};

// load route
export default config => {
  const files = loadFiles(config.path, 'routes');

  // create the routes
  const rawRoutes = files.map(filePath => {
    const module = require(filePath);
    const definitions = parseDefinitions(module, config.path, filePath);

    return mapRoutes(definitions);
  });
  const routes = _.flattenDeep(rawRoutes);

  // let the routes now about the database
  registerDatabase(routes, config);

  addRequestSchemaValidation(routes);

  // Sorts routes by route path, placing all routes with parameters and pattern matches last
  return routes.sort((route1, route2) => {

    // Matches express simple patterns or parameters
    // Or express will also allow RegExp objects direclty
    const routeRegex = /:|\*|\?|\+/;
    const route1HasPattern = route1.route instanceof RegExp || route1.route.match(routeRegex);
    const route2HasPattern = route2.route instanceof RegExp || route2.route.match(routeRegex);

    if (route1HasPattern && !route2HasPattern) {
      return 1;
    }
    if (!route1HasPattern && route2HasPattern) {
      return -1;
    }

    return `${route1.route}`.localeCompare(`${route2.route}`) || route1.verb.localeCompare(route2.verb);
  });
};
