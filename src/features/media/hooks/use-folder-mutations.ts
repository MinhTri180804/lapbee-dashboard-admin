import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { Body } from '@/shared/api/types';
import { mediaRepo, type FolderDto } from '../api/repo';
import { mediaKeys, type MediaListParams } from '../model/adapters';

export type FolderCreateBody = Body<'/admin/v1/media/folders', 'post'>;
export type FolderPatchBody = Body<'/admin/v1/media/folders/{id}', 'patch'>;

/** A `mediaKeys.list(…)` key for the given folder. */
function isFolderList(key: readonly unknown[], folder: MediaListParams['folder']): boolean {
  const params = key[2];
  return typeof params === 'object' && params !== null && 'folder' in params
    ? params.folder === folder
    : false;
}

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
    onSuccess: (_data, { id }) => {
      // The list of the deleted folder is still on screen until the caller moves up a level;
      // refetching it would 400 (unknown folderId) into a toast.
      qc.removeQueries({
        queryKey: ['media', 'list'],
        predicate: (q) => isFolderList(q.queryKey, id),
      });
      void qc.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}
