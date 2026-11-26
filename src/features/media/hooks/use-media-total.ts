import { useQuery } from '@tanstack/react-query';
import { mediaRepo } from '../api/repo';
import { mediaKeys } from '../model/adapters';

/** "Tất cả ảnh" (no argument) or "Chưa dùng" (`false`) count: `total` of a one-item page. */
export function useMediaTotal(used?: false): number | undefined {
  const query = useQuery({
    queryKey: mediaKeys.total(used),
    queryFn: () => mediaRepo.list({ perPage: 1, ...(used === false ? { used: 'false' } : {}) }),
    select: (list) => list.total,
  });
  return query.data;
}
