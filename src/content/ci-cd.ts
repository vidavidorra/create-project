import {parse, stringify} from 'yaml';
import {z} from 'zod';
import {type Options} from '../options.js';
import {File} from './file.js';

const job = (action: string) =>
  z.object({
    uses: z
      .string()
      .startsWith(`vidavidorra/.github/.github/workflows/${action}@`)
      .regex(/.*?@[\da-f]{6,64}$/),
  });

const schema = z.strictObject({
  name: z.literal('CI/CD'),
  on: z.object({
    push: z.object({
      branches: z.tuple([
        z.literal('main'),
        z.literal('beta'),
        z.literal('renovate/**'),
      ]),
    }),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    pull_request: z.null(),
  }),
  permissions: z.strictObject({
    contents: z.literal('write'),
    'id-token': z.literal('write'),
    issues: z.literal('write'),
    'pull-requests': z.literal('write'),
  }),
  jobs: z.strictObject({
    'lint-commit-messages': job('lint-commit-messages.yml'),
    lint: job('node-lint.yml'),
    build: job('node-build.yml'),
    test: job('node-test.yml'),
    'code-coverage': job('node-test-coverage.yml').extend({
      needs: z.tuple([
        z.literal('lint'),
        z.literal('build'),
        z.literal('test'),
      ]),
    }),
    release: job('release.yml').extend({
      needs: z
        .array(
          z.union([
            z.literal('lint-commit-messages'),
            z.literal('lint'),
            z.literal('build'),
            z.literal('test'),
            z.literal('code-coverage'),
          ]),
        )
        .length(5),
      secrets: z.strictObject({
        privateKey: z.string(),
      }),
    }),
  }),
});

type Yaml = z.infer<typeof schema>;

type DeepPartial<T> =
  T extends Record<string, unknown> ? {[K in keyof T]?: DeepPartial<T[K]>} : T;

class CiCd extends File {
  protected readonly _yaml: Yaml;

  constructor(path: string, options: Options) {
    super(path, {...options, format: true});
    this._yaml = schema.parse(parse(this._content));
  }

  override process(): this {
    const data: DeepPartial<Yaml> = schema.parse(this._yaml);
    const removeFromRelease: Yaml['jobs']['release']['needs'] = [];

    if (!this._options.typescript) {
      delete data.jobs?.build;
      removeFromRelease.push('build');
    }

    if (!this._options.typescript || !this._options.testing) {
      delete data.jobs?.test;
      removeFromRelease.push('test');
    }

    if (
      !this._options.typescript ||
      !this._options.testing ||
      !this._options.reportCodeCoverage
    ) {
      delete data.jobs?.['code-coverage'];
      removeFromRelease.push('code-coverage');
    }

    if (data.jobs?.release?.needs !== undefined) {
      data.jobs.release.needs = data.jobs.release.needs.filter(
        (action) => !removeFromRelease.includes(action),
      );
    }

    if (!this._options.public && !this._options.reportCodeCoverage) {
      delete data.permissions?.['id-token'];
    }

    const {sha, version} = this;
    this._content = stringify(data).replaceAll(sha, `${sha}${version}`);

    return this;
  }

  protected get sha(): string {
    const sha = this._yaml.jobs.lint.uses.split('@').at(1);
    if (sha === undefined) {
      throw new Error('SHA is required in YAML');
    }

    return sha;
  }

  protected get version(): string {
    const job = 'lint';
    const value = this._yaml.jobs[job].uses;
    const line = this._content.split('\n').find((line) => line.includes(value));
    if (line === undefined) {
      throw new Error(`"${job}" job not found in content`);
    }

    const version = line.replace(new RegExp(`^.*${value}`), '');
    if (!/ +# v\d+\.\d+\.\d+$/.test(version)) {
      throw new Error(
        `Version is not in a valid format (version: "${version}")`,
      );
    }

    return version;
  }
}

export {CiCd};
