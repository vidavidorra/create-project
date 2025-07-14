import fs from 'node:fs';
import {z} from 'zod';
import validatePackageName from 'validate-npm-package-name';

const schema = z
  .strictObject({
    project: z.string().min(1),
    package: z.string().check((context) => {
      const {validForNewPackages, errors, warnings} = validatePackageName(
        context.value,
      );
      if (!validForNewPackages) {
        for (const message of [...(errors ?? []), ...(warnings ?? [])]) {
          context.issues.push({
            code: 'custom',
            message,
            input: context.value,
          });
        }
      }
    }),
    public: z.boolean().default(false),
    description: z.string(),
    author: z.string().min(1),
    typescript: z.boolean(),
    testing: z.boolean().default(false),
    reportCodeCoverage: z.boolean().default(false),
    githubOwner: z.string().regex(/^[\w-.]+$/),
    githubRepository: z.string().regex(/^[\w-.]+$/),
    path: z
      .string()
      .min(1)
      .check((context) => {
        const exists = fs.existsSync(context.value);
        if (exists) {
          if (!fs.statSync(context.value).isDirectory()) {
            context.issues.push({
              code: 'custom',
              message: 'Expected an empty directory, received a file.',
              input: context.value,
            });
            return z.NEVER;
          }

          const {files} = fs.statfsSync(context.value);
          if (files !== 0) {
            context.issues.push({
              code: 'custom',
              message: [
                'Expected an empty directory, received a directory with',
                `${files} file${files === 1 ? '' : 's'}.`,
              ].join(' '),
              input: context.value,
            });
          }
        }
      }),
    dryRun: z.boolean().default(false),
  })
  .strict(); // @todo Remove this

type OptionsInput = z.input<typeof schema>;
type Options = z.infer<typeof schema>;

export {schema, schema as options, type Options, type OptionsInput};
