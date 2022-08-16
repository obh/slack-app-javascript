import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { dirname, join } from 'path';

const YAML_CONFIG_FILENAME = 'config.yaml';

export default () => {
  console.log("dir ---> ", __dirname);
  return yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;
};