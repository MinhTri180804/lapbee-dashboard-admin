import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { siteRepo, type PublishResult } from '../api/repo';
import { siteKeys } from '../model/keys';
import type { SettingsPatch, SiteDto } from '../model/types';

export type PublishInput = {
  settingsPatch: SettingsPatch | null;
  draftHash: string;
  /**
   * Called with the PATCH response once the settings are saved, before publishing. An error
   * after this call comes from the publish step; an error before it, from the PATCH.
   */
  onPatched?: (site: SiteDto) => void;
};

/**
 * Saves pending settings first (its response carries the new `draftHash`), then publishes.
 * If publish fails after the PATCH succeeded, the cache already holds the patched site.
 */
export function usePublishSite(): UseMutationResult<PublishResult, Error, PublishInput> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [siteKeys.detail], handlesErrors: true },
    mutationFn: async ({ settingsPatch, draftHash, onPatched }: PublishInput) => {
      let hash = draftHash;
      if (settingsPatch !== null) {
        const site = await siteRepo.patchSettings(settingsPatch);
        qc.setQueryData(siteKeys.detail, site);
        onPatched?.(site);
        hash = site.draftHash;
      }
      return siteRepo.publish(hash);
    },
    onSuccess: ({ site }) => {
      qc.setQueryData(siteKeys.detail, site);
      void qc.invalidateQueries({ queryKey: ['site', 'publications'] });
    },
  });
}
