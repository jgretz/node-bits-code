import loadCodeRoutes from './load_code_routes';
import loadSchemaRoutes from './load_schema_routes';

// load route
export default (config, codeSchema = {}) => {
  if (!config.path) {
    return [];
  }

  const codeRoutes = loadCodeRoutes(config.path);
  const schemaRoutes = loadSchemaRoutes(config, codeSchema);

  return [
    ...codeRoutes,
    ...schemaRoutes,
  ];
};
