import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { categoryRepo, type CategoryDto } from '../api/repo';
import { categoryKeys } from '../model/adapters';

export function useCategories(enabled = true): UseQueryResult<CategoryDto[]> {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => categoryRepo.list(),
    enabled,
  });
}
