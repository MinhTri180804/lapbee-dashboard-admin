import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { mediaRepo, type MediaList, type MediaQuery } from '../api/repo';
import { mediaKeys, type MediaListParams } from '../model/adapters';

export const MEDIA_PER_PAGE = 40;

/** The backend ignores `folderId` when `q` is set, so a search never sends it. */
function toQuery(params: MediaListParams, page: number): MediaQuery {
  const query: MediaQuery = { perPage: MEDIA_PER_PAGE, page };
  if (params.q) query.q = params.q;
  else if (params.folder !== null) query.folderId = params.folder;
  if (params.used === false) query.used = 'false';
  return query;
}

export function useMediaList(
  params: MediaListParams,
  enabled = true,
): UseInfiniteQueryResult<InfiniteData<MediaList, number>> {
  return useInfiniteQuery({
    queryKey: mediaKeys.list(params),
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => mediaRepo.list(toQuery(params, pageParam)),
    getNextPageParam: (last) => (last.page * last.perPage < last.total ? last.page + 1 : undefined),
  });
}
