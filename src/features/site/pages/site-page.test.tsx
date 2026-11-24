import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { siteFixture } from '@/test/fixtures/site';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import { siteKeys } from '../model/keys';
import type { SiteDto } from '../model/types';
import { SitePage } from './SitePage';

const BASE = 'http://localhost/admin/v1';
type Site = SiteDto;

const cleanSite: Site = { ...siteFixture, dirty: false };

function mockSite(site: Site = siteFixture) {
  server.use(mock.get(`${BASE}/site`, () => HttpResponse.json(site)));
}

const publication = {
  id: '1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
  number: 4,
  publishedAt: '2026-11-24T02:00:00.000Z',
  publishedBy: null,
};

function renderPage({
  route = '/site',
  permissions = ['*'],
}: { route?: string; permissions?: string[] } = {}) {
  return renderWithProviders(<SitePage />, {
    route,
    session: { permissions },
    routes: [{ path: '/elsewhere', element: <p>Trang khác</p> }],
  });
}

async function loaded() {
  await screen.findByLabelText('Hotline');
}

function preview() {
  return screen.getByRole('region', { name: 'Xem trước · Trang chủ' });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('SitePage', () => {
  it('shows the fixture data, header and tabs', async () => {
    mockSite();
    renderPage();
    await loaded();
    expect(screen.getByRole('heading', { name: 'Thông tin website' })).toBeInTheDocument();
    expect(screen.getByText('Quản trị · Website')).toBeInTheDocument();
    expect(screen.getByLabelText('Hotline')).toHaveValue('1900 1234');
    expect(screen.getByLabelText('Tên thương hiệu')).toHaveValue('LAPBEE');
    expect(screen.getByText('Chưa lưu')).toBeInTheDocument();
    for (const name of ['Thông tin chung', 'Trang chủ', 'Dịch vụ', 'Đội ngũ', 'Hành trình']) {
      expect(screen.getByRole('tab', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('tab', { name: 'Thông tin chung' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('link', { name: 'Lịch sử' })).toHaveAttribute('href', '/site/history');
    expect(within(preview()).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Laptop của bạnkhoẻ lại như mới như mới.',
    );
  });

  it('shows the saved label when nothing is pending', async () => {
    mockSite(cleanSite);
    renderPage();
    await loaded();
    expect(screen.getByText('Đã lưu · 10:30 · 20.11.2026')).toBeInTheDocument();
    expect(screen.queryByText('Chưa lưu')).not.toBeInTheDocument();
  });

  it('marks unsaved on typing; the preview follows hero fields only', async () => {
    mockSite(cleanSite);
    const user = userEvent.setup();
    renderPage();
    await loaded();
    const before = preview().textContent;
    await user.type(screen.getByLabelText('Hotline'), '9');
    expect(screen.getByText('Chưa lưu')).toBeInTheDocument();
    expect(preview().textContent).toBe(before);

    await user.click(screen.getByRole('tab', { name: 'Trang chủ' }));
    const h1a = screen.getByLabelText('Tiêu đề · dòng 1');
    await user.clear(h1a);
    await user.type(h1a, 'Máy tính');
    expect(within(preview()).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Máy tínhkhoẻ lại như mới như mới.',
    );
    // The form survives the tab change.
    await user.click(screen.getByRole('tab', { name: 'Thông tin chung' }));
    expect(screen.getByLabelText('Hotline')).toHaveValue('1900 12349');
  });

  it('shows the landing domain in the preview, hidden when unset', async () => {
    vi.stubEnv('VITE_LANDING_URL', 'https://lapbee.vn/');
    mockSite();
    renderPage();
    await loaded();
    expect(within(preview()).getByText('lapbee.vn')).toBeInTheDocument();
  });

  it('hides the domain when VITE_LANDING_URL is empty', async () => {
    vi.stubEnv('VITE_LANDING_URL', '');
    mockSite();
    renderPage();
    await loaded();
    expect(within(preview()).queryByText(/lapbee\.vn/)).not.toBeInTheDocument();
  });

  it('"Lưu nháp" sends only changed fields with the opening version', async () => {
    mockSite(cleanSite);
    let body: unknown;
    const saved = {
      ...cleanSite,
      dirty: true,
      version: 8,
      draft: { ...cleanSite.draft, settings: { ...cleanSite.draft.settings, phone: '0909' } },
    };
    server.use(
      mock.patch(`${BASE}/site/settings`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(saved);
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await loaded();
    const save = screen.getByRole('button', { name: 'Lưu nháp' });
    expect(save).toBeDisabled();
    const phone = screen.getByLabelText('Hotline');
    await user.clear(phone);
    await user.type(phone, '0909');
    await user.click(save);
    expect(await screen.findByText('Đã lưu nháp')).toBeInTheDocument();
    expect(body).toEqual({ version: 7, phone: '0909' });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Lưu nháp' })).toBeDisabled();
    });
    expect(screen.getByLabelText('Hotline')).toHaveValue('0909');
  });

  it('turning the eyebrow off disables its input and saves only that switch', async () => {
    mockSite(cleanSite);
    let body: unknown;
    server.use(
      mock.patch(`${BASE}/site/settings`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ...cleanSite, version: 8 });
      }),
    );
    const user = userEvent.setup();
    renderPage({ route: '/site?tab=home' });
    const eyebrow = await screen.findByLabelText('Dòng trạng thái');
    expect(eyebrow).toBeEnabled();
    await user.click(screen.getByRole('switch', { name: 'Hiện dòng trạng thái nhận máy' }));
    expect(eyebrow).toBeDisabled();
    expect(within(preview()).queryByText('Dịch vụ laptop')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }));
    await screen.findByText('Đã lưu nháp');
    expect(body).toEqual({ version: 7, showEyebrow: false });
  });

  it('keeps typing done while a save is in flight', async () => {
    mockSite(cleanSite);
    let release: () => void = () => undefined;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    const bodies: unknown[] = [];
    const saved = {
      ...cleanSite,
      dirty: true,
      version: 8,
      draft: { ...cleanSite.draft, settings: { ...cleanSite.draft.settings, phone: '0909' } },
    };
    server.use(
      mock.patch(`${BASE}/site/settings`, async ({ request }) => {
        bodies.push(await request.json());
        if (bodies.length === 1) await gate;
        return HttpResponse.json(saved);
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await loaded();
    const phone = screen.getByLabelText('Hotline');
    await user.clear(phone);
    await user.type(phone, '0909');
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }));
    await user.type(screen.getByLabelText('Giờ làm việc'), ' T7');
    release();
    await screen.findByText('Đã lưu nháp');
    expect(screen.getByLabelText('Giờ làm việc')).toHaveValue('08:00 - 20:00 T7');
    expect(screen.getByLabelText('Hotline')).toHaveValue('0909');
    const save = screen.getByRole('button', { name: 'Lưu nháp' });
    await waitFor(() => {
      expect(save).toBeEnabled();
    });
    await user.click(save);
    await waitFor(() => {
      expect(bodies).toHaveLength(2);
    });
    expect(bodies[1]).toEqual({ version: 8, hours: '08:00 - 20:00 T7' });
  });

  it('rebases typed edits onto the reloaded version after a conflict', async () => {
    let current: Site = cleanSite;
    server.use(mock.get(`${BASE}/site`, () => HttpResponse.json(current)));
    const bodies: unknown[] = [];
    server.use(
      mock.patch(`${BASE}/site/settings`, async ({ request }) => {
        bodies.push(await request.json());
        if (bodies.length === 1) return problem(409, 'VERSION_CONFLICT');
        return HttpResponse.json({ ...current, version: 10 });
      }),
    );
    const user = userEvent.setup();
    const { queryClient } = renderPage();
    await loaded();
    await user.type(screen.getByLabelText('Hotline'), '9');
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }));
    await waitFor(() => {
      expect(bodies).toHaveLength(1);
    });
    // Someone else changed the email; the reload brings version 9.
    current = {
      ...cleanSite,
      version: 9,
      draft: {
        ...cleanSite.draft,
        settings: { ...cleanSite.draft.settings, email: 'new@lapbee.test' },
      },
    };
    await act(() => queryClient.invalidateQueries({ queryKey: siteKeys.detail }));
    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toHaveValue('new@lapbee.test');
    });
    expect(screen.getByLabelText('Hotline')).toHaveValue('1900 12349');
    expect(screen.getByText('Chưa lưu')).toBeInTheDocument();
    expect(bodies).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }));
    await waitFor(() => {
      expect(bodies).toHaveLength(2);
    });
    expect(bodies[1]).toEqual({ version: 9, phone: '1900 12349' });
  });

  it('does not ask before leaving once the edits are saved', async () => {
    mockSite(cleanSite);
    server.use(
      mock.patch(`${BASE}/site/settings`, () =>
        HttpResponse.json({ ...cleanSite, dirty: true, version: 8 }),
      ),
    );
    const user = userEvent.setup();
    const { router } = renderPage();
    await loaded();
    await user.type(screen.getByLabelText('Hotline'), '9');
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }));
    await screen.findByText('Đã lưu nháp');
    await act(() => router.navigate('/elsewhere'));
    expect(await screen.findByText('Trang khác')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Bỏ thay đổi chưa lưu?' })).not.toBeInTheDocument();
  });

  it('puts a stats.0.v validation error on the first stat value', async () => {
    mockSite();
    server.use(
      mock.patch(`${BASE}/site/settings`, () =>
        problem(422, 'VALIDATION_FAILED', {
          errors: [{ path: 'stats.0.v', message: 'Cần giá trị.' }],
        }),
      ),
    );
    const user = userEvent.setup();
    renderPage({ route: '/site?tab=home' });
    const v = await screen.findByLabelText('Số liệu 01 · giá trị');
    await user.clear(v);
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }));
    expect(await screen.findByText('Cần giá trị.')).toBeInTheDocument();
    expect(screen.getByLabelText('Số liệu 01 · giá trị')).toHaveAttribute('aria-invalid', 'true');
  });

  it('maps VALIDATION_FAILED from the PATCH onto fields', async () => {
    mockSite();
    server.use(
      mock.patch(`${BASE}/site/settings`, () =>
        problem(422, 'VALIDATION_FAILED', {
          errors: [{ path: 'phone', message: 'Số điện thoại chưa đúng.' }],
        }),
      ),
    );
    const user = userEvent.setup();
    renderPage();
    await loaded();
    await user.type(screen.getByLabelText('Hotline'), 'x');
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }));
    expect(await screen.findByText('Số điện thoại chưa đúng.')).toBeInTheDocument();
    expect(screen.getByLabelText('Hotline')).toHaveAttribute('aria-invalid', 'true');
  });

  it('"Lưu & xuất bản" with a clean form only publishes', async () => {
    mockSite();
    const calls: string[] = [];
    let body: unknown;
    server.use(
      mock.patch(`${BASE}/site/settings`, () => {
        calls.push('patch');
        return HttpResponse.json(siteFixture);
      }),
      mock.post(`${BASE}/site/publish`, async ({ request }) => {
        calls.push('publish');
        body = await request.json();
        return HttpResponse.json({ publication, site: cleanSite });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await loaded();
    await user.click(screen.getByRole('button', { name: 'Lưu & xuất bản' }));
    expect(await screen.findByText('Đã xuất bản thay đổi')).toBeInTheDocument();
    expect(screen.getByText('Website đã cập nhật nội dung mới.')).toBeInTheDocument();
    expect(calls).toEqual(['publish']);
    expect(body).toEqual({ draftHash: 'hash-draft-0001' });
  });

  it('"Lưu & xuất bản" with edits saves them first', async () => {
    mockSite();
    const calls: string[] = [];
    let patchBody: unknown;
    server.use(
      mock.patch(`${BASE}/site/settings`, async ({ request }) => {
        calls.push('patch');
        patchBody = await request.json();
        return HttpResponse.json({ ...siteFixture, version: 8, draftHash: 'hash-2' });
      }),
      mock.post(`${BASE}/site/publish`, () => {
        calls.push('publish');
        return HttpResponse.json({ publication, site: cleanSite });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await loaded();
    await user.type(screen.getByLabelText('Email'), 'x');
    await user.click(screen.getByRole('button', { name: 'Lưu & xuất bản' }));
    await screen.findByText('Đã xuất bản thay đổi');
    expect(calls).toEqual(['patch', 'publish']);
    expect(patchBody).toEqual({ version: 7, email: 'hello@lapbee.testx' });
  });

  it('SITE_INVALID opens a dialog whose rows link to the tab or item', async () => {
    mockSite();
    server.use(
      mock.post(`${BASE}/site/publish`, () =>
        problem(422, 'SITE_INVALID', {
          errors: [
            { path: 'services.0.title', message: 'Không được để trống.' },
            { path: 'settings.h1a', message: 'Cần tiêu đề.' },
          ],
        }),
      ),
    );
    const user = userEvent.setup();
    renderPage();
    await loaded();
    await user.click(screen.getByRole('button', { name: 'Lưu & xuất bản' }));
    const dialog = await screen.findByRole('dialog', { name: 'Chưa xuất bản được' });
    expect(
      within(dialog).getByRole('link', { name: 'Dịch vụ · Sửa laptop: Không được để trống.' }),
    ).toHaveAttribute('href', `/site/services/${siteFixture.draft.services[0]?.id ?? ''}`);
    const settingsLink = within(dialog).getByRole('link', {
      name: 'Trang chủ · Tiêu đề · dòng 1: Cần tiêu đề.',
    });
    expect(settingsLink).toHaveAttribute('href', '/site?tab=home');
    await user.click(settingsLink);
    expect(screen.getByRole('tab', { name: 'Trang chủ' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('dialog', { name: 'Chưa xuất bản được' })).not.toBeInTheDocument();
  });

  it('NOTHING_TO_PUBLISH shows an info toast', async () => {
    mockSite();
    server.use(mock.post(`${BASE}/site/publish`, () => problem(409, 'NOTHING_TO_PUBLISH')));
    const user = userEvent.setup();
    renderPage();
    await loaded();
    await user.click(screen.getByRole('button', { name: 'Lưu & xuất bản' }));
    expect(await screen.findByText('Không có thay đổi để xuất bản')).toBeInTheDocument();
  });

  it('"Hoàn tác" asks first, then reverts with the draftHash', async () => {
    mockSite();
    let body: unknown;
    server.use(
      mock.post(`${BASE}/site/revert`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(cleanSite);
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await loaded();
    await user.click(screen.getByRole('button', { name: 'Hoàn tác' }));
    const dialog = screen.getByRole('dialog', {
      name: 'Đưa bản nháp về bản đã xuất bản gần nhất?',
    });
    expect(within(dialog).getByText('Mọi thay đổi chưa xuất bản sẽ mất.')).toBeInTheDocument();
    expect(body).toBeUndefined();
    await user.click(within(dialog).getByRole('button', { name: 'Hoàn tác' }));
    expect(await screen.findByText('Đã hoàn tác về bản đã xuất bản')).toBeInTheDocument();
    expect(body).toEqual({ draftHash: 'hash-draft-0001' });
    await waitFor(() => {
      expect(screen.getByLabelText('Hotline')).toHaveValue('1900 1234');
    });
  });

  it('disables "Hoàn tác" when the draft is clean', async () => {
    mockSite(cleanSite);
    renderPage();
    await loaded();
    expect(screen.getByRole('button', { name: 'Hoàn tác' })).toBeDisabled();
  });

  it('shows server warnings under the matching field', async () => {
    mockSite({
      ...siteFixture,
      warnings: [{ path: 'settings.seoTitle', message: 'Tiêu đề nên ngắn hơn 60 ký tự' }],
    });
    renderPage();
    await loaded();
    const warning = screen.getByText('Tiêu đề nên ngắn hơn 60 ký tự');
    expect(screen.getByLabelText('Tiêu đề trang').closest('[data-field]')).toContainElement(
      warning,
    );
  });

  it('keeps the tab in the URL with replace', async () => {
    mockSite();
    const user = userEvent.setup();
    const { router } = renderPage({ route: '/site?tab=home' });
    await screen.findByLabelText('Tiêu đề · dòng 1');
    expect(screen.getByRole('tab', { name: 'Trang chủ' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: 'Dịch vụ' }));
    expect(router.state.location.search).toBe('?tab=services');
    expect(router.state.historyAction).toBe('REPLACE');
    expect(screen.getByRole('heading', { name: 'Dịch vụ' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lưu nháp' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Xem trước · Trang chủ' })).not.toBeInTheDocument();
  });

  it('falls back to the general tab for an unknown value', async () => {
    mockSite();
    renderPage({ route: '/site?tab=bogus' });
    await loaded();
    expect(screen.getByRole('tab', { name: 'Thông tin chung' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('asks before leaving with unsaved edits', async () => {
    mockSite();
    const user = userEvent.setup();
    const { router } = renderPage();
    await loaded();
    await user.type(screen.getByLabelText('Hotline'), '9');
    // Switching tabs inside the page is not blocked.
    await user.click(screen.getByRole('tab', { name: 'Trang chủ' }));
    expect(screen.queryByRole('dialog', { name: 'Bỏ thay đổi chưa lưu?' })).not.toBeInTheDocument();

    await act(() => router.navigate('/elsewhere'));
    const dialog = await screen.findByRole('dialog', { name: 'Bỏ thay đổi chưa lưu?' });
    expect(within(dialog).getByText('Những gì bạn vừa gõ sẽ không được lưu.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Ở lại' }));
    expect(router.state.location.pathname).toBe('/site');

    await act(() => router.navigate('/elsewhere'));
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Bỏ thay đổi chưa lưu?' })).getByRole(
        'button',
        { name: 'Bỏ thay đổi' },
      ),
    );
    expect(await screen.findByText('Trang khác')).toBeInTheDocument();
  });

  it('is read-only for a user with only site.read', async () => {
    mockSite();
    const user = userEvent.setup();
    renderPage({ permissions: ['site.read'] });
    await loaded();
    expect(screen.getByLabelText('Hotline')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Mô tả')).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Lưu nháp' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Hoàn tác' })).toBeDisabled();
    const publish = screen.getByRole('button', { name: 'Lưu & xuất bản' });
    expect(publish).toBeDisabled();
    expect(publish).toHaveAttribute('title', 'Bạn không có quyền xuất bản website');
    await user.click(screen.getByRole('tab', { name: 'Trang chủ' }));
    expect(screen.getByRole('switch', { name: 'Hiện dòng trạng thái nhận máy' })).toBeDisabled();
    expect(screen.getByLabelText('Tiêu đề · dòng 1')).toHaveAttribute('readonly');
  });
});
