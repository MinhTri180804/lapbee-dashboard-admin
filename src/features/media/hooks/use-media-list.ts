import { useInfiniteQuery, type InfiniteData, type UseInfiniteQueryResult } from '@tanstack/react-query';
import { mediaRepo, type MediaList } from '../api/repo';
import { mediaKeys } from '../model/adapters';

export const MEDIA_PER_PAGE = 40;

export function useMediaList(
  q: string,
  enabled: boolean,
): UseInfiniteQueryResult<InfiniteData<MediaList, number>> {
  return useInfiniteQuery({
    queryKey: mediaKeys.list(q),
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      mediaRepo.list({ perPage: MEDIA_PER_PAGE, page: pageParam, ...(q ? { q } : {}) }),
    getNextPageParam: (last) => (last.page * last.perPage < last.total ? last.page + 1 : undefined),
  });
}
