import {input, confirm} from '@inquirer/prompts';
import {type Options, schema} from './options.js';
import {files} from './content/index.js';

function validate(value: unknown, option: keyof Options): true | string {
  const validation = schema.shape[option].safeParse(value);
  return validation.success
    ? true
    : validation.error.errors.map(({message}) => message).join('\n> ');
}

const project = await input({
  message: 'Project name:',
  validate: (value) => validate(value, 'project'),
});
const name = project.replaceAll(' ', '-').toLowerCase();
const defaultPackage = validate(name, 'package') === true ? name : undefined;

const options: Partial<Options> = {
  project,
  package: await input({
    message: 'Package name:',
    validate: (value) => validate(value, 'package'),
    default: defaultPackage,
  }),
  public: await confirm({
    message: 'Make package public?',
    default: schema.shape.public._def.defaultValue(),
  }),
  description: await input({
    message: 'Description:',
    validate: (value) => validate(value, 'description'),
  }),
  author: await input({
    message: 'Author:',
    validate: (value) => validate(value, 'author'),
  }),
  githubOwner: await input({
    message: 'GitHub owner:',
    validate: (value) => validate(value, 'githubOwner'),
  }),
  githubRepository: await input({
    message: 'GitHub repository:',
    validate: (value) => validate(value, 'githubRepository'),
    default:
      validate(defaultPackage, 'githubRepository') === true
        ? defaultPackage
        : undefined,
  }),
};

options.typescript = await confirm({message: 'Add typescript?'});
if (options.typescript) {
  options.testing = await confirm({message: 'Add AVA testing framework?'});
}

if (options.testing) {
  options.reportCodeCoverage = await confirm({
    message: 'Report code coverate to Codecov?',
  });
}

options.path = await input({message: 'Output folder:'});
options.dryRun = await confirm({message: 'Dry run?'});

for await (const file of files(schema.parse(options))) {
  console.log(`Create file ${file.path}`);
  await file.write();
}
