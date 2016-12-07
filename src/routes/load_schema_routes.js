import _ from 'lodash';
import SchemaRoute from './schema_route';

import {
  GET, PUT, POST, DELETE
} from '../util/constants';

const defineHandler = (key, schema) => new SchemaRoute(schema);
const defineRoute = (verb, route, implementation) => ({ verb, route, implementation });

const defineRoutes = (key, schema) => {
  const handler = defineHandler(key, schema);
  const route = `/${name}`;

  return [
    defineRoute(GET, route, handler),
    defineRoute(GET, `${route}/:id`, handler),
    defineRoute(PUT, route, handler),
    defineRoute(POST, route, handler),
    defineRoute(POST, `${route}/:id`, handler),
    defineRoute(DELETE, route, handler),
    defineRoute(DELETE, `${route}/:id`, handler),
  ];
};

export default (config, codeSchema) => {
  const keys = _.keys(codeSchema);
  const routes = keys.map((key) => defineRoutes(key, codeSchema[key]));

  return _.flattenDeep(routes);
};
