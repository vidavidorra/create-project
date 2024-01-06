import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {argv} from 'node:process';
import {join, resolve, dirname} from 'node:path';

const rootPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../');
const gitIgnore = join(rootPath, '.gitignore');
const npmIgnore = join(rootPath, '.npmignore');

/**
 * Workaround for [Rename `.gitignore` to `.npmignore` in package if no
 * `.npmignore` found](https://github.com/npm/npm/issues/1862) and ['npm pack'/
 * `publish` option to not rename or keep a copy of `.gitignore` files](
 * https://github.com/npm/npm/issues/7252) issues. With npm v9 or newer, the
 * `npm pack` includes the `.gitignore` in the tarball and `npm install` renames
 * the file to `.npmignore`. This script simply reverts that rename if it has
 * occurred.
 */
function postinstall() {
  if (fs.existsSync(npmIgnore) && !fs.existsSync(gitIgnore)) {
    fs.renameSync(npmIgnore, gitIgnore);
  }
}

if (
  import.meta.url.startsWith('file:') &&
  fileURLToPath(import.meta.url) === argv.at(1)
) {
  postinstall();
}

export {gitIgnore, npmIgnore, postinstall};
