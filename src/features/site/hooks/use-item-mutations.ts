import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { siteRepo, type CreateItemResult } from '../api/repo';
import { siteKeys } from '../model/keys';
import type { ItemCreateBodyMap, ItemKind, ItemPatchBodyMap, SiteDto } from '../model/types';

export function useCreateItem<K extends ItemKind>(
  kind: K,
): UseMutationResult<CreateItemResult, Error, ItemCreateBodyMap[K]> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [siteKeys.detail], handlesErrors: true },
    mutationFn: (body: ItemCreateBodyMap[K]) => siteRepo.createItem(kind, body),
    onSuccess: ({ site }) => {
      qc.setQueryData(siteKeys.detail, site);
    },
  });
}

/** No `handlesErrors`: the global handler must see VERSION_CONFLICT to open the conflict dialog. */
export function useUpdateItem<K extends ItemKind>(
  kind: K,
): UseMutationResult<SiteDto, Error, { id: string; body: ItemPatchBodyMap[K] }> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [siteKeys.detail] },
    mutationFn: ({ id, body }: { id: string; body: ItemPatchBodyMap[K] }) =>
      siteRepo.patchItem(kind, id, body),
    onSuccess: (site) => {
      qc.setQueryData(siteKeys.detail, site);
    },
  });
}

export function useDeleteItem(
  kind: ItemKind,
): UseMutationResult<SiteDto, Error, { id: string; version: number }> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [siteKeys.detail] },
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      siteRepo.deleteItem(kind, id, version),
    onSuccess: (site) => {
      qc.setQueryData(siteKeys.detail, site);
    },
  });
}
