import type { paths } from './generated/schema';

export type ApiPath = keyof paths;

type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'patch';

/** Methods actually defined (not `?: never`) for a path. */
export type ApiMethod<P extends ApiPath> = {
  [M in HttpMethod]: paths[P] extends Record<M, infer Op>
    ? Op extends undefined
      ? never
      : [Op] extends [never]
        ? never
        : M
    : never;
}[HttpMethod];

type Op<P extends ApiPath, M extends ApiMethod<P>> = NonNullable<paths[P][M & keyof paths[P]]>;

type JsonContent<C> = C extends { 'application/json': infer J } ? J : undefined;

type ParamsOf<O, K extends 'query' | 'path'> = O extends { parameters: infer Params }
  ? Params extends { [Key in K]?: infer V }
    ? NonNullable<V>
    : undefined
  : undefined;

/** JSON request body; `undefined` when the operation has none (multipart bodies are not supported). */
export type Body<P extends ApiPath, M extends ApiMethod<P>> =
  Op<P, M> extends { requestBody?: infer R }
    ? JsonContent<NonNullable<R> extends { content: infer C } ? C : never>
    : undefined;

/** JSON body of the response with status `S`; `undefined` when it has no body (e.g. 204). */
export type Res<P extends ApiPath, M extends ApiMethod<P>, S extends number> =
  Op<P, M> extends { responses: infer R }
    ? S extends keyof R
      ? R[S] extends { content: infer C }
        ? JsonContent<C>
        : undefined
      : never
    : never;

export type Query<P extends ApiPath, M extends ApiMethod<P>> = ParamsOf<Op<P, M>, 'query'>;

export type PathParams<P extends ApiPath, M extends ApiMethod<P>> = ParamsOf<Op<P, M>, 'path'>;
