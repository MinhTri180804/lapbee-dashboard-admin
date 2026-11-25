import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type UseMutationResult,
} from '@tanstack/react-query';
import { mediaRepo, type MediaDto, type MediaList } from '../api/repo';
import { mediaKeys } from '../model/adapters';

export type UploadMediaInput = { file: File; folderId: string | null };

/** The caller shows upload errors itself. Every media query is invalidated after the upload. */
export function useUploadMedia(): UseMutationResult<MediaDto, Error, UploadMediaInput> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { handlesErrors: true, invalidates: [mediaKeys.all] },
    mutationFn: ({ file, folderId }: UploadMediaInput) =>
      mediaRepo.upload(file, folderId ? { folderId } : {}),
    onSuccess: (created) => {
      queryClient.setQueriesData<InfiniteData<MediaList, number>>(
        { queryKey: [...mediaKeys.all, 'list'] },
        (data) => {
          const first = data?.pages[0];
          if (!data || !first) return data;
          const rest = data.pages.slice(1);
          return {
            ...data,
            pages: [
              { ...first, items: [created, ...first.items], total: first.total + 1 },
              ...rest,
            ],
          } satisfies InfiniteData<MediaList, number>;
        },
      );
    },
  });
}
