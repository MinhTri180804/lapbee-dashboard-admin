# LAPBEE Dashboard GĐ1: Nền tảng, đăng nhập, shell — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng SPA có nền tảng hoàn chỉnh (type sinh từ OpenAPI, API client với xử lý tập trung CSRF, lỗi, 401, step-up, conflict), phân quyền, shell sáng và tối, đăng nhập, đặt mật khẩu và trang tài khoản, chạy được với backend local.

**Architecture:** Hướng A trong design doc: chia theo feature, gồm `api/repo.ts` → `model/adapters.ts` → `hooks/` (TanStack Query) → UI. Tầng axios không import React; giao tiếp với UI qua event bus. Session nằm trong bộ nhớ.

**Tech Stack:** Node 24, TypeScript ~6.0.3 strict, Vite 8, React 19, React Router 8, TanStack Query 5, axios 1, react-hook-form 7 + zod 4 + @hookform/resolvers 7, openapi-typescript 7, Vitest 5 + Testing Library + MSW 3 + jsdom, ESLint 10 + typescript-eslint 8 + react-hooks + jsx-a11y, Prettier 3, lucide-react, @fontsource.

**Spec:** `docs/superpowers/specs/2026-11-23-lapbee-dashboard-design.md` (đọc cùng ADR 0001–0004).

## Global Constraints

- Hợp đồng: `/Users/minhtri/Documents/lapbee-backend/openapi.json` v1.4.0. Không tự thêm field hay route. Thiếu thì ghi vào `docs/backend-proposals.md`.
- `baseURL` là `/admin/v1`, `withCredentials: true`. Dev chạy ở `http://localhost:5173`, proxy `/admin/v1` và `/media-files` sang `http://localhost:3000`.
- `csrfToken` chỉ giữ trong bộ nhớ. Không ghi bất cứ dữ liệu phiên nào vào localStorage hay sessionStorage.
- POST, PUT, PATCH, DELETE luôn gửi header `X-CSRF-Token`.
- Xử lý lỗi theo `code` của `Problem`, không theo `detail`.
- TypeScript `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Không dùng `any`.
- Cấm `dangerouslySetInnerHTML`.
- Copy: tiếng Việt, sentence case, không dấu chấm than. Ngày `dd.mm.yyyy`, thời điểm `HH:MM · dd.mm.yyyy`, đều font mono, múi giờ `Asia/Ho_Chi_Minh`.
- Màu chỉ lấy từ biến token. Màu bee chỉ làm nền, chữ đặt trên nó dùng `--on-brand`.
- Sidebar rộng 248px, nền `--band-bg`.
- Alias import: `@/` trỏ tới `src/`.
- Commit nhỏ, mỗi task một commit. Message tiếng Anh dạng `feat:`, `chore:`, `test:`.

## Review Focus

1. **Tham số `?next=` độc hại** (`//evil.com`, `https://evil.com`, `javascript:`): sau đăng nhập phải về `/`, không đi ra ngoài. Test ở Task 11.
2. **Nhiều request cùng gặp `REAUTH_REQUIRED`**: chỉ mở một hộp thoại, xác nhận xong thì cả hai request được gửi lại. Test ở Task 6.
3. **Sai mật khẩu ở `/auth/reauth` hoặc `/auth/password`** (401 `INVALID_CREDENTIALS`): không được đẩy người dùng ra màn đăng nhập. Test ở Task 5.
4. **Token đặt mật khẩu nằm trong `#token=`**: phải xoá khỏi URL ngay khi đọc, và không bao giờ gửi qua query string. Test ở Task 11.
5. **Đổi mật khẩu xoay CSRF token**: request ghi tiếp theo phải dùng token mới. Test ở Task 13.

---

## File Structure

```
.nvmrc · package.json · tsconfig.json · tsconfig.node.json · vite.config.ts · eslint.config.js
.prettierrc.json · .prettierignore · .gitignore · .env.example · index.html · README.md
public/theme-init.js
scripts/gen-api.mjs                      sinh schema.d.ts + permissions.ts
scripts/check-api.mjs                    so file sinh với openapi.json
docs/csp.md
src/main.tsx
src/app/providers.tsx                    QueryClient, MutationCache, Toast, dialog toàn cục
src/app/router.tsx                       route + guard
src/app/nav.ts                           cấu hình nav theo quyền
src/app/layout/{Shell,Sidebar,UserMenu}.tsx (+ .module.css)
src/app/pages/{ForbiddenPage,NotFoundPage,ComingSoonPage}.tsx
src/app/use-idle-warning.ts
src/shared/api/generated/{schema.d.ts,permissions.ts}   SINH TỰ ĐỘNG
src/shared/api/types.ts                  helper Body/Res/Query/PathParams
src/shared/api/errors.ts                 AppError, toAppError, isProblem
src/shared/api/events.ts                 event bus
src/shared/api/reauth-coordinator.ts     single-flight cho step-up
src/shared/api/client.ts                 http + installInterceptors
src/shared/api/interceptors/{csrf,problem}.ts
src/shared/auth/session-store.ts
src/shared/auth/permissions.tsx          can, <Can>, RequirePermission, RequireAuth
src/shared/form/{apply-problem-to-form,error-messages}.ts
src/shared/lib/{format-date,text,safe-next}.ts
src/shared/theme/theme.ts
src/shared/styles/{tokens/*.css,fonts.css,base.css,index.css}
src/shared/ui/…                          Button, IconButton, TextField, PasswordField, Dialog,
                                         Toast, Badge, PageHeader, DataTable, Wordmark, Spinner
src/features/auth/{api/repo.ts,model/adapters.ts,hooks/*.ts,components/*,pages/*,index.ts}
src/test/{setup.ts,render.tsx,msw/server.ts,msw/handlers.ts,fixtures/auth.ts}
```

