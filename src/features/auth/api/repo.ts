import { http } from '@/shared/api/client';
import type { Body, Res } from '@/shared/api/types';

export type LoginBody = Body<'/admin/v1/auth/login', 'post'>;
export type LoginResult = Res<'/admin/v1/auth/login', 'post', 200>;
export type MeResult = Res<'/admin/v1/auth/me', 'get', 200>;
export type ChangePasswordBody = Body<'/admin/v1/auth/password', 'post'>;
export type ChangePasswordResult = Res<'/admin/v1/auth/password', 'post', 200>;
export type SetupPasswordBody = Body<'/admin/v1/auth/setup-password', 'post'>;
export type SessionList = Res<'/admin/v1/auth/sessions', 'get', 200>;
export type SessionDto = SessionList['items'][number];

export const authRepo = {
  async login(body: LoginBody): Promise<LoginResult> {
    return (await http.post<LoginResult>('/auth/login', body)).data;
  },
  async me(opts: { lbSkipSessionExpired?: boolean } = {}): Promise<MeResult> {
    return (await http.get<MeResult>('/auth/me', opts)).data;
  },
  async logout(): Promise<void> {
    await http.post('/auth/logout');
  },
  async reauth(password: string): Promise<void> {
    await http.post('/auth/reauth', { password } satisfies Body<'/admin/v1/auth/reauth', 'post'>);
  },
  async changePassword(body: ChangePasswordBody): Promise<ChangePasswordResult> {
    return (await http.post<ChangePasswordResult>('/auth/password', body)).data;
  },
  async setupPassword(body: SetupPasswordBody): Promise<void> {
    await http.post('/auth/setup-password', body);
  },
  async listSessions(): Promise<SessionList> {
    return (await http.get<SessionList>('/auth/sessions')).data;
  },
  async revokeSession(id: string): Promise<void> {
    await http.delete(`/auth/sessions/${encodeURIComponent(id)}`);
  },
};
