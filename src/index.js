import loadSchema from './schema/load_schema';
import loadRoutes from './routes/load_routes';

// compile
const compileConfiguration = (options = {}, bitsConfig) => {
  return {
    ...options,
    ...bitsConfig,
  };
};

export default (options) =>
({
  loadSchema: (bitsConfig) =>  {
    const config = compileConfiguration(options, bitsConfig);
    this.schema = loadSchema(config);

    return this.schema;
  },
  loadRoutes: (bitsConfig) => {
    const config = compileConfiguration(options, bitsConfig);

    return loadRoutes(config, this.schema);
  }
});