---

### Task 1: Khung dự án và công cụ

**Files:**
- Create: tất cả file cấu hình ở gốc trong File Structure, cùng `src/main.tsx`, `src/test/setup.ts`, `src/smoke.test.ts`

**Interfaces:**
- Produces: các script `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `test`, `gen:api`, `check:api`; alias `@/`.

- [ ] **Step 1:** `git init -b main`, rồi `git switch -c feat/p1-foundation`. Tạo `.nvmrc` với nội dung `24`. `.gitignore` gồm `node_modules`, `dist`, `coverage`, `.env`, `*.local`.
- [ ] **Step 2:** Cài dependencies đúng major trong Tech Stack, chốt `typescript@~6.0.3`. Thêm `"overrides": { "openapi-typescript": { "typescript": "$typescript" } }` và `"engines": { "node": ">=22.22" }`. Thêm cả `vitest`, `jsdom`, `@testing-library/jest-dom`, `msw`, `@vitejs/plugin-react`.
- [ ] **Step 3:** `tsconfig.json`:
  - `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `verbatimModuleSyntax`;
  - `"jsx": "react-jsx"`, `"paths": { "@/*": ["./src/*"] }`;
  - `"types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]`.
- [ ] **Step 4:** `vite.config.ts`:
  - `server: { port: 5173, strictPort: true, proxy: { '/admin/v1': { target: 'http://localhost:3000', changeOrigin: false }, '/media-files': { target: 'http://localhost:3000' } } }`;
  - `preview: { port: 5173, headers: { 'Content-Security-Policy': <chuỗi CSP GĐ1 ở docs/csp.md> } }` (preview dùng chung proxy);
  - `test: { environment: 'jsdom', globals: true, setupFiles: ['src/test/setup.ts'], css: { modules: { classNameStrategy: 'non-scoped' } } }`.
- [ ] **Step 5:** `eslint.config.js` dạng flat:
  - preset: `tseslint.configs.strictTypeChecked`, `react-hooks` recommended, `jsx-a11y` recommended;
  - `ignores: ['dist', 'src/shared/api/generated/**']`;
  - cấm `dangerouslySetInnerHTML`: `no-restricted-syntax` với selector `JSXAttribute[name.name='dangerouslySetInnerHTML']`;
  - ranh giới module bằng `no-restricted-imports`, khai báo theo `files`:
    - mọi file: cấm `@/features/*/*` (chỉ được import `@/features/<x>`);
    - `src/shared/**`: cấm `@/features/*`, `@/app/*`;
    - `src/features/*/components/**`, `src/features/*/pages/**`: cấm `**/api/repo` và `@/shared/api/generated/*`.
- [ ] **Step 6:** Prettier: `{ "singleQuote": true, "printWidth": 100, "trailingComma": "all" }`. `.prettierignore` gồm `src/shared/api/generated`, `dist`.
- [ ] **Step 7:** `src/smoke.test.ts` có `expect(1 + 1).toBe(2)`. `src/main.tsx` render `<p>LAPBEE</p>` vào `#root`.
- [ ] **Step 8:** Chạy `npm run typecheck && npm run lint && npm test -- --run && npm run build`. Kỳ vọng: cả bốn lệnh thành công.
- [ ] **Step 9:** Commit `chore: scaffold vite react ts project with lint, format, test`.

### Task 2: Sinh type từ OpenAPI

**Files:**
- Create: `scripts/gen-api.mjs`, `scripts/check-api.mjs`, `src/shared/api/types.ts`, `src/shared/api/types.test.ts`, `src/shared/api/generated/*` (do script sinh)

**Interfaces:**
- Produces:
  - `schema.d.ts` (export `paths`);
  - `permissions.ts`: `export const PERMISSION_KEYS = [...] as const; export type Permission = typeof PERMISSION_KEYS[number];`;
  - `types.ts`:
    - `type ApiPath = keyof paths`;
    - `Body<P, M>`: JSON request body;
    - `Res<P, M, S extends number>`: JSON body của response mã `S`;
    - `Query<P, M>`, `PathParams<P, M>`.

- [ ] **Step 1:** `gen-api.mjs`:
  - đọc `process.env.OPENAPI_PATH ?? '../lapbee-backend/openapi.json'`;
  - gọi API `openapiTS` + `astToString` của openapi-typescript, ghi `schema.d.ts` với header `// SINH TỰ ĐỘNG từ openapi.json <info.version>. Không sửa tay. Chạy npm run gen:api.`;
  - gom mọi giá trị `x-permissions` của các operation, bỏ trùng, sắp xếp, ghi `permissions.ts`;
  - tham số `--out <dir>` để đổi thư mục ghi.
