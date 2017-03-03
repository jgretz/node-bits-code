import _ from 'lodash';
import {mapFunctionType} from './map_function_type';

export const standardizeSchemaDefinition = def =>
  _.reduce(def, (result, value, key) => {
    if (_.isFunction(value)) {
      return {...result, [key]: {type: mapFunctionType(value)}};
    }

    if (value.type && _.isFunction(value.type)) {
      return {...result, [key]: {...value, type: mapFunctionType(value.type)}};
    }

    if (_.isString(value)) {
      return {...result, [key]: {type: value}};
    }

    if (_.isArray(value)) {
      return {...result, [key]: value.map(item => standardizeSchemaDefinition(item))};
    }

    return {...result, [key]: value};
  }, {});
