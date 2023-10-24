import test from 'ava';
import {options} from '../../_options.test.js';
import {Badge} from './badge.js';

test('uses "style=flat-square"', (t) => {
  for (const badge of new Badge(options).badges) {
    t.regex(new Badge(options).markdown(badge), /style=flat-square/);
  }
});

test('creates a linked markdown image', (t) => {
  for (const badge of new Badge(options).badges) {
    t.regex(
      new Badge(options).markdown(badge),
      /^\[!\[[\S ]+?]\(https:\/\/\S+?\)]\(\S+?\)$/,
    );
  }
});
