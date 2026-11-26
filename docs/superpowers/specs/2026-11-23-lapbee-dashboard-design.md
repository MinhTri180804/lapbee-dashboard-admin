# LAPBEE Dashboard — Tài liệu thiết kế

- Ngày: 23.11.2026
- Trạng thái: chờ duyệt
- Hợp đồng API: `lapbee-backend/openapi.json` v1.4.0 (đóng băng)

## 1. Mục đích

Dashboard admin để quản lý website marketing của LAPBEE: thông tin website (nháp → xuất bản), thư viện ảnh có thư mục, chuyên mục, bài viết soạn bằng Editor.js, người dùng và phân quyền, và quản trị hệ thống (API token, audit log, webhook thất bại).

Dashboard là lớp giao diện trên một hợp đồng API có sẵn. **Không tự đặt field hoặc route.** Chỗ nào thiếu thì ghi vào `docs/backend-proposals.md`.

## 2. Nguồn sự thật

Khi các nguồn mâu thuẫn, nguồn đứng trên thắng:

1. `lapbee-backend/openapi.json`;
2. `lapbee-backend/README.md`;
3. spec backend `2026-11-19-lapbee-backend-design.md`, trong đó spec deploy `2026-11-23-…-p5-deploy-design.md` thay §11.1 về vị trí đặt API (cùng origin);
4. `design_handoff_lapbee_admin/`: chỉ dùng cho giao diện. Bỏ qua mục "API đề xuất", `Post` dạng Markdown, `id: number`, và thư mục `docs/` của handoff.

## 3. Quyết định đã chốt (bước 1–2)

| # | Quyết định |
|---|---|
| D1 | Tab Thông tin chung / Trang chủ: "Lưu & xuất bản" = `PATCH /site/settings` (nếu form có thay đổi) rồi `POST /site/publish` bằng `draftHash` mới. Có thêm nút "Lưu nháp". Badge "Chưa lưu" bật khi form có thay đổi chưa gửi **hoặc** `dirty` của server là `true`. |
| D2 | Bài đang xuất bản: "Lưu" chỉ `PATCH`, giữ nguyên trạng thái. "Gỡ xuất bản" là nút riêng. |
| D3 | Route đặt mật khẩu là `/setup-password`, khớp link backend tạo (`${ADMIN_APP_URL}/setup-password#token=…`). |
| D4 | Ẩn cột SEO và ô "điểm SEO trung bình" ở danh sách bài. Chỉ chấm SEO trong editor. |
| D5 | Sidebar: có `["*"]` thì hiện nhãn "Super admin", nếu không thì hiện email. |
| D6 | `VITE_LANDING_URL` dùng cho "Xem website" và preview Google. |
| D7 | Bỏ hẳn màn Thông báo. Không có trạng thái `scheduled`, không có 2FA, không có quên mật khẩu qua email. |
| D8 | Gặp `CSRF_FAILED` thì gọi `GET /auth/me` lấy token mới rồi thử lại **một lần**. |
| D9 | Cảnh báo sắp hết phiên: ước lượng ở client theo thời điểm request thành công gần nhất. Sau 25 phút không hoạt động thì hiện toast "Phiên sắp hết hạn" kèm nút "Tiếp tục" (gọi `/auth/me`). |
| D10 | Sắp xếp dịch vụ, đội ngũ và chuyên mục bằng kéo thả. Mỗi lần thả gửi `PATCH` với `position` mới cho đúng một mục. |
| D11 | Thiếu sót của backend ghi vào `docs/backend-proposals.md`. |
| D12 | Kiến trúc hướng A: chia theo feature, gồm API client, repository, adapter, hook (TanStack Query) và UI. |

## 4. Kiến trúc

### 4.1 Các tầng

```
UI (pages, components)              chỉ dùng view model
  ↑
hooks/ theo feature                 TanStack Query: useSite(), usePublishSite()…
  ↑
model/adapters.ts                   DTO → view model, hàm thuần
  ↑
api/repo.ts theo feature            mỗi route một hàm có kiểu
  ↑
shared/api (axios + interceptors)   CSRF, Problem → AppError, 401, step-up
  ↑
shared/api/generated/schema.d.ts    sinh từ openapi.json, không sửa tay
```

Quy tắc phụ thuộc (kiểm tra bằng ESLint `import/no-restricted-paths`):

- `features/A` không import `features/B`, trừ qua `features/B/index.ts`. Ví dụ `posts` dùng `MediaPicker` của `media`.
- `shared/*` không import `features/*` hay `app/*`.
- Component không import `api/repo.ts` hay `generated/*`. Component chỉ dùng hook và view model.

### 4.2 Cấu trúc thư mục

```
src/
  app/            main.tsx, providers.tsx, router.tsx, layout/ (Shell, Sidebar), pages lỗi
  shared/
    api/          client.ts, errors.ts, events.ts, interceptors/, generated/, types.ts
    auth/         session-store.ts, permissions.ts (can, <Can>, RequireAuth, RequirePermission)
    ui/           thành phần dùng chung (Button, Input, Dialog, Toast…)
    form/         applyProblemToForm.ts, error-messages.ts
    lib/          format-date.ts, text.ts (bỏ dấu, slugify), query-keys.ts
    styles/       tokens/*.css (chép từ _ds), fonts.css, base.css
    theme/        theme.ts (sáng/tối, localStorage "lb-admin-theme")
  features/
    auth/ site/ media/ categories/ posts/ users/ roles/ system/
      api/repo.ts · model/{types,adapters}.ts · hooks/ · components/ · pages/ · index.ts
  test/           setup.ts, msw/{server,handlers}.ts, fixtures/*.ts
scripts/          gen-api.mjs, check-api.mjs
docs/adr/ docs/backend-proposals.md docs/superpowers/{specs,plans}/
```

