# LAPBEE Dashboard GĐ4a: Chuyên mục, danh sách bài, logic khối và SEO: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Màn Chuyên mục (CRUD và kéo thả thứ tự), màn danh sách Bài đăng (lọc, tìm, phân trang theo URL), và phần logic thuần mà editor ở GĐ4b sẽ dùng: kiểu 10 khối Editor.js, `blocksToMarkdown`, `analyze` (chấm SEO). Chốt cách xử lý CSP cho Editor.js bằng ADR.

**Architecture:** Theo ADR 0001. Feature mới `features/categories` và `features/posts`, mỗi feature có `{api/repo.ts, model, hooks, components, pages, index.ts}`. `posts` dùng chuyên mục qua `features/categories/index.ts`. `SortableItems` của GĐ2 chuyển sang `shared/ui` để site và categories dùng chung.

**Tech Stack:** như GĐ3. Chưa cài Editor.js ở 4a (cài ở 4b).

**Spec:** `docs/superpowers/specs/2026-11-23-lapbee-dashboard-design.md` (§3 D4, D7, D10; §4.8; §5.3; §5.4; §8.5). API: `../lapbee-backend/openapi.json` (`/admin/v1/categories*`, `/admin/v1/posts*`), README backend mục "Route module Bài viết" và "Editor.js cho dashboard". Giao diện danh sách bài: `../design_handoff_lapbee_admin/LAPBEE Admin.dc.html` dòng 425–490 (template) và 1205–1220 (dữ liệu, nhãn). Thuật toán SEO: `../design_handoff_lapbee_admin/LAPBEE Admin.dc.html` dòng 819–856 (bản có nhãn tiếng Việt) và `seo-analyzer.js`.

## Global Constraints

Toàn bộ Global Constraints của GĐ1–GĐ3 vẫn áp dụng: không tự thêm field hay route, CSRF chỉ trong bộ nhớ, xử lý lỗi theo `code`, TS strict, không `any`, cấm `dangerouslySetInnerHTML`, copy tiếng Việt sentence case không dấu chấm than, ngày `dd.mm.yyyy` font mono, màu chỉ qua token, kiểu DTO suy từ `Res`/`Body`/`Query`, thiếu quyền thì nút vô hiệu kèm tooltip "Bạn không có quyền …" (không ẩn). Thêm cho GĐ4a:

- API chuyên mục: `GET|POST /categories`, `PATCH|DELETE /categories/:id` (DELETE gửi `?version=`). Quyền xem `category.read`, ghi `category.manage`.
- API bài: `GET /posts` với `cat` (uuid chuyên mục), `status` (`draft`|`published`), `q` (≤ 200 ký tự), `page`, `perPage=8`. `counts` tính trên mọi bài, không theo bộ lọc. Quyền `post.read`.
- `version` gửi đi là giá trị lúc mở hộp thoại hoặc lúc bắt đầu kéo, không phải giá trị mới nhất trong cache.
- Kéo thả chuyên mục theo D10: mỗi lần thả gửi đúng một `PATCH { version, position }`.
- D4: không có cột SEO và ô "điểm SEO trung bình" ở danh sách. D7: không có trạng thái `scheduled`.
- Kiểu `data` của 10 khối là ngoại lệ duy nhất được gõ tay (spec §4.5), đặt ở `features/posts/model/blocks.ts`, mỗi kiểu ghi nguồn README backend và `lapbee-backend/src/modules/content/domain/blocks/block-handlers.ts`.

## Quyết định mới cần chủ dự án duyệt (đã áp dụng trong plan)

