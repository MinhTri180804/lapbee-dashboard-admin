import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { mediaRepo, type MediaDetailDto } from '../api/repo';
import { mediaKeys } from '../model/adapters';

/**
 * `paused` keeps the cached copy but never fetches: the panel sets it while deleting, so a
 * re-render after the delete removed the query does not fetch the deleted image again.
 */
export function useMediaDetail(
  id: string | null,
  { paused = false }: { paused?: boolean } = {},
): UseQueryResult<MediaDetailDto> {
  return useQuery({
    queryKey: mediaKeys.detail(id ?? ''),
    enabled: id !== null && !paused,
    queryFn: () => mediaRepo.get(id ?? ''),
  });
}
