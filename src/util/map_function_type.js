import {STRING, DECIMAL, DATE, BOOLEAN} from 'node-bits';

export const mapFunctionType = type => {
  switch (type) {
    case Number:
      return DECIMAL;

    case String:
      return STRING;

    case Date:
      return DATE;

    case Boolean:
      return BOOLEAN;

    default:
      return undefined; // eslint-disable-line
  }
};
