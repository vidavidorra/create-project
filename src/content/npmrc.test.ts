import test from 'ava';
import {type Options} from '../options.js';
import {options} from '../_options.test.js';
import {Npmrc} from './npmrc.js';

const path = '.npmrc';

test('enables the "format" option', (t) => {
  t.true(new Npmrc(path, options).options.format);
});

test('disables the "read" option', (t) => {
  t.false(new Npmrc(path, options).options.read);
});

test('contains "save-exact=true"', (t) => {
  t.is(new Npmrc(path, options).process().content, 'save-exact=true\n\n');
});
