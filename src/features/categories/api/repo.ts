import { http } from '@/shared/api/client';
import type { Body, Res } from '@/shared/api/types';

export type CategoryList = Res<'/admin/v1/categories', 'get', 200>;
export type CategoryDto = CategoryList['items'][number];

export const categoryRepo = {
  async list(): Promise<CategoryDto[]> {
    return (await http.get<CategoryList>('/categories')).data.items;
  },
  async create(body: Body<'/admin/v1/categories', 'post'>): Promise<CategoryDto> {
    return (await http.post<CategoryDto>('/categories', body)).data;
  },
  async update(id: string, body: Body<'/admin/v1/categories/{id}', 'patch'>): Promise<CategoryDto> {
    return (await http.patch<CategoryDto>(`/categories/${id}`, body)).data;
  },
  async remove(id: string, version: number): Promise<void> {
    await http.delete(`/categories/${id}`, { params: { version } });
  },
};
