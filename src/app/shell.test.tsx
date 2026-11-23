import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sessionStore } from '@/shared/auth/session-store';
import { THEME_STORAGE_KEY } from '@/shared/theme/theme';
import { meFixture } from '@/test/fixtures/auth';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { createTestQueryClient, renderWithProviders } from '@/test/render';
import { Shell } from './layout/Shell';
import { AppProviders } from './providers';
import { routes } from './router';

const BASE = 'http://localhost/admin/v1';

afterEach(() => {
  vi.unstubAllEnvs();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

function sidebar() {
  return screen.getByRole('complementary');
}

describe('Shell sidebar', () => {
  it('shows the user name and "Super admin" for *', () => {
    renderWithProviders(<Shell />, { route: '/site', session: { permissions: ['*'] } });
    const side = sidebar();
    expect(within(side).getByText('Quản trị viên')).toBeInTheDocument();
    expect(within(side).getByText('Super admin')).toBeInTheDocument();
    expect(within(side).queryByText('admin@lapbee.test')).not.toBeInTheDocument();
  });

  it('shows the email when the user is not a super admin', () => {
    renderWithProviders(<Shell />, { route: '/posts', session: { permissions: ['post.read'] } });
    const side = sidebar();
    expect(within(side).getByText('admin@lapbee.test')).toBeInTheDocument();
    expect(within(side).queryByText('Super admin')).not.toBeInTheDocument();
  });

  it('lists only permitted nav items, grouped, and marks the current one', () => {
    renderWithProviders(<Shell />, { route: '/posts', session: { permissions: ['post.read'] } });
    const nav = within(sidebar()).getByRole('navigation');
    expect(within(nav).getByText('Nội dung')).toHaveClass('lb-label');
    expect(within(nav).queryByText('Quản trị')).not.toBeInTheDocument();
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['Bài đăng']);
    expect(links[0]).toHaveAttribute('aria-current', 'page');
  });

  it('logs out through POST /auth/logout and goes to /login', async () => {
    const logout = vi.fn();
    server.use(
      mock.post(`${BASE}/auth/logout`, () => {
        logout();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    const { router } = renderWithProviders(<Shell />, {
      route: '/site',
      session: { permissions: ['*'] },
    });

    await user.click(within(sidebar()).getByRole('button', { name: /Quản trị viên/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Đăng xuất' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('links "Tài khoản" in the user menu to /account', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Shell />, { route: '/site', session: { permissions: ['*'] } });
    await user.click(within(sidebar()).getByRole('button', { name: /Quản trị viên/ }));
    expect(screen.getByRole('menuitem', { name: 'Tài khoản' })).toHaveAttribute('href', '/account');
  });

  it('toggles the theme: sets data-theme and persists lb-admin-theme', async () => {
    document.documentElement.dataset.theme = 'light';
    const user = userEvent.setup();
    renderWithProviders(<Shell />, { route: '/site', session: { permissions: ['*'] } });

    await user.click(within(sidebar()).getByRole('button', { name: 'Giao diện tối' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    await user.click(within(sidebar()).getByRole('button', { name: 'Giao diện sáng' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('renders and toggles the theme when localStorage access throws', async () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('denied', 'SecurityError');
      },
    });
    try {
      const user = userEvent.setup();
      renderWithProviders(<Shell />, { route: '/site', session: { permissions: ['*'] } });
      await user.click(within(sidebar()).getByRole('button', { name: /Giao diện/ }));
      expect(document.documentElement.dataset.theme).toMatch(/^(light|dark)$/);
    } finally {
      if (original) Object.defineProperty(window, 'localStorage', original);
    }
  });

  it('links "Xem website" to VITE_LANDING_URL in a new tab', () => {
    vi.stubEnv('VITE_LANDING_URL', 'https://lapbee.example');
    renderWithProviders(<Shell />, { route: '/site', session: { permissions: ['*'] } });
    const link = within(sidebar()).getByRole('link', { name: /Xem website/ });
    expect(link).toHaveAttribute('href', 'https://lapbee.example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('hides "Xem website" when VITE_LANDING_URL is empty', () => {
    vi.stubEnv('VITE_LANDING_URL', '');
    renderWithProviders(<Shell />, { route: '/site', session: { permissions: ['*'] } });
    expect(within(sidebar()).queryByRole('link', { name: /Xem website/ })).not.toBeInTheDocument();
  });
});

describe('routes', () => {
  function renderApp(path: string, permissions: string[]) {
    server.use(
      mock.get(`${BASE}/auth/me`, () =>
        HttpResponse.json({ user: meFixture.user, permissions, csrfToken: 'c' }),
      ),
    );
    // The store has no way back to 'unknown' between tests; seed what /me will confirm.
    sessionStore.signIn({ user: meFixture.user, permissions, csrfToken: 'c' });
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    render(
      <AppProviders queryClient={createTestQueryClient()}>
        <RouterProvider router={router} />
      </AppProviders>,
    );
    return router;
  }

  it('redirects / to the first allowed screen', async () => {
    const router = renderApp('/', ['media.read']);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/media');
    });
    expect(await screen.findByRole('heading', { name: 'Thư viện ảnh' })).toBeInTheDocument();
  });

  it('shows the forbidden page without the permission', async () => {
    renderApp('/users', ['post.read']);
    expect(
      await screen.findByRole('heading', { name: 'Không có quyền truy cập' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Tài khoản của bạn không có quyền xem trang này.')).toBeInTheDocument();
  });

  it('opens /system with any one of its permissions', async () => {
    renderApp('/system', ['audit.read']);
    expect(await screen.findByRole('heading', { name: 'Hệ thống' })).toBeInTheDocument();
  });

  it('shows the not-found page for unknown paths', async () => {
    renderApp('/khong-co', ['*']);
    expect(
      await screen.findByRole('heading', { name: 'Không tìm thấy trang' }),
    ).toBeInTheDocument();
  });

  it('sends anonymous users to /login?next=…', async () => {
    server.use(mock.get(`${BASE}/auth/me`, () => problem(401, 'UNAUTHENTICATED')));
    const router = createMemoryRouter(routes, { initialEntries: ['/posts'] });
    render(
      <AppProviders queryClient={createTestQueryClient()}>
        <RouterProvider router={router} />
      </AppProviders>,
    );
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });
    expect(router.state.location.search).toBe('?next=%2Fposts');
  });
});
