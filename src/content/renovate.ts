import {z} from 'zod';
import {type Options} from '../options.js';
import {File} from './file.js';

const schema = z.strictObject({
  '$schema': z.literal('https://docs.renovatebot.com/renovate-schema.json'),
  extends: z.tuple([z.literal('github>vidavidorra/.github')]),
  packageRules: z.array(z.record(z.string(), z.unknown())).optional(),
});

type Config = z.infer<typeof schema>;

class Renovate extends File {
  protected readonly _config: Config;

  constructor(path: string, options: Options) {
    super(path, {...options, format: true});
    this._config = schema.parse(JSON.parse(this._content));
  }

  get config() {
    return structuredClone(this._config);
  }

  override process(): this {
    delete this._config.packageRules;
    this._content = JSON.stringify(this._config, undefined, 2);
    return this;
  }
}

export {type Config, Renovate};
