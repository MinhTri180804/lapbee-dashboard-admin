import { http } from '@/shared/api/client';
import type { Query, Res } from '@/shared/api/types';

export type PostList = Res<'/admin/v1/posts', 'get', 200>;
export type PostListItem = PostList['items'][number];
export type PostQuery = Query<'/admin/v1/posts', 'get'>;

export const postRepo = {
  async list(query: PostQuery): Promise<PostList> {
    return (await http.get<PostList>('/posts', { params: query })).data;
  },
};
