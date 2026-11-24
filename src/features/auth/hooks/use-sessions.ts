import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { authRepo } from '../api/repo';
import { authKeys, toSessionRow, type SessionRow } from '../model/adapters';

export function useSessions(): UseQueryResult<SessionRow[]> {
  return useQuery({
    queryKey: authKeys.sessions,
    queryFn: async () => (await authRepo.listSessions()).items.map(toSessionRow),
  });
}