### 4.3 Pattern

| Pattern | Ở đâu | Lý do |
|---|---|---|
| Adapter | `features/*/model/adapters.ts` | UI không phụ thuộc DTO. Backend đổi tên field thì chỉ sửa một chỗ. Là hàm thuần nên viết TDD được |
| Repository | `features/*/api/repo.ts` | Mỗi route một hàm có kiểu. Hook và test không biết URL |
| Interceptor (chuỗi xử lý) | `shared/api/interceptors/*` | CSRF, chuyển lỗi, 401 và step-up nằm một chỗ |
| Single-flight | `reauth.ts`, `csrf-refresh.ts` | N request cùng gặp `REAUTH_REQUIRED` chỉ mở một hộp thoại, rồi gửi lại cả N |
| Observer | `shared/api/events.ts` | Tầng axios không import React hay router, chỉ phát sự kiện |
| Strategy / registry | tool Editor.js, `blocksToMarkdown`, bảng mã lỗi → câu tiếng Việt | Thêm khối hay mã lỗi chỉ là thêm một mục |
| Factory query key | `shared/lib/query-keys.ts` | Invalidate nhất quán |
| Policy | `shared/auth/permissions.ts` | Một nguồn cho menu, nút và route. `["*"]` xử lý một chỗ |

### 4.4 Phiên, CSRF, lỗi, step-up, conflict

**Client.** `axios.create({ baseURL: '/admin/v1', withCredentials: true, headers: { Accept: 'application/json' } })`. Khi dev, Vite proxy `/admin/v1` và `/media-files` sang `http://localhost:3000` (`changeOrigin: false`, để header `Origin` là `http://localhost:5173`, giá trị đã có trong `ADMIN_ORIGINS`).

**Session store** (bộ nhớ, không dùng localStorage): `{ status: 'unknown' | 'authenticated' | 'anonymous', user, permissions, csrfToken, lastActivityAt }`. Store dùng `useSyncExternalStore`, không thêm thư viện. Khi mở app: gọi `GET /auth/me`. Thành công thì chuyển sang `authenticated`. Gặp 401 thì chuyển sang `anonymous`, không coi là lỗi.

**Request interceptor.** Gắn `X-CSRF-Token` khi method thuộc POST, PUT, PATCH, DELETE và đang có token.

**Response interceptor**, theo thứ tự:

1. Thành công: cập nhật `lastActivityAt`. Nếu body có `csrfToken` (login, `/me`, đổi mật khẩu) thì store cập nhật qua repo, interceptor không tự đọc body.
2. Lỗi có body `application/problem+json`: chuyển thành `ProblemError`. Lỗi không có response: `NetworkError`. Lỗi còn lại: `UnexpectedError`.
3. `403 CSRF_FAILED` và request chưa thử lại: single-flight `GET /auth/me`, rồi gửi lại một lần (D8).
4. `403 REAUTH_REQUIRED`: phát `reauth:required`, chờ promise dùng chung. `ReauthDialog` gọi `POST /auth/reauth`. Thành công thì gửi lại request gốc. Người dùng huỷ thì ném `ReauthCancelledError`, lỗi này không hiện toast.
5. `401 UNAUTHENTICATED`: phát `session:expired`. App xoá cache, chuyển store sang `anonymous`, rồi chuyển tới `/login?next=<pathname+search>`.
6. Mọi trường hợp khác: ném lỗi tiếp cho tầng trên.

`401 INVALID_CREDENTIALS` (login, reauth, đổi mật khẩu) **không** kích hoạt bước 5, vì bước 5 lọc theo `code`.

**`VERSION_CONFLICT`.** `MutationCache.onError` toàn cục mở `ConflictDialog` với chữ "Dữ liệu đã thay đổi ở nơi khác". Nút "Tải lại" invalidate các key trong `mutation.meta.invalidates`. Form giữ nguyên dữ liệu đang gõ. Không bao giờ tự gửi lại.

**Lỗi còn lại.** `MutationCache.onError` hiện toast theo `messageFor(error)`, tức bảng `code → câu tiếng Việt` (lấy `detail` khi chưa có trong bảng). Bỏ qua khi `mutation.meta.handlesErrors === true`: form tự gắn lỗi vào field bằng `applyProblemToForm`.

**Gắn lỗi vào field.** `applyProblemToForm(error, setError, pathMap?)`. `errors[].path` của backend dùng dấu chấm (`content.blocks.3.data.file.mediaId`, `ids.2`). `pathMap` đổi path API sang tên field của form. Path không khớp field nào thì gom vào lỗi gốc `root.server`.

### 4.5 Phân quyền

- `can(permissions, key)`: trả `true` khi `permissions` chứa `'*'` hoặc chứa `key`.
- `<Can perm="post.publish">` để ẩn. Nút bấm dùng `disabled` kèm tooltip "Bạn không có quyền …" khi ẩn đi sẽ gây khó hiểu.
- Route khai báo `handle: { perm: 'site.read' }`. `RequirePermission` hiện trang 403 nội bộ.
- Menu chỉ hiện mục mà người dùng có quyền đọc.

