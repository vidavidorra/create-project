import test from 'ava';
import {z} from 'zod';
import {stub} from 'sinon';
import {createProject} from './create-project.js';
import {options} from './_options.test.js';
import {File} from './content/file.js';

test('throws an error when options are invald', async (t) => {
  await t.throwsAsync(async () => createProject({...options, project: ''}), {
    instanceOf: z.ZodError,
  });
});

test('writes all files', async (t) => {
  const write = stub(File.prototype, 'write' as any);
  const files = await createProject(options);
  t.is(write.callCount, files.length);
  write.restore();
});

test.serial('returns a list of files created', async (t) => {
  const files = await createProject(options);
  t.not(files.length, 0);
  for (const file of files) {
    t.not(file, '');
  }
});