| # | Quyết định | Lý do |
|---|---|---|
| P4-1 | GĐ4 chia hai PR: 4a (plan này) và 4b (editor Editor.js, lưu, xuất bản, gỡ, panel SEO, preview Google, CSP hash, `frame-src` cho embed) | Chủ dự án đã chọn ngày 26.11.2026 |
| P4-2 | CSP cho `<style>` Editor.js chèn: thêm `'sha256-…'` của từng thẻ style vào `style-src`, không dùng nonce. ADR 0005 ghi ở 4a; giá trị hash và test kiểm hash làm ở 4b | Chủ dự án đã chọn ngày 26.11.2026 |
| P4-3 | Danh sách bài giữ trạng thái trong URL: `/posts?cat=<uuid>&status=draft|published&q=…&page=n`. Không có tham số là "Tất cả", trang 1 | Như P3-1: tải lại, chia sẻ link, Quay lại vẫn đúng |
| P4-4 | Dải số liệu có 3 ô: "Đã xuất bản" (`counts.byStatus.published`), "Bản nháp" (`counts.byStatus.draft`), "Tổng số bài" (tổng hai số trên) | Thiết kế có 4 ô, bỏ "Đang lên lịch" (D7) và "Điểm SEO trung bình" (D4) |
| P4-5 | Bảng có 4 cột: Bài viết (tiêu đề và `effectiveExcerpt`), Chuyên mục, Trạng thái, Ngày. Tiêu đề rỗng hiện "Bài chưa có tiêu đề"; chưa có chuyên mục hiện "Chưa có chuyên mục"; `date` rỗng hiện "—" | D4; backend cho phép bài nháp thiếu các field này |
| P4-6 | Ở 4a, "Viết bài mới" vô hiệu kèm tooltip "Sắp có", hàng trong bảng chưa mở được. 4b nối vào editor | Tránh tạo bài nháp rỗng mà chưa sửa được |
| P4-7 | Màn Chuyên mục theo phác thảo §8.5: bảng có tay kéo, Tên, Đường dẫn, Mô tả, Số bài, nút Sửa và Xoá. Thêm và sửa bằng hộp thoại (Tên, Đường dẫn, Mô tả). Thêm mà để trống Đường dẫn thì không gửi `slug` (backend tự sinh). Sửa thì Đường dẫn bắt buộc | Backend chỉ tự sinh slug khi không gửi; `PATCH` không có cách quay lại tự sinh |
| P4-8 | "Xoá" chuyên mục vô hiệu khi `postCount > 0`, tooltip "Còn {postCount} bài trong chuyên mục"; vẫn xử lý `CATEGORY_NOT_EMPTY` nếu dữ liệu cũ | Spec §5.3 |
| P4-9 | Sidebar hiện số tổng bài cạnh "Bài đăng" (spec §4.7), lấy từ `GET /posts?perPage=1` (`counts.byStatus` cộng lại) | Spec §4.7 đã chốt |
| P4-10 | Chuyên mục chỉ có nút kéo thả và bàn phím (như site), không có Select "Vị trí n / N" | D10 |

---

## File Structure

```
src/shared/ui/SortableItems.tsx (+ css)        chuyển từ features/site/components (Task 1)
src/features/categories/
  api/repo.ts                 list, create, update, remove
  model/adapters.ts           categoryKeys, categoryErrorMessage, CategoryDto
  hooks/use-categories.ts, use-category-mutations.ts
  components/CategoryTable.tsx, CategoryDialog.tsx (+ css)
  pages/CategoriesPage.tsx    (+ test categories-page.test.tsx)
  index.ts                    CategoriesPage, useCategories, CategoryDto (cho posts)
src/features/posts/
  api/repo.ts                 list (4a); get, create, update, remove, publish, unpublish ở 4b
  model/adapters.ts           postKeys, PostListParams, statusLabel, toPostRow
  model/blocks.ts             kiểu 10 khối (gõ tay, có ghi nguồn)
  model/inline-html.ts        HTML nội dòng → markdown, parse bằng DOMParser theo danh sách thẻ cho phép
  model/blocks-to-markdown.ts (+ test)
  model/seo.ts                analyze, slugify, strip, scoreBand (+ test)
  hooks/use-posts.ts, use-posts-total.ts
  components/PostStats.tsx, PostFilters.tsx, PostTable.tsx (+ css)
  pages/PostsPage.tsx         (+ test posts-page.test.tsx)
  index.ts
src/test/fixtures/categories.ts, posts.ts
src/app/router.tsx, src/app/layout/* (số tổng ở sidebar)
docs/adr/0005-editorjs-style-csp.md
```

## Review Focus

1. **Kéo thả lúc đang có PATCH khác**: thả hai lần liên tiếp nhanh; lần thứ hai phải gửi `version` mới của mục đó sau lần một, không gửi lại version cũ (bài học GĐ2) (Task 1, Task 3).
2. **Lọc rồi phân trang rồi đổi lọc**: đang ở trang 3 mà đổi chuyên mục, trạng thái hoặc gõ tìm kiếm thì về trang 1; `page` vượt quá số trang (link cũ) thì hiện trạng thái trống có nút về trang 1, không lỗi (Task 5).
3. **Bài thiếu dữ liệu**: tiêu đề rỗng, `category: null`, `date: ""`, `effectiveExcerpt` rỗng vẫn hiện hàng gọn gàng (Task 5).
4. **HTML nội dòng lạ trong khối**: thẻ ngoài danh sách cho phép, `href` không an toàn, entity (`&amp;`, `&nbsp;`) và `<br>` chuyển sang markdown đúng, không ném lỗi, không chèn HTML (Task 4).
5. **Tên chuyên mục trùng hoặc slug sai mẫu**: `CATEGORY_NAME_TAKEN`, `SLUG_TAKEN`, `VALIDATION_FAILED` hiện dưới đúng ô, hộp thoại vẫn mở (Task 3).