### 4.6 Kiểu dữ liệu

- `npm run gen:api` chạy `openapi-typescript ../lapbee-backend/openapi.json -o src/shared/api/generated/schema.d.ts`. Đường dẫn nguồn đọc từ biến `OPENAPI_PATH`, mặc định như trên.
- `npm run check:api` sinh vào thư mục tạm rồi so với file đã commit, lệch thì báo đỏ. CI chạy lệnh này nếu có `openapi.json`.
- `src/shared/api/types.ts` đặt tên gọn bằng các helper `Body<P, M>`, `Res<P, M, S>`, `Query<P, M>`. Ví dụ `type MeDto = Res<'/admin/v1/auth/me', 'get', 200>`.
- **Ngoại lệ duy nhất được gõ tay:** kiểu `data` của 10 khối Editor.js (`features/posts/model/blocks.ts`), vì OpenAPI để `content` là `unknown`. Mỗi kiểu ghi nguồn là README backend và `block-handlers.ts`.

### 4.7 Giao diện

- Token chép nguyên từ `_ds/.../tokens/*.css` vào `src/shared/styles/tokens/`. Riêng `fonts.css` thay `@import` Google bằng `@fontsource`.
- Font: `@fontsource-variable/archivo` (trục wdth và wght), `@fontsource/be-vietnam-pro` (300–700, có subset vietnamese), `@fontsource-variable/jetbrains-mono`. Icon: `lucide-react`.
- CSS Modules. Không dùng giá trị màu viết cứng, chỉ dùng biến token.
- Theme: `data-theme` trên `<html>`. Đọc `localStorage "lb-admin-theme"`, nếu không có thì theo `prefers-color-scheme`. Theme được đặt bằng script nhỏ trước lần vẽ đầu tiên, nằm trong file `public/theme-init.js` (không inline) để CSP không cần `unsafe-inline`.
- Shell: lưới `248px | 1fr`. Sidebar nền `--band-bg`, có Wordmark và nhãn "Quản trị website", nav theo nhóm, cuối sidebar có "Xem website", nút đổi giao diện và khối người dùng (menu: Tài khoản, Đăng xuất).
- Nav:
  - **Nội dung:** Thông tin website (`site.read`), Bài đăng (`post.read`, kèm số tổng), Chuyên mục (`category.read`), Thư viện ảnh (`media.read`).
  - **Quản trị:** Người dùng (`user.read`), Vai trò (`role.read`), Hệ thống (`system.read` hoặc `system.manage_tokens` hoặc `audit.read`).
- Copy: tiếng Việt, sentence case, không dấu chấm than. Ngày hiển thị `dd.mm.yyyy`, thời điểm `HH:MM · dd.mm.yyyy`, đều dùng font mono, múi giờ `Asia/Ho_Chi_Minh`.
- Màu vàng bee chỉ làm nền, chữ đặt trên nó luôn là `--on-brand`.

### 4.8 Bảo mật (CSP)

Production do Caddy gửi header. Repo cung cấp sẵn giá trị trong `docs/csp.md` và kiểm tra khi dev bằng thẻ `<meta>`:

```
default-src 'self';
script-src 'self';
style-src 'self' 'sha256-…';   (hash các <style> Editor.js chèn, xem ADR 0005)
img-src 'self' data: blob: https://res.cloudinary.com;
font-src 'self';
connect-src 'self';
frame-src https://www.youtube.com https://player.vimeo.com https://codepen.io https://codesandbox.io;
object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'
```

ESLint cấm `dangerouslySetInnerHTML` (`react/no-danger`). Phần preview bài viết dựng React từ khối, không chèn HTML. HTML nội dòng được parse bằng `DOMParser` theo danh sách thẻ cho phép rồi dựng lại thành phần tử React.

## 5. Nghiệp vụ theo module (những điểm FE phải làm đúng)

### 5.1 Site

- Một query `['site']` cho `GET /site`. Mọi mutation ghi site trả về toàn bộ trạng thái site (`POST` mục trả `{ id, site }`, publish trả `{ publication, site }`), nên dùng `setQueryData(['site'], …)`, không invalidate.
- `version` ở cấp gốc là version của settings. Mỗi mục có `version` riêng. Xuất bản, hoàn tác và khôi phục gửi `draftHash`.
- Timeline không có `position`, luôn sắp theo `year`. Dịch vụ và đội ngũ có `position` (D10).
- Lỗi:
  - `SITE_INVALID` (422): mở danh sách lỗi theo `errors[].path`, mỗi lỗi có link tới tab hoặc mục tương ứng;
  - `NOTHING_TO_PUBLISH`: toast "Không có thay đổi để xuất bản";
  - `NOT_PUBLISHED`: nút "Hoàn tác" bị vô hiệu khi `published === null`;
  - `SITE_ITEM_LIMIT`: toast.
