import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { siteRepo } from '../api/repo';
import { toSiteView } from '../model/adapters';
import { siteKeys } from '../model/keys';
import type { SiteView } from '../model/types';

export function useSite(): UseQueryResult<SiteView> {
  return useQuery({
    queryKey: siteKeys.detail,
    queryFn: () => siteRepo.get(),
    select: toSiteView,
  });
}
