import {type Options} from '../../options.js';

type Config = Record<
  | 'conventionalCommits'
  | 'xo'
  | 'prettier'
  | 'renovate'
  | 'semanticRelease'
  | 'codeCoverage'
  | 'license'
  | 'npmVersion'
  | 'npmDownloads'
  | 'nodeJsVersion',
  {title: string; url: string; link: string}
>;

class Badge {
  private readonly _options: Options;

  constructor(options: Options) {
    this._options = options;
  }

  markdown(key: keyof Config): string {
    const config = this.config[key];
    const url = new URL(config.url);
    url.searchParams.append('style', 'flat-square');
    return `[![${config.title}](${url.toString()})](${config.link})`;
  }

  get badges(): Array<keyof Config> {
    return Object.keys(this.config) as Array<keyof Config>;
  }

  private get config(): Config {
    return {
      conventionalCommits: {
        title: 'Conventional Commits: 1.0.0',
        url: 'https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow',
        link: 'https://conventionalcommits.org',
      },
      xo: {
        title: 'XO code style',
        url: 'https://img.shields.io/badge/code_style-5ed9c7?logo=xo&labelColor=gray',
        link: 'https://github.com/xojs/xo',
      },
      prettier: {
        title: 'Prettier code style',
        url: 'https://img.shields.io/badge/code_style-Prettier-ff69b4?logo=prettier',
        link: 'https://github.com/prettier/prettier',
      },
      renovate: {
        title: 'Renovate',
        url: 'https://img.shields.io/badge/Renovate-enabled-brightgreen?logo=renovatebot&logoColor',
        link: 'https://renovatebot.com',
      },
      semanticRelease: {
        title: 'semantic-release',
        url: 'https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079',
        link: 'https://github.com/semantic-release/semantic-release',
      },
      codeCoverage: {
        title: 'Code coverage',
        url: `https://img.shields.io/codecov/c/github${this.gitHubRepository}?logo=codecov`,
        link: `https://codecov.io/gh/${this.gitHubRepository}`,
      },
      license: {
        title: 'License',
        url: `https://img.shields.io/github/license${this.gitHubRepository}`,
        link: `LICENSE.md`,
      },
      npmVersion: {
        title: 'npm version',
        url: `https://img.shields.io/npm/v/${this._options.package}?logo=npm`,
        link: `https://www.npmjs.com/package/${this._options.package}`,
      },
      npmDownloads: {
        title: 'npm downloads',
        url: `https://img.shields.io/npm/dm/${this._options.package}?logo=npm`,
        link: `https://www.npmjs.com/package/${this._options.package}`,
      },
      nodeJsVersion: {
        title: 'Node.js version support',
        url: `https://img.shields.io/node/v/${this._options.package}?logo=node.js`,
        link: `https://nodejs.org/en/about/releases/`,
      },
    };
  }

  private get gitHubRepository(): string {
    const {githubOwner, githubRepository} = this._options;
    return `${githubOwner}/${githubRepository}`;
  }
}

export {Badge};
