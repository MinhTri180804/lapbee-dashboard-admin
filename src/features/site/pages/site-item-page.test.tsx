import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers';
import { routes } from '@/app/router';
import { sessionStore } from '@/shared/auth/session-store';
import { meFixture } from '@/test/fixtures/auth';
import { mediaItem, mediaListFixture } from '@/test/fixtures/media';
import { siteFixture } from '@/test/fixtures/site';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { createTestQueryClient, renderWithProviders } from '@/test/render';
import { siteKeys } from '../model/keys';
import type { ItemKind, SiteDto } from '../model/types';
import { SiteItemPage } from './SiteItemPage';

const BASE = 'http://localhost/admin/v1';
const SERVICE = siteFixture.draft.services[0]!;
const TIMELINE = siteFixture.draft.timeline[0]!;
const YEAR = new Date().getFullYear();

function mockSite(site: SiteDto = siteFixture) {
  server.use(mock.get(`${BASE}/site`, () => HttpResponse.json(site)));
}

function renderItem(
  kind: ItemKind,
  id?: string,
  { permissions = ['*'] }: { permissions?: string[] } = {},
) {
  return renderWithProviders(<SiteItemPage kind={kind} {...(id ? { id } : {})} />, {
    route: `/site/${kind}/${id ?? 'new'}`,
    session: { permissions },
    routes: [{ path: '/site', element: <p>Trang thông tin website</p> }],
  });
}

