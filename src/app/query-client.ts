import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isProblem, ProblemError, ReauthCancelledError } from '@/shared/api/errors';
import { emit } from '@/shared/api/events';
import { messageFor } from '@/shared/form/error-messages';

/** `meta` understood by the global error handler. */
export type AppQueryMeta = {
  /** Keys the conflict dialog invalidates on "Tải lại" after `VERSION_CONFLICT`. */
  invalidates?: readonly (readonly unknown[])[];
  /** The caller shows the error itself (e.g. on form fields): no global toast. */
  handlesErrors?: boolean;
};

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: AppQueryMeta;
    mutationMeta: AppQueryMeta;
  }
}

const MAX_RETRIES = 2;

/** Global error policy (spec §4.4): conflict → dialog event, the rest → toast. */
function handleError(error: unknown, meta: AppQueryMeta | undefined): void {
  if (error instanceof ReauthCancelledError) return;
  // `session:expired` already signs out and redirects.
  if (isProblem(error, 'UNAUTHENTICATED')) return;
  // The conflict dialog is global (spec §4.4); `handlesErrors` only suppresses the toast.
  if (isProblem(error, 'VERSION_CONFLICT')) {
    emit('conflict', { invalidates: meta?.invalidates ?? [] });
    return;
  }
  if (meta?.handlesErrors === true) return;
  emit('toast', { kind: 'error', title: messageFor(error) });
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // A first-load failure is the page's to show; only background refetch failures toast.
        if (query.state.data === undefined) return;
        handleError(error, query.meta);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        handleError(error, mutation.meta);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // A problem response is the server's answer; asking again will not change it.
        retry: (failureCount, error) =>
          !(error instanceof ProblemError) && failureCount < MAX_RETRIES,
      },
    },
  });
}
