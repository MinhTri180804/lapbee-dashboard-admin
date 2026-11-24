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

/**
 * `handlesErrors` defaults to true (the form shows field errors). List callers (toggle,
 * reorder) pass `{ handlesErrors: false }` so non-conflict failures get the global toast.
 */
export function useUpdateItem<K extends ItemKind>(
  kind: K,
  { handlesErrors = true }: { handlesErrors?: boolean } = {},
): UseMutationResult<SiteDto, Error, { id: string; body: ItemPatchBodyMap[K] }> {
  const qc = useQueryClient();
  return useMutation({
    meta: { invalidates: [siteKeys.detail], handlesErrors },
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
    meta: { invalidates: [siteKeys.detail], handlesErrors: true },
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      siteRepo.deleteItem(kind, id, version),
    onSuccess: (site) => {
      qc.setQueryData(siteKeys.detail, site);
    },
  });
}