- [ ] **Step 2:** `check-api.mjs` chạy `gen-api.mjs --out <tmp>` rồi so từng byte với file đã commit. Lệch thì in tên file và `exit 1`.
- [ ] **Step 3:** Chạy `npm run gen:api`. Kỳ vọng: `PERMISSION_KEYS` có đúng 21 khoá:
  - `audit.read`;
  - `category.manage`, `category.read`;
  - `media.delete`, `media.read`, `media.update`, `media.upload`;
  - `post.create`, `post.delete`, `post.publish`, `post.read`, `post.update`;
  - `role.manage`, `role.read`;
  - `site.publish`, `site.read`, `site.update`;
  - `system.manage_tokens`, `system.read`;
  - `user.manage`, `user.read`.
- [ ] **Step 4:** Viết `types.test.ts` dùng `expectTypeOf`:

```ts
expectTypeOf<Res<'/admin/v1/auth/me', 'get', 200>>().toHaveProperty('csrfToken').toEqualTypeOf<string>();
expectTypeOf<Body<'/admin/v1/auth/login', 'post'>>().toEqualTypeOf<{ email: string; password: string }>();
expectTypeOf<Query<'/admin/v1/posts', 'get'>>().toHaveProperty('status');
```

- [ ] **Step 5:** Viết các helper trong `types.ts`, dựa trên `paths[P][M]['requestBody']['content']['application/json']` và `['responses'][S]['content']['application/json']`. Chạy `npm test -- --run src/shared/api && npm run typecheck && npm run check:api`. Kỳ vọng: PASS.
- [ ] **Step 6:** Commit `feat: generate api types and permission keys from openapi`.

### Task 3: Token, font, theme

**Files:**
- Create: `src/shared/styles/tokens/{colors,typography,spacing,effects,base}.css` (chép nguyên từ `design_handoff_lapbee_admin/_ds/lapbee-design-system-*/tokens/`), `fonts.css`, `index.css`, `src/shared/theme/theme.ts`, `theme.test.ts`, `public/theme-init.js`, `src/shared/ui/brand/logo-mark.png`

**Interfaces:**
- Produces:
  - `type Theme = 'light' | 'dark'`;
  - `readStoredTheme(storage: Pick<Storage,'getItem'>): Theme | null`;
  - `resolveInitialTheme(stored: Theme | null, prefersDark: boolean): Theme`;
  - `applyTheme(theme: Theme, root?: HTMLElement): void` (đặt `data-theme`);
  - `persistTheme(theme, storage)`;
  - `THEME_STORAGE_KEY = 'lb-admin-theme'`.

- [ ] **Step 1:** Test:
  - `resolveInitialTheme(null, true) === 'dark'`;
  - `resolveInitialTheme('light', true) === 'light'`;
  - `readStoredTheme` trả `null` khi giá trị lạ (`'blue'`) và khi `getItem` ném lỗi;
  - `applyTheme('dark', el)` đặt `el.dataset.theme === 'dark'`.
- [ ] **Step 2:** Chạy test, kỳ vọng FAIL. Viết `theme.ts` (mọi lần truy cập storage đều bọc try/catch). Chạy lại, kỳ vọng PASS.
- [ ] **Step 3:** `public/theme-init.js` là IIFE không phụ thuộc gì, cùng logic với `theme.ts`. Nạp bằng `<script src="/theme-init.js"></script>` trong `<head>` của `index.html`, đặt trước bundle.
- [ ] **Step 4:** `fonts.css` import `@fontsource-variable/archivo/wdth.css`, `@fontsource/be-vietnam-pro/{300,400,500,600,700}.css`, `@fontsource-variable/jetbrains-mono`. Giữ tên family trong `--font-*` đúng như tokens (thêm `"Archivo Variable"`, `"JetBrains Mono Variable"` vào đầu danh sách).
- [ ] **Step 5:** Tách ảnh `LOGO_MARK` (data URI PNG trong `_ds_bundle.js`) ra `logo-mark.png` bằng một lệnh node một lần, không thêm script vào repo.
- [ ] **Step 6:** Commit `feat: design tokens, self-hosted fonts and theme bootstrap`.

### Task 4: Tiện ích thuần (ngày, chữ, `next` an toàn)

**Files:**
- Create: `src/shared/lib/{format-date,text,safe-next}.ts` kèm `.test.ts`

**Interfaces:**
- Produces:
  - `formatDate(value: string): string`: nhận `YYYY-MM-DD` hoặc ISO, trả `dd.mm.yyyy`;
  - `formatDateTime(iso: string): string`: trả `HH:MM · dd.mm.yyyy` theo `Asia/Ho_Chi_Minh`;
  - `stripDiacritics(s: string): string`;
  - `slugify(s: string): string` (giống hệt `seo-analyzer.js`);
  - `safeNext(raw: string | null): string`.

- [ ] **Step 1:** Test:

```ts
expect(formatDate('2026-11-23')).toBe('23.11.2026');
expect(formatDateTime('2026-11-22T20:05:00Z')).toBe('03:05 · 23.11.2026'); // UTC+7 sang ngày mới
expect(slugify('Mẹo hay: Đổi pin MacBook')).toBe('meo-hay-doi-pin-macbook');
expect(stripDiacritics('Đội ngũ')).toBe('doi ngu');
expect(safeNext('/posts?page=2')).toBe('/posts?page=2');
for (const bad of ['//evil.com', 'https://evil.com', 'javascript:alert(1)', '/\\evil.com', null, ''])
  expect(safeNext(bad)).toBe('/');
expect(safeNext('/login')).toBe('/');
```

- [ ] **Step 2:** Chạy, kỳ vọng FAIL. Viết code:
  - ngày dùng `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', … })` qua `formatToParts`. `YYYY-MM-DD` là ngày lịch, không đổi múi giờ;
  - `slugify` và `stripDiacritics` chép logic từ `seo-analyzer.js` (`stripDiacritics` = `strip`).
- [ ] **Step 3:** Chạy, kỳ vọng PASS. Commit `feat: date, text and safe-next helpers`.

### Task 5: Lỗi ứng dụng, event bus, API client

**Files:**
- Create: `src/shared/api/{errors,events,client}.ts`, `interceptors/{csrf,problem}.ts`, `src/shared/auth/session-store.ts`, `src/shared/form/error-messages.ts`, `src/test/msw/{server,handlers}.ts`, `src/test/fixtures/auth.ts`, kèm test `errors.test.ts`, `client.test.ts`, `session-store.test.ts`

**Interfaces:**
- Produces:
  - `errors.ts`:
    - `class ProblemError extends Error { status: number; code: string; title: string; detail: string; fieldErrors: { path: string; message: string }[]; extras: Record<string, unknown> }`. `extras` giữ các key ngoài schema `Problem`, ví dụ `postCount`, `usages`, `mediaCount`, `folderCount`;
    - `class NetworkError`, `class UnexpectedError { status?: number }`, `class ReauthCancelledError`;
    - `type AppError`, `toAppError(e: unknown): AppError`, `isProblem(e: unknown, code?: string): e is ProblemError`.
  - `events.ts`:
    - `type AppEvents = { 'session:expired': undefined; 'reauth:required': undefined; 'conflict': { invalidates: readonly (readonly unknown[])[] }; 'toast': { kind: 'success'|'error'|'info'; title: string; body?: string } }`;
    - `on<K>(k, fn): () => void`, `emit<K>(k, payload)`.
  - `session-store.ts`:
    - `type SessionState = { status: 'unknown'|'authenticated'|'anonymous'; user: { id: string; email: string; name: string } | null; permissions: readonly string[]; csrfToken: string | null; lastActivityAt: number | null }`;
    - `sessionStore.{ get, subscribe, signIn({ user, permissions, csrfToken }), setCsrfToken(t), markActivity(now?), signOut() }`;
    - `useSession(): SessionState`.
  - `client.ts`: `export const http: AxiosInstance`; `createHttp(): AxiosInstance` (cho test), interceptor gắn sẵn. Mở rộng `AxiosRequestConfig` bằng `lbSkipSessionExpired?: boolean`, `lbRetriedCsrf?: boolean`, `lbRetriedReauth?: boolean`.
  - `error-messages.ts`: `messageFor(error: unknown): string`.
  - Test: `server` của MSW, `meFixture satisfies Res<'/admin/v1/auth/me','get',200>`, `problem(status, code, extra?)` để dựng body `application/problem+json`.

- [ ] **Step 1:** Test `client.test.ts` (MSW, `baseURL` đầy đủ `http://localhost/admin/v1` trong test):
  - `it('gắn X-CSRF-Token cho POST/PATCH/DELETE, không gắn cho GET')`: đặt `sessionStore.setCsrfToken('t1')`, handler ghi lại header. Kỳ vọng `'t1'` ở POST, `null` ở GET;
  - `it('chuyển problem+json thành ProblemError có fieldErrors và extras')`: 409 `CATEGORY_NOT_EMPTY` kèm `postCount: 3`. Kỳ vọng `code === 'CATEGORY_NOT_EMPTY'`, `extras.postCount === 3`;
  - `it('không có response thì là NetworkError')`: `HttpResponse.error()`;
  - `it('401 UNAUTHENTICATED phát session:expired')`;
  - `it('401 INVALID_CREDENTIALS không phát session:expired')` (Review Focus 3);
  - `it('401 UNAUTHENTICATED với lbSkipSessionExpired không phát session:expired')`, dùng cho lần gọi `/auth/me` lúc mở app;
  - `it('CSRF_FAILED lấy token mới qua /auth/me rồi thử lại đúng một lần')`: lần POST đầu trả 403 `CSRF_FAILED`, `/auth/me` trả `csrfToken: 't2'`, lần POST thứ hai nhận header `'t2'` và trả 200. Nếu lần thứ hai cũng `CSRF_FAILED` thì ném `ProblemError` và đếm đúng 2 lần POST;
  - `it('request thành công cập nhật lastActivityAt')`.
