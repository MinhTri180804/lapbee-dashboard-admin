import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { sessionStore } from '@/shared/auth/session-store';
import { authRepo } from '../api/repo';

/** Signs out locally and drops the query cache whether or not the server call succeeded. */
export function useLogout(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { handlesErrors: true },
    mutationFn: () => authRepo.logout(),
    onSettled: () => {
      sessionStore.signOut();
      queryClient.clear();
    },
  });
}
