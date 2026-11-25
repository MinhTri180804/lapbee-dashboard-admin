import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { Body } from '@/shared/api/types';
import { mediaRepo, type FolderDto } from '../api/repo';
import { mediaKeys } from '../model/adapters';

export type FolderCreateBody = { name: string; parentId: string | null };
export type FolderPatchBody = Body<'/admin/v1/media/folders/{id}', 'patch'>;

/** Folder dialogs show `folderErrorMessage(code)` themselves. */
export function useCreateFolder(): UseMutationResult<FolderDto, Error, FolderCreateBody> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [mediaKeys.all], handlesErrors: true },
    mutationFn: (body: FolderCreateBody) => mediaRepo.folders.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

export function useUpdateFolder(): UseMutationResult<
  FolderDto,
  Error,
  { id: string; body: FolderPatchBody }
> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [mediaKeys.all], handlesErrors: true },
    mutationFn: ({ id, body }: { id: string; body: FolderPatchBody }) =>
      mediaRepo.folders.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

export function useDeleteFolder(): UseMutationResult<void, Error, { id: string; version: number }> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [mediaKeys.all], handlesErrors: true },
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      mediaRepo.folders.remove(id, version),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}
