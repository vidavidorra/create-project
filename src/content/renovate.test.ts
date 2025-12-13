import test from 'ava';
import {options} from '../_options.test.js';
import {type Config, Renovate} from './renovate.js';

const path = '.github/renovate.json';

function config(): Config {
  return new Renovate(path, options).process().config;
}

test('enables the "format" option', (t) => {
  t.true(new Renovate(path, options).options.format);
});

test('extends "vidavidorra/.github"', (t) => {
  t.deepEqual(config().extends, ['github>vidavidorra/.github']);
});

test('does not include "packageRules"', (t) => {
  t.is(config().packageRules, undefined);
});
