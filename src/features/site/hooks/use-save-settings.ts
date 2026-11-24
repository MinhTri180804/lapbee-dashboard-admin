import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { siteRepo } from '../api/repo';
import { siteKeys } from '../model/keys';
import type { SettingsPatch, SiteDto } from '../model/types';

/** No `handlesErrors`: VERSION_CONFLICT must reach the global conflict dialog. */
export function useSaveSettings(): UseMutationResult<SiteDto, Error, SettingsPatch> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [siteKeys.detail] },
    mutationFn: (body: SettingsPatch) => siteRepo.patchSettings(body),
    onSuccess: (site) => {
      qc.setQueryData(siteKeys.detail, site);
    },
  });
}
