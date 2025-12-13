import test from 'ava';
import {options} from '../_options.test.js';
import {EslintConfig} from './eslint-config.js';

const path = 'eslint.config.js';

test('enables the "format" option', (t) => {
  t.true(new EslintConfig(path, options).options.format);
});

test('disables the "read" option', (t) => {
  t.false(new EslintConfig(path, options).options.read);
});

test('exports the default from the "@vidavidorra/eslint-config" package', (t) => {
  const file = new EslintConfig(path, options).process();

  /**
   * Content before formatting, so e.g. still contains the spaces between the
   * brackets in the object literal.
   */
  t.is(file.content, 'export { default } from "@vidavidorra/eslint-config";\n');
});
