import test from 'ava';
import {options} from '../_options.test.js';
import {TsConfig, type Config} from './ts-config.js';

const path = 'tsconfig.json';

function config(): Config {
  return new TsConfig(path, options).process().config;
}

test('enables the "format" option', (t) => {
  t.true(new TsConfig(path, options).options.format);
});

test('does not include compiler option "allowJs"', (t) => {
  t.is(config().compilerOptions.allowJs, undefined);
});

const includesCompilerOption = test.macro<[keyof Config['compilerOptions']]>({
  async exec(t, option) {
    t.not(config().compilerOptions[option], undefined);
  },
  title: (_, option) => `includes compiler option "${option}"`,
});
test(includesCompilerOption, 'declaration');
test(includesCompilerOption, 'module');
test(includesCompilerOption, 'esModuleInterop');
test(includesCompilerOption, 'moduleResolution');
test(includesCompilerOption, 'outDir');
test(includesCompilerOption, 'skipLibCheck');
test(includesCompilerOption, 'sourceMap');
test(includesCompilerOption, 'strict');
test(includesCompilerOption, 'target');

test('includes "include" for "src/**/*.ts"', (t) => {
  t.deepEqual(config().include, ['src/**/*.ts']);
});