describe('SiteItemPage', () => {
  it('adds a service with the picked icon and position', async () => {
    mockSite();
    const bodies: unknown[] = [];
    server.use(
      mock.post(`${BASE}/site/services`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ id: SERVICE.id, site: siteFixture }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    const { router } = renderItem('services');
    await user.type(await screen.findByLabelText('Tên dịch vụ'), 'Thay pin');
    expect(screen.getByRole('heading', { level: 1, name: 'Thêm dịch vụ' })).toBeInTheDocument();
    expect(screen.getByText('Thêm dịch vụ', { selector: '.lb-label' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'cpu' }));
    expect(screen.getByRole('button', { name: 'cpu' })).toHaveAttribute('aria-pressed', 'true');
    const position = screen.getByLabelText('Vị trí');
    expect(position).toHaveDisplayValue('Vị trí 3 / 3');
    await user.selectOptions(position, 'Vị trí 1 / 3');
    const preview = screen.getByRole('region', { name: 'Xem trước · mục Dịch vụ, trang chủ' });
    expect(within(preview).getByRole('heading', { name: 'Thay pin' })).toBeInTheDocument();
    expect(within(preview).getByText('Mô tả ngắn về dịch vụ.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Thêm dịch vụ' }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/site');
    });
    expect(router.state.location.search).toBe('?tab=services');
    expect(bodies).toEqual([
      { icon: 'cpu', title: 'Thay pin', desc: '', time: '', visible: true, position: 0 },
    ]);
    expect(await screen.findByText('Đã thêm dịch vụ')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Bỏ thay đổi chưa lưu?' })).not.toBeInTheDocument();
  });

  it('requires a title before sending', async () => {
    mockSite();
    let posts = 0;
    server.use(
      mock.post(`${BASE}/site/services`, () => {
        posts += 1;
        return HttpResponse.json({ id: SERVICE.id, site: siteFixture }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderItem('services');
    await screen.findByLabelText('Tên dịch vụ');
    await user.click(screen.getByRole('button', { name: 'Thêm dịch vụ' }));
    expect(await screen.findByLabelText('Tên dịch vụ')).toHaveAccessibleDescription(
      'Không được để trống.',
    );
    expect(posts).toBe(0);
  });

  it('patches only the changed field with the version the form was opened with', async () => {
    mockSite();
    const bodies: unknown[] = [];
    server.use(
      mock.patch(`${BASE}/site/services/${SERVICE.id}`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(siteFixture);
      }),
    );
    const user = userEvent.setup();
    const { router, queryClient } = renderItem('services', SERVICE.id);
    expect(await screen.findByLabelText('Tên dịch vụ')).toHaveValue('Sửa laptop');
    expect(screen.getByRole('heading', { level: 1, name: 'Sửa laptop' })).toBeInTheDocument();
    expect(screen.getByText('Sửa dịch vụ · 01')).toBeInTheDocument();
    expect(screen.getByLabelText('Vị trí')).toHaveDisplayValue('Vị trí 1 / 2');
    await user.type(screen.getByLabelText('Mô tả'), ', pin');
    expect(screen.getByText('28 / 90 ký tự · một câu, nói rõ sửa được gì')).toBeInTheDocument();
    // Someone else saved meanwhile: the cache now holds a newer version of the item.
    act(() => {
      queryClient.setQueryData<SiteDto>(siteKeys.detail, {
        ...siteFixture,
        draft: {
          ...siteFixture.draft,
          services: siteFixture.draft.services.map((s) =>
            s.id === SERVICE.id ? { ...s, version: 9 } : s,
          ),
        },
      });
    });
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => {
      expect(router.state.location.search).toBe('?tab=services');
    });
    expect(bodies).toEqual([{ version: 2, desc: 'Thay màn hình, bàn phím, pin' }]);
    expect(await screen.findByText('Đã cập nhật dịch vụ')).toBeInTheDocument();
  });

  it('after a version conflict, the reloaded version becomes the baseline and edits stay', async () => {
    mockSite();
    const bodies: unknown[] = [];
    server.use(
      mock.patch(`${BASE}/site/services/${SERVICE.id}`, async ({ request }) => {
        bodies.push(await request.json());
        return bodies.length === 1
          ? problem(409, 'VERSION_CONFLICT')
          : HttpResponse.json(siteFixture);
      }),
    );
    const user = userEvent.setup();
    const { router, queryClient } = renderItem('services', SERVICE.id);
    await user.type(await screen.findByLabelText('Mô tả'), ', pin');
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => {
      expect(bodies).toHaveLength(1);
    });
    // "Tải lại" in the conflict dialog refetches the site: someone renamed the service.
    act(() => {
      queryClient.setQueryData<SiteDto>(siteKeys.detail, {
        ...siteFixture,
        draft: {
          ...siteFixture.draft,
          services: siteFixture.draft.services.map((s) =>
            s.id === SERVICE.id ? { ...s, title: 'Sửa máy tính', version: 3 } : s,
          ),
        },
      });
    });
    expect(await screen.findByDisplayValue('Sửa máy tính')).toBeInTheDocument();
    expect(screen.getByLabelText('Mô tả')).toHaveValue('Thay màn hình, bàn phím, pin');
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => {
      expect(router.state.location.search).toBe('?tab=services');
    });
    expect(bodies[1]).toEqual({ version: 3, desc: 'Thay màn hình, bàn phím, pin' });
  });

  it('asks before deleting and sends ?version=', async () => {
    mockSite();
    const urls: URL[] = [];
    server.use(
      mock.delete(`${BASE}/site/services/${SERVICE.id}`, ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json(siteFixture);
      }),
    );
    const user = userEvent.setup();
    const { router } = renderItem('services', SERVICE.id);
    await screen.findByLabelText('Tên dịch vụ');
    await user.click(screen.getByRole('button', { name: 'Xoá' }));
    const dialog = screen.getByRole('dialog', { name: 'Xoá Sửa laptop?' });
    expect(
      within(dialog).getByText(
        'Mục bị xoá khỏi bản nháp. Bấm “Hoàn tác” ở trang Thông tin website nếu xoá nhầm.',
      ),
    ).toBeInTheDocument();
    expect(urls).toHaveLength(0);
    await user.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    await waitFor(() => {
      expect(router.state.location.search).toBe('?tab=services');
    });
    expect(urls[0]?.searchParams.get('version')).toBe('2');
    expect(await screen.findByText('Đã xoá dịch vụ')).toBeInTheDocument();
  });

  it('picks a team photo with the MediaPicker and sends photoMediaId', async () => {
    mockSite();
    const bodies: unknown[] = [];
    server.use(
      mock.get(`${BASE}/media`, () => HttpResponse.json(mediaListFixture)),
      mock.post(`${BASE}/site/team`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ id: 'x', site: siteFixture }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    const { router } = renderItem('team');
    await user.type(await screen.findByLabelText('Họ và tên'), 'Hùng');
    expect(screen.getByLabelText('Năm gia nhập')).toHaveAccessibleDescription(
      `Từ ${String(YEAR)} · thành viên mới`,
    );
    expect(screen.queryByRole('button', { name: 'Bỏ ảnh' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Chọn ảnh' }));
    await user.click(await screen.findByAltText('anh-1.jpg'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Chọn ảnh' })).not.toBeInTheDocument();
    });
    const preview = screen.getByRole('region', { name: 'Xem trước · trang Đội ngũ' });
    expect(within(preview).getByText('Hùng')).toBeInTheDocument();
    expect(within(preview).getByRole('presentation')).toHaveAttribute(
      'src',
      'https://cdn.lapbee.test/media/1.jpg',
    );
    expect(screen.getByRole('button', { name: 'Bỏ ảnh' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Thêm thành viên' }));
    await waitFor(() => {
      expect(router.state.location.search).toBe('?tab=team');
    });
    expect(bodies).toEqual([
      {
        name: 'Hùng',
        role: '',
        since: YEAR,
        bio: '',
        visible: true,
        photoMediaId: mediaItem(1).id,
        position: 2,
      },
    ]);
  });

  it('rejects an invalid join year', async () => {
    mockSite();
    const user = userEvent.setup();
    renderItem('team', siteFixture.draft.team[1]!.id);
    const since = await screen.findByLabelText('Năm gia nhập');
    expect(since).toHaveAccessibleDescription(`Từ 2020 · ${String(YEAR - 2020)} năm tại LAPBEE`);
    await user.clear(since);
    await user.type(since, '1800');
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByLabelText('Năm gia nhập')).toHaveAccessibleDescription(
      /Năm không hợp lệ\./,
    );
  });

  it('requires the quote text when the milestone shows a quote', async () => {
    mockSite();
    let posts = 0;
    server.use(
      mock.post(`${BASE}/site/timeline`, () => {
        posts += 1;
        return HttpResponse.json({ id: 'x', site: siteFixture }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderItem('timeline');
    await user.type(await screen.findByLabelText('Tiêu đề'), 'Mở xưởng');
    expect(screen.getByText('Các mốc tự sắp xếp theo năm, từ cũ đến mới.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Vị trí')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Trích dẫn/ }));
    await user.click(screen.getByRole('button', { name: 'Thêm mốc' }));
    expect(await screen.findByRole('textbox', { name: 'Trích dẫn' })).toHaveAccessibleDescription(
      'Không được để trống.',
    );
    expect(posts).toBe(0);
  });

  it('checks the year has 4 digits', async () => {
    mockSite();
    const user = userEvent.setup();
    renderItem('timeline');
    await user.type(await screen.findByLabelText('Tiêu đề'), 'Mở xưởng');
    const year = screen.getByLabelText('Năm');
    await user.clear(year);
    await user.type(year, '99');
    await user.click(screen.getByRole('button', { name: 'Thêm mốc' }));
    expect(await screen.findByLabelText('Năm')).toHaveAccessibleDescription('Năm gồm 4 chữ số.');
  });

  it('disables "Thêm ảnh" at 5 photos', async () => {
    mockSite();
    const user = userEvent.setup();
    renderItem('timeline', TIMELINE.id);
    expect(await screen.findByLabelText('Tiêu đề')).toHaveValue('Mở cửa hàng đầu tiên');
    expect(screen.getByText('2 / 5 ảnh')).toBeInTheDocument();
    const add = screen.getByRole('button', { name: 'Thêm ảnh' });
    await user.click(add);
    await user.click(add);
    await user.click(add);
    expect(screen.getByText('5 / 5 ảnh')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox', { name: /^Chú thích ảnh/ })).toHaveLength(5);
    expect(add).toBeDisabled();
  });

  it('shows "Không tìm thấy mục này" for an unknown id', async () => {
    mockSite();
    const user = userEvent.setup();
    const { router } = renderItem('team', '00000000-0000-4000-8000-000000000000');
    expect(
      await screen.findByRole('heading', { name: 'Không tìm thấy mục này' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Đội ngũ' }));
    await waitFor(() => {
      expect(router.state.location.search).toBe('?tab=team');
    });
  });

  it('maps VALIDATION_FAILED onto fields and SITE_ITEM_LIMIT to a toast', async () => {
    mockSite();
    let calls = 0;
    server.use(
      mock.post(`${BASE}/site/services`, () => {
        calls += 1;
        return calls === 1
          ? problem(422, 'VALIDATION_FAILED', {
              errors: [{ path: 'title', message: 'Tên quá dài' }],
            })
          : problem(409, 'SITE_ITEM_LIMIT');
      }),
    );
    const user = userEvent.setup();
    const { router } = renderItem('services');
    await user.type(await screen.findByLabelText('Tên dịch vụ'), 'Thay pin');
    await user.click(screen.getByRole('button', { name: 'Thêm dịch vụ' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Tên dịch vụ')).toHaveAccessibleDescription('Tên quá dài');
    });
    await user.click(screen.getByRole('button', { name: 'Thêm dịch vụ' }));
    expect(await screen.findByText('Đã đủ số mục tối đa.')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/site/services/new');
  });

  it('is read-only without site.update', async () => {
    mockSite();
    renderItem('services', SERVICE.id, { permissions: ['site.read'] });
    expect(await screen.findByLabelText('Tên dịch vụ')).toHaveAttribute('readonly');
    const save = screen.getByRole('button', { name: 'Lưu thay đổi' });
    expect(save).toBeDisabled();
    expect(save).toHaveAttribute('title', 'Bạn không có quyền sửa website');
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'cpu' })).toBeDisabled();
    expect(screen.getByLabelText('Vị trí')).toBeDisabled();
  });
});

describe('site item routes', () => {
  function renderApp(path: string) {
    server.use(
      mock.get(`${BASE}/auth/me`, () =>
        HttpResponse.json({ user: meFixture.user, permissions: ['*'], csrfToken: 'c' }),
      ),
    );
    mockSite();
    sessionStore.signIn({ user: meFixture.user, permissions: ['*'], csrfToken: 'c' });
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    render(
      <AppProviders queryClient={createTestQueryClient()}>
        <RouterProvider router={router} />
      </AppProviders>,
    );
    return router;
  }

  it('shows the 404 page for an unknown kind', async () => {
    renderApp('/site/foo/new');
    expect(
      await screen.findByRole('heading', { name: 'Không tìm thấy trang' }),
    ).toBeInTheDocument();
  });

  it('opens an item page from the app routes', async () => {
    renderApp(`/site/timeline/${TIMELINE.id}`);
    expect(await screen.findByLabelText('Tiêu đề')).toHaveValue('Mở cửa hàng đầu tiên');
    expect(screen.getByText('Sửa mốc · 01')).toBeInTheDocument();
  });
});
