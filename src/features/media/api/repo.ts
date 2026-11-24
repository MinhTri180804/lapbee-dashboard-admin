import { http } from '@/shared/api/client';
import type { Query, Res } from '@/shared/api/types';

export type MediaList = Res<'/admin/v1/media', 'get', 200>;
export type MediaDto = MediaList['items'][number];
export type MediaQuery = Query<'/admin/v1/media', 'get'>;

export const mediaRepo = {
  async list(query: MediaQuery): Promise<MediaList> {
    return (await http.get<MediaList>('/media', { params: query })).data;
  },
  /** Multipart: the browser sets the Content-Type boundary, so no header is passed. */
  async upload(file: File): Promise<MediaDto> {
    const form = new FormData();
    form.append('file', file);
    return (await http.post<MediaDto>('/media', form)).data;
  },
};
