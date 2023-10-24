import {isAbsolute, join} from 'node:path';
import {stat, readFile} from 'node:fs/promises';
import test from 'ava';
import rootPath from './root-path.js';

test('is an absolute path', (t) => {
  t.true(isAbsolute(rootPath));
});

test('is a directory', async (t) => {
  const stats = await stat(rootPath);
  t.true(stats.isDirectory());
});

test('is a directory containing the root "package.json" file', async (t) => {
  const packageJsonPath = join(rootPath, 'package.json');
  const stats = await stat(packageJsonPath);
  t.true(stats.isFile());
  const packageJson = await readFile(packageJsonPath, 'utf8');
  t.true(packageJson.includes('"name": "@vidavidorra/create-project"'));
});