---

### Task 1: Chuyển `SortableItems` sang `shared/ui`

**Files:**
- Move: `src/features/site/components/SortableItems.tsx` (+ `.module.css`) → `src/shared/ui/SortableItems.tsx`; export qua `src/shared/ui/index.ts`
- Modify: các chỗ import trong `features/site`

**Interfaces:**
- Produces: `SortableItems` với props như hiện tại (`items`, `titleOf`, `strategy`, `onMove`, `children`), import từ `@/shared/ui`.

- [ ] **Step 1:** Chuyển file, sửa import. Không đổi hành vi. Toàn bộ test `src/features/site` qua mà không sửa assertion.
- [ ] **Step 2:** `npm run typecheck && npm run lint && npx vitest run src/features/site src/shared/ui`. Commit `refactor: move sortable list to shared ui`.

### Task 2: Repo, model và hook chuyên mục

**Files:**
- Create: `src/features/categories/{api/repo.ts, model/adapters.ts, hooks/use-categories.ts, hooks/use-category-mutations.ts}`, test `hooks/category-hooks.test.tsx`; `src/test/fixtures/categories.ts`

**Interfaces:**
- Produces:
  ```ts
  type CategoryList = Res<'/admin/v1/categories','get',200>;
  type CategoryDto = CategoryList['items'][number];
  categoryRepo.list(): Promise<CategoryDto[]>
  categoryRepo.create(body: Body<'/admin/v1/categories','post'>): Promise<CategoryDto>
  categoryRepo.update(id: string, body: Body<'/admin/v1/categories/{id}','patch'>): Promise<CategoryDto>
  categoryRepo.remove(id: string, version: number): Promise<void>
  categoryKeys = { all: ['categories'] }
  useCategories(enabled?: boolean): UseQueryResult<CategoryDto[]>
  useCreateCategory(), useUpdateCategory(), useDeleteCategory()   // handlesErrors; meta.invalidates [categoryKeys.all]; onSuccess void invalidate categoryKeys.all và ['posts']
  categoryErrorMessage(code): string | null  // CATEGORY_NAME_TAKEN "Đã có chuyên mục cùng tên.", SLUG_TAKEN "Đường dẫn này đã được dùng.", CATEGORY_NOT_EMPTY trả null (câu có số bài do UI dựng)
  ```
- Kiểu trả về của `create`/`update` lấy đúng từ openapi (kiểm tra response 201/200; nếu khác `CategoryDto` thì dùng kiểu đó).

