import ts from 'typescript';
import {type Options} from '../options.js';
import {File} from './file.js';

class EslintConfig extends File {
  constructor(path: string, options: Options) {
    super(path, {...options, format: true, read: false});
  }

  override process(): this {
    this._content = ts.createPrinter().printFile(this.sourceFile());
    return this;
  }

  private sourceFile(): ts.SourceFile {
    const statements = [
      ts.factory.createExportDeclaration(
        undefined,
        false,
        ts.factory.createNamedExports([
          ts.factory.createExportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier('default'),
          ),
        ]),
        ts.factory.createStringLiteral('@vidavidorra/eslint-config'),
      ),
    ];

    return ts.factory.createSourceFile(
      statements,
      ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None,
    );
  }
}

export {EslintConfig};