- [ ] **Step 2:** Test `errors.test.ts`: `toAppError` với body không phải problem (HTML 502) trả `UnexpectedError { status: 502 }`. `isProblem(e, 'VERSION_CONFLICT')`.
- [ ] **Step 3:** Test `session-store.test.ts`: `signIn` đổi `status` sang `'authenticated'`; `signOut` xoá `csrfToken` và `permissions`; `subscribe` được gọi đúng một lần sau mỗi thay đổi.
- [ ] **Step 4:** Chạy, kỳ vọng FAIL. Viết code:
  - interceptor đánh dấu đã thử lại bằng `config.lbRetriedCsrf`, khai báo qua declaration merging `AxiosRequestConfig`;
  - lấy lại CSRF dùng single-flight (biến promise ở cấp module);
  - `messageFor` dùng bảng code → câu cho các mã chung: `NETWORK` ("Không kết nối được máy chủ. Thử lại sau."), `RATE_LIMITED`, `FORBIDDEN` ("Bạn không có quyền làm việc này."), `PAYLOAD_TOO_LARGE`, `VALIDATION_FAILED`, `NOT_FOUND`. Không có trong bảng thì lấy `detail`.
- [ ] **Step 5:** Chạy, kỳ vọng PASS. Commit `feat: axios client with csrf, problem mapping and session expiry`.

### Task 6: Điều phối step-up (single-flight)

**Files:**
- Create: `src/shared/api/reauth-coordinator.ts`, `reauth-coordinator.test.ts`
- Modify: `src/shared/api/interceptors/problem.ts`, `client.test.ts`

**Interfaces:**
- Produces:
  - `waitForReauth(): Promise<void>`: tạo hoặc dùng lại promise đang chờ, phát `reauth:required` khi tạo mới;
  - `resolveReauth(): void`;
  - `rejectReauth(): void`: promise bị từ chối với `ReauthCancelledError`;
  - `isReauthPending(): boolean`.

- [ ] **Step 1:** Test coordinator: hai lần gọi `waitForReauth()` trả cùng một promise, và `reauth:required` được phát đúng một lần. Sau `resolveReauth()` thì `isReauthPending() === false`.
- [ ] **Step 2:** Test `client.test.ts`:
  - `it('REAUTH_REQUIRED chờ xác nhận rồi gửi lại; hai request song song chỉ mở một lần')` (Review Focus 2): hai POST song song, lần đầu đều 403 `REAUTH_REQUIRED`. Test lắng nghe `reauth:required`, đếm 1, gọi `resolveReauth()`. Kỳ vọng cả hai promise resolve 200;
  - `it('huỷ step-up ném ReauthCancelledError')`;
  - request đã gửi lại mà vẫn `REAUTH_REQUIRED` thì ném `ProblemError`, không lặp vô hạn (cờ `lbRetriedReauth`).
- [ ] **Step 3:** FAIL. Viết code. PASS. Commit `feat: single-flight reauth retry`.

### Task 7: Phân quyền và gắn lỗi vào form

**Files:**
- Create: `src/shared/auth/permissions.tsx`, `permissions.test.tsx`, `src/shared/form/apply-problem-to-form.ts`, `apply-problem-to-form.test.ts`

**Interfaces:**
- Consumes: `Permission` (Task 2), `useSession` (Task 5).
- Produces:
  - `can(perms: readonly string[], perm: Permission | readonly Permission[], mode?: 'all' | 'any'): boolean`;
  - `useCan(perm, mode?): boolean`;
  - `<Can perm mode? fallback?>`;
  - `<RequirePermission perm>`: render `<ForbiddenPage/>` khi thiếu quyền, nhận qua prop `forbidden` để `shared` không import `app`;
  - `<RequireAuth>`: `status === 'unknown'` thì hiện `Spinner` toàn trang; `'anonymous'` thì `<Navigate to={'/login?next=' + encodeURIComponent(path + search)} replace/>`;
  - `applyProblemToForm<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, pathMap?: Partial<Record<string, Path<T>>>): boolean`.

- [ ] **Step 1:** Test `can`:
  - `can(['*'], 'user.manage') === true`;
  - `can(['post.read'], 'post.publish') === false`;
  - `can(['post.read','post.update'], ['post.read','post.publish'], 'any') === true`;
  - mảng rỗng luôn `false`.
- [ ] **Step 2:** Test `applyProblemToForm`:
  - `VALIDATION_FAILED` với `errors: [{ path: 'newPassword', message: 'Tối thiểu 12 ký tự.' }]` gọi `setError('newPassword', { type: 'server', message })` và trả `true`;
  - `pathMap: { 'content.blocks.3.data.file.mediaId': 'content' }` đổi đúng tên field;
  - path không khớp field nào thì gom vào `setError('root.server', …)`;
  - lỗi không phải `ProblemError` thì trả `false` và không gọi `setError`.
- [ ] **Step 3:** Test `RequireAuth` với `MemoryRouter`: phiên `anonymous` ở `/posts?page=2` thì chuyển tới `/login?next=%2Fposts%3Fpage%3D2`.
- [ ] **Step 4:** FAIL. Viết code. PASS. Commit `feat: permission helpers, route guards, form error mapping`.

### Task 8: Bộ thành phần UI cơ bản

