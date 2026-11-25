import { http } from '@/shared/api/client';
import type { Body, Query, Res } from '@/shared/api/types';

export type MediaList = Res<'/admin/v1/media', 'get', 200>;
export type MediaDto = MediaList['items'][number];
export type MediaQuery = Query<'/admin/v1/media', 'get'>;
export type MediaDetailDto = Res<'/admin/v1/media/{id}', 'get', 200>;
export type FolderDto = Res<'/admin/v1/media/folders', 'get', 200>['items'][number];

export const mediaRepo = {
  async list(query: MediaQuery): Promise<MediaList> {
    return (await http.get<MediaList>('/media', { params: query })).data;
  },
  async get(id: string): Promise<MediaDetailDto> {
    return (await http.get<MediaDetailDto>(`/media/${id}`)).data;
  },
  /** Multipart: the browser sets the Content-Type boundary, so no header is passed. */
  async upload(
    file: File,
    opts: { folderId?: string },
    onProgress?: (ratio: number) => void,
  ): Promise<MediaDto> {
    const form = new FormData();
    form.append('file', file);
    if (opts.folderId) form.append('folderId', opts.folderId);
    return (
      await http.post<MediaDto>('/media', form, {
        onUploadProgress: (event) => {
          if (onProgress && event.progress !== undefined) onProgress(event.progress);
        },
      })
    ).data;
  },
  async update(id: string, body: Body<'/admin/v1/media/{id}', 'patch'>): Promise<MediaDto> {
    return (await http.patch<MediaDto>(`/media/${id}`, body)).data;
  },
  async remove(id: string, version: number): Promise<void> {
    await http.delete(`/media/${id}`, { params: { version } });
  },
  async move(ids: string[], folderId: string | null): Promise<{ moved: number }> {
    return (await http.post<{ moved: number }>('/media/move', { ids, folderId })).data;
  },
  folders: {
    async list(): Promise<FolderDto[]> {
      return (await http.get<{ items: FolderDto[] }>('/media/folders')).data.items;
    },
    async create(body: Body<'/admin/v1/media/folders', 'post'>): Promise<FolderDto> {
      return (await http.post<FolderDto>('/media/folders', body)).data;
    },
    async update(
      id: string,
      body: Body<'/admin/v1/media/folders/{id}', 'patch'>,
    ): Promise<FolderDto> {
      return (await http.patch<FolderDto>(`/media/folders/${id}`, body)).data;
    },
    async remove(id: string, version: number): Promise<void> {
      await http.delete(`/media/folders/${id}`, { params: { version } });
    },
  },
};
