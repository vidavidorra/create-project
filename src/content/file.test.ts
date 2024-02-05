import fs from 'node:fs';
import {stub, type SinonStub, restore} from 'sinon';
import anyTest, {type TestFn} from 'ava';
import {options} from '../_options.test.js';
import {File} from './file.js';

const test = anyTest as TestFn<{
  readFileSync: SinonStub;
  existsSync: SinonStub;
  mkdir: SinonStub;
  writeFile: SinonStub;
}>;
test.beforeEach((t) => {
  t.context.readFileSync = stub(fs, 'readFileSync');
  t.context.existsSync = stub(fs, 'existsSync');
  t.context.mkdir = stub(fs.promises, 'mkdir');
  t.context.writeFile = stub(fs.promises, 'writeFile');
});
test.afterEach.always(() => {
  restore();
});
const writeOptions = {...options, dryRun: false} as const;

test.serial('defaults "format" option to "false"', (t) => {
  t.false(new File('', options).options.format);
});

test.serial('defaults "read" option to "true"', (t) => {
  t.true(new File('', options).options.read);
});

test.serial('reads file content on construction', (t) => {
  // eslint-disable-next-line no-new
  new File('', options);
  t.is(t.context.readFileSync.callCount, 1);
});

test.serial(
  'does not read file content on construction without "read" option',
  (t) => {
    const {content} = new File('', {...options, read: false});
    t.is(t.context.readFileSync.callCount, 0);
    t.is(content, '');
  },
);

test.serial('"content" contains the read file\'s content', (t) => {
  const content = "I'll see you at the beginning, friend.";
  t.context.readFileSync.returns(content);
  const file = new File('', options);
  t.is(t.context.readFileSync.callCount, 1);
  t.is(file.content, content);
});

test.serial('write › calls "process" with "dryRun" option', async (t) => {
  const process = stub(File.prototype, 'process' as any);
  await new File('', options).write();
  t.is(process.callCount, 1);
});

test.serial('write › calls "process" without "dryRun" option', async (t) => {
  const process = stub(File.prototype, 'process' as any);
  await new File('', writeOptions).write();
  t.is(process.callCount, 1);
});

test.serial(
  'write › creates a non-existing directory recursively',
  async (t) => {
    t.context.existsSync.returns(false);
    await new File('.github/test', writeOptions).write();
    t.is(t.context.mkdir.callCount, 1);
    t.deepEqual(t.context.mkdir.firstCall.args, [
      `${options.path.replace(/^\.\//, '')}/.github`,
      {recursive: true},
    ]);
  },
);

test.serial('write › does not create an existing directory', async (t) => {
  t.context.existsSync.returns(true);
  await new File('', writeOptions).write();
  t.is(t.context.mkdir.callCount, 0);
});

test.serial(
  'write › does not create a directory with "dryRun" option',
  async (t) => {
    t.context.existsSync.returns(false);
    await new File('', options).write();
    t.is(t.context.mkdir.callCount, 0);
  },
);

test.serial(
  'write › does not format content without "format" option',
  async (t) => {
    const content = 'const n = 1';
    t.context.readFileSync.returns(content);
    await new File('test.ts', {...writeOptions, format: false}).write();
    t.is(t.context.writeFile.firstCall.args.at(1), content);
  },
);

test.serial('write › formats content with "format" option', async (t) => {
  const content = 'const n = 1';
  t.context.readFileSync.returns(content);
  const file = new File('test.ts', {...writeOptions, format: true});
  t.context.readFileSync.restore(); // Used by `prettier.resolveConfig`.
  await file.write();
  t.is(t.context.writeFile.firstCall.args.at(1), `${content};\n`);
});

test.serial('write › does not write with "dryRun" option', async (t) => {
  await new File('test.ts', options).write();
  t.is(t.context.writeFile.callCount, 0);
});