- [ ] **Step 1:** Test: `useCategories` trả danh sách theo `position`; `useDeleteCategory` gửi `DELETE /categories/c1?version=3` và tải lại danh sách; `useUpdateCategory` gửi `{ version, position }`; `VERSION_CONFLICT` vẫn phát sự kiện `conflict`.
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: category repo and hooks`.

### Task 3: Màn Chuyên mục

**Files:**
- Create: `components/CategoryTable.tsx`, `components/CategoryDialog.tsx` (+ css), `pages/CategoriesPage.tsx`, test `pages/categories-page.test.tsx`; `index.ts`
- Modify: `src/app/router.tsx` (`/categories` → `guarded('category.read', <CategoriesPage />)`)

**Interfaces:**
- Consumes: Task 1, Task 2.
- Produces: `CategoryDialog({ open, title, initial: { name, slug, description }, slugRequired: boolean, submitLabel, onClose, onSubmit(values): Promise<void> })`.

**Bố cục và copy (§8.5):** eyebrow mono `Nội dung · Chuyên mục`; tiêu đề `Chuyên mục`; nút chính `Thêm chuyên mục` (icon `plus`). Bảng: cột tay kéo, `Tên`, `Đường dẫn` (mono, dạng `/slug`), `Mô tả` (cắt bằng …), `Số bài` (mono), nút `Sửa` và `Xoá`. Trống: "Chưa có chuyên mục nào.". Hộp thoại `Thêm chuyên mục` / `Sửa chuyên mục`: `Tên` (1–100 ký tự), `Đường dẫn` (hint "Để trống để tự tạo từ tên." khi thêm; mẫu `^[a-z0-9]+(-[a-z0-9]+)*$`, tối đa 200, lỗi "Chỉ dùng chữ thường không dấu, số và dấu gạch ngang."), `Mô tả` (TextArea, CharCount 500); nút `Thêm` / `Lưu`. Xoá: ConfirmDialog "Xoá chuyên mục {tên}?" / "Chuyên mục bị xoá khỏi website." / `Xoá`. Toast: "Đã thêm chuyên mục", "Đã lưu chuyên mục", "Đã xoá chuyên mục", "Đã đổi thứ tự". Thiếu `category.manage`: `Thêm chuyên mục`, `Sửa`, `Xoá`, tay kéo vô hiệu, tooltip "Bạn không có quyền quản lý chuyên mục".

- Lỗi `CATEGORY_NAME_TAKEN` dưới ô Tên, `SLUG_TAKEN` và `VALIDATION_FAILED` (theo `errors[].path`) dưới đúng ô, hộp thoại vẫn mở. `VERSION_CONFLICT` thì đóng hộp thoại (hộp thoại xung đột chung xử lý; mở lại lấy version mới), như P3 thư mục.
- Sửa mà không đổi gì thì chỉ đóng hộp thoại, không gửi PATCH; chỉ gửi field đã đổi.

- [ ] **Step 1:** Test: vào `/categories` thấy hàng fixture theo thứ tự; thêm với Đường dẫn trống gửi `{ name, description }` không có `slug`; thêm có Đường dẫn gửi `slug`; `CATEGORY_NAME_TAKEN` hiện "Đã có chuyên mục cùng tên." dưới ô Tên, hộp thoại vẫn mở; sửa chỉ gửi field đổi kèm `version` lúc mở; `postCount 12` → `Xoá` vô hiệu, tooltip "Còn 12 bài trong chuyên mục"; xoá chuyên mục rỗng gửi `?version=`; `CATEGORY_NOT_EMPTY` → toast "Còn {postCount} bài trong chuyên mục" (lấy `postCount` từ dữ liệu hiện có); kéo bằng bàn phím một hàng xuống một bậc gửi đúng một `PATCH { version, position }`; thiếu `category.manage` → các nút vô hiệu kèm tooltip.
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: categories page with dialogs and drag ordering`.

### Task 4: Kiểu khối, `blocksToMarkdown` và `analyze`

**Files:**
- Create: `src/features/posts/model/blocks.ts`, `inline-html.ts`, `blocks-to-markdown.ts`, `seo.ts`; test `blocks-to-markdown.test.ts`, `seo.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type EditorDoc = { time?: number; version?: string; blocks: Block[] };
  type Block = { id?: string } & (
    | { type: 'paragraph'; data: { text: string } }
    | { type: 'header'; data: { text: string; level: 2 | 3 | 4 } }
    | { type: 'list'; data: { style: 'ordered' | 'unordered' | 'checklist'; meta?: { start?: number; counterType?: string }; items: ListItem[] } }
    | { type: 'code'; data: { code: string; language: CodeLanguage } }
    | { type: 'table'; data: { withHeadings: boolean; content: string[][] } }
    | { type: 'callout'; data: { variant: 'info' | 'tip' | 'warning' | 'danger'; title: string; message: string } }
    | { type: 'quote'; data: { text: string; caption: string } }
    | { type: 'image'; data: { file: { mediaId: string; url: string; width?: number; height?: number }; caption: string } }   // kiểm lại shape `toEditor` của image trong block-handlers.ts
    | { type: 'embed'; data: { service: EmbedService; source: string; embed?: string; caption: string } }    // kiểm lại `toEditor` của embed
    | { type: 'delimiter'; data: Record<string, never> }
  );
  type ListItem = { content: string; meta: { checked?: boolean }; items: ListItem[] };
  CODE_LANGUAGES, CALLOUT_VARIANTS, EMBED_SERVICES (sao từ backend, ghi nguồn)
  inlineToMarkdown(html: string): string        // b/strong → **, i/em → *, s → ~~, code → `…`, a[href an toàn] → [text](href), br → xuống dòng, u/mark giữ chữ; thẻ khác giữ chữ; entity giải mã
  blocksToMarkdown(blocks: Block[]): string     // khối cách nhau bởi một dòng trống
  analyze(input: { title: string; slug: string; kw: string; meta: string; body: string; alt: string }): SeoResult
  type SeoCheck = { group: 'seo' | 'read'; label: string; status: 'good' | 'warn' | 'bad'; detail: string; w: number };
  type SeoResult = { score: number; checks: SeoCheck[]; wc: number; read: number };
  scoreBand(score): { label: 'Tốt' | 'Cần cải thiện' | 'Kém'; tone: 'success' | 'warning' | 'danger' }   // ≥80, 50–79, <50
  slugify(s), strip(s)
  ```
