import {type OptionsInput as Options, schema} from './options.js';
import {files} from './content/index.js';

async function createProject(options: Options): Promise<string[]> {
  return Promise.all(
    files(schema.parse(options)).map(async (file) => {
      await file.write();
      return file.path;
    }),
  );
}

export {createProject};
