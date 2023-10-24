import {z} from 'zod';
import {sortPackageJson} from 'sort-package-json';
import {type Options} from '../options.js';
import {File} from './file.js';

const schema = z
  .object({
    name: z.string().min(1),
    version: z.string().min('0.0.0'.length),
    description: z.string(),
    private: z.boolean().optional(),
    homepage: z.string().url(),
    bugs: z
      .object({
        url: z.string().url(),
      })
      .strict(),
    repository: z
      .object({
        type: z.literal('git'),
        url: z.string().url(),
      })
      .strict(),
    license: z.literal('GPL-3.0-or-later'),
    author: z.string().min(1),
    type: z.literal('module'),
    exports: z.string().min(1).optional(),
    files: z
      .tuple([z.literal('./dist/**/!(*.test).{js,d.ts,cjs}')])
      .rest(z.string().min(1))
      .optional(),
    scripts: z
      .object({
        build: z.string().min(1),
        format: z.string().startsWith('prettier'),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'format:check': z.string().startsWith('prettier'),
        lint: z.literal('npm run format:check && xo'),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'lint:fix': z.literal('npm run format && xo --fix'),
        prepare: z.literal('husky install .github/husky'),
        test: z.string().min(1),
      })
      .strict(),
    commitlint: z.record(z.unknown()),
    xo: z.record(z.unknown()),
    prettier: z.record(z.unknown()),
    release: z.record(z.unknown()),
    ava: z.record(z.unknown()).optional(),
    c8: z.record(z.unknown()).optional(),
    dependencies: z.record(z.string()).optional(),
    devDependencies: z.record(z.string()),
    engines: z.object({node: z.literal('>=18')}).strict(),
    publishConfig: z
      .object({access: z.literal('public')})
      .strict()
      .optional(),
  })
  .strict();

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
    this._package.author = this._options.author;
    this._package.devDependencies = {
      ...this._package.devDependencies,
      ...this._package.dependencies,
    };
    delete this._package.dependencies;
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
      'husky',
      'lint-staged',
      'semantic-release',
      'xo',
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
}

export {Package, type PackageJson};
