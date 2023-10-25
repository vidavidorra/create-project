import fs from 'node:fs';
import {z} from 'zod';
import validatePackageName from 'validate-npm-package-name';

const schema = z
  .object({
    project: z.string().min(1),
    package: z.string().superRefine((value, ctx) => {
      const {validForNewPackages, errors, warnings} =
        validatePackageName(value);
      if (!validForNewPackages) {
        for (const message of [...(errors ?? []), ...(warnings ?? [])]) {
          ctx.addIssue({code: z.ZodIssueCode.custom, message});
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
      .superRefine((value, ctx) => {
        const exists = fs.existsSync(value);
        if (exists) {
          if (!fs.statSync(value).isDirectory()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Expected an empty directory, received a file.',
            });
            return z.NEVER;
          }

          const {files} = fs.statfsSync(value);
          if (files !== 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: [
                'Expected an empty directory, received a directory with',
                `${files} file${files === 1 ? '' : 's'}.`,
              ].join(' '),
            });
          }
        }
      }),
    dryRun: z.boolean().default(false),
  })
  .strict();

type OptionsInput = z.input<typeof schema>;
type Options = z.infer<typeof schema>;

export {schema, schema as options, type Options, type OptionsInput};