- `warnings` hiện dưới field tương ứng ở dạng cảnh báo mềm, không chặn.
- Lịch sử: `GET /site/publications` có phân trang. "Khôi phục về nháp" cần xác nhận, chạy xong thì chuyển về tab Thông tin chung và hiện toast.
- Quyết định giai đoạn 2:
  - P2-1: tab nằm trong URL `/site?tab=general|home|services|team|journey`, tải lại hoặc quay lại từ trang mục vẫn đúng tab.
  - P2-2: trang mục `/site/services/new`, `/site/services/:id`, tương tự `team`, `timeline`; lịch sử ở `/site/history`. Mỗi màn có URL riêng.
  - P2-3: form settings (tab Thông tin chung và Trang chủ) là một form chung; đổi tab không mất dữ liệu đang gõ.
  - P2-4: rời trang khi form settings hoặc form mục có thay đổi chưa gửi thì hỏi "Bỏ thay đổi chưa lưu?" (`useBlocker`).
  - P2-5: "Hoàn tác" hỏi xác nhận trước: "Đưa bản nháp về bản đã xuất bản gần nhất? Mọi thay đổi chưa xuất bản sẽ mất." (backend xoá toàn bộ nháp).
  - P2-6: "Xoá" mục hỏi xác nhận; công tắc ẩn/hiện ở danh sách dịch vụ ghi nháp ngay.
  - P2-7: lỗi `SITE_INVALID` khi xuất bản hiện hộp thoại liệt kê lỗi, mỗi lỗi có link tới tab hoặc mục tương ứng.
- Quy tắc chốt khi triển khai:
  - `VERSION_CONFLICT` luôn mở hộp thoại xung đột chung, kể cả với mutation có `handlesErrors`; `handlesErrors` chỉ tắt toast.
  - Sau 409 hoặc sau một lần lưu đang chạy, form settings và form mục rebase phần người dùng chưa lưu lên version mới của server (giữ thay đổi của họ, chuyển version nền). Nếu cache đã mới hơn lúc xảy ra xung đột thì rebase ngay. Không bao giờ tự gửi lại.
  - Thiếu quyền `site.update`: nút vẫn hiện nhưng vô hiệu, có tooltip `title` "Bạn không có quyền …", không ẩn (thay cho "ẩn nút" ở Task 7).
  - Kéo thả sắp xếp: mỗi lần một thao tác (tay nắm `aria-disabled` khi đang gửi), thứ tự lạc quan được hoàn lại khi lỗi.

### 5.2 Media

Theo ảnh thiết kế "Thư viện ảnh" bạn gửi ngày 23.11.2026:

- Cây thư mục dựng từ danh sách phẳng (`parentId`). Số đếm hiển thị là **tổng cộng dồn** ảnh của folder và mọi folder con, FE tự cộng từ `mediaCount` (vốn chỉ đếm ảnh trực tiếp).
- "Tất cả ảnh" lấy `total` của `GET /media`. "Chưa dùng" lấy `total` của `GET /media?used=false`.
- Ẩn "· 7,4 MB", vì không có API tổng dung lượng. Trên thẻ ảnh không hiện "Dùng N nơi", vì danh sách không có `usages`. Panel chi tiết gọi `GET /media/:id` và hiện danh sách chỗ dùng.
- Ô tìm kiếm ghi "Tìm trong thư viện" (`q` bỏ qua `folderId`).
- Giới hạn 5 cấp: nút "Thư mục mới" bị vô hiệu khi folder đang chọn có `depth === 5`.
- Upload dạng multipart (field `file`, `folderId`, `alt`) có thanh tiến trình. Lỗi `MEDIA_TOO_LARGE`, `MEDIA_UNSUPPORTED_TYPE`, `MEDIA_INVALID_IMAGE` hiện theo từng file.
- `MediaPicker` (hộp thoại) dùng chung cho ảnh đội ngũ, ảnh hành trình, ảnh bìa và khối ảnh trong bài.
- Quyết định giai đoạn 3:
  - P3-1: trạng thái màn nằm trong URL `/media?folder=<id>|root&view=unused&q=…&id=<ảnh đang mở>`; không có `folder`, `view`, `q` là "Tất cả ảnh". Tải lại, chia sẻ link, nút Quay lại vẫn đúng chỗ.
  - P3-2: ô tìm kiếm ghi "Tìm trong thư viện" (thiết kế ghi "Tìm trong thư mục"). Khi có `q`, tiêu đề vùng giữa là "Kết quả tìm kiếm" và bỏ chọn thư mục, vì backend bỏ qua `folderId` khi có `q`.
  - P3-3: "Tải ảnh lên" nhận nhiều file, tải vào thư mục đang chọn (ở "Tất cả ảnh", "Chưa dùng" hoặc khi tìm kiếm thì vào gốc). Tải song song tối đa 2 file; danh sách tải hiện tiến trình và lỗi từng file, có nút "Đóng" khi xong. Giới hạn 10 MB, chỉ JPEG, PNG, WebP, AVIF.
  - P3-4: panel chi tiết sửa tên và alt trong một form, nút "Lưu thay đổi" (không tự lưu); đổi thư mục bằng Select lưu ngay khi chọn; "Xoá ảnh" vô hiệu khi `usages` không rỗng, tooltip "Ảnh đang được dùng, không xoá được."
  - P3-5: chọn nhiều ảnh bằng ô chọn trên thẻ; thanh chọn hiện "{n} ảnh đã chọn", "Chuyển tới…", "Bỏ chọn". Tối đa 100 ảnh một lần ("Chọn tối đa 100 ảnh một lần."). Không có xoá hàng loạt vì `POST /media/move` nhận 1–100 id còn xoá thì không có API hàng loạt.
  - P3-6: "Đổi tên", "Chuyển tới…", "Xoá" thư mục hiện ở đầu vùng giữa khi đang chọn một thư mục, cạnh "Thư mục mới". Không có menu chuột phải hay kéo thả ảnh vào thư mục (phần mở rộng sau).
  - P3-7: "Xoá" thư mục vô hiệu khi còn ảnh trực tiếp hoặc thư mục con, tooltip "Thư mục còn ảnh hoặc thư mục con."; vẫn xử lý `FOLDER_NOT_EMPTY` nếu dữ liệu cũ.
  - P3-8: "Chuyển tới…" (ảnh hoặc thư mục) mở hộp thoại cây thư mục có mục "Gốc thư viện"; với thư mục, ẩn chính nó, thư mục con và đích làm cây vượt 5 cấp, để chặn trước `FOLDER_CYCLE`, `FOLDER_TOO_DEEP`.
  - P3-9: lưới tải 40 ảnh mỗi trang, nút "Tải thêm" ở cuối (không cuộn vô hạn).
