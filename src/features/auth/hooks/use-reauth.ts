import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { authRepo } from '../api/repo';

/** Step-up password check. The dialog shows errors on its field, so no global toast. */
export function useReauth(): UseMutationResult<void, Error, string> {
  return useMutation({
    meta: { handlesErrors: true },
    mutationFn: (password: string) => authRepo.reauth(password),
  });
}
