#!/usr/bin/env node

import {input, confirm} from '@inquirer/prompts';
import z from 'zod';
import {createProject, type Options, options as schema} from './index.js';

function validate(value: unknown, option: keyof Options): true | string {
  const {success, error} = schema.shape[option].safeParse(value);
  return success ? true : z.prettifyError(error);
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
    default: schema.shape.public.def.defaultValue,
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
    message: 'Report code coverage to Codecov?',
  });
}

options.path = await input({
  message: 'Output folder:',
  validate: (value) => validate(value, 'path'),
});
options.dryRun = await confirm({message: 'Dry run?'});

const files = await createProject(schema.parse(options));
if (options.dryRun) {
  for (const path of files) {
    console.log(`Create file ${path}`);
  }
}
