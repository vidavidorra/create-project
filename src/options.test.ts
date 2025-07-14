import fs from 'node:fs';
import test from 'ava';
import {z} from 'zod';
import {stub} from 'sinon';
import {type Options, schema} from './options.js';
import {options} from './_options.test.js';

type Key = keyof Options;
type Value = Options[Key];

const defaults = test.macro<[Key, Value]>({
  exec: (t, key, value) => t.is(schema.shape[key].parse(undefined), value),
  title: (_, key, value) => `defaults "${key}" to "${value.toString()}"`,
});

const succeeds = test.macro<[Key, Value | undefined, string]>({
  exec(t, key, value) {
    t.notThrows(() => schema.shape[key].parse(value));
  },
  title: (_, key, _0, detail) => `succeeds parsing with ${detail} "${key}"`,
});

class ZodError extends z.ZodError {}

const fails = test.macro<[Key, Value | undefined, string]>({
  exec(t, key, value) {
    const error = t.throws(() => schema.shape[key].parse(value), {
      instanceOf: ZodError,
    });

    t.is(error.issues.length, 1);
  },
  title: (_, key, _0, detail) => `fails parsing with ${detail} "${key}"`,
});

test('succeeds parsing all options', (t) => {
  t.notThrows(() => schema.parse(options));
});

test(succeeds, 'project', 'a', 'a single character');
test(succeeds, 'project', 'a'.repeat(1024 * 1024), 'a long');
test(fails, 'project', '', 'an empty');
test(fails, 'project', undefined, 'undefined');
test(succeeds, 'package', 'a', 'a single character');
test(succeeds, 'package', 'a'.repeat(214), 'a long');
test(fails, 'package', '', 'an empty');
test(fails, 'package', 'a~', 'a special-character');
test(fails, 'package', undefined, 'undefined');
test(defaults, 'public', false);
test(succeeds, 'public', true, 'boolean');
test(succeeds, 'description', '', 'an empty');
test(succeeds, 'description', 'a', 'a single character');
test(succeeds, 'description', 'a'.repeat(1024 * 1024), 'a long');
test(fails, 'description', undefined, 'undefined');
test(succeeds, 'author', 'a', 'a single character');
test(succeeds, 'author', 'a'.repeat(1024 * 1024), 'a long');
test(fails, 'author', '', 'an empty');
test(fails, 'author', undefined, 'undefined');
test(succeeds, 'typescript', true, 'boolean');
test(fails, 'typescript', undefined, 'undefined');
test(defaults, 'testing', false);
test(succeeds, 'testing', undefined, 'undefined');
test(succeeds, 'testing', true, 'boolean');
test(defaults, 'reportCodeCoverage', false);
test(succeeds, 'reportCodeCoverage', undefined, 'undefined');
test(succeeds, 'reportCodeCoverage', true, 'boolean');
test(succeeds, 'githubOwner', 'a', 'a single character');
test(succeeds, 'githubOwner', 'a'.repeat(1024 * 1024), 'a long');
test(succeeds, 'githubOwner', 'a.b.c-def', 'a non-alphanumeric');
test(fails, 'githubOwner', '', 'an empty');
test(fails, 'githubOwner', 'abc def', 'a whitespaced');
test(fails, 'githubOwner', undefined, 'undefined');
test(succeeds, 'githubRepository', 'a', 'a single character');
test(succeeds, 'githubRepository', 'a'.repeat(1024 * 1024), 'a long');
test(succeeds, 'githubRepository', 'a.b.c-def', 'a non-alphanumeric');
test(fails, 'githubRepository', '', 'an empty');
test(fails, 'githubRepository', 'abc def', 'a whitespaced');
test(fails, 'githubRepository', undefined, 'undefined');
test.serial(succeeds, 'path', './new-project', 'an non-existing');
test.serial('succeeds parsing with an empty directory "path"', (t) => {
  const statfsSync = stub(fs, 'statfsSync').returns({files: 0} as fs.StatsFs);
  t.notThrows(() => schema.shape.path.parse('./src'));
  statfsSync.restore();
});
test.serial('fails parsing with an existing file "path"', (t) => {
  t.throws(() => schema.shape.path.parse('./package.json'), {
    instanceOf: z.ZodError,
    message: /Expected an empty directory, received a file\./,
  });
});
test.serial('fails parsing with an single-file directory "path"', (t) => {
  const statfsSync = stub(fs, 'statfsSync').returns({files: 1} as fs.StatsFs);
  t.throws(() => schema.shape.path.parse('./src'), {
    instanceOf: z.ZodError,
    message: /Expected an empty directory, received a directory with 1 file\./,
  });
  statfsSync.restore();
});
test.serial('fails parsing with an multi-file directory "path"', (t) => {
  const statfsSync = stub(fs, 'statfsSync').returns({files: 2} as fs.StatsFs);
  t.throws(() => schema.shape.path.parse('./src'), {
    instanceOf: z.ZodError,
    message: /Expected an empty directory, received a directory with 2 files\./,
  });
  statfsSync.restore();
});
test.serial(fails, 'path', undefined, 'undefined');
test(defaults, 'dryRun', false);
test(succeeds, 'dryRun', undefined, 'undefined');
test(succeeds, 'dryRun', true, 'boolean');
