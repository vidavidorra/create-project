import test from 'ava';
import {z} from 'zod';
import {createProject} from './create-project.js';
import {options} from './options.js';
import * as index from './index.js';
import {type Options} from './index.js';

test('exports "options" schema', (t) => {
  t.true(index.options instanceof z.ZodObject);
  t.is(index.options, options);
});

test('exports "Options" type', (t) => {
  const value: Options = {} as unknown as Options;
  t.not(value, undefined);
});

test('exports "createProject" function', (t) => {
  t.is(index.createProject, createProject);
});
