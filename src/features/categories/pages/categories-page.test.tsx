import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http as mock, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { categoriesFixture, categoryFixtures, categoryItem } from '@/test/fixtures/categories';
import { problem } from '@/test/msw/problem';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import type { CategoryDto } from '../model/adapters';
import { CategoriesPage } from './CategoriesPage';

const BASE = 'http://localhost/admin/v1';
const [huongDan, tinTuc, khuyenMai] = categoryFixtures as [CategoryDto, CategoryDto, CategoryDto];

function mockList(items: CategoryDto[] = categoryFixtures) {
  server.use(mock.get(`${BASE}/categories`, () => HttpResponse.json({ items })));
}

function renderPage(permissions: string[] = ['*']) {
  return renderWithProviders(<CategoriesPage />, {
    route: '/categories',
    session: { permissions },
  });
}

/** jsdom has no layout: give each element a rect from its index among its siblings. */
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const index = this.parentElement ? Array.from(this.parentElement.children).indexOf(this) : 0;
    return DOMRect.fromRect({ x: 0, y: index * 60, width: 800, height: 52 });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function rowNames() {
  const list = screen.getByRole('list', { name: 'Danh sách chuyên mục' });
  return within(list)
    .getAllByRole('listitem')
    .map((li) => li.querySelector('[data-cell="name"]')?.textContent);
}

async function dragDownOnce(handleName: string) {
  const user = userEvent.setup();
  screen.getByRole('button', { name: handleName }).focus();
  await user.keyboard(' ');
  await user.keyboard('{ArrowDown}');
  await user.keyboard(' ');
}

