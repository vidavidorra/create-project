import ts from 'typescript';
import {type Options} from '../options.js';
import {File} from './file.js';

class LintStaged extends File {
  constructor(path: string, options: Options) {
    super(path, {...options, format: true, read: false});
  }

  override process(): this {
    this._content = ts.createPrinter().printFile(this.sourceFile());
    return this;
  }

  private eslint(): ts.Expression {
    return ts.factory.createStringLiteral('eslint --fix');
  }

  private ava(): ts.Expression {
    return ts.factory.createArrowFunction(
      undefined,
      undefined,
      [],
      undefined,
      undefined,
      ts.factory.createStringLiteral('ava'),
    );
  }

  private prettier(): ts.Expression {
    return ts.factory.createStringLiteral('prettier --write');
  }

  private config(): ts.Expression {
    return ts.factory.createObjectLiteralExpression([
      ts.factory.createPropertyAssignment(
        ts.factory.createStringLiteral('*.{ts,tsx,js,jsx}'),
        ts.factory.createArrayLiteralExpression([
          this.eslint(),
          ...(this._options.testing ? [this.ava()] : []),
        ]),
      ),
      ts.factory.createPropertyAssignment(
        ts.factory.createStringLiteral(
          '*.{vue,css,less,scss,html,htm,json,md,markdown,yml,yaml}',
        ),
        this.prettier(),
      ),
    ]);
  }

  private sourceFile(): ts.SourceFile {
    const statements = [
      ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
          [
            ts.factory.createVariableDeclaration(
              ts.factory.createIdentifier('config'),
              undefined,
              undefined,
              this.config(),
            ),
          ],
          ts.NodeFlags.Const,
        ),
      ),
      ts.factory.createExportAssignment(
        undefined,
        undefined,
        ts.factory.createIdentifier('config'),
      ),
    ];

    return ts.factory.createSourceFile(
      statements,
      ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None,
    );
  }
}

export {LintStaged};