- Quy tắc chốt khi triển khai giai đoạn 3:
  - Mọi mutation media đặt `meta: { invalidates: [mediaKeys.all] }`; số đếm thư mục là tổng cộng dồn.
  - Hộp thoại đổi tên, chuyển, xoá thư mục tự đóng khi gặp `VERSION_CONFLICT` (hộp thoại xung đột chung hiện lên); mở lại thì lấy version mới.
  - `?id` bị bỏ khi đổi thư mục, chế độ xem hoặc từ khoá tìm kiếm (panel không hiện ảnh nằm ngoài lưới); link có sẵn `?id` khi tải trang vẫn mở được.
  - "Thư mục mới" tạo trong thư mục đang chọn, nếu không chọn thì tạo ở gốc.
  - Lưới ảnh dùng cột `auto-fill`. Dưới 1200px panel chi tiết chuyển thành Dialog rộng.
  - `MediaPicker` tải một file vào thư mục đang chọn rồi tự chọn file đó; thiếu quyền thì nút tải vô hiệu kèm tooltip. Query thư mục chỉ chạy khi có quyền `media.read`.
  - Form panel chi tiết dùng `useRebasingForm` (`shared/form`), cùng cơ chế rebase như form site.
  - Câu chữ do FE tự viết (chưa có trong thiết kế), cần chủ dự án duyệt: "Bạn không có quyền sửa ảnh", "Bạn không có quyền xoá ảnh", "Bạn không có quyền chuyển ảnh", "Bạn không có quyền tải ảnh lên", "Bạn không có quyền tạo/sửa/xoá thư mục", "Tên ảnh tối đa 200 ký tự." và "Văn bản thay thế tối đa 300 ký tự.", "Tên thư mục tối đa 100 ký tự.", "Thư mục chỉ lồng tối đa 5 cấp."

### 5.3 Chuyên mục

Danh sách, thêm, sửa, xoá, kéo thả `position`. Các mã lỗi: `CATEGORY_NAME_TAKEN` và `SLUG_TAKEN` gắn vào field, `CATEGORY_NOT_EMPTY` hiện câu "Còn {postCount} bài trong chuyên mục".

- Quyết định giai đoạn 4a:
  - P4-1: giai đoạn 4 chia hai PR: 4a (chuyên mục, danh sách bài, nền cho editor) và 4b (editor Editor.js, lưu, xuất bản, gỡ, panel SEO, preview Google, hash CSP, `frame-src` cho embed).
  - P4-7: màn Chuyên mục theo §8.5: bảng có tay kéo, Tên, Đường dẫn, Mô tả, Số bài, nút Sửa và Xoá. Thêm và sửa bằng hộp thoại. Thêm mà để trống Đường dẫn thì không gửi `slug` (backend tự sinh); sửa thì Đường dẫn bắt buộc, vì `PATCH` không có cách quay lại tự sinh.
  - P4-8: "Xoá" vô hiệu khi `postCount > 0`, tooltip "Còn {postCount} bài trong chuyên mục"; vẫn xử lý `CATEGORY_NOT_EMPTY` nếu dữ liệu cũ.
  - P4-10: chỉ có tay kéo thả và bàn phím (như site), không có Select "Vị trí n / N".
- Quy tắc chốt khi triển khai 4a:
  - Hộp thoại thêm, sửa, xoá tự đóng khi gặp `VERSION_CONFLICT` (hộp thoại xung đột chung hiện lên); mở lại thì lấy version mới.
  - Đổi thứ tự chờ danh sách tải lại xong rồi mới cho kéo tiếp (để lấy `version` mới); trong lúc đó các nút điều khiển bị vô hiệu với tooltip "Đang đổi thứ tự". Lỗi không phải conflict cũng tải lại danh sách.
  - Toast `CATEGORY_NOT_EMPTY` lấy `postCount` từ body lỗi của server, không từ cache.
  - Câu chữ do FE tự viết (chưa có trong thiết kế), cần chủ dự án duyệt: "Bạn không có quyền quản lý chuyên mục", "Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.", "Để trống để tự tạo từ tên.", "Đang đổi thứ tự".

### 5.4 Bài viết

