# LAPBEE Dashboard GĐ3: Thư viện ảnh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Màn Thư viện ảnh theo ảnh thiết kế ngày 23.11.2026: cây thư mục 5 cấp, lưới ảnh, panel chi tiết, tải nhiều ảnh có tiến trình, chuyển, đổi tên, xoá ảnh và thư mục. `MediaPicker` hoàn chỉnh (có cây thư mục) thay cho bản tối giản ở màn site.

**Architecture:** Theo ADR 0001: `features/media/{api/repo.ts, model/*, hooks/*, components/*, pages/*, index.ts}`. Danh sách ảnh dùng `useInfiniteQuery`; mọi mutation media invalidate tiền tố `['media']` (danh sách, chi tiết, thư mục) thay vì tự chèn vào cache. Task 1 tách logic "giữ thay đổi đang gõ khi gặp xung đột" của GĐ2 thành hook dùng chung, panel chi tiết ảnh dùng lại.

**Tech Stack:** như GĐ2, không thêm thư viện. Tiến trình upload dùng `onUploadProgress` của axios.

**Spec:** `docs/superpowers/specs/2026-11-23-lapbee-dashboard-design.md` (§5.2, §7 dòng GĐ3, §3 D11). API: `../lapbee-backend/openapi.json` (các route `/admin/v1/media*`). Giao diện: ảnh thiết kế "Thư viện ảnh" (bố cục mô tả ở Task 4–5; ảnh lưu trong workspace SDD của plan này).

## Global Constraints

Toàn bộ Global Constraints của GĐ1 và GĐ2 vẫn áp dụng: không tự thêm field hay route, CSRF chỉ trong bộ nhớ, xử lý lỗi theo `code`, TS strict, không `any`, cấm `dangerouslySetInnerHTML`, copy tiếng Việt sentence case không dấu chấm than, ngày `dd.mm.yyyy` font mono, màu chỉ qua token. Thêm cho GĐ3:

- API: `GET|POST /media`, `GET|PATCH|DELETE /media/:id` (DELETE gửi `?version=`), `POST /media/move`, `GET|POST /media/folders`, `PATCH|DELETE /media/folders/:id` (DELETE gửi `?version=`).
- Quyền: xem cần `media.read`; tải lên cần `media.upload`; sửa tên, alt, chuyển ảnh, tạo/đổi tên/chuyển thư mục cần `media.update`; xoá ảnh và thư mục cần `media.delete`. Thiếu quyền thì input chỉ đọc và nút vô hiệu kèm tooltip "Bạn không có quyền …" (không ẩn nút).
- `version` gửi đi là giá trị lúc mở panel hoặc hộp thoại (hoặc lúc rebase sau xung đột), không phải giá trị mới nhất trong cache.
- Mọi mutation media đặt `meta: { invalidates: [mediaKeys.all] }`.
- Số đếm của thư mục là **tổng cộng dồn** (`mediaCount` của nó cộng mọi thư mục con); "Tất cả ảnh" là `total` của `GET /media`; "Chưa dùng" là `total` của `GET /media?used=false`.
- Không hiện dung lượng tổng ("· 7,4 MB") và "Dùng N nơi" trên thẻ ảnh (đề xuất backend #5, #6).
- Upload: tối đa 10 MB, chỉ JPEG, PNG, WebP, AVIF (`accept="image/jpeg,image/png,image/webp,image/avif"`); lỗi `MEDIA_TOO_LARGE`, `MEDIA_UNSUPPORTED_TYPE`, `MEDIA_INVALID_IMAGE` hiện theo từng file.
- Thư mục lồng tối đa 5 cấp (`depth` 1–5).

## Quyết định mới cần chủ dự án duyệt (đã áp dụng trong plan)

| # | Quyết định | Lý do |
|---|---|---|
| P3-1 | Trạng thái màn nằm trong URL: `/media?folder=<id>|root&view=unused&q=…&id=<ảnh đang mở>`. Không có `folder`, `view`, `q` là "Tất cả ảnh" | Tải lại, chia sẻ link, nút Quay lại vẫn đúng chỗ |
| P3-2 | Ô tìm kiếm ghi "Tìm trong thư viện" (thiết kế ghi "Tìm trong thư mục"). Khi có `q`, tiêu đề vùng giữa là "Kết quả tìm kiếm" và bỏ chọn thư mục | Backend bỏ qua `folderId` khi có `q` (spec §5.2) |
| P3-3 | "Tải ảnh lên" nhận nhiều file, tải vào thư mục đang chọn (ở "Tất cả ảnh", "Chưa dùng" hoặc khi tìm kiếm thì vào gốc). Tải song song tối đa 2 file; danh sách tải hiện tiến trình và lỗi từng file, có nút "Đóng" khi xong | Thiết kế có một nút tải; API nhận một file mỗi request |
| P3-4 | Panel chi tiết: sửa tên và alt trong một form, nút "Lưu thay đổi" (không tự lưu); đổi thư mục bằng Select lưu ngay khi chọn; "Xoá ảnh" vô hiệu khi `usages` không rỗng, kèm tooltip "Ảnh đang được dùng, không xoá được." | Tự lưu dễ gây 409 khi gõ; đổi thư mục là một thao tác rời |
| P3-5 | Chọn nhiều ảnh bằng ô chọn trên thẻ; thanh chọn hiện "{n} ảnh đã chọn", "Chuyển tới…", "Bỏ chọn". Tối đa 100 ảnh một lần. Không có xoá hàng loạt | `POST /media/move` nhận 1–100 id; không có API xoá hàng loạt |
| P3-6 | Thao tác thư mục ("Đổi tên", "Chuyển tới…", "Xoá") hiện ở đầu vùng giữa khi đang chọn một thư mục, cạnh "Thư mục mới". Không có menu chuột phải hay kéo thả ảnh vào thư mục | Ít thành phần mới; kéo thả là phần mở rộng sau |
| P3-7 | "Xoá" thư mục vô hiệu khi thư mục còn ảnh trực tiếp hoặc có thư mục con, kèm tooltip "Thư mục còn ảnh hoặc thư mục con."; vẫn xử lý `FOLDER_NOT_EMPTY` nếu dữ liệu đã cũ | Backend chỉ xoá thư mục rỗng |
| P3-8 | "Chuyển tới…" (ảnh hoặc thư mục) mở hộp thoại cây thư mục có mục "Gốc thư viện"; với thư mục, ẩn chính nó, thư mục con và đích làm cây vượt 5 cấp | Chặn trước `FOLDER_CYCLE`, `FOLDER_TOO_DEEP` |
| P3-9 | Lưới tải 40 ảnh mỗi trang, nút "Tải thêm" ở cuối (không cuộn vô hạn) | Đơn giản, dễ test, giữ được vị trí cuộn |

---

## File Structure

```
src/shared/form/use-rebasing-form.ts          (+ test)   hook giữ thay đổi đang gõ khi gặp xung đột (Task 1)
src/features/site/pages/SitePage.tsx, SiteItemPage.tsx   dùng hook trên (Task 1)
src/features/media/
  api/repo.ts                 mở rộng: get, upload(file, opts, onProgress), update, remove, move, folders.*
  model/adapters.ts           mediaKeys, toMediaThumb, uploadErrorMessage (sẵn có) + format helpers, error messages
  model/folder-tree.ts        (+ test) dựng cây, cộng dồn số đếm, đường dẫn, đích chuyển hợp lệ
  hooks/use-media-list.ts     nhận MediaListParams
  hooks/use-media-detail.ts, use-folders.ts, use-media-mutations.ts, use-folder-mutations.ts, use-upload-queue.ts
  components/FolderTree.tsx, MediaGrid.tsx, MediaCard.tsx, MediaDetailPanel.tsx, UploadQueue.tsx,
             MoveDialog.tsx, FolderNameDialog.tsx, SelectionBar.tsx, MediaPicker.tsx (viết lại)
  pages/MediaLibraryPage.tsx  (+ test media-library.test.tsx)
src/test/fixtures/media.ts    fixture ảnh, chi tiết, thư mục (satisfies DTO)
src/app/router.tsx            /media → MediaLibraryPage
```

## Review Focus

1. **Xung đột khi sửa ảnh**: người khác đổi alt trong lúc mình đang gõ; PATCH mang version lúc mở panel, 409 mở hộp thoại toàn cục, "Tải lại" giữ chữ đang gõ và chuyển sang version mới (Task 1, Task 5).
2. **Số đếm cộng dồn sau thao tác**: tải ảnh, chuyển ảnh, xoá ảnh xong thì số ở cây thư mục, "Tất cả ảnh", "Chưa dùng" cập nhật (invalidate `['media']`) (Task 3, Task 6).
3. **Chuyển thư mục tạo vòng hoặc vượt 5 cấp**: hộp thoại không cho chọn chính nó, thư mục con, đích làm cây sâu quá 5; nếu server vẫn trả `FOLDER_CYCLE`/`FOLDER_TOO_DEEP` thì hiện câu tương ứng (Task 2, Task 7).
4. **Tải nhiều file, một file lỗi**: các file khác vẫn tải xong; file lỗi hiện đúng câu theo `code`; đóng danh sách không huỷ file đang tải dở (Task 3, Task 4).
5. **Đang mở ảnh rồi ảnh bị xoá hoặc chuyển đi nơi khác**: panel hiện "Không tìm thấy ảnh này." khi `GET /media/:id` trả 404 và bỏ `id` khỏi URL khi đóng; xoá xong thì panel đóng (Task 5).

---

### Task 1: Hook dùng chung `useRebasingForm` cho xung đột

**Files:**
- Create: `src/shared/form/use-rebasing-form.ts`, test `src/shared/form/use-rebasing-form.test.tsx`
- Modify: `src/features/site/pages/SitePage.tsx`, `src/features/site/pages/SiteItemPage.tsx` (bỏ `keepEdits`, `rebaseTo`/`rebase`, `resetOnNextVersion`/`conflicted`, `latest` riêng của từng trang)

**Interfaces:**
- Produces:
  ```ts
  type Server<T> = { values: T; version: number } | null;
  function useRebasingForm<T extends FieldValues>(opts: {
    form: UseFormReturn<T>;
    server: Server<T>;              // bản mới nhất trong cache, null khi chưa có hoặc đã bị xoá
  }): {
    baseline: { readonly initial: T; readonly version: number };  // version gửi đi
    onConflict(): void;             // gọi khi nhận VERSION_CONFLICT
    rebaseFromSent(next: { values: T; version: number }, sent: T): void; // sau khi ghi thành công
    resetTo(next: { values: T; version: number }): void;  // reset toàn bộ (vd. hoàn tác)
  };
  function keepEdits<T>(next: T, previous: T, current: T): T; // gộp từng lá, mảng theo phần tử
  ```
- Hành vi (giữ đúng như GĐ2 đã review): `onConflict` rebase ngay nếu `server.version !== baseline.version`, ngược lại chờ version mới tới rồi rebase; rebase dùng `reset(initial)` rồi `reset(merged, { keepDefaultValues: true })` (tránh lỗi `keepDirtyValues` của RHF 7.92); không bao giờ tự gửi lại.

- [ ] **Step 1:** Test hook (renderHook với `useForm`): `keepEdits` giữ lá đã sửa và nhận lá server đổi (cả mảng `stats`); `onConflict` khi cache đã đi trước → rebase ngay, `baseline.version` = version cache, form vẫn bẩn; khi cache chưa đổi → chưa rebase, version mới tới thì rebase đúng một lần; `rebaseFromSent` giữ chữ gõ sau khi bấm; `resetTo` làm form sạch.
- [ ] **Step 2:** Thêm test hồi quy còn thiếu từ GĐ2 vào `site-page.test.tsx`: xuất bản khi form bẩn, PATCH 200 (v10) rồi publish 409, tải lại trả v10 → không có cờ treo; lần lưu sau gửi `version: 10`.
- [ ] **Step 3:** RED → viết hook → chuyển SitePage và SiteItemPage sang hook; toàn bộ test `site-page.test.tsx`, `site-item-page.test.tsx` hiện có phải qua mà không sửa assertion.
- [ ] **Step 4:** `npx vitest run src/shared/form src/features/site` qua. Commit `refactor: shared rebasing form hook for conflict handling`.

### Task 2: Repo, kiểu và cây thư mục

**Files:**
- Modify: `src/features/media/api/repo.ts`, `src/features/media/model/adapters.ts`
- Create: `src/features/media/model/folder-tree.ts`, test `folder-tree.test.ts`, test `adapters.test.ts`; `src/test/fixtures/media.ts`

**Interfaces:**
- Produces (repo; kiểu suy từ `Res`/`Body`/`Query` sinh ra, không gõ tay):
  ```ts
  type MediaDetailDto = Res<'/admin/v1/media/{id}','get',200>;
  type FolderDto = Res<'/admin/v1/media/folders','get',200>['items'][number];
  mediaRepo.list(query: MediaQuery): Promise<MediaList>
  mediaRepo.get(id: string): Promise<MediaDetailDto>
  mediaRepo.upload(file: File, opts: { folderId?: string }, onProgress?: (ratio: number) => void): Promise<MediaDto>
  mediaRepo.update(id: string, body: Body<'/admin/v1/media/{id}','patch'>): Promise<MediaDto>
  mediaRepo.remove(id: string, version: number): Promise<void>
  mediaRepo.move(ids: string[], folderId: string | null): Promise<{ moved: number }>
  mediaRepo.folders.list(): Promise<FolderDto[]>
  mediaRepo.folders.create(body: { name: string; parentId: string | null }): Promise<FolderDto>
  mediaRepo.folders.update(id: string, body: Body<'/admin/v1/media/folders/{id}','patch'>): Promise<FolderDto>
  mediaRepo.folders.remove(id: string, version: number): Promise<void>
  ```
- Produces (model):
  ```ts
  mediaKeys = { all: ['media'], list: (p: MediaListParams) => ['media','list',p], detail: (id) => ['media','detail',id], folders: ['media','folders'], total: (used?: false) => ['media','total',used ?? 'all'] }
  type MediaListParams = { folder: string | 'root' | null; q: string; used: false | null };
  type FolderNode = { id; name; depth; parentId; version; mediaCount; total: number; children: FolderNode[]; height: number };
  buildFolderTree(flat: FolderDto[]): FolderNode[]        // total = cộng dồn; height = số cấp của cây con (lá = 1)
  findFolder(tree, id): FolderNode | undefined
  folderPath(tree, id): FolderNode[]                         // từ gốc tới thư mục
  moveTargets(tree, movingId: string | null): Set<string | null>  // null = gốc; với ảnh (movingId null) là mọi thư mục; với thư mục loại chính nó, cây con, đích có depth + height > 5, và cha hiện tại
  formatBytes(n): string        // "214 KB", "1,2 MB" (dấu phẩy thập phân, 1024)
  formatMediaMeta(dto): string  // "JPG · 800 × 1000 · 214 KB · 02.03.2026"
  folderErrorMessage(code): string | null  // FOLDER_NAME_TAKEN "Đã có thư mục cùng tên ở đây.", FOLDER_TOO_DEEP "Thư mục chỉ lồng tối đa 5 cấp.", FOLDER_CYCLE "Không thể chuyển thư mục vào chính nó hoặc thư mục con.", FOLDER_NOT_EMPTY "Thư mục còn ảnh hoặc thư mục con."
  USAGE_KIND_LABEL: Record<string,string>  // team_member "Đội ngũ", timeline_entry "Hành trình", site_publication "Bản xuất bản website", post_cover "Ảnh bìa bài viết", post_image "Ảnh trong bài viết"; kind lạ thì hiện `source`
  ```

- [ ] **Step 1:** Test `buildFolderTree` với fixture theo ảnh thiết kế (Đội ngũ 6; Hành trình → 2024 → Phòng sạch; Bài đăng → Hướng dẫn, Khuyến mãi; Dịch vụ 0): `mediaCount` trực tiếp: Đội ngũ 6, Hành trình 7, 2024 2, Phòng sạch 3, Bài đăng 3, Hướng dẫn 2, Khuyến mãi 1, Dịch vụ 0 → `total` cộng dồn: Hành trình 12, 2024 5, Phòng sạch 3, Bài đăng 6; `height` của Hành trình 3; thứ tự giữ như server (depth rồi tên); `parentId` trỏ tới id không có thì gắn vào gốc, không lặp vô hạn.
- [ ] **Step 2:** Test `moveTargets`: chuyển "Hành trình" (height 3) không cho chọn chính nó, "2024", "Phòng sạch", thư mục có depth ≥ 3, và chính cha hiện tại (gốc → `null` bị loại); chuyển ảnh cho chọn `null` và mọi thư mục.
- [ ] **Step 3:** Test `formatBytes(219136)` = "214 KB", `formatBytes(1258291)` = "1,2 MB"; `formatMediaMeta` cho fixture ra đúng chuỗi mẫu; repo `upload` gửi `FormData` có `file` và `folderId` (MSW đọc `request.formData()`), không gửi `folderId` khi không có; `remove` gửi `?version=`.
- [ ] **Step 4:** RED → code → GREEN. Commit `feat: media repo, folder tree and formatters`.

### Task 3: Hook truy vấn và ghi

**Files:**
- Modify: `src/features/media/hooks/use-media-list.ts`, `use-upload-media.ts` (xoá, thay bằng hàng đợi)
- Create: `hooks/use-media-detail.ts`, `use-folders.ts`, `use-media-total.ts`, `use-media-mutations.ts`, `use-folder-mutations.ts`, `use-upload-queue.ts`; test `hooks/media-hooks.test.tsx`

**Interfaces:**
- Consumes: Task 2.
- Produces:
  ```ts
  useMediaList(params: MediaListParams, enabled?: boolean): UseInfiniteQueryResult<InfiniteData<MediaList, number>>  // perPage 40
  useMediaTotal(used?: false): number | undefined          // GET /media?perPage=1[&used=false] → total
  useMediaDetail(id: string | null): UseQueryResult<MediaDetailDto>
  useFolders(): { tree: FolderNode[]; flat: FolderDto[]; query: UseQueryResult<FolderDto[]> }
  useUpdateMedia(): UseMutationResult<MediaDto, Error, { id: string; body: … }>      // handlesErrors
  useDeleteMedia(): UseMutationResult<void, Error, { id: string; version: number }>   // handlesErrors
  useMoveMedia(): UseMutationResult<{ moved: number }, Error, { ids: string[]; folderId: string | null }>
  useCreateFolder(), useUpdateFolder(), useDeleteFolder()                            // handlesErrors
  type UploadItem = { key: string; name: string; progress: number; status: 'queued'|'uploading'|'done'|'error'; error?: string; media?: MediaDto };
  useUploadQueue(): { items: UploadItem[]; add(files: File[], folderId: string | null): void; clearFinished(): void; busy: boolean }
  ```
- Mọi mutation: `meta: { invalidates: [mediaKeys.all] }`, `onSuccess` invalidate `mediaKeys.all`. Hàng đợi chạy tối đa 2 file song song, mỗi file thành công invalidate `mediaKeys.all`; lỗi file này không dừng file khác; `error` = `uploadErrorMessage(code)`.

- [ ] **Step 1:** Test: `useMediaList({folder:'root',q:'',used:null})` gửi `folderId=root`; `{folder:id}` gửi `folderId=id`; có `q` thì gửi `q` và **không** gửi `folderId`; `used:false` gửi `used=false`; trang 2 qua `fetchNextPage`.
- [ ] **Step 2:** Test hàng đợi: thêm 3 file, MSW giữ request → không quá 2 request cùng lúc; file 2 trả 415 → `status 'error'`, câu "Chỉ nhận ảnh JPEG, PNG, WebP hoặc AVIF.", file 1 và 3 `done`; `progress` tăng khi axios báo tiến trình (giả lập bằng mock `onUploadProgress` hoặc chỉ kiểm 0 → 1 khi xong).
- [ ] **Step 3:** Test `useDeleteMedia` gửi `DELETE /media/:id?version=3` và invalidate danh sách (danh sách gọi lại); `VERSION_CONFLICT` vẫn phát sự kiện `conflict`.
- [ ] **Step 4:** RED → code → GREEN. Commit `feat: media query and mutation hooks with upload queue`.

### Task 4: Trang Thư viện ảnh: khung, cây thư mục, lưới, tải lên

**Files:**
- Create: `pages/MediaLibraryPage.tsx` (+ css), `components/FolderTree.tsx`, `MediaGrid.tsx`, `MediaCard.tsx`, `UploadQueue.tsx` (+ css); test `pages/media-library.test.tsx`
- Modify: `src/features/media/index.ts` (export `MediaLibraryPage`), `src/app/router.tsx` (`/media` → `guarded('media.read', <MediaLibraryPage />)`)

**Interfaces:**
- Consumes: Task 3 hooks.
- Produces: `FolderTree({ tree, selected: string|null, onSelect(id: string|null), compact?: boolean })` (Task 8 dùng lại); `MediaCard({ media, selected, checked, onOpen, onToggleCheck, checkable })`.

**Bố cục và copy (theo ảnh thiết kế):**
- Đầu trang: eyebrow mono `Quản trị · Thư viện ảnh`; tiêu đề `Thư viện ảnh`; mô tả "Tải ảnh lên một lần, dùng lại ở Đội ngũ, Hành trình và Bài đăng. Ảnh đang được dùng không xoá được."; bên phải nhãn mono `{total} ảnh` và nút chính `Tải ảnh lên` (icon `upload`, input file ẩn `multiple`).
- Cột trái: `Tất cả ảnh` (icon `images`, số `total`), `Chưa dùng` (icon vòng nét đứt, số `useMediaTotal(false)`); nhãn mono `Thư mục` và `Tối đa 5 cấp`; cây thư mục: icon folder, nút mở/đóng (chevron, `aria-expanded`) cho thư mục có con, số cộng dồn mono bên phải, thụt lề theo cấp; mục đang chọn nền `--surface-2`.
- Vùng giữa: tiêu đề `Thư viện` (Tất cả ảnh) / `Chưa dùng` / tên thư mục / `Kết quả tìm kiếm`; dòng mono `{n} ảnh` (n = `total` của danh sách hiện tại); bên phải `Thư mục mới` (ghost, icon `folder-plus`) và ô tìm kiếm placeholder `Tìm trong thư viện` (icon `search`, debounce 300 ms, ghi vào `q`).
- Lưới 4 cột (co về 2 cột ở màn hẹp): thẻ ảnh có `thumbUrl` (alt = `alt` hoặc tên), tên cắt bằng dấu …, dòng mono `{width} × {height}`; thẻ đang mở viền `--ink`. Cuối lưới nút `Tải thêm` khi còn trang. Trống: "Thư mục này chưa có ảnh." / "Không tìm thấy ảnh nào." / "Chưa có ảnh nào chưa dùng."
- Danh sách tải (góc dưới phải): tiêu đề `Đang tải {k}/{n} ảnh` hoặc `Đã tải xong`, mỗi file một dòng tên + thanh tiến trình + câu lỗi; nút `Đóng` (chỉ xoá các dòng đã xong).
- Thiếu `media.upload`: nút `Tải ảnh lên` vô hiệu, tooltip "Bạn không có quyền tải ảnh lên".

- [ ] **Step 1:** Test: vào `/media` thấy cây với số cộng dồn (Hành trình `12`), `Tất cả ảnh` số đúng, lưới có thẻ fixture; bấm "2024" → URL `?folder=<id>` và request `folderId=<id>`; gõ tìm kiếm → URL có `q`, tiêu đề "Kết quả tìm kiếm", request không có `folderId`; bấm "Chưa dùng" → `?view=unused`, request `used=false`; thu gọn "Hành trình" ẩn "2024"; `Tải thêm` gọi trang 2.
- [ ] **Step 2:** Test tải lên: đang ở thư mục "Đội ngũ", chọn 2 file → 2 POST có `folderId` của Đội ngũ; một file 413 → dòng đó hiện "Ảnh vượt quá 10 MB."; xong thì danh sách ảnh được tải lại.
- [ ] **Step 3:** RED → code → GREEN. Commit `feat: media library page with folder tree, grid and uploads`.

### Task 5: Panel chi tiết ảnh

**Files:**
- Create: `components/MediaDetailPanel.tsx` (+ css); test `components/media-detail.test.tsx`
- Modify: `pages/MediaLibraryPage.tsx` (bấm thẻ ghi `id` vào URL; panel là cột phải; màn hẹp thì panel thành hộp thoại `size="wide"`)

**Interfaces:**
- Consumes: `useMediaDetail`, `useUpdateMedia`, `useDeleteMedia`, `useFolders`, `useRebasingForm` (Task 1), `formatMediaMeta`, `USAGE_KIND_LABEL`.

**Copy:** ảnh `url` lớn; tên file (đậm) và dòng mono `formatMediaMeta`; form: `Tên ảnh` (TextField, 1–200 ký tự), `Văn bản thay thế` (TextArea, hint "Tự điền vào alt khi chèn ảnh vào bài viết.", CharCount 300); `Thư mục` (Select, các lựa chọn `Gốc thư viện` và đường dẫn `Hành trình / 2024 / Phòng sạch`, đổi là PATCH `{version, folderId}` ngay, toast "Đã chuyển ảnh"); `Đang dùng ở` (danh sách `{nhãn loại} · {label}`) hoặc "Chưa được dùng ở đâu."; nút `Lưu thay đổi` (chính, chỉ bật khi form bẩn, toast "Đã lưu ảnh"); `Xoá ảnh` (danger ghost; ConfirmDialog "Xoá ảnh {tên}?" / "Ảnh bị xoá khỏi thư viện và không lấy lại được." / `Xoá`; toast "Đã xoá ảnh"; đóng panel).

- [ ] **Step 1:** Test: mở `?id=x` gọi `GET /media/x`, hiện meta "JPG · 800 × 1000 · 214 KB · 02.03.2026"; sửa alt → PATCH `{ version: <lúc mở>, alt }` chỉ có field đổi, kể cả khi cache detail đã được làm mới sang version khác; 409 → "Tải lại" giữ alt đang gõ và lần lưu sau mang version mới; đổi thư mục gửi `{version, folderId}`; ảnh có `usages` → `Xoá ảnh` vô hiệu kèm tooltip, danh sách "Đội ngũ · Nguyễn Minh Khoa"; xoá ảnh không dùng → confirm → `DELETE ?version=` → panel đóng, `id` khỏi URL; `MEDIA_IN_USE` (dữ liệu cũ) → toast "Ảnh đang được dùng, không xoá được." và tải lại chi tiết; 404 → "Không tìm thấy ảnh này."; thiếu `media.update` → input chỉ đọc.
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: media detail panel with rename, alt, move and delete`.

### Task 6: Chọn nhiều ảnh và chuyển

**Files:**
- Create: `components/SelectionBar.tsx`, `components/MoveDialog.tsx` (+ css); test `components/media-move.test.tsx`
- Modify: `MediaCard.tsx` (ô chọn góc trên trái, hiện khi hover/focus hoặc khi đã có ảnh được chọn; `aria-label="Chọn {tên}"`), `MediaLibraryPage.tsx`

**Interfaces:**
- Produces: `MoveDialog({ open, title, tree, movingFolderId: string|null, currentFolderId: string|null, onClose, onConfirm(target: string|null) })` (Task 7 dùng lại). Lựa chọn lấy từ `moveTargets`; mục không hợp lệ không hiện. Nút `Chuyển` vô hiệu khi chưa chọn đích.

**Copy:** thanh chọn `{n} ảnh đã chọn` · `Chuyển tới…` · `Bỏ chọn`; quá 100 thì ô chọn còn lại vô hiệu và thanh hiện "Chọn tối đa 100 ảnh một lần."; hộp thoại tiêu đề `Chuyển {n} ảnh tới`; toast `Đã chuyển {moved} ảnh`. Đổi thư mục/tìm kiếm thì bỏ chọn.

- [ ] **Step 1:** Test: chọn 2 ảnh → thanh hiện "2 ảnh đã chọn"; "Chuyển tới…" → chọn "Phòng sạch" → `POST /media/move { ids:[a,b], folderId }`, toast "Đã chuyển 2 ảnh", chọn bị xoá, danh sách và cây tải lại; chọn "Gốc thư viện" gửi `folderId: null`; thiếu `media.update` → "Chuyển tới…" vô hiệu kèm tooltip.
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: multi-select and move media`.

### Task 7: Quản lý thư mục

**Files:**
- Create: `components/FolderNameDialog.tsx`; test `components/media-folders.test.tsx`
- Modify: `MediaLibraryPage.tsx` (nút thư mục ở đầu vùng giữa)

**Interfaces:**
- Consumes: `useCreateFolder`, `useUpdateFolder`, `useDeleteFolder`, `MoveDialog`, `folderErrorMessage`, `findFolder`.
- Produces: `FolderNameDialog({ open, title, initialName, submitLabel, onClose, onSubmit(name): Promise<void> })` — lỗi `FOLDER_NAME_TAKEN`, `VALIDATION_FAILED` hiện dưới ô tên; lỗi khác toast.

**Copy:** `Thư mục mới` → hộp thoại `Thư mục mới` (ô `Tên thư mục`, 1–100 ký tự, nút `Tạo`), cha = thư mục đang chọn hoặc gốc; vô hiệu khi thư mục đang chọn có `depth === 5`, tooltip "Thư mục chỉ lồng tối đa 5 cấp."; khi đang chọn thư mục: `Đổi tên` (hộp thoại `Đổi tên thư mục`, nút `Lưu`), `Chuyển tới…` (MoveDialog tiêu đề `Chuyển thư mục {tên} tới`), `Xoá` (ConfirmDialog "Xoá thư mục {tên}?" / "Thư mục trống sẽ bị xoá." / `Xoá`; xong thì chọn thư mục cha). Toast: "Đã tạo thư mục", "Đã đổi tên thư mục", "Đã chuyển thư mục", "Đã xoá thư mục".

- [ ] **Step 1:** Test: tạo trong "Hành trình" gửi `{ name, parentId }` và chọn thư mục mới; `FOLDER_NAME_TAKEN` → "Đã có thư mục cùng tên ở đây." dưới ô tên, hộp thoại vẫn mở; thư mục depth 5 → `Thư mục mới` vô hiệu; đổi tên gửi `{ version, name }`; chuyển gửi `{ version, parentId }`, server trả `FOLDER_TOO_DEEP` → toast "Thư mục chỉ lồng tối đa 5 cấp."; "Đội ngũ" có ảnh → `Xoá` vô hiệu kèm tooltip; thư mục rỗng → xoá gửi `?version=`, URL chuyển sang thư mục cha; `FOLDER_NOT_EMPTY` → toast "Thư mục còn ảnh hoặc thư mục con.".
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: create, rename, move and delete media folders`.

### Task 8: `MediaPicker` hoàn chỉnh

**Files:**
- Modify: `components/MediaPicker.tsx` (+ css), test `components/media-picker.test.tsx`

**Interfaces:**
- Consumes: `FolderTree` (compact), `useMediaList`, `useUploadQueue` (hoặc `mediaRepo.upload` qua mutation một file), `useFolders`.
- Giữ nguyên props `MediaPickerProps` (`open`, `onClose`, `onPick`, `title`) để `TeamForm` và `TimelineForm` không phải sửa.

**Bố cục:** Dialog `size="wide"`; trái là cây thư mục gọn có `Tất cả ảnh` (cuộn riêng); phải là ô `Tìm trong thư viện`, nút `Tải ảnh lên` (một file, tải vào thư mục đang chọn, xong thì tự chọn ảnh đó), lưới thumbnail 3–4 cột, `Tải thêm`. Bấm ảnh là chọn (gọi `onPick`) như hiện tại. Trạng thái tìm kiếm, thư mục và ảnh đang chọn reset khi đóng.

- [ ] **Step 1:** Test: mở picker, bấm thư mục "Đội ngũ" → request `folderId`; tìm kiếm bỏ `folderId`; tải ảnh khi đang ở "Đội ngũ" gửi `folderId` và gọi `onPick` với ảnh mới; đóng rồi mở lại thì ô tìm kiếm trống và về "Tất cả ảnh"; thiếu `media.upload` → nút tải vô hiệu kèm tooltip. Test site hiện có (`site-item-page.test.tsx` chọn ảnh thành viên) vẫn qua.
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: full media picker with folders`.

### Task 9: Kiểm chứng với backend thật, tài liệu, PR

- [ ] **Step 1:** Cập nhật spec §5.2 với P3-1 đến P3-9; README (cấu trúc `media`); thiếu sót API mới (nếu có) vào `docs/backend-proposals.md`.
- [ ] **Step 2:** Gates: `npm run typecheck && npm run lint && npx vitest run && npm run check:api && npm run build && npx prettier --check .`.
- [ ] **Step 3:** `npm run build && npm run preview` với backend local (Docker chạy), tài khoản trong `dev-credentials.local`: tạo cây 5 cấp (cấp 6 bị chặn), tải nhiều ảnh trong đó có file sai loại, xem số cộng dồn, mở chi tiết, sửa alt, đổi thư mục, chọn nhiều và chuyển, đổi tên/chuyển/xoá thư mục, xoá ảnh đang dùng (bị chặn) và không dùng, chọn ảnh đội ngũ qua picker mới, giao diện tối, console không lỗi CSP; xung đột: mở cùng ảnh ở hai tab, lưu tab 1 rồi tab 2.
- [ ] **Step 4:** Commit `docs: media library decisions`. Push và mở PR vào `develop` (không vào `main`).
