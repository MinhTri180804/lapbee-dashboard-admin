import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { postRepo } from '../api/repo';
import { postKeys, toPostQuery, type PostList, type PostListParams } from '../model/adapters';

/** One page of the list (8 posts); the previous page stays on screen while the next one loads. */
export function usePosts(params: PostListParams): UseQueryResult<PostList> {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => postRepo.list(toPostQuery(params)),
    placeholderData: keepPreviousData,
  });
}
