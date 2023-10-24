import test from 'ava';
import {options} from '../../_options.test.js';
import {type Options} from '../../options.js';
import {Readme} from './readme.js';

const path = '.github/lint-staged.js';

test('enables the "format" option', (t) => {
  t.true(new Readme(path, options).options.format);
});

test('starts with project title, omitted in the table of contents', (t) => {
  const file = new Readme(path, options).process();
  t.is(
    file.content.split('\n').at(0),
    `# ${options.project} <!-- omit in toc -->`,
  );
});

const includesBadge = test.macro<[boolean, keyof Options, string]>({
  exec(t, include, option, value) {
    const file = new Readme(path, {...options, [option]: include}).process();
    (include ? t.regex : t.notRegex)(file.content, new RegExp(value));
  },
  title: (_, include, option, value) =>
    [
      `${include ? 'includes' : 'does not include'} "${value}"`,
      `${include ? 'with' : 'without'} "${option}" option`,
    ].join(' '),
});

test(includesBadge, true, 'public', 'npm version');
test(includesBadge, false, 'public', 'npm version');
test(includesBadge, true, 'public', 'npm downloads');
test(includesBadge, false, 'public', 'npm downloads');
test(includesBadge, true, 'public', 'Node.js version support');
test(includesBadge, false, 'public', 'Node.js version support');
test(includesBadge, true, 'reportCodeCoverage', 'Code coverage');
test(includesBadge, false, 'reportCodeCoverage', 'Code coverage');

test('contains a copyright with the current year and author', (t) => {
  const file = new Readme(path, options).process();
  const year = new Date().getFullYear();
  t.regex(file.content, new RegExp(`Copyright © ${year} ${options.author}`));
});
