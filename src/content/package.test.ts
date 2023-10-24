import test from 'ava';
import {type Options} from '../options.js';
import {options} from '../_options.test.js';
import {Package, type PackageJson} from './package.js';

const path = 'package.json';
function packageJson(partialOptions: Partial<Options> = {}): PackageJson {
  return new Package(path, {...options, ...partialOptions}).process().package;
}

test('enables the "format" option', (t) => {
  t.true(new Package(path, options).options.format);
});

const sets = test.macro<[keyof PackageJson, string, string]>({
  exec: (t, key, value) => t.is(packageJson()[key], value),
  title: (_, key, value, to) => `sets "${key}" to ${to}`,
});

test(sets, 'name', options.package, '"package" option');
test(sets, 'version', '0.1.0', '"0.1.0"');
test(sets, 'description', options.description, '"description" option');
test(sets, 'author', options.author, '"author" option');
test('does not include "dependencies"', (t) => {
  t.is(packageJson().dependencies, undefined);
});
test('sets "files" to non-test files in dist', (t) => {
  t.deepEqual(packageJson().files, ['./dist/**/!(*.test).{js,d.ts,cjs}']);
});

const includes = test.macro<[boolean, keyof PackageJson, keyof Options]>({
  async exec(t, include, value, option) {
    if (include) {
      t.not(packageJson({[option]: include})[value], undefined);
    } else {
      t.is(packageJson({[option]: include})[value], undefined);
    }
  },
  title: (_, include, value, option) =>
    [
      `${include ? 'includes' : 'does not include'} "${value}"`,
      (option === 'public' ? !include : include) ? 'with' : 'without',
      `"${option}" option`,
    ].join(' '),
});

test('sets "private" to "true" without "public" option', (t) => {
  t.is(packageJson({public: false}).private, true);
});
test('does not include "private" with "public" option', (t) => {
  t.is(packageJson({public: true}).private, undefined);
});
test(includes, true, 'publishConfig', 'public');
test(includes, false, 'publishConfig', 'public');
test(includes, true, 'exports', 'typescript');
test(includes, false, 'exports', 'typescript');
test(includes, true, 'files', 'typescript');
test(includes, false, 'files', 'typescript');
test(includes, true, 'ava', 'testing');
test(includes, false, 'ava', 'testing');
test(includes, true, 'c8', 'testing');
test(includes, false, 'c8', 'testing');

test('includes "build" script with "typescript" option', (t) => {
  t.not(packageJson({typescript: true}).scripts.build, '');
});
test('clears "build" script without "typescript" option', (t) => {
  t.is(packageJson({typescript: false}).scripts.build, '');
});
test('includes "test" script with "testing" option', (t) => {
  t.not(packageJson({testing: true}).scripts.test, '');
});
test('clears "test" script without "testing" option', (t) => {
  t.is(packageJson({testing: false}).scripts.test, '');
});

const doesNotIncludeDep = test.macro<[string, keyof Options]>({
  exec: (t, name, option) =>
    t.false(Object.keys(packageJson({[option]: false})).includes(name)),
  title: (_, name, option) =>
    `does not include dependency "${name}" without "${option}" option`,
});
test(doesNotIncludeDep, 'typescript', 'typescript');
test(doesNotIncludeDep, '@ava/typescript', 'testing');
test(doesNotIncludeDep, 'ava', 'testing');
test(doesNotIncludeDep, 'c8', 'testing');

const dependencies = [
  '@commitlint/cli',
  '@semantic-release/changelog',
  '@semantic-release/exec',
  '@semantic-release/git',
  '@vidavidorra/commitlint-config',
  'husky',
  'lint-staged',
  'semantic-release',
  'xo',
] as const;
test('includes "typescript" dependency with "typescript" option', (t) => {
  t.deepEqual(
    Object.keys(packageJson({testing: false}).devDependencies).sort(),
    [...dependencies, 'typescript'].sort(),
  );
});
test('includes test and coverage dependencies with "testing" option', (t) => {
  t.deepEqual(
    Object.keys(packageJson({typescript: false}).devDependencies).sort(),
    [...dependencies, '@ava/typescript', 'ava', 'c8'].sort(),
  );
});
