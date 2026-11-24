import { http } from '@/shared/api/client';
import type { Body, Res } from '@/shared/api/types';
import type {
  ItemCreateBodyMap,
  ItemKind,
  ItemPatchBodyMap,
  SettingsPatch,
  SiteDto,
} from '../model/types';

export type PublishResult = Res<'/admin/v1/site/publish', 'post', 200>;
export type PublicationList = Res<'/admin/v1/site/publications', 'get', 200>;
export type PublicationDto = PublicationList['items'][number];
/** Same shape for every kind: `{ id, site }`. */
export type CreateItemResult = Res<'/admin/v1/site/services', 'post', 201>;

export const siteRepo = {
  async get(): Promise<SiteDto> {
    return (await http.get<SiteDto>('/site')).data;
  },
  async patchSettings(body: SettingsPatch): Promise<SiteDto> {
    return (await http.patch<SiteDto>('/site/settings', body)).data;
  },
  async createItem<K extends ItemKind>(
    kind: K,
    body: ItemCreateBodyMap[K],
  ): Promise<CreateItemResult> {
    return (await http.post<CreateItemResult>(`/site/${kind}`, body)).data;
  },
  async patchItem<K extends ItemKind>(
    kind: K,
    id: string,
    body: ItemPatchBodyMap[K],
  ): Promise<SiteDto> {
    return (await http.patch<SiteDto>(`/site/${kind}/${encodeURIComponent(id)}`, body)).data;
  },
  async deleteItem(kind: ItemKind, id: string, version: number): Promise<SiteDto> {
    return (
      await http.delete<SiteDto>(`/site/${kind}/${encodeURIComponent(id)}`, {
        params: { version },
      })
    ).data;
  },
  async publish(draftHash: string): Promise<PublishResult> {
    return (
      await http.post<PublishResult>('/site/publish', {
        draftHash,
      } satisfies Body<'/admin/v1/site/publish', 'post'>)
    ).data;
  },
  async revert(draftHash: string): Promise<SiteDto> {
    return (
      await http.post<SiteDto>('/site/revert', {
        draftHash,
      } satisfies Body<'/admin/v1/site/revert', 'post'>)
    ).data;
  },
  async publications(page: number, perPage = 20): Promise<PublicationList> {
    return (await http.get<PublicationList>('/site/publications', { params: { page, perPage } }))
      .data;
  },
  async restore(id: string, draftHash: string): Promise<SiteDto> {
    return (
      await http.post<SiteDto>(`/site/publications/${encodeURIComponent(id)}/restore-to-draft`, {
        draftHash,
      })
    ).data;
  },
};

export type UserList = Res<'/admin/v1/users', 'get', 200>;

export const usersRepo = {
  async list(): Promise<UserList> {
    return (await http.get<UserList>('/users', { params: { perPage: 100 } })).data;
  },
};
