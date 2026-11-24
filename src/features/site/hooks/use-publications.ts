import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { siteRepo, type PublicationList } from '../api/repo';
import { siteKeys } from '../model/keys';

export function usePublications(page: number): UseQueryResult<PublicationList> {
  return useQuery({
    queryKey: siteKeys.publications(page),
    queryFn: () => siteRepo.publications(page),
    placeholderData: keepPreviousData,
  });
}