**Files:**
- Create: `src/shared/ui/` gồm `Button`, `IconButton`, `TextField`, `PasswordField`, `Dialog`, `Toast` (`ToastProvider`, `useToast`), `Badge`, `PageHeader`, `DataTable`, `Wordmark`, `Spinner`, mỗi cái kèm `.module.css`, cùng `index.ts` và `ui.test.tsx`

**Interfaces:**
- Produces:
  - `Button { variant: 'primary'|'secondary'|'ghost'|'danger'; size?: 'sm'|'md'|'lg'; loading?: boolean; icon?: LucideIcon } & ButtonHTMLAttributes`. Khi `loading` thì `disabled` và `aria-busy`;
  - `TextField { label: string; hint?: string; error?: string } & InputHTMLAttributes`, dùng `forwardRef` cho react-hook-form;
  - `Dialog { open: boolean; title: string; onClose(): void; children; footer? }`, dùng `<dialog>` gốc với `showModal()`. Esc gọi `onClose`, focus trả về phần tử đã mở dialog;
  - `useToast(): { show(t: { kind; title; body? }): void }`, tự ẩn sau 2800 ms (giống prototype), vùng thông báo có `role="status"`;
  - `PageHeader { eyebrow: string; title: string; description?: string; actions?: ReactNode }`: eyebrow dùng class `lb-label`, tiêu đề 44px Archivo;
  - `DataTable<T> { columns: { key: string; header: string; render(row: T): ReactNode; mono?: boolean }[]; rows: T[]; rowKey(row: T): string; empty: string }`;
  - `Wordmark { size?: number; inverse?: boolean }`: ảnh logo mark kèm chữ "LAP**BEE**".

- [ ] **Step 1:** Test:
  - `TextField` có `error` thì input có `aria-invalid="true"` và `aria-describedby` trỏ tới phần tử chứa câu lỗi;
  - `Button loading` thì bị `disabled`;
  - `Dialog` mở rồi nhấn Escape thì gọi `onClose`;
  - `useToast().show` hiện chữ trong `role="status"` và biến mất sau 2800 ms (dùng `vi.useFakeTimers`);
  - `DataTable` không có dòng nào thì hiện `empty`.
- [ ] **Step 2:** FAIL. Viết code theo prototype và readme của design system:
  - radius control 4px, dialog 14px;
  - focus: viền ink 2px, input có thêm vòng `--shadow-focus`;
  - khi nhấn: dịch xuống 1px;
  - nút primary nền `--brand`, chữ `--on-brand`.
- [ ] **Step 3:** PASS. Commit `feat: base ui kit from lapbee design system`.

### Task 9: Repository, adapter và hook của auth

**Files:**
- Create: `src/features/auth/api/repo.ts`, `model/adapters.ts` (+ test), `hooks/{use-bootstrap-session,use-login,use-logout,use-setup-password,use-change-password,use-sessions,use-revoke-session}.ts` (+ test), `index.ts`

**Interfaces:**
- Consumes: `http`, `sessionStore`, `Body`/`Res` types.
- Produces:
  - `authRepo.{ login(b), me(opts?: { lbSkipSessionExpired?: boolean }), logout(), reauth(password), changePassword(b), setupPassword(b), listSessions(), revokeSession(id) }`, trả đúng DTO sinh ra (`void` cho route 204);
  - `describeUserAgent(ua: string): string`;
  - `toSessionRow(dto): { id; device; ip; createdAt: string; lastSeenAt: string; current: boolean }`, trong đó hai trường thời điểm đã qua `formatDateTime`;
  - `authKeys = { sessions: ['auth','sessions'] as const }`;
  - các hook trả `UseMutationResult` hoặc `UseQueryResult` của TanStack. `useLogin` sau khi `login` thành công thì gọi `me()` (vì response login không có `permissions`), rồi `sessionStore.signIn(...)`.

- [ ] **Step 1:** Test adapter:
  - `describeUserAgent(<UA Chrome trên macOS>) === 'Chrome · macOS'`;
  - Safari trên iOS ra `'Safari · iOS'`;
  - UA rỗng ra `'Thiết bị không rõ'`.
- [ ] **Step 2:** Test hook bằng `renderHook` với MSW:
  - `useLogin` thành công: store `authenticated`, `permissions` lấy từ `meFixture`, `csrfToken` là token của `/me`;
  - `useBootstrapSession`: `/me` trả 401 thì store `anonymous`, không phát `session:expired` hay toast (gọi `authRepo.me({ lbSkipSessionExpired: true })`);
  - `useChangePassword` thành công: `sessionStore.get().csrfToken` bằng token mới trong response (Review Focus 5);
  - `useRevokeSession` với phiên `current: true` thì `signOut()`;
  - `useLogout` gọi `signOut()` và `queryClient.clear()`.
- [ ] **Step 3:** FAIL. Viết code. Mutation của form đặt `meta: { handlesErrors: true }`. PASS. Commit `feat: auth repository, adapters and hooks`.

### Task 10: Providers, router, shell

