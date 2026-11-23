import axios from 'axios';
import type { components } from './generated/schema';

export type Problem = components['schemas']['Problem'];
export type FieldError = { path: string; message: string };

const problemKeys = new Set(['type', 'title', 'status', 'code', 'detail', 'errors']);

/** A backend `application/problem+json` error. */
export class ProblemError extends Error {
  override readonly name = 'ProblemError';
  readonly status: number;
  readonly code: string;
  readonly title: string;
  readonly detail: string;
  readonly fieldErrors: FieldError[];
  /** Keys outside the `Problem` schema, e.g. `postCount`, `usages`, `mediaCount`, `folderCount`. */
  readonly extras: Record<string, unknown>;

  constructor(body: Problem & Record<string, unknown>, options?: ErrorOptions) {
    super(body.detail || body.title || body.code, options);
    this.status = body.status;
    this.code = body.code;
    this.title = body.title;
    this.detail = body.detail;
    this.fieldErrors = (body.errors ?? []).map(({ path, message }) => ({ path, message }));
    this.extras = Object.fromEntries(Object.entries(body).filter(([k]) => !problemKeys.has(k)));
  }
}

/** The request never got a response (offline, DNS, CORS, aborted connection). */
export class NetworkError extends Error {
  override readonly name = 'NetworkError';

  constructor(options?: ErrorOptions) {
    super('Network error', options);
  }
}

/** Anything else: a non-problem error body (e.g. an HTML 502 from a proxy) or a client bug. */
export class UnexpectedError extends Error {
  override readonly name = 'UnexpectedError';
  readonly status?: number;

  constructor({ status, cause }: { status?: number; cause?: unknown } = {}) {
    super(status === undefined ? 'Unexpected error' : `Unexpected error (HTTP ${String(status)})`, {
      cause,
    });
    if (status !== undefined) this.status = status;
  }
}

/** The user dismissed the step-up dialog. Never shown as a toast. */
export class ReauthCancelledError extends Error {
  override readonly name = 'ReauthCancelledError';

  constructor() {
    super('Reauthentication cancelled');
  }
}

export type AppError = ProblemError | NetworkError | UnexpectedError | ReauthCancelledError;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFieldError(value: unknown): value is FieldError {
  return isRecord(value) && typeof value.path === 'string' && typeof value.message === 'string';
}

function asProblem(data: unknown): (Problem & Record<string, unknown>) | null {
  if (!isRecord(data)) return null;
  const { type, title, status, code, detail, errors } = data;
  if (typeof code !== 'string' || typeof status !== 'number') return null;
  if (errors !== undefined && !(Array.isArray(errors) && errors.every(isFieldError))) return null;
  return {
    ...data,
    type: typeof type === 'string' ? type : 'about:blank',
    title: typeof title === 'string' ? title : '',
    status,
    code,
    detail: typeof detail === 'string' ? detail : '',
  };
}

export function isAppError(e: unknown): e is AppError {
  return (
    e instanceof ProblemError ||
    e instanceof NetworkError ||
    e instanceof UnexpectedError ||
    e instanceof ReauthCancelledError
  );
}

export function toAppError(e: unknown): AppError {
  if (isAppError(e)) return e;
  if (axios.isAxiosError(e)) {
    const { response } = e;
    if (!response) return new NetworkError({ cause: e });
    const body = asProblem(response.data);
    if (body) return new ProblemError(body, { cause: e });
    return new UnexpectedError({ status: response.status, cause: e });
  }
  return new UnexpectedError({ cause: e });
}

export function isProblem(e: unknown, code?: string): e is ProblemError {
  return e instanceof ProblemError && (code === undefined || e.code === code);
}
