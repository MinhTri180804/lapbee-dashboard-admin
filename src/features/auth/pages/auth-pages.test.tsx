import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sessionStore } from '@/shared/auth/session-store';
import { meFixture } from '@/test/fixtures/auth';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import { LoginPage } from './LoginPage';
import { SetupPasswordPage } from './SetupPasswordPage';

const BASE = 'http://localhost/admin/v1';
const destinations = [
  { path: '/posts', element: <p>Trang bài đăng</p> },
  { path: '/login', element: <p>Trang đăng nhập</p> },
  { path: '/', element: <p>Trang chủ</p> },
];

beforeEach(() => {
  sessionStore.signOut();
});

function mockLoginOk() {
  server.use(
    mock.post(`${BASE}/auth/login`, () =>
      HttpResponse.json({ status: 'authenticated', user: meFixture.user, csrfToken: 'c' }),
    ),
    mock.get(`${BASE}/auth/me`, () => HttpResponse.json(meFixture)),
  );
}

async function fillLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email'), 'admin@lapbee.test');
  await user.type(screen.getByLabelText('Mật khẩu'), 'secret-password');
  await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));
}

describe('LoginPage', () => {
  it('reports empty fields without sending a request', async () => {
    const hit = vi.fn();
    server.use(
      mock.post(`${BASE}/auth/login`, () => {
        hit();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login', routes: destinations.slice(0, 1) });
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findAllByText('Không được để trống.')).toHaveLength(2);
    expect(hit).not.toHaveBeenCalled();
  });

  it('rejects a malformed email without sending a request', async () => {
    const hit = vi.fn();
    server.use(
      mock.post(`${BASE}/auth/login`, () => {
        hit();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login', routes: destinations.slice(0, 1) });
    await user.type(screen.getByLabelText('Email'), 'khong-phai-email');
    await user.type(screen.getByLabelText('Mật khẩu'), 'mat-khau-bat-ky');
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByText('Email không hợp lệ.')).toBeInTheDocument();
    expect(hit).not.toHaveBeenCalled();
  });

  it('accepts an email with surrounding spaces', async () => {
    let sent: unknown;
    server.use(
      mock.post(`${BASE}/auth/login`, async ({ request }) => {
        sent = await request.json();
        return problem(401, 'INVALID_CREDENTIALS');
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });
    await user.type(screen.getByLabelText('Email'), '  admin@lapbee.test  ');
    await user.type(screen.getByLabelText('Mật khẩu'), 'mat-khau-bat-ky');
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    await screen.findByRole('alert');
    expect(sent).toMatchObject({ email: 'admin@lapbee.test' });
  });

  it('shows INVALID_CREDENTIALS in an alert and stays on /login', async () => {
    server.use(mock.post(`${BASE}/auth/login`, () => problem(401, 'INVALID_CREDENTIALS')));
    const user = userEvent.setup();
    const { router } = renderWithProviders(<LoginPage />, { route: '/login' });
    await fillLogin(user);
    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu không đúng.');
    expect(router.state.location.pathname).toBe('/login');
  });

  it('shows RATE_LIMITED message', async () => {
    server.use(mock.post(`${BASE}/auth/login`, () => problem(429, 'RATE_LIMITED')));
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });
    await fillLogin(user);
    expect(await screen.findByRole('alert')).toHaveTextContent('Thử lại sau ít phút.');
  });

  it('goes to ?next after a successful login', async () => {
    mockLoginOk();
    const user = userEvent.setup();
    const { router } = renderWithProviders(<LoginPage />, {
      route: '/login?next=%2Fposts',
      routes: destinations.slice(0, 1),
    });
    await fillLogin(user);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/posts');
    });
  });

  it('ignores an unsafe ?next', async () => {
    mockLoginOk();
    const user = userEvent.setup();
    const { router } = renderWithProviders(<LoginPage />, {
      route: '/login?next=%2F%2Fevil.com',
      routes: [destinations[2]!],
    });
    await fillLogin(user);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
  });

  it('redirects an authenticated visitor away', async () => {
    const { router } = renderWithProviders(<LoginPage />, {
      route: '/login?next=%2Fposts',
      session: {},
      routes: destinations.slice(0, 1),
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/posts');
    });
  });
});

const EXPIRED = 'Link đã hết hạn hoặc đã dùng. Hãy xin quản trị viên link mới.';
const PASSWORD = 'a-very-long-password';

async function fillSetup(
  user: ReturnType<typeof userEvent.setup>,
  password = PASSWORD,
  confirm = PASSWORD,
) {
  await user.type(screen.getByLabelText('Mật khẩu mới'), password);
  await user.type(screen.getByLabelText('Nhập lại'), confirm);
  await user.click(screen.getByRole('button', { name: 'Đặt mật khẩu' }));
}

describe('SetupPasswordPage', () => {
  it('removes the token from the URL and sends it in the body', async () => {
    let body: unknown;
    let url = '';
    server.use(
      mock.post(`${BASE}/auth/setup-password`, async ({ request }) => {
        body = await request.json();
        url = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    const { router } = renderWithProviders(<SetupPasswordPage />, {
      route: '/setup-password?ref=mail#token=abc',
      routes: destinations,
      history: 'browser',
    });
    expect(window.location.hash).toBe('');
    // The router's own location loses the hash too, and keeps path and query.
    expect(router.state.location.hash).toBe('');
    expect(router.state.location.pathname).toBe('/setup-password');
    expect(router.state.location.search).toBe('?ref=mail');
    await fillSetup(user);
    await waitFor(() => {
      expect(body).toEqual({ token: 'abc', newPassword: PASSWORD });
    });
    expect(url).not.toContain('abc');
    window.history.replaceState(null, '', '/');
  });

  it('rejects a password shorter than 12 characters', async () => {
    const hit = vi.fn();
    server.use(
      mock.post(`${BASE}/auth/setup-password`, () => {
        hit();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<SetupPasswordPage />, { route: '/setup-password#token=abc' });
    await fillSetup(user, 'short', 'short');
    expect(await screen.findByText('Mật khẩu cần 12–128 ký tự.')).toBeInTheDocument();
    expect(hit).not.toHaveBeenCalled();
  });

  it('rejects mismatching passwords', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SetupPasswordPage />, { route: '/setup-password#token=abc' });
    await fillSetup(user, PASSWORD, `${PASSWORD}x`);
    expect(await screen.findByText('Mật khẩu nhập lại không khớp.')).toBeInTheDocument();
  });

  it('shows the expired-link message and hides the form on INVALID_LINK', async () => {
    server.use(mock.post(`${BASE}/auth/setup-password`, () => problem(400, 'INVALID_LINK')));
    const user = userEvent.setup();
    renderWithProviders(<SetupPasswordPage />, { route: '/setup-password#token=abc' });
    await fillSetup(user);
    expect(await screen.findByText(EXPIRED)).toBeInTheDocument();
    expect(screen.queryByLabelText('Mật khẩu mới')).not.toBeInTheDocument();
  });

  it('shows the expired-link message at once without a token', () => {
    renderWithProviders(<SetupPasswordPage />, { route: '/setup-password' });
    expect(screen.getByText(EXPIRED)).toBeInTheDocument();
    expect(screen.queryByLabelText('Mật khẩu mới')).not.toBeInTheDocument();
  });

  it('goes to /login with a success toast on 204', async () => {
    server.use(
      mock.post(`${BASE}/auth/setup-password`, () => new HttpResponse(null, { status: 204 })),
    );
    const user = userEvent.setup();
    const { router } = renderWithProviders(<SetupPasswordPage />, {
      route: '/setup-password#token=abc',
      routes: destinations,
    });
    await fillSetup(user);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });
    expect(await screen.findByText('Đã đặt mật khẩu')).toBeInTheDocument();
  });
});
