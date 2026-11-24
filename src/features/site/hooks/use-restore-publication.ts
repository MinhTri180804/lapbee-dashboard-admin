import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { siteRepo } from '../api/repo';
import { siteKeys } from '../model/keys';
import type { SiteDto } from '../model/types';

export function useRestorePublication(): UseMutationResult<
  SiteDto,
  Error,
  { id: string; draftHash: string }
> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [siteKeys.detail] },
    mutationFn: ({ id, draftHash }: { id: string; draftHash: string }) =>
      siteRepo.restore(id, draftHash),
    onSuccess: (site) => {
      qc.setQueryData(siteKeys.detail, site);
    },
  });
}
