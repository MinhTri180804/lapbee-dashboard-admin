import type { Res } from '@/shared/api/types';

export const meFixture = {
  user: {
    id: '0b7c2a4e-5d1f-4c3a-9e8b-1f2d3c4b5a69',
    email: 'admin@lapbee.test',
    name: 'Quản trị viên',
  },
  permissions: ['*'],
  csrfToken: 'csrf-fixture',
} satisfies Res<'/admin/v1/auth/me', 'get', 200>;
