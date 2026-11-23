import { HttpResponse } from 'msw';
import type { components } from '@/shared/api/generated/schema';

type Problem = components['schemas']['Problem'];

const titles: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  413: 'Payload Too Large',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
};

/** An `application/problem+json` response shaped like the backend's `Problem` schema. */
export function problem(
  status: number,
  code: string,
  extra: Partial<Problem> & Record<string, unknown> = {},
): HttpResponse<string> {
  const body = {
    type: 'about:blank',
    title: titles[status] ?? 'Error',
    status,
    code,
    detail: `Problem ${code}`,
  } satisfies Problem;
  return new HttpResponse(JSON.stringify({ ...body, ...extra }), {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}
