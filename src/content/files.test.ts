import test from 'ava';
import {options} from '../_options.test.js';
import {files} from './files.js';

const appliesFileMode755 = test.macro<[string]>({
  exec(t, path) {
    const file = files(options).find((file) => file.path === path);
    t.is(file?.options.mode, 0o755);
  },
  title: (_, path) => `applies file mode 755 to "${path}" file`,
});

const includes = test.macro<[string]>({
  exec(t, path) {
    t.not(
      files(options).find((file) => file.path === path),
      undefined,
    );
  },
  title: (_, path) => `includes "${path}" file`,
});

test(appliesFileMode755, '.github/husky/commit-msg');
test(appliesFileMode755, '.github/husky/pre-commit');

test(includes, '.github/husky/commit-msg');
test(includes, '.github/husky/pre-commit');
test(includes, '.github/workflows/ci-cd.yml');
test(includes, '.github/lint-staged.js');
test(includes, '.github/renovate.json');
test(includes, '.editorconfig');
test(includes, '.gitignore');
test(includes, '.npmrc');
test(includes, 'eslint.config.js');
test(includes, 'LICENSE.md');
test(includes, 'package.json');
test(includes, 'README.md');
test(includes, 'tsconfig.json');
