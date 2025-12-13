import {z} from 'zod';
import {sortPackageJson} from 'sort-package-json';
import {type Options} from '../options.js';
import {File} from './file.js';

const schema = z.strictObject({
  name: z.string().min(1),
  version: z.string().min('0.0.0'.length),
  description: z.string(),
  keywords: z.array(z.string()).min(1).optional(),
  private: z.boolean().optional(),
  homepage: z.url(),
  bugs: z.strictObject({url: z.url()}),
  repository: z.strictObject({type: z.literal('git'), url: z.url()}),
  license: z.literal('GPL-3.0-or-later'),
  author: z.string().min(1),
  type: z.literal('module'),
  exports: z.string().min(1).optional(),
  bin: z.record(z.string(), z.unknown()).optional(),
  files: z
    .tuple([z.literal('./dist/**/!(*.test).{js,d.ts,cjs}')])
    .rest(z.string().min(1))
    .optional(),
  scripts: z.strictObject({
    build: z.string().min(1),
    format: z.string().startsWith('prettier'),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'format:check': z.string().startsWith('prettier'),
    lint: z.literal('npm run format:check && eslint'),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'lint:fix': z.literal('npm run format && eslint --fix'),
    postinstall: z.string().optional(),
    prepare: z.literal('husky .github/husky'),
    test: z.string().min(1),
  }),
  commitlint: z.record(z.string(), z.unknown()),
  prettier: z.literal('@vidavidorra/prettier-config'),
  release: z.record(z.string(), z.unknown()),
  ava: z.record(z.string(), z.unknown()).optional(),
  c8: z.record(z.string(), z.unknown()).optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()),
  engines: z.strictObject({node: z.literal('>=22')}),
  publishConfig: z.strictObject({access: z.literal('public')}).optional(),
  overrides: z.record(z.string(), z.unknown()).optional(),
});

type PackageJson = z.infer<typeof schema>;

class Package extends File {
  protected readonly _fullPackage: Required<PackageJson>;
  protected readonly _package: PackageJson;

  constructor(path: string, options: Options) {
    super(path, {...options, format: true});
    this._fullPackage = schema.required().parse(JSON.parse(this._content));
    this._package = structuredClone(this._fullPackage);
  }

  get package() {
    return structuredClone(this._package);
  }

  override process(): this {
    this._package.name = this._options.package;
    this._package.version = '0.1.0';
    this._package.description = this._options.description;
    this._package.homepage = `${this.gitHubUrl}#readme`;
    this._package.bugs.url = `${this.gitHubUrl}/issues`;
    this._package.repository.url = `git+${this.gitHubUrl}.git`;
    this._package.author = this._options.author;
    this._package.devDependencies = {
      ...this._package.devDependencies,
      ...this._package.dependencies,
    };
    delete this._package.keywords;
    delete this._package.bin;
    delete this._package.dependencies;
    delete this._package.scripts.postinstall;
    delete this._package.overrides;
    if (this._options.public) {
      delete this._package.private;
    } else {
      this._package.private = true;
      delete this._package.publishConfig;
    }

    const devDependencies = [
      '@commitlint/cli',
      '@semantic-release/changelog',
      '@semantic-release/exec',
      '@semantic-release/git',
      '@vidavidorra/commitlint-config',
      '@vidavidorra/eslint-config',
      '@vidavidorra/prettier-config',
      'eslint',
      'husky',
      'lint-staged',
      'prettier',
      'semantic-release',
    ];
    if (this._options.typescript) {
      this._package.files = [this._fullPackage.files[0]];
      devDependencies.push('typescript');
    } else {
      this._package.scripts.build = '';
      delete this._package.exports;
      delete this._package.files;
    }

    if (this._options.testing) {
      devDependencies.push('@ava/typescript', 'ava', 'c8');
    } else {
      this._package.scripts.test = '';
      delete this._package.ava;
      delete this._package.c8;
    }

    for (const dependency of Object.keys(this._package.devDependencies)) {
      if (!devDependencies.includes(dependency)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this._package.devDependencies[dependency];
      }
    }

    sortPackageJson(this._package);
    this._content = JSON.stringify(this._package, undefined, 2);

    return this;
  }

  private get gitHubUrl(): string {
    const {githubOwner, githubRepository} = this._options;
    return `https://github.com/${githubOwner}/${githubRepository}`;
  }
}

export {Package, type PackageJson};
