import test from 'ava';
import {options} from '../_options.test.js';
import {TsConfig, type TsConfigJson} from './ts-config.js';

const path = 'tsconfig.json';
function tsConfig(): TsConfigJson {
  return new TsConfig(path, options).process().tsConfig;
}

test('enables the "format" option', (t) => {
  t.true(new TsConfig(path, options).options.format);
});

test('does not include compiler option "allowJs"', (t) => {
  t.is(tsConfig().compilerOptions.allowJs, undefined);
});

const includesCompilerOption = test.macro<
  [keyof TsConfigJson['compilerOptions']]
>({
  async exec(t, option) {
    t.not(tsConfig().compilerOptions[option], undefined);
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
  t.deepEqual(tsConfig().include, ['src/**/*.ts']);
});
