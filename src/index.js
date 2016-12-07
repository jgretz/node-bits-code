import loadSchema from './schema/load_schema';
import loadRoutes from './routes/load_routes';

// compile
const compileConfiguration = (options = {}, bitsConfig) => {
  return {
    ...options,
    ...bitsConfig,
  };
};

export default (options) => {
  let schema = null;

  return {
    loadSchema: (bitsConfig) =>  {
      const config = compileConfiguration(options, bitsConfig);
      schema = loadSchema(config);

      return schema;
    },
    loadRoutes: (bitsConfig) => {
      const config = compileConfiguration(options, bitsConfig);

      return loadRoutes(config, schema);
    }
  };
};
