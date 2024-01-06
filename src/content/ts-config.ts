import {z} from 'zod';
import {type Options} from '../options.js';
import {File} from './file.js';

const schema = z
  .object({
    compilerOptions: z
      .object({
        allowJs: z.boolean().optional(),
      })
      .passthrough(),
    include: z.array(z.string()).min(1),
  })
  .strict();

type TsConfigJson = z.infer<typeof schema>;

class TsConfig extends File {
  protected readonly _tsConfig: TsConfigJson;

  constructor(path: string, options: Options) {
    super(path, {...options, format: true});
    this._tsConfig = schema.required().parse(JSON.parse(this._content));
  }

  get tsConfig() {
    return structuredClone(this._tsConfig);
  }

  override process(): this {
    delete this._tsConfig.compilerOptions.allowJs;
    this._content = JSON.stringify(this._tsConfig, undefined, 2);
    return this;
  }
}

export {TsConfig, type TsConfigJson};
