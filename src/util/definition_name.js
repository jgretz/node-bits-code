import path from 'path';
import { DEFAULT, INDEX } from 'node-bits';

// helpers
const isDefault = (key) => key === DEFAULT;
const nameFromFile = (filePath) => path.basename(filePath, path.extname(filePath));

// function
export default (key, filePath) => {
  const name = isDefault(key) ? nameFromFile(filePath) : key;

  return name === INDEX ? '' : name;
};
