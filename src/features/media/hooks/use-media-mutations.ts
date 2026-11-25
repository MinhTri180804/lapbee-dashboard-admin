import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { Body } from '@/shared/api/types';
import { mediaRepo, type MediaDto } from '../api/repo';
import { mediaKeys } from '../model/adapters';

export type MediaPatchBody = Body<'/admin/v1/media/{id}', 'patch'>;

/** The detail panel shows field errors itself. */
export function useUpdateMedia(): UseMutationResult<
  MediaDto,
  Error,
  { id: string; body: MediaPatchBody }
> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [mediaKeys.all], handlesErrors: true },
    mutationFn: ({ id, body }: { id: string; body: MediaPatchBody }) =>
      mediaRepo.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.all }),
  });
}

export function useDeleteMedia(): UseMutationResult<void, Error, { id: string; version: number }> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [mediaKeys.all], handlesErrors: true },
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      mediaRepo.remove(id, version),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.all }),
  });
}

export function useMoveMedia(): UseMutationResult<
  { moved: number },
  Error,
  { ids: string[]; folderId: string | null }
> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [mediaKeys.all] },
    mutationFn: ({ ids, folderId }: { ids: string[]; folderId: string | null }) =>
      mediaRepo.move(ids, folderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.all }),
  });
}