- `blocksToMarkdown`: paragraph → đoạn; header level n → `#`×n + khoảng trắng + chữ; list → `- ` / `1. ` / `- [ ] ` hoặc `- [x] ` theo cấp lồng (2 khoảng trắng mỗi cấp); code → khối ```` ```lang ````; table → bảng markdown (hàng đầu là tiêu đề khi `withHeadings`, không thì vẫn tạo hàng tiêu đề rỗng); callout → `> **title**` rồi `> message`; quote → `> text` và `> — caption` khi có; image → `![caption](url)`; embed → `[caption hoặc service](source)`; delimiter → `---`. Chữ trong mọi khối đi qua `inlineToMarkdown`.
- `analyze` chép đúng logic và câu chữ của bản trong `LAPBEE Admin.dc.html` dòng 819–856 (14 tiêu chí, trọng số, nhãn và `detail`, số thập phân dùng dấu phẩy). Chỉ đổi cú pháp sang TS strict, không đổi ngưỡng.

- [ ] **Step 1:** Test `inlineToMarkdown`: `<b>a</b> <i>b</i>` → `**a** *b*`; `<a href="/dich-vu">x</a>` → `[x](/dich-vu)`; `<a href="javascript:alert(1)">x</a>` → `x`; `a&amp;b&nbsp;c` → `a&b c`; `x<br>y` → hai dòng; thẻ lạ `<span>z</span>` → `z`.
- [ ] **Step 2:** Test `blocksToMarkdown` cho từng loại khối với fixture; một tài liệu nhiều khối cho đúng chuỗi mong đợi (snapshot dạng chuỗi trong test, không file snapshot).
- [ ] **Step 3:** Test `analyze` với bài mẫu `BODY1` của thiết kế (dòng 858 trở đi; chép vào fixture) cùng `title`, `kw`, `meta`, `slug`, `alt` của bài mẫu đó: điểm và trạng thái từng tiêu chí trùng với kết quả chạy `seo-analyzer.js` gốc (chạy bản gốc bằng Node trong lúc viết test để lấy số, ghi số vào test); bài rỗng ra điểm thấp và các `detail` "Chưa có nội dung.", "Chưa đặt từ khoá chính."; `scoreBand(80)` = Tốt, `scoreBand(79)` = Cần cải thiện, `scoreBand(49)` = Kém.
- [ ] **Step 4:** RED → code → GREEN. Commit `feat: editor block types, markdown conversion and seo analyzer`.

### Task 5: Danh sách bài

**Files:**
- Create: `src/features/posts/{api/repo.ts, model/adapters.ts, hooks/use-posts.ts, hooks/use-posts-total.ts, components/PostStats.tsx, PostFilters.tsx, PostTable.tsx (+ css), pages/PostsPage.tsx, index.ts}`, test `pages/posts-page.test.tsx`; `src/test/fixtures/posts.ts`
- Modify: `src/app/router.tsx` (`/posts` → `guarded('post.read', <PostsPage />)`)

**Interfaces:**
- Consumes: `useCategories` từ `@/features/categories` (tên chuyên mục cho tag lọc).
- Produces:
  ```ts
  type PostList = Res<'/admin/v1/posts','get',200>;  type PostListItem = PostList['items'][number];
  postRepo.list(query: Query<'/admin/v1/posts','get'>): Promise<PostList>
  postKeys = { all: ['posts'], list: (p: PostListParams) => ['posts','list',p], total: ['posts','total'] }
  type PostListParams = { cat: string | null; status: 'draft' | 'published' | null; q: string; page: number };
  usePosts(params): UseQueryResult<PostList>   // perPage 8, placeholderData giữ trang cũ khi đổi trang
  usePostsTotal(enabled?): number | undefined  // GET /posts?perPage=1 → byStatus.draft + byStatus.published
  ```

**Bố cục và copy (thiết kế dòng 425–490, đã bỏ phần D4/D7):** eyebrow mono `Quản trị · Bài đăng`; tiêu đề `Bài đăng`; mô tả "Bài viết trên website. Mỗi bài được chấm điểm SEO khi bạn viết."; nút chính `Viết bài mới` (P4-6). Dải số liệu 3 ô (P4-4), số mono lớn. Hàng lọc: tag `Tất cả` (số = tổng) và mỗi chuyên mục theo thứ tự `position` (số lấy `counts.byCat`, không có thì 0); ô tìm kiếm placeholder `Tìm theo tiêu đề` (debounce 300 ms, giữ dấu cách đang gõ như P3); Select trạng thái `Mọi trạng thái` / `Đã xuất bản` / `Bản nháp`. Bảng 4 cột (P4-5): tiêu đề đậm cắt bằng …, dòng phụ `effectiveExcerpt`; Badge chuyên mục; Badge trạng thái có chấm (`Đã xuất bản` success, `Bản nháp` neutral); ngày `dd.mm.yyyy` mono. Trống: "Không có bài viết phù hợp với bộ lọc." (có lọc) / "Chưa có bài viết nào." (không lọc). Cuối bảng: nhãn `Hiển thị {a}–{b} trên {total} bài` hoặc `0 bài`, nút trang trước và sau.

- Đổi `cat`, `status`, `q` thì bỏ `page`. Lần đầu gõ tìm kiếm thì thêm mục lịch sử, gõ tiếp thì thay (như P3). `page` vượt số trang thì hiện trạng thái trống kèm nút `Về trang 1`.
- Sidebar: số tổng cạnh "Bài đăng" (P4-9), chỉ gọi khi có `post.read`.

- [ ] **Step 1:** Test: vào `/posts` gửi `perPage=8&page=1`, hiện 3 số liệu từ `counts`; bấm tag chuyên mục → URL `?cat=<uuid>`, request `cat=<uuid>`, về trang 1; chọn `Bản nháp` → `status=draft`; gõ tìm kiếm → `q` sau debounce, trang 1; trang 2 → `page=2` và nhãn `Hiển thị 9–16 trên 20 bài`; bài thiếu tiêu đề, chuyên mục, ngày hiện "Bài chưa có tiêu đề", "Chưa có chuyên mục", "—"; `?page=9` khi chỉ có 3 trang → trạng thái trống và `Về trang 1`; `Viết bài mới` vô hiệu, tooltip "Sắp có"; sidebar hiện số tổng.
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: posts list with filters, search and pagination`.

