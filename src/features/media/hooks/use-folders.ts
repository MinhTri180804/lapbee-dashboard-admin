import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import { mediaRepo, type FolderDto } from '../api/repo';
import { mediaKeys } from '../model/adapters';
import { buildFolderTree, type FolderNode } from '../model/folder-tree';

const NO_FOLDERS: FolderDto[] = [];

export function useFolders(): {
  tree: FolderNode[];
  flat: FolderDto[];
  query: UseQueryResult<FolderDto[]>;
} {
  const query = useQuery({ queryKey: mediaKeys.folders, queryFn: () => mediaRepo.folders.list() });
  const flat = query.data ?? NO_FOLDERS;
  const tree = useMemo(() => buildFolderTree(flat), [flat]);
  return { tree, flat, query };
}
