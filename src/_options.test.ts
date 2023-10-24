import {type Options} from './options.js';

const options: Options = {
  project: 'New project',
  package: 'new-project',
  public: true,
  description: 'New project does awesome things.',
  author: 'John Doe',
  typescript: true,
  testing: true,
  reportCodeCoverage: true,
  githubOwner: 'jdoe',
  githubRepository: 'new-project',
  path: './new-project',
  dryRun: true,
} as const;

export {options};
