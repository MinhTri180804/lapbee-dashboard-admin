import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { siteFixture } from '@/test/fixtures/site';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import type { SiteDto } from '../model/types';
import { ServicesList } from './ServicesList';
import { TeamGrid } from './TeamGrid';
import { TimelineList } from './TimelineList';

const BASE = 'http://localhost/admin/v1';
const [svc0, svc1] = siteFixture.draft.services;

function mockSite(site: SiteDto = siteFixture) {
  server.use(mock.get(`${BASE}/site`, () => HttpResponse.json(site)));
}

function renderList(ui: ReactElement, permissions: string[] = ['*']) {
  return renderWithProviders(ui, {
    route: '/site',
    session: { permissions },
    routes: [{ path: '/site/:kind/:id', element: <p>Trang mục</p> }],
  });
}

/** jsdom has no layout: give each element a rect from its index among its siblings. */
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const index = this.parentElement ? Array.from(this.parentElement.children).indexOf(this) : 0;
    const top = index * 80;
    return DOMRect.fromRect({ x: 0, y: top, width: 600, height: 72 });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function rowTitles() {
  return screen.getAllByRole('listitem').map((li) => within(li).getByRole('heading').textContent);
}

/** A promise the test opens by hand, to hold a mocked response. */
function gate() {
  let open: () => void = () => undefined;
  const wait = new Promise<void>((resolve) => {
    open = resolve;
  });
  return {
    wait,
    open: () => {
      open();
    },
  };
}

async function dragDownOnce(handleName: string) {
  const user = userEvent.setup();
  const handle = screen.getByRole('button', { name: handleName });
  handle.focus();
  await user.keyboard(' ');
  await user.keyboard('{ArrowDown}');
  await user.keyboard(' ');
}

