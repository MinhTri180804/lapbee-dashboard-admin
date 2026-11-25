import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { mediaRepo, type MediaDto } from '../api/repo';
import { mediaKeys } from '../model/adapters';

export type UploadMediaInput = { file: File; folderId: string | null };

/** The caller shows upload errors itself. Every media query is invalidated after the upload. */
export function useUploadMedia(): UseMutationResult<MediaDto, Error, UploadMediaInput> {
  return useMutation({
    meta: { handlesErrors: true, invalidates: [mediaKeys.all] },
    mutationFn: ({ file, folderId }: UploadMediaInput) =>
      mediaRepo.upload(file, folderId ? { folderId } : {}),
  });
}