- Danh sách gửi `cat`, `status`, `q`, `page`, `perPage=8`, giữ trong URL search params. Dải số liệu lấy `counts.byStatus` (đã xuất bản, bản nháp) và `total`. Tag chuyên mục lấy `counts.byCat`.
- Editor:
  - Editor.js với đúng 10 khối, chấm SEO ở client bằng `analyze(blocksToMarkdown(blocks))`;
  - slug tự sinh hoặc khoá tay (`slugLocked`); ảnh bìa và alt; meta, `kw`, `noindex`, `featured`, `date`; preview Google.
- Nút theo D2:
  - "Lưu" = `PATCH`;
  - "Xuất bản" = `PATCH` (nếu có thay đổi) rồi `POST /publish` với `version` mới;
  - "Gỡ xuất bản" = `POST /unpublish`;
  - `POST_INVALID` gắn lỗi vào từng field qua `errors`.
- Chi tiết Editor.js ở giai đoạn 4b, ADR 0005 (CSP) và ADR riêng nếu cần.
- Quyết định giai đoạn 4a:
  - P4-2: CSP cho `<style>` Editor.js chèn dùng hash `'sha256-…'` trong `style-src`, không nonce (ADR 0005). Giá trị hash và test so khớp làm ở 4b.
  - P4-3: danh sách giữ trạng thái trong URL `/posts?cat=<uuid>&status=draft|published&q=…&page=n`; không có tham số là "Tất cả", trang 1.
  - P4-4: dải số liệu 3 ô: "Đã xuất bản", "Bản nháp", "Tổng số bài" (tổng hai số trên). Bỏ "Đang lên lịch" và "Điểm SEO trung bình" của thiết kế.
  - P4-5: bảng 4 cột: Bài viết (tiêu đề và `effectiveExcerpt`), Chuyên mục, Trạng thái, Ngày. Tiêu đề rỗng hiện "Bài chưa có tiêu đề"; chưa có chuyên mục hiện "Chưa có chuyên mục"; `date` rỗng hiện "—".
  - P4-6: ở 4a "Viết bài mới" vô hiệu kèm tooltip "Sắp có", hàng trong bảng chưa mở được; 4b nối vào editor.
  - P4-9: sidebar hiện số tổng bài cạnh "Bài đăng" (§4.7), lấy từ `GET /posts?perPage=1` (cộng `counts.byStatus`), chỉ gọi khi có `post.read`.
- Quy tắc chốt khi triển khai 4a:
  - Model chuyển khối Editor.js sang markdown và chấm SEO (`blocksToMarkdown`, `analyze`) đã có ở 4a, có test từ khối đến điểm; dạng dữ liệu khối ảnh và embed theo `toEditor` của backend.
  - Xuống dòng `<br>` trong tiêu đề, danh sách, trích dẫn được giữ cấu trúc dòng khi chuyển sang markdown.
  - Câu chữ do FE tự viết (chưa có trong thiết kế), cần chủ dự án duyệt: "Không có bài viết ở trang này." (trang vượt quá số trang), "Không tải được danh sách bài. Thử lại sau.", và mô tả trang "Bài viết trên website. Mỗi bài được chấm điểm SEO khi bạn viết."

### 5.5 Người dùng, vai trò, hệ thống

- Người dùng:
  - tạo người dùng, hiện `setupLink` một lần trong hộp thoại có nút "Sao chép" và hạn dùng;
  - sửa tên và vai trò;
  - vô hiệu hoá, kích hoạt lại, tạo link đặt lại mật khẩu, mở khoá (chỉ khi có `["*"]`).
- Vai trò: ma trận quyền theo `module` lấy từ `GET /permissions`. Nhãn tiếng Việt giữ ở FE. Vai trò hệ thống chỉ đọc.
- Token API: tối đa 2 token còn hiệu lực. Token chỉ hiện một lần lúc tạo.
- Audit log: lọc theo `actor`, `action`, `from`, `to`.
- Webhook thất bại: bảng chỉ đọc.

## 6. Kiểm thử

- **TDD cho logic:** adapter, `can`, `applyProblemToForm`, `messageFor`, các interceptor (dùng MSW), session store, `blocksToMarkdown`, `analyze`, dựng cây thư mục.
- **Test component cho luồng chính:** đăng nhập, quay lại `next`, step-up rồi thử lại, conflict, xuất bản site, upload ảnh, lưu và xuất bản bài.
- **Fixture:** đặt trong `src/test/fixtures/*.ts`, khai báo kiểu bằng DTO sinh ra (`satisfies MeDto`), nên lệch schema là lỗi biên dịch.
- **Câu lệnh:** `npm run typecheck`, `lint`, `test`, `check:api`, `build`.

## 7. Lộ trình (mỗi giai đoạn một PR)

