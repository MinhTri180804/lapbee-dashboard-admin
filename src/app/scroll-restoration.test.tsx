import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppScrollRestoration } from './scroll-restoration';

let scrollTo: ReturnType<typeof vi.fn>;

beforeEach(() => {
  scrollTo = vi.fn();
  vi.stubGlobal('scrollTo', scrollTo);
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
});

function setScrollY(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
}

function renderApp() {
  const router = createMemoryRouter(
    [
      {
        element: (
          <>
            <AppScrollRestoration />
            <Outlet />
          </>
        ),
        children: [
          { path: '/site', element: <p>Danh sách</p> },
          { path: '/site/services/:id', element: <p>Mục</p> },
        ],
      },
    ],
    { initialEntries: ['/site?tab=services'] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('AppScrollRestoration', () => {
  it('opens a new page at the top and restores the list on back', async () => {
    const router = renderApp();
    await screen.findByText('Danh sách');
    setScrollY(600);
    await act(() => router.navigate('/site/services/1'));
    expect(screen.getByText('Mục')).toBeInTheDocument();
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
    setScrollY(0);
    await act(() => router.navigate(-1));
    expect(screen.getByText('Danh sách')).toBeInTheDocument();
    expect(scrollTo).toHaveBeenLastCalledWith(0, 600);
  });

  it('keeps the position when only ?tab changes', async () => {
    const router = renderApp();
    await screen.findByText('Danh sách');
    setScrollY(300);
    scrollTo.mockClear();
    await act(() => router.navigate('/site?tab=team', { replace: true }));
    expect(router.state.location.search).toBe('?tab=team');
    expect(scrollTo).not.toHaveBeenCalledWith(0, 0);
  });
});
