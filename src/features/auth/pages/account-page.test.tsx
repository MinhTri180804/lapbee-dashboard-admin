import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { sessionStore } from '@/shared/auth/session-store';
import { meFixture } from '@/test/fixtures/auth';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import { AccountPage } from './AccountPage';

const BASE = 'http://localhost/admin/v1';

const sessionItems = [
  {
    id: 's-current',
    ip: '10.0.0.1',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15',
    createdAt: '2026-01-02T03:04:00Z',
    lastSeenAt: '2026-01-02T05:06:00Z',
    current: true,
  },
  {
    id: 's-other',
    ip: '10.0.0.2',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
    createdAt: '2026-01-01T03:04:00Z',
    lastSeenAt: '2026-01-01T03:04:00Z',
    current: false,
  },
];

function mockSessions(items = sessionItems) {
  server.use(mock.get(`${BASE}/auth/sessions`, () => HttpResponse.json({ items })));
}

beforeEach(() => {
  sessionStore.signOut();
  mockSessions();
});

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Mật khẩu hiện tại'), 'old-password-123');
  await user.type(screen.getByLabelText('Mật khẩu mới'), 'brand-new-password-1');
  await user.type(screen.getByLabelText('Nhập lại'), 'brand-new-password-1');
  await user.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
}

describe('AccountPage header', () => {
  it('shows the user line with the role label', async () => {
    renderWithProviders(<AccountPage />, { session: {} });
    expect(screen.getByRole('heading', { name: 'Tài khoản của bạn' })).toBeInTheDocument();
    expect(screen.getByText('TÀI KHOẢN')).toBeInTheDocument();
    expect(
      screen.getByText(`${meFixture.user.name} · ${meFixture.user.email} · Super admin`),
    ).toBeInTheDocument();
    await screen.findByText('Safari · macOS');
  });

  it('omits the role label without the wildcard permission', async () => {
    renderWithProviders(<AccountPage />, { session: { permissions: ['post.read'] } });
    expect(
      screen.getByText(`${meFixture.user.name} · ${meFixture.user.email}`),
    ).toBeInTheDocument();
    await screen.findByText('Safari · macOS');
  });
});

