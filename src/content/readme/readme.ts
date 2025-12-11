import {type Options} from '../../options.js';
import {File} from '../file.js';
import {Badge} from './badge.js';

class Readme extends File {
  private readonly _badge: Badge;

  constructor(path: string, options: Options) {
    super(path, {...options, format: true});
    this._badge = new Badge(options);
  }

  override process(): this {
    this._content = [
      `# ${this.options.project} <!-- omit in toc -->`,
      `${this.options.description}`,
      '---',
      this.badges(),
      this.tableOfContents(),
      this.install(),
      this.usage(),
      this.contributing(),
      this.securityPolicy(),
      this.license(),
    ].join('\n\n');
    return this;
  }

  private badges(): string {
    return [
      this._options.public ? this._badge.markdown('npmVersion') : undefined,
      this._options.public ? this._badge.markdown('npmDownloads') : undefined,
      this._options.public ? this._badge.markdown('nodeJsVersion') : undefined,
      this._badge.markdown('renovate'),
      this._badge.markdown('semanticRelease'),
      this._options.reportCodeCoverage
        ? this._badge.markdown('codeCoverage')
        : undefined,
      this._badge.markdown('license'),
    ].join('\n');
  }

  private tableOfContents(): string {
    return this.dedent(`- [Install](#install)
      - [Usage](#usage)
      - [Contributing](#contributing)
      - [Security policy](#security-policy)
      - [License](#license)`);
  }

  private install(): string {
    return this.dedent(`## Install

        ...`);
  }

  private usage(): string {
    return this.dedent(`## Usage

      ...`);
  }

  private contributing(): string {
    const contributingGuide = this.gitHubUrl(
      'blob/main/CONTRIBUTING.md',
      '.github',
    );

    return this.dedent(`## Contributing

      ${[
        `Please [create an issue](${this.gitHubUrl('issues/new/choose')})`,
        'if you have a bug report or feature proposal, or',
        `[create a discussion](${this.gitHubUrl('discussions')}) if you have a`,
        'question. If you like this project, please consider giving it a star',
        '⭐ to support my work.',
      ].join(' ')}

      ${[
        `Refer to the [contributing guide](${contributingGuide})`,
        'for detailed information about other contributions, like pull',
        'requests.',
      ].join(' ')}

      ${this._badge.markdown('conventionalCommits')}
      ${this._badge.markdown('xo')}
      ${this._badge.markdown('prettier')}`);
  }

  private securityPolicy(): string {
    return this.dedent(`## Security policy
      ${[
        'Please refer to the',
        `[Security Policy on GitHub](${this.gitHubUrl('security')})`,
        'for the security policy.',
      ].join(' ')}`);
  }

  private license(): string {
    return this.dedent(`## License

      ${[
        'This project is licensed under the',
        '[GPLv3 license](https://www.gnu.org/licenses/gpl.html).',
      ].join(' ')}

      Copyright © ${new Date().getFullYear()} ${this.options.author}

      <details><summary>License notice</summary>
      <p>

      This program is free software: you can redistribute it and/or modify
      it under the terms of the GNU General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.

      This program is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
      GNU General Public License for more details.

      You should have received a copy of the GNU General Public License
      along with this program. If not, see <http://www.gnu.org/licenses/>.

      ${[
        'The full text of the license is available in the',
        '[LICENSE](LICENSE.md) file in this repository and',
        '[online](https://www.gnu.org/licenses/gpl.html)',
      ].join(' ')}

      </details>

      <!-- References -->`);
  }

  private dedent(value: string): string {
    return value.replaceAll(/^ +/gm, '');
  }

  private gitHubUrl(path: string, repository?: string): string {
    const {githubOwner: owner, githubRepository} = this._options;
    return new URL(
      path,
      `https://github.com/${owner}/${repository ?? githubRepository}/`,
    ).toString();
  }
}

export {Readme};
