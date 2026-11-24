import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { siteRepo } from '../api/repo';
import { siteKeys } from '../model/keys';
import type { SiteDto } from '../model/types';

/** Variable: the `draftHash` of the latest site response. */
export function useRevertSite(): UseMutationResult<SiteDto, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [siteKeys.detail] },
    mutationFn: (draftHash: string) => siteRepo.revert(draftHash),
    onSuccess: (site) => {
      qc.setQueryData(siteKeys.detail, site);
    },
  });
}
