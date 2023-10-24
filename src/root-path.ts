import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const rootPath = resolve(dirname(fileURLToPath(import.meta.url)), '../');

export default rootPath;
