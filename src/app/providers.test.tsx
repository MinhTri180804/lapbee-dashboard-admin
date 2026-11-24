import { act, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { emit } from '@/shared/api/events';
import { isReauthPending, waitForReauth } from '@/shared/api/reauth-coordinator';
import { sessionStore } from '@/shared/auth/session-store';
import { renderWithProviders } from '@/test/render';

describe('AppEventsBridge', () => {
  it('shows a toast for the `toast` event', async () => {
    renderWithProviders(<p>page</p>);
    act(() => {
      emit('toast', { kind: 'success', title: 'Đã lưu', body: 'Xong' });
    });
    expect(await screen.findByText('Đã lưu')).toBeInTheDocument();
    expect(screen.getByText('Xong')).toBeInTheDocument();
  });

  it('on session:expired signs out, clears the cache and redirects to /login?next=…', async () => {
    const { router, queryClient } = renderWithProviders(<p>page</p>, {
      route: '/posts?page=2',
      session: {},
    });
    queryClient.setQueryData(['x'], 1);
    const pending = waitForReauth();
    const cancelled = vi.fn();
    pending.catch(cancelled);

    act(() => {
      emit('session:expired');
    });

    expect(sessionStore.get().status).toBe('anonymous');
    expect(queryClient.getQueryData(['x'])).toBeUndefined();
    expect(isReauthPending()).toBe(false);
    await waitFor(() => {
      expect(cancelled).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });
    expect(router.state.location.search).toBe('?next=' + encodeURIComponent('/posts?page=2'));
    expect(
      await screen.findByText('Phiên đã hết hạn. Đăng nhập lại để tiếp tục.'),
    ).toBeInTheDocument();
  });

  it('ignores session:expired when already anonymous', () => {
    const { router } = renderWithProviders(<p>page</p>, { route: '/posts' });
    act(() => {
      emit('session:expired');
    });
    expect(router.state.location.pathname).toBe('/posts');
    expect(
      screen.queryByText('Phiên đã hết hạn. Đăng nhập lại để tiếp tục.'),
    ).not.toBeInTheDocument();
  });
});
