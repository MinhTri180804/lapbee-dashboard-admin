import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ProblemError } from '@/shared/api/errors';

/**
 * Maps a backend problem onto a react-hook-form instance. Returns false (and does nothing)
 * when `error` is not a `ProblemError`, so callers can fall back to a toast.
 *
 * Each field error goes to `pathMap[path]`, else to the path itself when the form knows it
 * (`knownFields`; when omitted every path is assumed to be a field). Errors for unknown paths
 * are joined with a space into one `root.server` message. A problem without field errors
 * reports its `detail` at `root.server`.
 */
export function applyProblemToForm<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  pathMap: Partial<Record<string, Path<T>>> = {},
  knownFields?: readonly string[],
): boolean {
  if (!(error instanceof ProblemError)) return false;

  if (error.fieldErrors.length === 0) {
    setError('root.server', { type: 'server', message: error.detail });
    return true;
  }

  const unmatched: string[] = [];
  for (const { path, message } of error.fieldErrors) {
    const mapped = pathMap[path];
    if (mapped !== undefined) {
      setError(mapped, { type: 'server', message });
    } else if (knownFields === undefined || knownFields.includes(path)) {
      // The backend path is only known to be a field of T by the caller's say-so.
      setError(path as Path<T>, { type: 'server', message });
    } else {
      unmatched.push(message);
    }
  }
  if (unmatched.length > 0) {
    setError('root.server', { type: 'server', message: unmatched.join(' ') });
  }
  return true;
}