### Task 6: ADR CSP, tài liệu, kiểm chứng, PR

- [ ] **Step 1:** `docs/adr/0005-editorjs-style-csp.md`: bối cảnh (Editor.js và tool chèn `<style>`, SPA tĩnh sau Caddy), các phương án (nonce qua Caddy templates, `'unsafe-inline'`, hash), quyết định P4-2, hệ quả (mỗi lần nâng Editor.js hoặc tool phải cập nhật hash; 4b thêm test so hash của style chèn thực tế với CSP trong `vite.config.ts` và `docs/csp.md`). Cập nhật `docs/csp.md` mục "Bổ sung ở giai đoạn 4" trỏ tới ADR.
- [ ] **Step 2:** Spec §5.3, §5.4 ghi P4-1 đến P4-10; §7 tách dòng GĐ4 thành 4a và 4b; README (cấu trúc `categories`, `posts`, `shared/ui/SortableItems`).
- [ ] **Step 3:** Gates: `npm run typecheck && npm run lint && npx vitest run && npm run check:api && npm run build && npx prettier --check .`. Commit `docs: categories and posts list decisions`.
- [ ] **Step 4 (subagent Sonnet):** `npm run build` rồi preview với backend local, tài khoản trong `dev-credentials.local`: thêm, sửa, xoá chuyên mục (có trùng tên, slug sai mẫu), kéo đổi thứ tự hai lần liên tiếp, thử xoá chuyên mục còn bài; danh sách bài với lọc chuyên mục, trạng thái, tìm có dấu và không dấu, phân trang; số tổng ở sidebar; tài khoản thiếu quyền (nếu có) thấy nút vô hiệu; giao diện tối; console không lỗi CSP. Push và mở PR vào `develop` (không vào `main`).
