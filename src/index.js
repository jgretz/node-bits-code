import loadSchema from './load_schema';
import loadRoutes from './load_routes';

// compile
const compileConfiguration = (options = {}, bitsConfig) => {
  return {
    ...options,
    ...bitsConfig,
  };
};

const load = (func, options, bitsConfig) => {
  const config = compileConfiguration(options, bitsConfig);
  return func(config);
};

export default (options) =>
({
  loadSchema: (bitsConfig) => load(loadSchema, options, bitsConfig),
  loadRoutes: (bitsConfig) => load(loadRoutes, options, bitsConfig),
});
