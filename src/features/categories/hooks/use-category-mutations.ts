import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import type { Body } from '@/shared/api/types';
import { categoryRepo, type CategoryDto } from '../api/repo';
import { categoryKeys } from '../model/adapters';

export type CategoryCreateBody = Body<'/admin/v1/categories', 'post'>;
export type CategoryPatchBody = Body<'/admin/v1/categories/{id}', 'patch'>;

/** Post lists carry category tags and counts, so they go stale with every category change. */
function invalidateCategoryData(qc: QueryClient): void {
  void qc.invalidateQueries({ queryKey: categoryKeys.all });
  void qc.invalidateQueries({ queryKey: ['posts'] });
}

/** Category dialogs show `categoryErrorMessage(code)` themselves. */
export function useCreateCategory(): UseMutationResult<CategoryDto, Error, CategoryCreateBody> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [categoryKeys.all], handlesErrors: true },
    mutationFn: (body: CategoryCreateBody) => categoryRepo.create(body),
    onSuccess: () => {
      invalidateCategoryData(qc);
    },
  });
}

export function useUpdateCategory(): UseMutationResult<
  CategoryDto,
  Error,
  { id: string; body: CategoryPatchBody }
> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [categoryKeys.all], handlesErrors: true },
    mutationFn: ({ id, body }: { id: string; body: CategoryPatchBody }) =>
      categoryRepo.update(id, body),
    onSuccess: () => {
      invalidateCategoryData(qc);
    },
  });
}

export function useDeleteCategory(): UseMutationResult<
  void,
  Error,
  { id: string; version: number }
> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [categoryKeys.all], handlesErrors: true },
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      categoryRepo.remove(id, version),
    onSuccess: () => {
      invalidateCategoryData(qc);
    },
  });
}
