import {z} from 'zod';
import {type Options} from '../options.js';
import {File} from './file.js';

const schema = z.strictObject({
  compilerOptions: z.looseObject({allowJs: z.boolean().optional()}),
  include: z.array(z.string()).min(1),
});

type Config = z.infer<typeof schema>;

class TsConfig extends File {
  protected readonly _config: Config;

  constructor(path: string, options: Options) {
    super(path, {...options, format: true});
    this._config = schema.parse(JSON.parse(this._content));
  }

  get config() {
    return structuredClone(this._config);
  }

  override process(): this {
    delete this._config.compilerOptions.allowJs;
    this._content = JSON.stringify(this._config, undefined, 2);
    return this;
  }
}

export {TsConfig, type Config};