**Files:**
- Create: `src/app/{providers,router,nav}.tsx`, `src/app/layout/{Shell,Sidebar,UserMenu}.tsx`, `src/app/pages/{ForbiddenPage,NotFoundPage,ComingSoonPage}.tsx`, `src/app/use-idle-warning.ts`, `src/test/render.tsx`, cùng các test `nav.test.ts`, `shell.test.tsx`, `use-idle-warning.test.ts`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `can`, `useSession`, `on`/`emit`, `useToast`, các hook auth.
- Produces:
  - `NAV: { group: 'Nội dung' | 'Quản trị'; items: { to: string; label: string; icon: LucideIcon; perm: Permission | readonly Permission[] }[] }[]`;
  - `visibleNav(perms): typeof NAV`, bỏ các nhóm rỗng;
  - `firstAllowedPath(perms): string`, trả `'/account'` khi không có mục nào;
  - `createQueryClient(): QueryClient`;
  - `renderWithProviders(ui, { route?, session? })`, helper test;
  - `useIdleWarning({ warnAfterMs = 25 * 60_000, checkEveryMs = 30_000 })`.

- [ ] **Step 1:** Test `nav.test.ts`:
  - quyền `['post.read','post.create','post.update','category.read','media.read','media.upload','media.update']` (editor): hiện đúng Bài đăng, Chuyên mục, Thư viện ảnh, không có nhóm Quản trị;
  - `['*']` hiện đủ 7 mục;
  - mục Hệ thống hiện khi có bất kỳ quyền nào trong `system.read`, `system.manage_tokens`, `audit.read`;
  - `firstAllowedPath(['media.read']) === '/media'`.
- [ ] **Step 2:** Test `createQueryClient`:
  - mutation lỗi `VERSION_CONFLICT` với `meta.invalidates: [['site']]` thì phát `conflict` với payload đó và không phát `toast`;
  - mutation có `meta.handlesErrors` thì không phát gì;
  - lỗi `ReauthCancelledError` thì không phát gì;
  - query không thử lại khi gặp `ProblemError`.
- [ ] **Step 3:** Test `shell.test.tsx`:
  - sidebar hiện tên người dùng, nhãn "Super admin" khi `['*']`, hoặc email khi không phải (D5);
  - bấm "Đăng xuất" gọi `POST /auth/logout` và chuyển tới `/login`;
  - nút đổi giao diện đặt `data-theme` và ghi `lb-admin-theme`;
  - "Xem website" là link `href={import.meta.env.VITE_LANDING_URL}` có `rel="noopener"` và `target="_blank"`, ẩn khi biến này rỗng.
- [ ] **Step 4:** Test `useIdleWarning`: `lastActivityAt` cách đây 25 phút thì phát `toast` kiểu info "Phiên sắp hết hạn", chỉ một lần cho mỗi giai đoạn không hoạt động.
- [ ] **Step 5:** FAIL. Viết code:
  - router:
    - `/login` và `/setup-password` là route công khai;
    - các route còn lại nằm dưới `<RequireAuth><Shell/></RequireAuth>`;
    - `/` dùng `Navigate` tới `firstAllowedPath`;
    - các route `/site`, `/posts`, `/categories`, `/media`, `/users`, `/roles`, `/system` dùng `ComingSoonPage` ("Màn này có ở giai đoạn sau.") bọc `RequirePermission`;
    - `/account`, trang 404;
  - providers:
    - lắng nghe `session:expired`: `signOut`, `queryClient.clear()`, chuyển tới `/login?next=…`, toast "Phiên đã hết hạn. Đăng nhập lại để tiếp tục.";
    - lắng nghe `toast` và gọi `useToast`;
  - sidebar theo prototype, nav có nhóm và nhãn nhóm `lb-label`.
- [ ] **Step 6:** PASS. Commit `feat: app shell, router, nav by permission, global error handling`.

### Task 11: Màn đăng nhập và đặt mật khẩu

**Files:**
- Create: `src/features/auth/pages/{LoginPage,SetupPasswordPage}.tsx` (+ `.module.css`, `auth-pages.test.tsx`), `src/features/auth/components/AuthCard.tsx`
- Modify: `src/app/router.tsx`

**Interfaces:**
- Consumes: `useLogin`, `useSetupPassword`, `safeNext`, `applyProblemToForm`, `TextField`, `PasswordField`, `Button`, `Wordmark`.

- [ ] **Step 1:** Test `LoginPage`:
  - để trống thì báo "Không được để trống." ở cả hai ô, không gửi request (zod);
  - 401 `INVALID_CREDENTIALS` thì hiện "Email hoặc mật khẩu không đúng." trong `role="alert"`, vẫn ở `/login`;
  - 429 `RATE_LIMITED` thì hiện "Thử lại sau ít phút.";
  - thành công với `?next=%2Fposts` thì về `/posts`;
  - thành công với `?next=%2F%2Fevil.com` thì về `/` (Review Focus 1);
  - đã `authenticated` mà vào `/login` thì chuyển đi luôn.
