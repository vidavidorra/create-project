import {type Options} from '../options.js';
import {File} from './file.js';

class Npmrc extends File {
  constructor(path: string, options: Options) {
    super(path, {...options, format: true, read: false});
  }

  override process(): this {
    this._content = 'save-exact=true\n\n';
    return this;
  }
}

export {Npmrc};
