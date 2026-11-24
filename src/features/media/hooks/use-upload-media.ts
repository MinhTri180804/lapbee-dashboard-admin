import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type UseMutationResult,
} from '@tanstack/react-query';
import { mediaRepo, type MediaDto, type MediaList } from '../api/repo';
import { mediaKeys } from '../model/adapters';

/** The caller shows upload errors itself. The new item is put first in every cached list. */
export function useUploadMedia(): UseMutationResult<MediaDto, Error, File> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { handlesErrors: true },
    mutationFn: (file: File) => mediaRepo.upload(file),
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
