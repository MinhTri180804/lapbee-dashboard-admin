import { useQuery } from '@tanstack/react-query';
import { useCan } from '@/shared/auth/permissions';
import { usersRepo } from '../api/repo';

const FIVE_MINUTES = 5 * 60 * 1000;

/** Map of user id to display name; stays empty unless the viewer has `user.read`. */
export function useUserNames(): Map<string, string> {
  const canRead = useCan('user.read');
  const { data } = useQuery({
    queryKey: ['site', 'user-names'],
    queryFn: async () => new Map((await usersRepo.list()).items.map((u) => [u.id, u.name])),
    enabled: canRead,
    staleTime: FIVE_MINUTES,
  });
  return data ?? new Map<string, string>();
}