| GĐ | Phạm vi | Xong khi |
|---|---|---|
| 1 | Nền tảng (Vite, TS strict, ESLint, Prettier, sinh type, token, font, theme), API client và toàn bộ phần xử lý tập trung (§4.4), phân quyền, shell, đăng nhập, `/setup-password`, tài khoản (đổi mật khẩu, phiên), ReauthDialog, ConflictDialog, bộ thành phần UI cơ bản | Đăng nhập thật với backend local, điều hướng trong shell, step-up chạy khi đổi mật khẩu |
| 2 | Thông tin website: 5 tab, trang Thêm/Sửa mục kèm preview, kéo thả, xuất bản và hoàn tác, lịch sử. Ô chọn ảnh tạm dùng `MediaPicker` bản tối giản | Sửa và xuất bản site đầy đủ, có xử lý `VERSION_CONFLICT` |
| 3 (xong, chờ PR) | Thư viện ảnh theo ảnh thiết kế, `MediaPicker` hoàn chỉnh, thay vào màn site | Upload, chuyển, đổi tên, xoá, quản lý folder 5 cấp |
| 4a (xong, chờ PR) | Chuyên mục (thêm, sửa, xoá, kéo thả), danh sách bài có lọc, tìm kiếm, phân trang, số tổng ở sidebar; model khối và SEO client; ADR CSP | Quản lý chuyên mục đầy đủ, danh sách bài đúng với backend |
| 4b | Editor Editor.js (10 khối, tool tự viết), lưu, xuất bản, gỡ, panel SEO, preview Google, CSP hash, `frame-src` cho embed | Tạo, lưu, xuất bản, gỡ bài; `POST_INVALID` gắn vào field |
| 5 | Người dùng, vai trò, token API, audit log, webhook thất bại | Đủ phạm vi |

## 8. Phác thảo các màn chưa có thiết kế (chờ duyệt)

Mọi màn dùng chung khung trang của prototype:

- eyebrow mono, ví dụ `QUẢN TRỊ · NGƯỜI DÙNG`;
- tiêu đề 44px Archivo, mô tả ngắn;
- nút chính màu bee ở góc phải;
- bảng phân dòng bằng hairline, không dùng card.

### 8.1 Đăng nhập (`/login`), đặt mật khẩu (`/setup-password`)

```
┌──────────────────────────── nền --band-bg toàn màn ────────────────────────────┐
│                                                                                 │
│            [Wordmark LAPBEE]                                                    │
│            QUẢN TRỊ WEBSITE                                                     │
│   ┌───────────────────────────── card 440px ───────────────────────────────┐    │
│   │  Đăng nhập                                       (Archivo 32)          │    │
│   │  Email            [______________________________]                     │    │
│   │  Mật khẩu         [__________________________] [hiện]                  │    │
│   │  ⚠ Email hoặc mật khẩu không đúng.   (vùng lỗi chung, role=alert)      │    │
│   │  [        Đăng nhập        ]  (bee, full width)                        │    │
│   │  Quên mật khẩu? Liên hệ quản trị viên để nhận link đặt lại.  (fg-2)    │    │
│   └────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- `/setup-password` dùng cùng khung: tiêu đề "Đặt mật khẩu", ô "Mật khẩu mới" và "Nhập lại", gợi ý "12–128 ký tự".
- Link hết hạn (`INVALID_LINK`): "Link đã hết hạn hoặc đã dùng. Hãy xin quản trị viên link mới."
- Thành công: chuyển tới `/login` kèm toast "Đã đặt mật khẩu".
- Token đọc từ `location.hash`, rồi xoá ngay khỏi URL bằng `history.replaceState`.
- `RATE_LIMITED`: "Thử lại sau ít phút."

### 8.2 Tài khoản (`/account`): đổi mật khẩu và phiên đăng nhập

```
TÀI KHOẢN
Tài khoản của bạn                                  
Nguyễn Minh Khoa · minhkhoa@… · Super admin
─────────────────────────────────────────────────────────────────────────
Đổi mật khẩu                       │  Mật khẩu hiện tại  [__________]
Đổi xong, các phiên khác bị        │  Mật khẩu mới       [__________]
đăng xuất.                         │  Nhập lại           [__________]
                                   │                      [Đổi mật khẩu]
─────────────────────────────────────────────────────────────────────────
Phiên đăng nhập                                                        
THIẾT BỊ                 IP            BẮT ĐẦU            HOẠT ĐỘNG CUỐI
Chrome · macOS  [Hiện tại] 1.2.3.4   09:42 · 19.11.2026  10:05 · 23.11.2026
Safari · iOS              5.6.7.8    …                   …           [Thu hồi]
```

`userAgent` được rút gọn thành tên trình duyệt và hệ điều hành bằng một hàm nhỏ có test. Thu hồi phiên hiện tại tương đương đăng xuất.

### 8.3 Hộp thoại xác thực lại (dùng chung)

```
┌ Xác nhận mật khẩu ─────────────────────── ✕ ┐
│ Thao tác này cần nhập lại mật khẩu.          │
│ Mật khẩu [______________________]            │
│                         [Huỷ] [Xác nhận]     │
└──────────────────────────────────────────────┘
```

### 8.4 Hộp thoại xung đột dữ liệu (dùng chung)

```
┌ Dữ liệu đã thay đổi ở nơi khác ──────────────┐
│ Có người vừa sửa mục này. Tải lại để xem bản │
│ mới nhất; nội dung bạn đang gõ chưa được lưu.│
│                    [Để sau] [Tải lại]        │
└──────────────────────────────────────────────┘
```

### 8.5 Chuyên mục (`/categories`)

```
NỘI DUNG · CHUYÊN MỤC
Chuyên mục                                              [+ Thêm chuyên mục]
─────────────────────────────────────────────────────────────────────────
⋮⋮  TÊN            ĐƯỜNG DẪN        MÔ TẢ                   SỐ BÀI
⋮⋮  Mẹo hay        /meo-hay         …                        12    [Sửa] [Xoá]
⋮⋮  Tin tức        /tin-tuc         …                         4    [Sửa] [Xoá]
```

Thêm và sửa dùng hộp thoại (Tên, Đường dẫn để trống thì tự sinh, Mô tả). Nút "Xoá" bị vô hiệu khi `postCount > 0`, kèm tooltip.

### 8.6 Lịch sử xuất bản (`/site/history`, mở từ header màn Thông tin website)

```
THÔNG TIN WEBSITE · LỊCH SỬ
Lịch sử xuất bản
BẢN     XUẤT BẢN LÚC           NGƯỜI XUẤT BẢN
#14     10:05 · 23.11.2026     Nguyễn Minh Khoa   [Hiện hành]
#13     16:20 · 21.11.2026     Nguyễn Minh Khoa   [Khôi phục về nháp]
                                              ‹ 1 2 3 ›
