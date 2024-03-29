import {type Options} from '../options.js';
import {File} from './file.js';

class Npmrc extends File {
  constructor(path: string, options: Options) {
    super(path, {...options, read: false});
  }

  override process(): this {
    this._content = 'save-exact=true\n';
    return this;
  }
}

export {Npmrc};
