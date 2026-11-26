import { useQuery } from '@tanstack/react-query';
import { postRepo } from '../api/repo';
import { postKeys } from '../model/adapters';

/** P4-9: every post (drafts and published), from the counts of a one-item page. */
export function usePostsTotal(enabled = true): number | undefined {
  const query = useQuery({
    queryKey: postKeys.total,
    queryFn: () => postRepo.list({ perPage: 1 }),
    select: (list) => list.counts.byStatus.draft + list.counts.byStatus.published,
    enabled,
  });
  return query.data;
}
