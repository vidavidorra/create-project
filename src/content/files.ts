import {type Options} from '../options.js';
import {CiCd} from './ci-cd.js';
import {File} from './file.js';
import {LintStaged} from './lint-staged.js';
import {Package} from './package.js';
import {Readme} from './readme/index.js';

function files(options: Options): File[] {
  return [
    new File('.github/husky/commit-msg', {...options, mode: 0o755}),
    new File('.github/husky/pre-commit', {...options, mode: 0o755}),
    new CiCd('.github/workflows/ci-cd.yml', options),
    new LintStaged('.github/lint-staged.js', options),
    new File('.github/renovate.json', options),
    new File('.editorconfig', options),
    new File('.gitignore', options),
    new File('.npmrc', options),
    new File('LICENSE.md', options),
    new Package('package.json', options),
    new Readme('README.md', options),
    new File('tsconfig.json', options),
  ];
}

export {files};