describe('CategoriesPage', () => {
  it('shows the header and the rows in server order', async () => {
    mockList();
    renderPage();
    expect(await screen.findByText('Hướng dẫn')).toBeInTheDocument();
    expect(screen.getByText('Nội dung · Chuyên mục')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Chuyên mục', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thêm chuyên mục' })).toBeEnabled();
    expect(rowNames()).toEqual(['Hướng dẫn', 'Tin tức', 'Khuyến mãi']);
    expect(screen.getByText('/huong-dan')).toBeInTheDocument();
    expect(screen.getByText('Mô tả Tin tức')).toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    mockList([]);
    renderPage();
    expect(await screen.findByText('Chưa có chuyên mục nào.')).toBeInTheDocument();
  });

  it('adding with an empty Đường dẫn sends no slug', async () => {
    mockList();
    const bodies: unknown[] = [];
    server.use(
      mock.post(`${BASE}/categories`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(categoryItem(4, 'Mẹo vặt', 'meo-vat', 0), { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Thêm chuyên mục' }));
    const dialog = await screen.findByRole('dialog', { name: 'Thêm chuyên mục' });
    expect(within(dialog).getByText('Để trống để tự tạo từ tên.')).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText('Tên'), 'Mẹo vặt');
    await user.type(within(dialog).getByLabelText('Mô tả'), 'Mẹo hay');
    await user.click(within(dialog).getByRole('button', { name: 'Thêm' }));
    await waitFor(() => {
      expect(bodies).toEqual([{ name: 'Mẹo vặt', description: 'Mẹo hay' }]);
    });
    expect(await screen.findByText('Đã thêm chuyên mục')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('adding with a Đường dẫn sends the slug', async () => {
    mockList();
    const bodies: unknown[] = [];
    server.use(
      mock.post(`${BASE}/categories`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(categoryItem(4, 'Mẹo vặt', 'meo', 0), { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Thêm chuyên mục' }));
    const dialog = await screen.findByRole('dialog', { name: 'Thêm chuyên mục' });
    await user.type(within(dialog).getByLabelText('Tên'), 'Mẹo vặt');
    await user.type(within(dialog).getByLabelText('Đường dẫn'), 'meo');
    await user.click(within(dialog).getByRole('button', { name: 'Thêm' }));
    await waitFor(() => {
      expect(bodies).toEqual([{ name: 'Mẹo vặt', slug: 'meo', description: '' }]);
    });
  });

  it('rejects a malformed Đường dẫn before sending', async () => {
    mockList();
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Thêm chuyên mục' }));
    const dialog = await screen.findByRole('dialog', { name: 'Thêm chuyên mục' });
    await user.type(within(dialog).getByLabelText('Tên'), 'Mẹo vặt');
    await user.type(within(dialog).getByLabelText('Đường dẫn'), 'Mẹo Vặt');
    await user.click(within(dialog).getByRole('button', { name: 'Thêm' }));
    expect(
      await within(dialog).findByText('Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.'),
    ).toBeInTheDocument();
  });

  it('CATEGORY_NAME_TAKEN shows under Tên and keeps the dialog open', async () => {
    mockList();
    server.use(mock.post(`${BASE}/categories`, () => problem(409, 'CATEGORY_NAME_TAKEN')));
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Thêm chuyên mục' }));
    const dialog = await screen.findByRole('dialog', { name: 'Thêm chuyên mục' });
    await user.type(within(dialog).getByLabelText('Tên'), 'Tin tức');
    await user.click(within(dialog).getByRole('button', { name: 'Thêm' }));
    expect(await within(dialog).findByText('Đã có chuyên mục cùng tên.')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Tên')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('dialog', { name: 'Thêm chuyên mục' })).toBeInTheDocument();
  });

  it('SLUG_TAKEN and VALIDATION_FAILED show under the right field', async () => {
    mockList();
    let call = 0;
    server.use(
      mock.post(`${BASE}/categories`, () => {
        call += 1;
        return call === 1
          ? problem(409, 'SLUG_TAKEN')
          : problem(422, 'VALIDATION_FAILED', {
              errors: [{ path: 'description', message: 'Mô tả quá dài.' }],
            });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Thêm chuyên mục' }));
    const dialog = await screen.findByRole('dialog', { name: 'Thêm chuyên mục' });
    await user.type(within(dialog).getByLabelText('Tên'), 'Mẹo');
    await user.type(within(dialog).getByLabelText('Đường dẫn'), 'tin-tuc');
    await user.click(within(dialog).getByRole('button', { name: 'Thêm' }));
    expect(await within(dialog).findByText('Đường dẫn này đã được dùng.')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Đường dẫn')).toHaveAttribute('aria-invalid', 'true');
    await user.click(within(dialog).getByRole('button', { name: 'Thêm' }));
    expect(await within(dialog).findByText('Mô tả quá dài.')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Mô tả')).toHaveAttribute('aria-invalid', 'true');
  });

  it('editing sends only the changed fields with the version from when it opened', async () => {
    mockList();
    const bodies: unknown[] = [];
    const ids: unknown[] = [];
    server.use(
      mock.patch(`${BASE}/categories/:id`, async ({ request, params }) => {
        bodies.push(await request.json());
        ids.push(params.id);
        return HttpResponse.json({ ...tinTuc, name: 'Tin mới', version: 4 });
      }),
    );
    const user = userEvent.setup();
    const { queryClient } = renderPage();
    await user.click(await screen.findByRole('button', { name: 'Sửa Tin tức' }));
    const dialog = await screen.findByRole('dialog', { name: 'Sửa chuyên mục' });
    expect(within(dialog).queryByText('Để trống để tự tạo từ tên.')).not.toBeInTheDocument();
    // A refetch bumping the version while the dialog is open must not change what is sent.
    act(() => {
      queryClient.setQueryData(['categories'], [huongDan, { ...tinTuc, version: 9 }, khuyenMai]);
    });
    const name = within(dialog).getByLabelText('Tên');
    await user.clear(name);
    await user.type(name, 'Tin mới');
    await user.click(within(dialog).getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(bodies).toEqual([{ version: tinTuc.version, name: 'Tin mới' }]);
    });
    expect(ids).toEqual([tinTuc.id]);
    expect(await screen.findByText('Đã lưu chuyên mục')).toBeInTheDocument();
  });

  it('editing without changes closes without a PATCH', async () => {
    mockList();
    let calls = 0;
    server.use(
      mock.patch(`${BASE}/categories/:id`, () => {
        calls += 1;
        return HttpResponse.json(tinTuc);
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Sửa Tin tức' }));
    const dialog = await screen.findByRole('dialog', { name: 'Sửa chuyên mục' });
    await user.click(within(dialog).getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(calls).toBe(0);
  });

  it('editing requires Đường dẫn', async () => {
    mockList();
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Sửa Tin tức' }));
    const dialog = await screen.findByRole('dialog', { name: 'Sửa chuyên mục' });
    await user.clear(within(dialog).getByLabelText('Đường dẫn'));
    await user.click(within(dialog).getByRole('button', { name: 'Lưu' }));
    expect(await within(dialog).findByText('Không được để trống.')).toBeInTheDocument();
  });

  it('VERSION_CONFLICT on edit closes the dialog', async () => {
    mockList();
    server.use(mock.patch(`${BASE}/categories/:id`, () => problem(409, 'VERSION_CONFLICT')));
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Sửa Tin tức' }));
    const dialog = await screen.findByRole('dialog', { name: 'Sửa chuyên mục' });
    await user.type(within(dialog).getByLabelText('Tên'), ' 2');
    await user.click(within(dialog).getByRole('button', { name: 'Lưu' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Sửa chuyên mục' })).not.toBeInTheDocument();
    });
  });

  it('a category with posts cannot be deleted', async () => {
    mockList([categoryItem(1, 'Hướng dẫn', 'huong-dan', 12)]);
    renderPage();
    const del = await screen.findByRole('button', { name: 'Xoá Hướng dẫn' });
    expect(del).toBeDisabled();
    expect(del).toHaveAttribute('title', 'Còn 12 bài trong chuyên mục');
  });

  it('deleting an empty category sends ?version=', async () => {
    mockList();
    const deletes: string[] = [];
    server.use(
      mock.delete(`${BASE}/categories/:id`, ({ request, params }) => {
        deletes.push(`${String(params.id)}?${new URL(request.url).searchParams.toString()}`);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Xoá Tin tức' }));
    const dialog = await screen.findByRole('dialog', { name: 'Xoá chuyên mục Tin tức?' });
    expect(within(dialog).getByText('Chuyên mục bị xoá khỏi website.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    await waitFor(() => {
      expect(deletes).toEqual([`${tinTuc.id}?version=${String(tinTuc.version)}`]);
    });
    expect(await screen.findByText('Đã xoá chuyên mục')).toBeInTheDocument();
  });

  it('CATEGORY_NOT_EMPTY toasts the server post count and reloads the list', async () => {
    let lists = 0;
    server.use(
      mock.get(`${BASE}/categories`, () => {
        lists += 1;
        return HttpResponse.json({
          items:
            lists === 1 ? categoryFixtures : [huongDan, { ...tinTuc, postCount: 3 }, khuyenMai],
        });
      }),
      mock.delete(`${BASE}/categories/:id`, () =>
        problem(409, 'CATEGORY_NOT_EMPTY', { postCount: 3 }),
      ),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Xoá Tin tức' }));
    const dialog = await screen.findByRole('dialog', { name: 'Xoá chuyên mục Tin tức?' });
    await user.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    expect(await screen.findByText('Còn 3 bài trong chuyên mục')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Xoá Tin tức' })).toBeDisabled();
    });
    expect(screen.getByRole('button', { name: 'Xoá Tin tức' })).toHaveAttribute(
      'title',
      'Còn 3 bài trong chuyên mục',
    );
  });

  it('deleting a category that is already gone toasts, reloads and closes the confirm', async () => {
    let lists = 0;
    server.use(
      mock.get(`${BASE}/categories`, () => {
        lists += 1;
        return HttpResponse.json({ items: lists === 1 ? categoryFixtures : [huongDan, khuyenMai] });
      }),
      mock.delete(`${BASE}/categories/:id`, () => problem(404, 'NOT_FOUND')),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Xoá Tin tức' }));
    const dialog = await screen.findByRole('dialog', { name: 'Xoá chuyên mục Tin tức?' });
    await user.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(rowNames()).toEqual(['Hướng dẫn', 'Khuyến mãi']);
    });
  });

  it('a failed reorder reloads the list so a deleted row disappears', async () => {
    let lists = 0;
    server.use(
      mock.get(`${BASE}/categories`, () => {
        lists += 1;
        return HttpResponse.json({
          items: lists === 1 ? categoryFixtures : [tinTuc, khuyenMai],
        });
      }),
      mock.patch(`${BASE}/categories/:id`, () => problem(404, 'NOT_FOUND')),
    );
    renderPage();
    await screen.findByText('Hướng dẫn');
    await dragDownOnce('Đổi thứ tự Hướng dẫn');
    await waitFor(() => {
      expect(rowNames()).toEqual(['Tin tức', 'Khuyến mãi']);
    });
  });

  it('a keyboard drag one step down sends exactly one PATCH { version, position }', async () => {
    let lists = 0;
    server.use(
      mock.get(`${BASE}/categories`, () => {
        lists += 1;
        return HttpResponse.json(
          lists === 1
            ? categoriesFixture
            : {
                items: [
                  { ...tinTuc, position: 0 },
                  { ...huongDan, position: 1, version: 2 },
                  khuyenMai,
                ],
              },
        );
      }),
    );
    const bodies: unknown[] = [];
    const ids: unknown[] = [];
    server.use(
      mock.patch(`${BASE}/categories/:id`, async ({ request, params }) => {
        bodies.push(await request.json());
        ids.push(params.id);
        return HttpResponse.json({ ...huongDan, position: 1, version: 2 });
      }),
    );
    renderPage();
    await screen.findByText('Hướng dẫn');
    await dragDownOnce('Đổi thứ tự Hướng dẫn');
    expect(await screen.findByText('Đã đổi thứ tự')).toBeInTheDocument();
    expect(bodies).toEqual([{ version: huongDan.version, position: 1 }]);
    expect(ids).toEqual([huongDan.id]);
    await waitFor(() => {
      expect(rowNames()).toEqual(['Tin tức', 'Hướng dẫn', 'Khuyến mãi']);
    });
  });

  it('a second drag waits for the reloaded list and sends the moved item new version', async () => {
    let lists = 0;
    let release: () => void = () => undefined;
    const reload = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      mock.get(`${BASE}/categories`, async () => {
        lists += 1;
        if (lists === 1) return HttpResponse.json(categoriesFixture);
        await reload;
        return HttpResponse.json({
          items: [{ ...tinTuc, position: 0 }, { ...huongDan, position: 1, version: 2 }, khuyenMai],
        });
      }),
    );
    const bodies: unknown[] = [];
    server.use(
      mock.patch(`${BASE}/categories/:id`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ ...huongDan, position: 1, version: 2 });
      }),
    );
    renderPage();
    await screen.findByText('Hướng dẫn');
    await dragDownOnce('Đổi thứ tự Hướng dẫn');
    expect(await screen.findByText('Đã đổi thứ tự')).toBeInTheDocument();
    // The PATCH settled but the list still holds version 1: dragging stays refused.
    const handle = screen.getByRole('button', { name: 'Đổi thứ tự Hướng dẫn' });
    expect(handle).toHaveAttribute('aria-disabled', 'true');
    expect(handle).toHaveAttribute('title', 'Đang đổi thứ tự');
    for (const name of ['Sửa Tin tức', 'Xoá Tin tức']) {
      const button = screen.getByRole('button', { name });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('title', 'Đang đổi thứ tự');
    }
    await dragDownOnce('Đổi thứ tự Hướng dẫn');
    expect(bodies).toHaveLength(1);
    expect(rowNames()).toEqual(['Tin tức', 'Hướng dẫn', 'Khuyến mãi']);
    act(() => {
      release();
    });
    await waitFor(() => {
      expect(handle).not.toHaveAttribute('aria-disabled', 'true');
    });
    await dragDownOnce('Đổi thứ tự Hướng dẫn');
    await waitFor(() => {
      expect(bodies).toHaveLength(2);
    });
    expect(bodies[1]).toEqual({ version: 2, position: 2 });
  });

  it('without category.manage the actions are disabled with a tooltip', async () => {
    mockList();
    renderPage(['category.read']);
    await screen.findByText('Hướng dẫn');
    const title = 'Bạn không có quyền quản lý chuyên mục';
    const add = screen.getByRole('button', { name: 'Thêm chuyên mục' });
    expect(add).toBeDisabled();
    expect(add).toHaveAttribute('title', title);
    for (const name of ['Sửa Tin tức', 'Xoá Tin tức', 'Đổi thứ tự Tin tức']) {
      const button = screen.getByRole('button', { name });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('title', title);
    }
  });
});
