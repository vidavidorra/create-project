import fs from 'node:fs';
import {stub, match, type SinonStub, restore} from 'sinon';
import anyTest, {type TestFn} from 'ava';
import {gitIgnore, npmIgnore, postinstall} from './postinstall.js';

const test = anyTest as TestFn<{existsSync: SinonStub; renameSync: SinonStub}>;
test.beforeEach((t) => {
  t.context.existsSync = stub(fs, 'existsSync');
  t.context.renameSync = stub(fs, 'renameSync');
});
test.afterEach.always(() => {
  restore();
});

const gitToNpm = '".gitignore" to ".npmignore"';
test.serial(`renames ${gitToNpm}`, (t) => {
  t.context.existsSync.withArgs(gitIgnore).returns(false);
  t.context.existsSync.withArgs(npmIgnore).returns(true);
  postinstall();
  t.is(t.context.renameSync.callCount, 1);
  t.deepEqual(t.context.renameSync.firstCall.args, [npmIgnore, gitIgnore]);
});

test.serial(`does not rename ${gitToNpm} when ".gitignore" exists`, (t) => {
  t.context.existsSync.withArgs(gitIgnore).returns(true);
  t.context.existsSync.withArgs(npmIgnore).returns(true);
  postinstall();
  t.is(t.context.renameSync.callCount, 0);
});

test.serial(`does not rename ${gitToNpm} without ".npmignore"`, (t) => {
  t.context.existsSync.withArgs(gitIgnore).returns(false);
  t.context.existsSync.withArgs(npmIgnore).returns(false);
  postinstall();
  t.is(t.context.renameSync.callCount, 0);
});
