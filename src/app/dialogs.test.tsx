import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { emit } from '@/shared/api/events';
import { isReauthPending, waitForReauth } from '@/shared/api/reauth-coordinator';
import { sessionStore } from '@/shared/auth/session-store';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';

const URL = '*/auth/reauth';

function openReauth(onRejected = vi.fn(), onResolved = vi.fn()) {
  const p = waitForReauth();
  p.then(onResolved, onRejected);
  return { onRejected, onResolved };
}

describe('ReauthDialog', () => {
  it('opens on reauth:required', async () => {
    renderWithProviders(<p>page</p>, { session: {} });
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => {
      openReauth();
    });
    expect(await screen.findByRole('dialog', { name: 'Xác nhận mật khẩu' })).toBeInTheDocument();
    expect(screen.getByText('Thao tác này cần nhập lại mật khẩu.')).toBeInTheDocument();
  });

  it('wrong password shows the error, stays open and does not go to /login', async () => {
    server.use(http.post(URL, () => problem(401, 'INVALID_CREDENTIALS')));
    const user = userEvent.setup();
    const { router } = renderWithProviders(<p>page</p>, { route: '/posts', session: {} });
    act(() => {
      openReauth();
    });
    await user.type(await screen.findByLabelText('Mật khẩu'), 'sai');
    await user.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(await screen.findByText('Mật khẩu không đúng.')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Xác nhận mật khẩu' })).toHaveAttribute('open');
    expect(router.state.location.pathname).toBe('/posts');
    expect(isReauthPending()).toBe(true);
  });

  it('empty password shows a required message without a request', async () => {
    const user = userEvent.setup();
    renderWithProviders(<p>page</p>, { session: {} });
    act(() => {
      openReauth();
    });
    await user.click(await screen.findByRole('button', { name: 'Xác nhận' }));
    expect(await screen.findByText('Không được để trống.')).toBeInTheDocument();
  });

  it('correct password resolves the prompt and closes', async () => {
    server.use(http.post(URL, () => new Response(null, { status: 204 })));
    const user = userEvent.setup();
    renderWithProviders(<p>page</p>, { session: {} });
    let spies!: ReturnType<typeof openReauth>;
    act(() => {
      spies = openReauth();
    });
    await user.type(await screen.findByLabelText('Mật khẩu'), 'dung');
    await user.click(screen.getByRole('button', { name: 'Xác nhận' }));
    await waitFor(() => {
      expect(spies.onResolved).toHaveBeenCalled();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(spies.onRejected).not.toHaveBeenCalled();
  });

  it('Huỷ rejects the prompt and closes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<p>page</p>, { session: {} });
    let spies!: ReturnType<typeof openReauth>;
    act(() => {
      spies = openReauth();
    });
    await user.click(await screen.findByRole('button', { name: 'Huỷ' }));
    await waitFor(() => {
      expect(spies.onRejected).toHaveBeenCalled();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Escape rejects the prompt', async () => {
    renderWithProviders(<p>page</p>, { session: {} });
    let spies!: ReturnType<typeof openReauth>;
    act(() => {
      spies = openReauth();
    });
    const dialog = await screen.findByRole('dialog', { name: 'Xác nhận mật khẩu' });
    act(() => {
      dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    });
    await waitFor(() => {
      expect(spies.onRejected).toHaveBeenCalled();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes when the session expires while open', async () => {
    renderWithProviders(<p>page</p>, { route: '/posts', session: {} });
    let spies!: ReturnType<typeof openReauth>;
    act(() => {
      spies = openReauth();
    });
    await screen.findByRole('dialog', { name: 'Xác nhận mật khẩu' });
    act(() => {
      emit('session:expired');
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await waitFor(() => {
      expect(spies.onRejected).toHaveBeenCalled();
    });
  });

  it('rejects and closes when session:expired arrives while already anonymous', async () => {
    // No session: the bridge returns early on session:expired, so the dialog must reject.
    renderWithProviders(<p>page</p>, { route: '/posts' });
    let spies!: ReturnType<typeof openReauth>;
    act(() => {
      spies = openReauth();
    });
    await screen.findByRole('dialog', { name: 'Xác nhận mật khẩu' });
    act(() => {
      emit('session:expired');
    });
    await waitFor(() => {
      expect(spies.onRejected).toHaveBeenCalled();
    });
    expect(isReauthPending()).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('rejects and closes when the session ends by another path (logout, revoke)', async () => {
    renderWithProviders(<p>page</p>, { route: '/posts', session: {} });
    let spies!: ReturnType<typeof openReauth>;
    act(() => {
      spies = openReauth();
    });
    await screen.findByRole('dialog', { name: 'Xác nhận mật khẩu' });
    act(() => {
      sessionStore.signOut();
    });
    await waitFor(() => {
      expect(spies.onRejected).toHaveBeenCalled();
    });
    expect(isReauthPending()).toBe(false);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('reopens with an empty field and no error', async () => {
    server.use(http.post(URL, () => problem(401, 'INVALID_CREDENTIALS')));
    const user = userEvent.setup();
    renderWithProviders(<p>page</p>, { session: {} });
    act(() => {
      openReauth();
    });
    await user.type(await screen.findByLabelText('Mật khẩu'), 'sai');
    await user.click(screen.getByRole('button', { name: 'Xác nhận' }));
    await screen.findByText('Mật khẩu không đúng.');
    await user.click(screen.getByRole('button', { name: 'Huỷ' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    act(() => {
      openReauth();
    });
    expect(await screen.findByLabelText('Mật khẩu')).toHaveValue('');
    expect(screen.queryByText('Mật khẩu không đúng.')).toBeNull();
  });

  it('rejects a pending prompt when unmounted', async () => {
    const { unmount } = renderWithProviders(<p>page</p>, { session: {} });
    let spies!: ReturnType<typeof openReauth>;
    act(() => {
      spies = openReauth();
    });
    await screen.findByRole('dialog');
    unmount();
    await waitFor(() => {
      expect(spies.onRejected).toHaveBeenCalled();
    });
  });
});

describe('ConflictDialog', () => {
  it('opens on conflict; Tải lại invalidates each key then closes', async () => {
    const user = userEvent.setup();
    const { queryClient } = renderWithProviders(<p>page</p>, { session: {} });
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    act(() => {
      emit('conflict', { invalidates: [['x']] });
    });
    expect(
      await screen.findByRole('dialog', { name: 'Dữ liệu đã thay đổi ở nơi khác' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tải lại' }));
    expect(spy).toHaveBeenCalledWith({ queryKey: ['x'] });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('a second conflict while open merges invalidates, deduped', async () => {
    const user = userEvent.setup();
    const { queryClient } = renderWithProviders(<p>page</p>, { session: {} });
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    act(() => {
      emit('conflict', { invalidates: [['posts', 'p1']] });
    });
    await screen.findByRole('dialog', { name: 'Dữ liệu đã thay đổi ở nơi khác' });
    act(() => {
      emit('conflict', { invalidates: [['categories'], ['posts', 'p1']] });
    });
    act(() => {
      emit('conflict', { invalidates: [['tags']] });
    });
    await user.click(screen.getByRole('button', { name: 'Tải lại' }));
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenCalledWith({ queryKey: ['posts', 'p1'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['categories'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['tags'] });
  });

  it('starts from a clean list after closing', async () => {
    const user = userEvent.setup();
    const { queryClient } = renderWithProviders(<p>page</p>, { session: {} });
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    act(() => {
      emit('conflict', { invalidates: [['a']] });
    });
    await user.click(await screen.findByRole('button', { name: 'Để sau' }));
    act(() => {
      emit('conflict', { invalidates: [['b']] });
    });
    await user.click(await screen.findByRole('button', { name: 'Tải lại' }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ queryKey: ['b'] });
  });

  it('Để sau closes without invalidating', async () => {
    const user = userEvent.setup();
    const { queryClient } = renderWithProviders(<p>page</p>, { session: {} });
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    act(() => {
      emit('conflict', { invalidates: [['x']] });
    });
    await user.click(await screen.findByRole('button', { name: 'Để sau' }));
    expect(spy).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
