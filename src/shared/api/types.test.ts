import type { Body, PathParams, Query, Res } from './types';

describe('api type helpers', () => {
  it('resolves response, body and query types from the OpenAPI schema', () => {
    expectTypeOf<Res<'/admin/v1/auth/me', 'get', 200>>()
      .toHaveProperty('csrfToken')
      .toEqualTypeOf<string>();
    expectTypeOf<Body<'/admin/v1/auth/login', 'post'>>().toEqualTypeOf<{
      email: string;
      password: string;
    }>();
    expectTypeOf<Query<'/admin/v1/posts', 'get'>>().toHaveProperty('status');
  });

  it('handles bodyless responses, bodyless requests and path params', () => {
    expectTypeOf<Res<'/admin/v1/auth/logout', 'post', 204>>().toEqualTypeOf<undefined>();
    expectTypeOf<Body<'/admin/v1/auth/me', 'get'>>().toEqualTypeOf<undefined>();
    expectTypeOf<PathParams<'/admin/v1/posts/{id}', 'get'>>().toHaveProperty('id');
  });
});
