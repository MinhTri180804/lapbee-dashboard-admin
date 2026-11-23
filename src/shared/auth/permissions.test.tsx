import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { meFixture } from '@/test/fixtures/auth';
import { Can, RequireAuth, RequirePermission, can } from './permissions';
import { sessionStore } from './session-store';

describe('can', () => {
  it('"*" cấp mọi quyền', () => {
    expect(can(['*'], 'user.manage')).toBe(true);
  });

  it('thiếu quyền thì false', () => {
    expect(can(['post.read'], 'post.publish')).toBe(false);
  });

  it('mode any chỉ cần một quyền', () => {
    expect(can(['post.read', 'post.update'], ['post.read', 'post.publish'], 'any')).toBe(true);
    expect(can(['post.read', 'post.update'], ['post.read', 'post.publish'])).toBe(false);
  });

  it('mảng rỗng luôn false', () => {
    expect(can([], 'post.read')).toBe(false);
    expect(can(['*'], [])).toBe(false);
    expect(can(['*'], [], 'any')).toBe(false);
  });
});

describe('Can / RequirePermission', () => {
  beforeEach(() => {
    sessionStore.signIn({ ...meFixture, permissions: ['post.read'] });
  });

  it('Can hiện children khi đủ quyền, fallback khi thiếu', () => {
    render(
      <>
        <Can perm="post.read">có</Can>
        <Can perm="post.publish" fallback={<span>không</span>}>
          ẩn
        </Can>
        <Can perm="post.publish">ẩn nữa</Can>
      </>,
    );
    expect(screen.getByText('có')).toBeInTheDocument();
    expect(screen.getByText('không')).toBeInTheDocument();
    expect(screen.queryByText('ẩn')).not.toBeInTheDocument();
    expect(screen.queryByText('ẩn nữa')).not.toBeInTheDocument();
  });

  it('RequirePermission hiện forbidden khi thiếu quyền', () => {
    render(
      <MemoryRouter>
        <RequirePermission perm="user.manage" forbidden={<p>403</p>}>
          <p>nội dung</p>
        </RequirePermission>
        <RequirePermission perm="post.read" forbidden={<p>403 khác</p>}>
          <p>được xem</p>
        </RequirePermission>
      </MemoryRouter>,
    );
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.queryByText('nội dung')).not.toBeInTheDocument();
    expect(screen.getByText('được xem')).toBeInTheDocument();
  });
});

function LocationProbe() {
  const { pathname, search } = useLocation();
  return <p>{`${pathname}${search}`}</p>;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/posts"
          element={
            <RequireAuth>
              <p>danh sách bài</p>
            </RequireAuth>
          }
        />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  it('anonymous chuyển tới /login?next=', () => {
    sessionStore.signOut();
    renderAt('/posts?page=2');
    expect(screen.getByText('/login?next=%2Fposts%3Fpage%3D2')).toBeInTheDocument();
  });

  it('authenticated hiện children', () => {
    sessionStore.signIn(meFixture);
    renderAt('/posts');
    expect(screen.getByText('danh sách bài')).toBeInTheDocument();
  });
});
