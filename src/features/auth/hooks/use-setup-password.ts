import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { authRepo, type SetupPasswordBody } from '../api/repo';

export function useSetupPassword(): UseMutationResult<void, Error, SetupPasswordBody> {
  return useMutation({
    meta: { handlesErrors: true },
    mutationFn: (body: SetupPasswordBody) => authRepo.setupPassword(body),
  });
}
