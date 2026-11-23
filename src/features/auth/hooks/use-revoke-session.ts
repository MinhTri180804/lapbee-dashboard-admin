import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { sessionStore } from '@/shared/auth/session-store';
import { authRepo } from '../api/repo';
import { authKeys } from '../model/adapters';

/** The row being revoked: `current` (from the sessions list) tells the hook it is the caller's own session. */
export type RevokeTarget = { id: string; current: boolean };

/** Revoking the current session ends it: the store is cleared and the cache dropped. */
export function useRevokeSession(): UseMutationResult<void, Error, RevokeTarget> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: RevokeTarget) => authRepo.revokeSession(id),
    onSuccess: async (_data, { current }) => {
      if (current) {
        sessionStore.signOut();
        queryClient.clear();
        return;
      }
      await queryClient.invalidateQueries({ queryKey: authKeys.sessions });
    },
  });
}