describe('change password', () => {
  it('re-authenticates, retries, toasts and uses the rotated CSRF token on the next write', async () => {
    let attempts = 0;
    const csrfOnDelete: (string | null)[] = [];
    server.use(
      mock.post(`${BASE}/auth/password`, () => {
        attempts += 1;
        if (attempts === 1) return problem(403, 'REAUTH_REQUIRED');
        return HttpResponse.json({ csrfToken: 'new' });
      }),
      mock.post(`${BASE}/auth/reauth`, () => new HttpResponse(null, { status: 204 })),
      mock.delete(`${BASE}/auth/sessions/:id`, ({ request }) => {
        csrfOnDelete.push(request.headers.get('X-CSRF-Token'));
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<AccountPage />, { session: {} });
    await screen.findByText('Firefox · Linux');
    await fillForm(user);

    const dialog = await screen.findByRole('dialog', { name: 'Xác nhận mật khẩu' });
    await user.type(within(dialog).getByLabelText('Mật khẩu'), 'old-password-123');
    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận' }));

    expect(
      await screen.findByText('Đã đổi mật khẩu. Các phiên khác đã bị đăng xuất.'),
    ).toBeInTheDocument();
    expect(attempts).toBe(2);
    expect(sessionStore.get().csrfToken).toBe('new');
    expect(screen.getByLabelText('Mật khẩu hiện tại')).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Thu hồi' }));
    await waitFor(() => {
      expect(csrfOnDelete).toEqual(['new']);
    });
  });

  it('shows nothing when the step-up prompt is cancelled', async () => {
    let attempts = 0;
    server.use(
      mock.post(`${BASE}/auth/password`, () => {
        attempts += 1;
        return problem(403, 'REAUTH_REQUIRED');
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<AccountPage />, { session: {} });
    await fillForm(user);

    const dialog = await screen.findByRole('dialog', { name: 'Xác nhận mật khẩu' });
    await user.click(within(dialog).getByRole('button', { name: 'Huỷ' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    // Let the rejected mutation settle before asserting the absence of an error.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Đổi mật khẩu' })).not.toHaveAttribute(
        'aria-busy',
        'true',
      );
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(attempts).toBe(1);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText('Đã có lỗi xảy ra. Thử lại sau.')).toBeNull();
  });

  it('shows VALIDATION_FAILED under the new password field', async () => {
    server.use(
      mock.post(`${BASE}/auth/password`, () =>
        problem(422, 'VALIDATION_FAILED', {
          errors: [{ path: 'newPassword', message: 'Mật khẩu quá phổ biến.' }],
        }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<AccountPage />, { session: {} });
    await fillForm(user);
    const field = screen.getByLabelText('Mật khẩu mới');
    await waitFor(() => {
      expect(field).toHaveAccessibleDescription('Mật khẩu quá phổ biến.');
    });
  });

  it('shows INVALID_CREDENTIALS under the current password field', async () => {
    server.use(mock.post(`${BASE}/auth/password`, () => problem(401, 'INVALID_CREDENTIALS')));
    const user = userEvent.setup();
    renderWithProviders(<AccountPage />, { session: {} });
    await fillForm(user);
    await waitFor(() => {
      expect(screen.getByLabelText('Mật khẩu hiện tại')).toHaveAccessibleDescription(
        'Mật khẩu hiện tại không đúng.',
      );
    });
  });

  it('validates required, length and confirmation without a request', async () => {
    let called = false;
    server.use(
      mock.post(`${BASE}/auth/password`, () => {
        called = true;
        return HttpResponse.json({ csrfToken: 'x' });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<AccountPage />, { session: {} });
    await user.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
    expect(await screen.findAllByText('Không được để trống.')).toHaveLength(3);

    await user.type(screen.getByLabelText('Mật khẩu hiện tại'), 'old');
    await user.type(screen.getByLabelText('Mật khẩu mới'), 'short');
    await user.type(screen.getByLabelText('Nhập lại'), 'other');
    await user.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
    expect(await screen.findByText('Mật khẩu cần 12–128 ký tự.')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Mật khẩu mới'));
    await user.type(screen.getByLabelText('Mật khẩu mới'), 'long-enough-password');
    await user.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
    expect(await screen.findByText('Mật khẩu nhập lại không khớp.')).toBeInTheDocument();
    expect(called).toBe(false);
  });
});

describe('sessions table', () => {
  it('marks the current session and offers no revoke for it', async () => {
    renderWithProviders(<AccountPage />, { session: {} });
    const currentRow = (await screen.findByText('Safari · macOS')).closest('tr');
    const otherRow = screen.getByText('Firefox · Linux').closest('tr');
    expect(currentRow).not.toBeNull();
    expect(otherRow).not.toBeNull();
    expect(within(currentRow as HTMLElement).getByText('Hiện tại')).toBeInTheDocument();
    expect(within(currentRow as HTMLElement).queryByRole('button', { name: 'Thu hồi' })).toBeNull();
    expect(
      within(otherRow as HTMLElement).getByRole('button', { name: 'Thu hồi' }),
    ).toBeInTheDocument();
  });

  it('shows times in mono as HH:MM · dd.mm.yyyy', async () => {
    renderWithProviders(<AccountPage />, { session: {} });
    const cell = await screen.findByText('10:04 · 02.01.2026');
    expect(cell.className).toMatch(/mono/);
  });

  it('revokes another session then reloads the list', async () => {
    let items = [...sessionItems];
    let deleted: string | undefined;
    server.use(
      mock.get(`${BASE}/auth/sessions`, () => HttpResponse.json({ items })),
      mock.delete(`${BASE}/auth/sessions/:id`, ({ params }) => {
        deleted = String(params.id);
        items = items.filter((s) => s.id !== deleted);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<AccountPage />, { session: {} });
    await user.click(await screen.findByRole('button', { name: 'Thu hồi' }));
    await waitFor(() => {
      expect(screen.queryByText('Firefox · Linux')).toBeNull();
    });
    expect(deleted).toBe('s-other');
  });

  it('shows the empty message', async () => {
    mockSessions([]);
    renderWithProviders(<AccountPage />, { session: {} });
    expect(await screen.findByText('Không có phiên nào.')).toBeInTheDocument();
  });
});
