import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { mediaRepo, type MediaDetailDto } from '../api/repo';
import { mediaKeys } from '../model/adapters';

export function useMediaDetail(id: string | null): UseQueryResult<MediaDetailDto> {
  return useQuery({
    queryKey: mediaKeys.detail(id ?? ''),
    enabled: id !== null,
    queryFn: () => mediaRepo.get(id ?? ''),
  });
}
