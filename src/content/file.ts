import {join, dirname} from 'node:path';
import fs from 'node:fs';
import prettier from 'prettier';
import rootPath from '../root-path.js';
import {type Options} from '../options.js';

type FileOptions = {mode: number; format: boolean};

class File {
  protected _content: string;
  protected readonly _options: Options & FileOptions;
  private readonly _directory: string;

  constructor(
    public readonly path: string,
    options: Options & Partial<FileOptions>,
  ) {
    this._directory = dirname(path);
    this._options = {mode: 0o644, format: false, ...options};
    this._content = fs.readFileSync(join(rootPath, path), 'utf8');
  }

  get options() {
    return structuredClone(this._options);
  }

  get content() {
    return this._content;
  }

  async write(): Promise<void> {
    this.process();

    const path = join(this.options.path, this.path);
    if (!this._options.dryRun) {
      const directory = join(this.options.path, this._directory);
      if (!fs.existsSync(directory)) {
        await fs.promises.mkdir(directory, {recursive: true});
      }

      await fs.promises.writeFile(path, await this.format(), {
        mode: this._options.mode,
      });
    }
  }

  /**
   * Process file contents.
   *
   * @note This function is called automatically from `write`.
   */
  process(): this {
    return this;
  }

  private async format(): Promise<string> {
    if (this._options.format) {
      const config = await prettier.resolveConfig(
        join(rootPath, 'package.json'),
      );

      return prettier.format(this._content, {...config, filepath: this.path});
    }

    return this._content;
  }
}

export {File};
