import { toNestErrors } from '@hookform/resolvers';
import type { FieldError, FieldValues, Resolver } from 'react-hook-form';
import { z } from 'zod';

const REQUIRED = 'Không được để trống.';
const YEAR_DIGITS = 'Năm gồm 4 chữ số.';
const YEAR_INVALID = 'Năm không hợp lệ.';

const required = z.string().trim().min(1, REQUIRED);

/** Only the fields the client checks; the rest pass through to the server's own checks. */
export const serviceSchema = z.looseObject({ title: required });

export function teamSchema(currentYear: number) {
  return z.looseObject({
    name: required,
    since: z
      .number({ error: YEAR_INVALID })
      .int(YEAR_INVALID)
      .min(1900, YEAR_INVALID)
      .max(currentYear, YEAR_INVALID),
  });
}

export const timelineSchema = z
  .looseObject({
    year: z
      .string()
      .trim()
      .min(1, REQUIRED)
      .regex(/^\d{4}$/, YEAR_DIGITS),
    title: required,
    media: z.string(),
    quote: z.looseObject({ text: z.string() }),
  })
  .superRefine(
    (v, ctx) => {
      if (v.media === 'quote' && !v.quote.text.trim()) {
        ctx.addIssue({ code: 'custom', path: ['quote', 'text'], message: REQUIRED });
      }
    },
    // Also check the quote while other fields are invalid, so every error shows at once.
    { when: () => true },
  );

/**
 * A react-hook-form resolver that runs `schema` but keeps the form's own values on success
 * (the schemas only check part of the form). The first issue of each path wins.
 */
export function itemResolver<T extends FieldValues>(schema: z.ZodType): Resolver<T> {
  return (values, _context, options) => {
    const result = schema.safeParse(values);
    if (result.success) return { values, errors: {} };
    const flat: Record<string, FieldError> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.map(String).join('.');
      flat[path] ??= { type: issue.code, message: issue.message };
    }
    return { values: {}, errors: toNestErrors(flat, options) };
  };
}
