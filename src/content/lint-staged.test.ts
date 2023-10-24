import test from 'ava';
import {options} from '../_options.test.js';
import {LintStaged} from './lint-staged.js';

const path = '.github/lint-staged.js';

test('enables the "format" option', (t) => {
  t.true(new LintStaged(path, options).options.format);
});

test('does not include "ava" without "testing" option', (t) => {
  const file = new LintStaged(path, {...options, testing: false}).process();
  t.false(file.content.includes('ava'));
});

test('includes "ava" with "testing" option', (t) => {
  const file = new LintStaged(path, {...options, testing: true}).process();
  t.true(file.content.includes('ava'));
});