- [ ] **Step 2:** Test `SetupPasswordPage`:
  - vào `/setup-password#token=abc` thì `location.hash` thành rỗng ngay sau render (`history.replaceState`), và request gửi `{ token: 'abc', newPassword }` trong body (Review Focus 4);
  - mật khẩu dưới 12 ký tự thì báo "Mật khẩu cần 12–128 ký tự.", không gửi;
  - hai ô không khớp thì báo "Mật khẩu nhập lại không khớp.";
  - 400 `INVALID_LINK` thì hiện "Link đã hết hạn hoặc đã dùng. Hãy xin quản trị viên link mới." và ẩn form;
  - không có token thì hiện ngay thông báo đó;
  - 204 thì chuyển tới `/login` kèm toast "Đã đặt mật khẩu".
- [ ] **Step 3:** FAIL. Viết code theo phác thảo §8.1 của design doc. PASS. Commit `feat: login and setup-password screens`.

### Task 12: ReauthDialog và ConflictDialog

**Files:**
- Create: `src/features/auth/components/ReauthDialog.tsx`, `src/app/ConflictDialog.tsx`, `dialogs.test.tsx`
- Modify: `src/app/providers.tsx`, `src/features/auth/index.ts`

**Interfaces:**
- Consumes: `on('reauth:required')`, `resolveReauth`, `rejectReauth`, `authRepo.reauth`, `on('conflict')`.

- [ ] **Step 1:** Test:
  - phát `reauth:required` thì dialog "Xác nhận mật khẩu" mở;
  - nhập sai (401 `INVALID_CREDENTIALS`) thì hiện "Mật khẩu không đúng.", dialog vẫn mở, **không** chuyển tới `/login`;
  - nhập đúng (204) thì gọi `resolveReauth` và dialog đóng;
  - "Huỷ" hoặc Esc thì gọi `rejectReauth`;
  - phát `conflict` với `invalidates: [['x']]` thì dialog "Dữ liệu đã thay đổi ở nơi khác" mở, "Tải lại" gọi `queryClient.invalidateQueries({ queryKey: ['x'] })` rồi đóng.
- [ ] **Step 2:** FAIL. Viết code theo phác thảo §8.3 và §8.4. PASS. Commit `feat: reauth and conflict dialogs`.

### Task 13: Trang tài khoản

**Files:**
- Create: `src/features/auth/pages/AccountPage.tsx` (+ `.module.css`, `account-page.test.tsx`), `components/{ChangePasswordForm,SessionsTable}.tsx`
- Modify: `src/app/router.tsx`

- [ ] **Step 1:** Test luồng đổi mật khẩu đầy đủ, với MSW và providers thật:
  - lần POST `/auth/password` đầu trả 403 `REAUTH_REQUIRED`. Dialog mở; nhập mật khẩu, `/auth/reauth` trả 204. Request được gửi lại và trả `{ csrfToken: 'new' }`. Toast "Đã đổi mật khẩu. Các phiên khác đã bị đăng xuất.";
  - request ghi kế tiếp (thu hồi phiên) mang header `X-CSRF-Token: new` (Review Focus 5);
  - `VALIDATION_FAILED` tại `newPassword` thì lỗi hiện dưới ô "Mật khẩu mới";
  - 401 `INVALID_CREDENTIALS` thì lỗi hiện dưới ô "Mật khẩu hiện tại".
- [ ] **Step 2:** Test bảng phiên:
  - render từ fixture `GET /auth/sessions`, phiên `current` có badge "Hiện tại" và không có nút "Thu hồi";
  - thu hồi phiên khác gọi `DELETE /auth/sessions/:id` rồi tải lại danh sách;
  - thời điểm hiện bằng font mono, dạng `HH:MM · dd.mm.yyyy`.
- [ ] **Step 3:** FAIL. Viết code theo phác thảo §8.2. PASS. Commit `feat: account page with password change and sessions`.

### Task 14: Kiểm chứng với backend thật, tài liệu, PR

**Files:**
- Create: `docs/csp.md`, `README.md`, `.env.example` (`VITE_LANDING_URL=`)

- [ ] **Step 1:** `docs/csp.md` ghi:
  - chuỗi CSP GĐ1, trùng với `preview.headers`: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https://res.cloudinary.com; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'`;
  - ghi chú: GĐ4 bổ sung `frame-src` cho embed và cách xử lý `<style>` của Editor.js.
- [ ] **Step 2:** README: yêu cầu môi trường, cách chạy backend local, `npm run dev`, `gen:api`, `check:api`, danh sách script, liên kết tới design doc và ADR.
- [ ] **Step 3:** Chạy `npm run typecheck && npm run lint && npm test -- --run && npm run check:api && npm run build`. Kỳ vọng: tất cả thành công.
- [ ] **Step 4:** Kiểm tra thủ công với backend local (`npm run start:dev` ở `lapbee-backend`, super admin tạo bằng CLI), chạy `npm run build && npm run preview` để có CSP:
  - đăng nhập; tải lại trang vẫn còn phiên;
  - mở `/account`, đổi mật khẩu có step-up;
  - đăng xuất;
  - mở link `setup-password` do CLI in ra;
  - console không có lỗi CSP;
  - cả theme sáng và tối hiển thị đúng.
- [ ] **Step 5:** Commit `docs: readme and csp`. Mở PR từ `feat/p1-foundation`. Repo chưa có remote GitHub, nên hỏi chủ dự án URL remote trước khi push.