```

Tên người xuất bản tra từ `GET /users` nếu có `user.read`, nếu không thì hiện "—". Không xem được nội dung bản cũ (đề xuất gửi backend).

### 8.7 Người dùng (`/users`)

```
QUẢN TRỊ · NGƯỜI DÙNG
Người dùng                                              [+ Thêm người dùng]
[Tìm theo tên hoặc email]   (Tất cả) (Đang hoạt động) (Chờ kích hoạt) (Đã khoá)
─────────────────────────────────────────────────────────────────────────
TÊN / EMAIL                  VAI TRÒ          TRẠNG THÁI
Nguyễn Minh Khoa             Super admin      ● Đang hoạt động      [⋯]
minhkhoa@…
Trần Thu Hà                  Biên tập         ◌ Chờ kích hoạt       [⋯]
```

- Menu `⋯`: Sửa, Tạo link đặt lại mật khẩu, Vô hiệu hoá hoặc Kích hoạt lại, Mở khoá đăng nhập (chỉ super admin).
- Tạo người dùng và tạo link đều mở hộp thoại hiện link một lần:

```
┌ Link đặt mật khẩu ───────────────────────────┐
│ Gửi link này cho người dùng qua kênh nội bộ. │
│ Link chỉ hiện một lần, hết hạn lúc           │
│ 10:35 · 23.11.2026.                          │
│ [https://admin…/setup-password#token=…] [Sao chép] │
│                                   [Xong]     │
└──────────────────────────────────────────────┘
```

### 8.8 Vai trò (`/roles`, `/roles/:id`)

```
QUẢN TRỊ · VAI TRÒ
Vai trò                                                   [+ Thêm vai trò]
TÊN            MÃ             NGƯỜI DÙNG   
Super admin    super_admin    1            [Hệ thống]
Biên tập       editor         2            [Hệ thống]
Cộng tác viên  contributor    0            [Sửa] [Xoá]

Sửa vai trò (trang riêng):
Tên [_____]  Mã [contributor] (chỉ nhập lúc tạo)  Mô tả [_____]
QUYỀN
Bài viết       ☑ Xem  ☑ Tạo  ☑ Sửa  ☐ Xuất bản  ☐ Xoá
Chuyên mục     ☑ Xem  ☐ Quản lý
Thư viện ảnh   ☑ Xem  ☑ Tải lên  ☐ Sửa  ☐ Xoá
…                                               [Huỷ] [Lưu vai trò]
```

Quyền mà người đang thao tác không có thì bị vô hiệu, kèm tooltip (backend trả `PRIVILEGE_ESCALATION`).

### 8.9 Hệ thống (`/system`, 3 tab: Token API · Nhật ký · Webhook lỗi)

```
QUẢN TRỊ · HỆ THỐNG
Hệ thống          [Token API] [Nhật ký thao tác] [Webhook lỗi]

Token API — landing dùng để đọc nội dung đã xuất bản. Tối đa 2 token còn hiệu lực.
TÊN             TẠO LÚC              DÙNG LẦN CUỐI          
landing-prod    09:00 · 20.11.2026   10:01 · 23.11.2026      [Thu hồi]
landing-old     …                    —                       Đã thu hồi 21.11.2026
                                                         [+ Tạo token]
→ hộp thoại hiện token một lần: "Chép token vào cấu hình landing ngay. Sau khi đóng sẽ không xem lại được."

Nhật ký: [Người thực hiện ▾] [Hành động ▾] [Từ ngày] [Đến ngày]
THỜI ĐIỂM            NGƯỜI THỰC HIỆN   HÀNH ĐỘNG         ĐỐI TƯỢNG       IP
10:05 · 23.11.2026   Minh Khoa         site.published    site #14        1.2.3.4   [›]
(› mở panel xem `data` dạng cây key–value, chữ thuần)

Webhook lỗi:
TẠO LÚC              TAG                         LẦN THỬ   MÃ    LỖI
…                    posts, post:mua-he          10        503   timeout
```

## 9. Rủi ro

- `content` không có kiểu trong OpenAPI. Kiểu khối gõ tay có thể lệch backend. Giảm thiểu: fixture lấy từ README và test tích hợp khi chạy backend local.
- `openapi-typescript@7.13` khai peer `typescript ^5`, còn repo dùng `typescript ~6.0.3` (giống backend, và typescript-eslint chưa hỗ trợ TS 7). Giảm thiểu: dùng `overrides` trong `package.json` và kiểm chứng bằng `npm run gen:api` ở giai đoạn 1.
- Editor.js chèn `<style>` lúc chạy nên CSP cần nonce. Cách xử lý chốt ở giai đoạn 4.