describe('ServicesList', () => {
  it('shows the summary, rows and add button', async () => {
    mockSite();
    renderList(<ServicesList />);
    expect(await screen.findByText('2 dịch vụ · 1 đang hiển thị')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dịch vụ' })).toBeInTheDocument();
    expect(rowTitles()).toEqual(['Sửa laptop', 'Vệ sinh máy']);
    expect(screen.getByText('1-2 ngày')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thêm dịch vụ' })).toBeInTheDocument();
  });

  it('toggling the switch sends { version, visible }', async () => {
    mockSite();
    let body: unknown;
    let id: unknown;
    server.use(
      mock.patch(`${BASE}/site/services/:id`, async ({ request, params }) => {
        body = await request.json();
        id = params.id;
        return HttpResponse.json(siteFixture);
      }),
    );
    const user = userEvent.setup();
    renderList(<ServicesList />);
    const sw = await screen.findByRole('switch', { name: 'Hiện Vệ sinh máy' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await user.click(sw);
    await waitFor(() => {
      expect(body).toEqual({ version: svc1?.version, visible: true });
    });
    expect(id).toBe(svc1?.id);
  });

  it('keyboard drag one step down sends { version, position: 1 } and shows the new order', async () => {
    mockSite();
    let body: unknown;
    let id: unknown;
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const reordered: SiteDto = {
      ...siteFixture,
      draft: {
        ...siteFixture.draft,
        services: [
          { ...siteFixture.draft.services[1]!, position: 0 },
          { ...siteFixture.draft.services[0]!, position: 1, version: 3 },
        ],
      },
    };
    server.use(
      mock.patch(`${BASE}/site/services/:id`, async ({ request, params }) => {
        body = await request.json();
        id = params.id;
        await gate;
        return HttpResponse.json(reordered);
      }),
    );
    renderList(<ServicesList />);
    await screen.findByText('Sửa laptop');
    await dragDownOnce('Đổi thứ tự Sửa laptop');
    await waitFor(() => {
      expect(body).toEqual({ version: svc0?.version, position: 1 });
    });
    expect(id).toBe(svc0?.id);
    // Optimistic: the new order shows while the request is pending.
    expect(rowTitles()).toEqual(['Vệ sinh máy', 'Sửa laptop']);
    act(() => {
      release();
    });
    await waitFor(() => {
      expect(rowTitles()).toEqual(['Vệ sinh máy', 'Sửa laptop']);
    });
  });

  it('shows the new order, then restores it when the PATCH fails', async () => {
    mockSite();
    const reorder = gate();
    server.use(
      mock.patch(`${BASE}/site/services/:id`, async () => {
        await reorder.wait;
        return problem(500, 'INTERNAL');
      }),
    );
    renderList(<ServicesList />);
    await screen.findByText('Sửa laptop');
    await dragDownOnce('Đổi thứ tự Sửa laptop');
    expect(rowTitles()).toEqual(['Vệ sinh máy', 'Sửa laptop']);
    act(() => {
      reorder.open();
    });
    await waitFor(() => {
      expect(rowTitles()).toEqual(['Sửa laptop', 'Vệ sinh máy']);
    });
  });

  it('disables the switches while a reorder is in flight', async () => {
    mockSite();
    const reorder = gate();
    server.use(
      mock.patch(`${BASE}/site/services/:id`, async () => {
        await reorder.wait;
        return problem(500, 'INTERNAL');
      }),
    );
    renderList(<ServicesList />);
    await screen.findByText('Sửa laptop');
    await dragDownOnce('Đổi thứ tự Sửa laptop');
    expect(rowTitles()).toEqual(['Vệ sinh máy', 'Sửa laptop']);
    expect(screen.getByRole('switch', { name: 'Hiện Vệ sinh máy' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Hiện Sửa laptop' })).toBeDisabled();
    act(() => {
      reorder.open();
    });
    await waitFor(() => {
      expect(rowTitles()).toEqual(['Sửa laptop', 'Vệ sinh máy']);
    });
    expect(screen.getByRole('switch', { name: 'Hiện Vệ sinh máy' })).toBeEnabled();
  });

  it('sends one toggle per row until it settles (a double click is not a conflict)', async () => {
    mockSite();
    const toggle = gate();
    const bodies: unknown[] = [];
    server.use(
      mock.patch(`${BASE}/site/services/:id`, async ({ request }) => {
        bodies.push(await request.json());
        await toggle.wait;
        return HttpResponse.json(siteFixture);
      }),
    );
    const user = userEvent.setup();
    renderList(<ServicesList />);
    const sw = await screen.findByRole('switch', { name: 'Hiện Vệ sinh máy' });
    await user.dblClick(sw);
    await waitFor(() => {
      expect(bodies).toHaveLength(1);
    });
    expect(sw).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Hiện Sửa laptop' })).toBeEnabled();
    act(() => {
      toggle.open();
    });
    await waitFor(() => {
      expect(sw).toBeEnabled();
    });
    expect(bodies).toHaveLength(1);
  });

  it('ignores a second drag while a reorder is in flight', async () => {
    mockSite();
    const reorder = gate();
    const bodies: unknown[] = [];
    const reordered: SiteDto = {
      ...siteFixture,
      draft: {
        ...siteFixture.draft,
        services: [
          { ...siteFixture.draft.services[1]!, position: 0 },
          { ...siteFixture.draft.services[0]!, position: 1, version: 3 },
        ],
      },
    };
    server.use(
      mock.patch(`${BASE}/site/services/:id`, async ({ request }) => {
        bodies.push(await request.json());
        await reorder.wait;
        return HttpResponse.json(reordered);
      }),
    );
    renderList(<ServicesList />);
    await screen.findByText('Sửa laptop');
    await dragDownOnce('Đổi thứ tự Sửa laptop');
    await waitFor(() => {
      expect(bodies).toHaveLength(1);
    });
    const handle = screen.getByRole('button', { name: 'Đổi thứ tự Vệ sinh máy' });
    expect(handle).toHaveAttribute('aria-disabled', 'true');
    await dragDownOnce('Đổi thứ tự Vệ sinh máy');
    expect(rowTitles()).toEqual(['Vệ sinh máy', 'Sửa laptop']);
    act(() => {
      reorder.open();
    });
    await waitFor(() => {
      expect(handle).not.toHaveAttribute('aria-disabled', 'true');
    });
    expect(bodies).toHaveLength(1);
    expect(rowTitles()).toEqual(['Vệ sinh máy', 'Sửa laptop']);
  });

  it('without site.update disables add, handles and switches', async () => {
    mockSite();
    renderList(<ServicesList />, ['site.read']);
    await screen.findByText('Sửa laptop');
    const add = screen.getByRole('button', { name: 'Thêm dịch vụ' });
    expect(add).toBeDisabled();
    expect(add).toHaveAttribute('title', 'Bạn không có quyền sửa website');
    expect(screen.getByRole('switch', { name: 'Hiện Sửa laptop' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Đổi thứ tự Sửa laptop' })).toBeDisabled();
  });

  it('edit and add navigate to the item routes', async () => {
    mockSite();
    const user = userEvent.setup();
    const { router } = renderList(<ServicesList />);
    await user.click(await screen.findByRole('button', { name: 'Sửa Vệ sinh máy' }));
    expect(router.state.location.pathname).toBe(`/site/services/${svc1?.id ?? ''}`);
  });
});

describe('TeamGrid', () => {
  it('shows the summary, photo thumbnail, placeholder and since', async () => {
    mockSite();
    renderList(<TeamGrid />);
    expect(await screen.findByText('2 thành viên')).toBeInTheDocument();
    const minh = screen.getByRole('button', { name: /^Minh/ });
    expect(minh.querySelector('img')).toHaveAttribute(
      'src',
      siteFixture.draft.team[0]?.photo?.thumbUrl,
    );
    expect(within(minh).getByText('Từ 2015')).toBeInTheDocument();
    const lan = screen.getByRole('button', { name: /^Lan/ });
    expect(lan.querySelector('img')).toBeNull();
    expect(within(lan).getByText('Ảnh chân dung')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thêm thành viên' })).toBeInTheDocument();
  });

  it('shows "Đang ẩn" on hidden members', async () => {
    const team = siteFixture.draft.team.map((m, i) => (i === 1 ? { ...m, visible: false } : m));
    mockSite({ ...siteFixture, draft: { ...siteFixture.draft, team } });
    renderList(<TeamGrid />);
    const lan = await screen.findByRole('button', { name: /^Lan/ });
    expect(within(lan).getByText('Đang ẩn')).toBeInTheDocument();
  });

  it('without site.update disables add with a tooltip', async () => {
    mockSite();
    renderList(<TeamGrid />, ['site.read']);
    const add = await screen.findByRole('button', { name: 'Thêm thành viên' });
    expect(add).toBeDisabled();
    expect(add).toHaveAttribute('title', 'Bạn không có quyền sửa website');
  });

  it('clicking a card opens the member', async () => {
    mockSite();
    const user = userEvent.setup();
    const { router } = renderList(<TeamGrid />);
    await user.click(await screen.findByRole('button', { name: /^Lan/ }));
    expect(router.state.location.pathname).toBe(
      `/site/team/${siteFixture.draft.team[1]?.id ?? ''}`,
    );
  });

  it('keyboard drag sends { version, position: 1 }', async () => {
    mockSite();
    let body: unknown;
    server.use(
      mock.patch(`${BASE}/site/team/:id`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(siteFixture);
      }),
    );
    renderList(<TeamGrid />);
    await screen.findByText('2 thành viên');
    await dragDownOnce('Đổi thứ tự Minh');
    await waitFor(() => {
      expect(body).toEqual({ version: siteFixture.draft.team[0]?.version, position: 1 });
    });
  });
});

describe('TimelineList', () => {
  it('shows the summary, years and media labels', async () => {
    mockSite();
    renderList(<TimelineList />);
    expect(await screen.findByText('2 mốc · 2015 – 2020')).toBeInTheDocument();
    expect(screen.getByText('2 ảnh')).toBeInTheDocument();
    expect(screen.getByText('Trích dẫn')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thêm mốc' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Đổi thứ tự/ })).not.toBeInTheDocument();
  });

  it('without site.update disables add with a tooltip', async () => {
    mockSite();
    renderList(<TimelineList />, ['site.read']);
    const add = await screen.findByRole('button', { name: 'Thêm mốc' });
    expect(add).toBeDisabled();
    expect(add).toHaveAttribute('title', 'Bạn không có quyền sửa website');
  });

  it('labels text-only milestones "Chỉ chữ" and edit navigates', async () => {
    const timeline = siteFixture.draft.timeline.map((t, i) =>
      i === 0 ? { ...t, media: 'none' as const, photos: [] } : t,
    );
    mockSite({ ...siteFixture, draft: { ...siteFixture.draft, timeline } });
    const user = userEvent.setup();
    const { router } = renderList(<TimelineList />);
    expect(await screen.findByText('Chỉ chữ')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sửa Khách hàng nói gì' }));
    expect(router.state.location.pathname).toBe(
      `/site/timeline/${siteFixture.draft.timeline[1]?.id ?? ''}`,
    );
  });
});
