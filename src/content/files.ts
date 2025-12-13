import {type Options} from '../options.js';
import {CiCd} from './ci-cd.js';
import {EslintConfig} from './eslint-config.js';
import {File} from './file.js';
import {LintStaged} from './lint-staged.js';
import {Npmrc} from './npmrc.js';
import {Package} from './package.js';
import {Readme} from './readme/index.js';
import {Renovate} from './renovate.js';
import {TsConfig} from './ts-config.js';

function files(options: Options): File[] {
  return [
    new File('.github/husky/commit-msg', {...options, mode: 0o755}),
    new File('.github/husky/pre-commit', {...options, mode: 0o755}),
    new CiCd('.github/workflows/ci-cd.yml', options),
    new LintStaged('.github/lint-staged.js', options),
    new Renovate('.github/renovate.json', options),
    new File('.editorconfig', options),
    new File('.gitignore', options),
    new Npmrc('.npmrc', options),
    new EslintConfig('eslint.config.js', options),
    new File('LICENSE.md', options),
    new Package('package.json', options),
    new Readme('README.md', options),
    new TsConfig('tsconfig.json', options),
  ];
}

export {files};
