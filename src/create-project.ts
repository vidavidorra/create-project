import {type OptionsInput as Options, schema} from './options.js';
import {files} from './content/index.js';

async function createProject(options: Options): Promise<string[]> {
  const paths: string[] = [];
  for await (const file of files(schema.parse(options))) {
    await file.write();
    paths.push(file.path);
  }

  return paths;
}

export {createProject};
