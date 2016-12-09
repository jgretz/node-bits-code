import loadSchema from './load_schema';
import loadRoutes from './load_routes';

// compile
const compileConfiguration = (options = {}, bitsConfig) => {
  return {
    ...options,
    ...bitsConfig,
  };
};

const load = (func, options, bitsConfig) =>
  func(compileConfiguration(options, bitsConfig));

export default (options) => {
  return {
    loadSchema: (bitsConfig) => load(loadSchema, options, bitsConfig),
    loadRoutes: (bitsConfig) => load(loadRoutes, options, bitsConfig),
  };
};
