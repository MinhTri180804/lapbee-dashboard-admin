import type { CategoryDto } from '../api/repo';

export type { CategoryDto };

export const categoryKeys = {
  all: ['categories'] as const,
};

const CATEGORY_ERRORS: Record<string, string> = {
  CATEGORY_NAME_TAKEN: 'Đã có chuyên mục cùng tên.',
  SLUG_TAKEN: 'Đường dẫn này đã được dùng.',
};

/** CATEGORY_NOT_EMPTY has no fixed copy: the UI builds the sentence with the post count. */
export function categoryErrorMessage(code: string | undefined): string | null {
  return (code && CATEGORY_ERRORS[code]) || null;
}
