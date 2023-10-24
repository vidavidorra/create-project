import test from 'ava';
import {type Options} from '../options.js';
import {options} from '../_options.test.js';
import {CiCd} from './ci-cd.js';

const path = '.github/workflows/ci-cd.yml';

test('enables the "format" option', (t) => {
  t.true(new CiCd(path, options).options.format);
});

const includes = test.macro<[boolean, string, keyof Options]>({
  async exec(t, include, value, option) {
    const file = new CiCd(path, {...options, [option]: include}).process();
    (include ? t.true : t.false)(file.content.includes(value));
  },
  title: (_, include, value, option) =>
    [
      `${include ? 'includes' : 'does not include'} "${value}"`,
      `${include ? 'with' : 'without'} "${option}" option`,
    ].join(' '),
});

test(includes, true, 'build:', 'typescript');
test(includes, true, '- build', 'typescript');
test(includes, false, 'build:', 'typescript');
test(includes, false, '- build', 'typescript');
test(includes, true, 'test:', 'typescript');
test(includes, true, '- test', 'typescript');
test(includes, false, 'test:', 'typescript');
test(includes, false, '- test', 'typescript');
test(includes, true, 'code-coverage:', 'typescript');
test(includes, true, '- code-coverage', 'typescript');
test(includes, false, 'code-coverage:', 'typescript');
test(includes, false, '- code-coverage', 'typescript');
test(includes, true, 'test:', 'testing');
test(includes, true, '- test', 'testing');
test(includes, false, 'test:', 'testing');
test(includes, false, '- test', 'testing');
test(includes, true, 'code-coverage:', 'testing');
test(includes, true, '- code-coverage', 'testing');
test(includes, false, 'code-coverage:', 'testing');
test(includes, false, '- code-coverage', 'testing');
test(includes, true, 'code-coverage:', 'reportCodeCoverage');
test(includes, true, '- code-coverage', 'reportCodeCoverage');
test(includes, false, 'code-coverage:', 'reportCodeCoverage');
test(includes, false, '- code-coverage', 'reportCodeCoverage');
test(includes, true, 'secrets.NPM_PUBLISH_TOKEN', 'public');
test(includes, false, 'secrets.NPM_PUBLISH_TOKEN', 'public');

type Version = 'none' | 'invalid';
class CiCdTest extends CiCd {
  private readonly _overwrite: {sha: boolean; version?: Version};
  private readonly _sha: string;
  private readonly _version: string;

  constructor(path: string, options: Options, sha = false, version?: Version) {
    super(path, options);
    this._overwrite = {sha, version};
    this._sha = super.sha;
    this._version = super.version;
  }

  get sha(): string {
    this._yaml.jobs.lint.uses = this._overwrite.sha
      ? this._yaml.jobs.lint.uses.replace('@', '')
      : this._yaml.jobs.lint.uses;
    return this._overwrite.sha ? super.sha : this._sha;
  }

  get version(): string {
    if (this._overwrite.version === 'none') {
      this._yaml.jobs.lint.uses = this._yaml.jobs.lint.uses.replace('lint', '');
    } else if (this._overwrite.version === 'invalid') {
      this._content = this._content.replaceAll(' # v', '');
    }

    return this._overwrite.version ? super.version : this._version;
  }
}

test('throws an error when YAML does not contain a SHA', (t) => {
  t.throws(() => new CiCdTest(path, options, true).process(), {
    instanceOf: Error,
    message: 'SHA is required in YAML',
  });
});

test('throws an error when YAML does not contain a "lint" job', (t) => {
  t.throws(() => new CiCdTest(path, options, false, 'none').process(), {
    instanceOf: Error,
    message: '"lint" job not found in content',
  });
});

test('throws an error when YAML does not contain a valid version', (t) => {
  t.throws(() => new CiCdTest(path, options, false, 'invalid').process(), {
    instanceOf: Error,
    message: /Version is not in a valid format \(version: ".*"\)/,
  });
});
