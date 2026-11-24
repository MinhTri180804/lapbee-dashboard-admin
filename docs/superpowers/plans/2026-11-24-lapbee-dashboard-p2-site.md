# LAPBEE Dashboard GĐ2: Thông tin website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Màn Thông tin website đầy đủ theo prototype: 5 tab, mô hình nháp và xuất bản (Lưu nháp, Lưu & xuất bản, Hoàn tác, badge "Chưa lưu"), trang Thêm/Sửa mục có xem trước, kéo thả thứ tự, ô chọn ảnh tối giản, lịch sử xuất bản và khôi phục về nháp.

**Architecture:** Theo GĐ1 (ADR 0001): `features/site/{api/repo.ts, model/*, hooks/*, components/*, pages/*, index.ts}`. Mọi route ghi site trả về toàn bộ trạng thái site, nên hook ghi `setQueryData(siteKeys.detail, …)` thay vì invalidate. Ô chọn ảnh nằm ở `features/media` (bản tối giản, GĐ3 mở rộng).

**Tech Stack:** như GĐ1, thêm `@dnd-kit/core@6`, `@dnd-kit/sortable@10`, `@dnd-kit/utilities@3` (đã duyệt ở bước 2).

**Spec:** `docs/superpowers/specs/2026-11-23-lapbee-dashboard-design.md` (§3 D1, D10; §5.1; §8.6). Giao diện: `design_handoff_lapbee_admin/LAPBEE Admin.dc.html`, khối `THÔNG TIN WEBSITE` (dòng 60–251) và `THÊM / SỬA MỤC WEBSITE` (dòng 614 trở đi), logic ở `class Component` (`ITEM_DEF`, `ITEM_META`, `renderVals`).

## Global Constraints

Toàn bộ Global Constraints của GĐ1 vẫn áp dụng (plan `2026-11-23-…-p1-…md`): không tự thêm field hay route, CSRF chỉ trong bộ nhớ, xử lý theo `code`, TS strict, không `any`, cấm `dangerouslySetInnerHTML`, copy tiếng Việt sentence case không dấu chấm than, ngày `dd.mm.yyyy` và thời điểm `HH:MM · dd.mm.yyyy` font mono, màu chỉ qua token, bee chỉ làm nền với chữ `--on-brand`. Thêm cho GĐ2:

- API: `GET /site`, `PATCH /site/settings`, `POST|PATCH|DELETE /site/{services|team|timeline}[/:id]`, `POST /site/publish`, `POST /site/revert`, `GET /site/publications`, `POST /site/publications/:id/restore-to-draft`; `GET /media`, `POST /media` (cho ô chọn ảnh).
- Quyền: xem cần `site.read`; mọi thao tác ghi nháp, hoàn tác và khôi phục cần `site.update`; xuất bản cần `site.publish`. Thiếu quyền thì input chỉ đọc và nút bị vô hiệu, kèm tooltip "Bạn không có quyền …".
- `version` gửi đi là giá trị **lúc mở form**, không phải giá trị mới nhất trong cache. Cache có thể được làm mới nền trong lúc người dùng gõ; gửi version mới sẽ ghi đè thay đổi của người khác mà không báo 409.
- `draftHash` gửi cho xuất bản, hoàn tác, khôi phục lấy từ phản hồi site mới nhất (sau lần ghi nháp cuối của chính mình).
- Mọi mutation ghi site đặt `meta: { invalidates: [siteKeys.detail] }` để hộp thoại xung đột tải lại đúng dữ liệu.
- Timeline không có `position` và `visible`; luôn hiển thị theo `year` tăng dần như server trả về.
- Copy, nhãn và gợi ý lấy đúng từ prototype (bảng ở Task 5–8), trừ chỗ plan ghi khác.

## Quyết định mới cần chủ dự án duyệt (đã áp dụng trong plan)

| # | Quyết định | Lý do |
|---|---|---|
| P2-1 | Tab nằm trong URL: `/site?tab=general|home|services|team|journey` | Tải lại hoặc quay lại từ trang mục vẫn đúng tab |
| P2-2 | Trang mục: `/site/services/new`, `/site/services/:id`, tương tự `team`, `timeline`; lịch sử: `/site/history` | Mỗi màn có URL riêng, nút Quay lại của trình duyệt dùng được |
| P2-3 | Form settings (tab Thông tin chung và Trang chủ) là **một** form chung; đổi tab không mất dữ liệu đang gõ | Prototype gộp cả hai vào một `site` |
| P2-4 | Rời trang khi form settings hoặc form mục có thay đổi chưa gửi: hỏi "Bỏ thay đổi chưa lưu?" (React Router `useBlocker`) | Tránh mất dữ liệu đang gõ |
| P2-5 | "Hoàn tác" hỏi xác nhận trước: "Đưa bản nháp về bản đã xuất bản gần nhất? Mọi thay đổi chưa xuất bản sẽ mất." | Backend xoá toàn bộ nháp, không lấy lại được |
| P2-6 | "Xoá" mục hỏi xác nhận; công tắc ẩn/hiện ở danh sách dịch vụ ghi nháp ngay | Xoá khó đảo ngược hơn ẩn |
| P2-7 | Lỗi `SITE_INVALID` khi xuất bản: hộp thoại liệt kê lỗi, mỗi lỗi có link tới tab hoặc mục tương ứng | Lỗi có thể nằm ở mục không đang mở |

---

## File Structure

```
src/shared/ui/  Tabs, Switch, Select, TextArea, Card, ConfirmDialog, CharCount  (+ .module.css, ui-p2.test.tsx)
src/features/media/
  api/repo.ts            listMedia(query), uploadMedia(file, folderId?)
  model/adapters.ts      toMediaThumb(dto) → MediaThumb
  hooks/use-media-list.ts, use-upload-media.ts
  components/MediaPicker.tsx (+ .module.css, media-picker.test.tsx)
  index.ts
src/features/site/
  api/repo.ts            mọi route /site*
  model/types.ts         SiteView, SettingsForm, ServiceForm, TeamForm, TimelineForm, ItemKind
  model/adapters.ts      DTO → view model, form ↔ body, đường dẫn lỗi → vị trí
  model/service-icons.ts 16 icon Lucide theo đúng SERVICE_ICONS
  model/keys.ts          siteKeys
  hooks/                 use-site, use-save-settings, use-publish-site, use-revert-site,
                         use-item-mutations, use-publications, use-restore-publication,
                         use-unsaved-guard
  components/            SiteHeader, SettingsGeneral, SettingsHome, HeroPreview, ServicesList,
                         TeamGrid, TimelineList, PublishErrorsDialog, ItemShell,
                         ServiceForm, TeamForm, TimelineForm, previews/*
  pages/                 SitePage, SiteItemPage, SiteHistoryPage
  index.ts
src/test/fixtures/site.ts, media.ts
```

---

### Task 1: Bổ sung UI kit

**Files:** `src/shared/ui/{Tabs,Switch,Select,TextArea,Card,ConfirmDialog,CharCount}.tsx` + `.module.css`, `src/shared/ui/index.ts`, `src/shared/ui/ui-p2.test.tsx`

**Interfaces — Produces:**
- `Tabs { items: { value: string; label: string }[]; value: string; onChange(v: string): void; label: string }`: `role="tablist"`, mỗi tab `role="tab"` `aria-selected`; mũi tên trái/phải chuyển tab. Tab đang chọn có gạch chân màu `--brand` 2px.
- `Switch { checked: boolean; onChange(v: boolean): void; label: string; hideLabel?: boolean; disabled?: boolean }`: `<button role="switch" aria-checked>`.
- `Select { label: string; options: { value: string; label: string }[]; value: string; onChange(v: string): void; disabled?: boolean; hint?: string }`: `<select>` gốc, cùng khung với TextField.
- `TextArea`: như `TextField` (label, hint, error, ref cho react-hook-form) với `rows`.
- `Card { as?: 'div' | 'button'; interactive?: boolean; padding?: 0 | 16 | 28 }`: viền hairline, radius 8, không bóng; interactive thì hover viền ink, nâng 2px, `--shadow-2`.
- `ConfirmDialog { open; title; body; confirmLabel; tone?: 'danger' | 'default'; busy?: boolean; onConfirm(); onCancel() }`, dựng trên `Dialog`.
- `CharCount({ value, max, suffix? })` → chuỗi `"12 / 60 ký tự"` (kèm `· suffix` nếu có), chuyển màu `--warning` khi vượt `max`.

- [ ] **Step 1:** Test: Tabs đổi bằng phím mũi tên và gọi `onChange`; Switch có `role="switch"` và `aria-checked` đổi khi bấm; Select gọi `onChange` với value; TextArea có `aria-invalid` khi có `error`; ConfirmDialog gọi `onConfirm`/`onCancel`, nút xác nhận bị vô hiệu khi `busy`; CharCount `('abc', 60)` hiện `3 / 60 ký tự`, vượt max thì có class cảnh báo.
- [ ] **Step 2:** RED, rồi viết code theo prototype và readme design system. GREEN.
- [ ] **Step 3:** Commit `feat: tabs, switch, select, textarea, card and confirm dialog`.

### Task 2: Model của site (TDD)

**Files:** `src/features/site/model/{types,adapters,keys,service-icons}.ts` + `adapters.test.ts`, `src/test/fixtures/site.ts`

**Interfaces — Produces:**
- `siteKeys = { detail: ['site'] as const, publications: (page: number) => ['site','publications',page] as const }`.
- `SiteDto = Res<'/admin/v1/site','get',200>`; `ItemKind = 'services' | 'team' | 'timeline'`.
- `toSiteView(dto, now?): SiteView` với `SiteView = { draft; published; dirty; draftHash; settingsVersion; publicationNumber; savedLabel: string | null; canRevert: boolean; warnings: Map<string, string> }`. `savedLabel` = `'Đã lưu · ' + formatDateTime(publishedAt)` khi `!dirty && publishedAt`, ngược lại `null`. `canRevert = published !== null`.
- `settingsToForm(settings): SettingsForm` (luôn đủ 4 ô `stats`, thiếu thì thêm `{ v: '', l: '' }`); `settingsPatch(form, initial, version): Body<'/admin/v1/site/settings','patch'>` chỉ gồm field đã đổi (so sánh sâu với `initial`), luôn có `version`; trả `null` khi không có gì đổi.
- `serviceToForm`, `teamToForm`, `timelineToForm`, và `newItemForm(kind, currentYear)` theo `ITEM_DEF` của prototype (`services: { icon: 'laptop', visible: true }`, `team: { since: currentYear, visible: true }`, `timeline: { year: String(currentYear), media: 'none', photos: [], quote: { text:'', by:'', role:'' } }`).
- `itemCreateBody(kind, form, position?)` và `itemPatchBody(kind, form, initial, version)` (chỉ field đổi; `position` chỉ gửi khi đổi).
- `locateError(path, draft): { tab: SiteTab; itemId?: string; kind?: ItemKind; field: string } | null`. Ví dụ `settings.seoTitle` → tab `general`; `settings.h1a` → `home`; `services.2.title` → `{ tab: 'services', kind: 'services', itemId: draft.services[2].id, field: 'title' }`; `timeline.0.quote.text` → field `quote.text`.
- `SETTINGS_TAB: Record<keyof Settings, 'general' | 'home'>`: `name, phone, email, hours, address, seoTitle, seoDesc` → `general`; còn lại → `home`.
- `SERVICE_ICONS`: 16 tên theo đúng thứ tự trong enum của OpenAPI, kèm component `lucide-react` (`laptop→Laptop, apple→Apple, monitor→Monitor, hard-drive→HardDrive, cpu→Cpu, building-2→Building2, smartphone→Smartphone, tablet→Tablet, printer→Printer, keyboard→Keyboard, battery-charging→BatteryCharging, server→Server, wifi→Wifi, mouse→Mouse, shield-check→ShieldCheck, wrench→Wrench`). Test so sánh danh sách tên với enum sinh từ OpenAPI.
- Fixture `siteFixture satisfies SiteDto`: 2 dịch vụ (1 ẩn), 2 thành viên (1 có ảnh), 2 mốc (`photos` và `quote`), `published` khác `draft`, `dirty: true`, 1 cảnh báo `services.0.desc`.

- [ ] **Step 1:** Test cho từng hàm trên với giá trị cụ thể (ví dụ `settingsPatch` khi chỉ đổi `phone` trả `{ version: 7, phone: '1900 1234' }`; `stats` đổi một ô thì gửi cả mảng 4 ô).
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: site view model and adapters`.

### Task 3: Repository và hook của site

**Files:** `src/features/site/api/repo.ts`, `hooks/*.ts`, `hooks/hooks.test.tsx`

**Interfaces — Produces:**
- `siteRepo`: `get()`, `patchSettings(body)`, `createItem(kind, body)` → `{ id, site }`, `patchItem(kind, id, body)` → site, `deleteItem(kind, id, version)` → site (version ở query `?version=`), `publish(draftHash)` → `{ publication, site }`, `revert(draftHash)` → site, `publications(page, perPage = 20)`, `restore(id, draftHash)` → site.
- `useSite()`: query `siteKeys.detail`, `select: toSiteView`.
- `useSaveSettings()`, `useCreateItem(kind)`, `useUpdateItem(kind)`, `useDeleteItem(kind)`, `useRevertSite()`, `useRestorePublication()`: mọi `onSuccess` gọi `setQueryData(siteKeys.detail, site)`; `meta: { invalidates: [siteKeys.detail] }`; các mutation dùng trong form thêm `handlesErrors: true`.
- `usePublishSite()`: `mutationFn({ settingsPatch, draftHash })`: nếu `settingsPatch !== null` thì `patchSettings` trước và lấy `draftHash` từ phản hồi; sau đó `publish`. Thành công: `setQueryData` và invalidate `['site','publications']`. `meta.handlesErrors: true` (trang tự xử lý `SITE_INVALID`, `NOTHING_TO_PUBLISH`).
- `usePublications(page)`.

- [ ] **Step 1:** Test với MSW (fixture Task 2):
  - `useSaveSettings` gửi đúng body và cache nhận site mới;
  - `useDeleteItem` gửi `?version=3`;
  - `usePublishSite` khi có `settingsPatch`: gọi `PATCH /site/settings` rồi `POST /site/publish` với **draftHash mới** từ phản hồi PATCH (không phải hash cũ);
  - `usePublishSite` khi PATCH thành công nhưng publish trả 422 `SITE_INVALID`: cache đã nhận site sau PATCH, lỗi trả về cho trang;
  - 409 `VERSION_CONFLICT` ở `useUpdateItem` phát sự kiện `conflict` với `[['site']]` (qua QueryClient thật của app).
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: site repository and hooks`.

### Task 4: Ô chọn ảnh tối giản

**Files:** `src/features/media/**` như File Structure, `src/test/fixtures/media.ts`

**Interfaces — Produces:**
- `MediaThumb = { id: string; url: string; thumbUrl: string; width: number; height: number; alt: string; name: string }`.
- `MediaPicker { open: boolean; onClose(): void; onPick(m: MediaThumb): void; title?: string }`:
  - lưới ảnh từ `GET /media?perPage=40&page=n` (mới nhất trước), ô tìm "Tìm trong thư viện" (`q`, debounce 300 ms), phân trang "Xem thêm";
  - nút "Tải ảnh lên" (chỉ khi có `media.upload`): `POST /media` multipart field `file`; xong thì ảnh mới nằm đầu lưới và được chọn ngay;
  - lỗi upload theo code: `MEDIA_TOO_LARGE` "Ảnh vượt quá 10 MB.", `MEDIA_UNSUPPORTED_TYPE` "Chỉ nhận ảnh JPEG, PNG, WebP hoặc AVIF.", `MEDIA_INVALID_IMAGE` "Ảnh bị hỏng hoặc quá lớn để xử lý.";
  - không có `media.read`: hiện "Bạn không có quyền xem thư viện ảnh." và không gọi API.
- `features/media/index.ts` export `MediaPicker`, `MediaThumb`.

- [ ] **Step 1:** Test: hiện lưới từ fixture, gõ tìm gửi `q`, chọn ảnh gọi `onPick` với `MediaThumb`, upload gửi multipart có field `file` và chọn ảnh vừa tải, mỗi mã lỗi hiện đúng câu, thiếu quyền không gọi API.
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: minimal media picker`.

### Task 5: Trang Thông tin website — khung, header, tab settings

**Files:** `src/features/site/pages/SitePage.tsx`, `components/{SiteHeader,SettingsGeneral,SettingsHome,HeroPreview,PublishErrorsDialog}.tsx`, `hooks/use-unsaved-guard.ts`, test `site-page.test.tsx`; sửa `src/app/router.tsx` (route `/site` → `SitePage`).

**Copy (từ prototype):**
- Eyebrow `Quản trị · Website`; tiêu đề `Thông tin website`; mô tả "Nội dung hiển thị trên Trang chủ, Đội ngũ và Hành trình. Thay đổi chỉ xuất hiện trên website sau khi bạn lưu."
- Header phải: badge `Chưa lưu` (tone warning, có chấm) hoặc `Đã lưu · HH:MM · dd.mm.yyyy` (mono); nút `Lịch sử` (ghost, icon `history`, link `/site/history`); `Hoàn tác` (outline, icon `rotate-ccw`); `Lưu nháp` (outline, chỉ hiện ở tab general/home); `Lưu & xuất bản` (primary, icon `upload`).
- Tabs: `Thông tin chung`, `Trang chủ`, `Dịch vụ`, `Đội ngũ`, `Hành trình`.
- Tab Thông tin chung: mục `Liên hệ` (nhãn mono `Header · Footer · Đặt lịch`): `Tên thương hiệu`, `Hotline`, `Email`, `Giờ làm việc`, `Địa chỉ`; mục `SEO mặc định` (`Dùng khi trang chưa có mô tả riêng`): `Tiêu đề trang` (CharCount 60), `Mô tả` (TextArea 3 dòng, CharCount 160).
- Tab Trang chủ: `Phần mở đầu` (`Hero · đầu trang chủ`): Switch `Hiện dòng trạng thái nhận máy` + ô eyebrow (vô hiệu khi tắt); `Tiêu đề · dòng 1`, `Tiêu đề · dòng 2`, `Từ tô vàng`; `Đoạn giới thiệu` (TextArea); `Nút chính` (hint "Dẫn tới trang Đặt lịch"), `Nút phụ` (hint "Cuộn tới mục Dịch vụ"); `Dải số liệu` (`4 ô · dưới phần mở đầu`): 4 hàng `01`–`04`, mỗi hàng ô giá trị và ô nhãn.
- Xem trước (chỉ tab general/home, cột phải): Card `Xem trước · Trang chủ` + domain lấy từ `VITE_LANDING_URL` (bỏ giao thức; trống thì ẩn); hero theo form đang gõ (`h1a`, xuống dòng, `h1b` + từ tô vàng nền `--brand` + dấu chấm, `lead`, 2 nút, 4 ô số liệu); chú thích "Bản xem trước thu nhỏ, cập nhật khi bạn gõ. Bố cục thật co giãn theo màn hình."

**Hành vi:**
- `Chưa lưu` khi `form.isDirty || site.dirty` (D1).
- `Lưu nháp`: `useSaveSettings` với `settingsPatch`; không có gì đổi thì nút vô hiệu. Thành công: reset form về giá trị mới (version mới), toast "Đã lưu nháp".
- `Lưu & xuất bản`: `usePublishSite({ settingsPatch, draftHash })`. Thành công: toast "Đã xuất bản thay đổi" / "Website đã cập nhật nội dung mới." và reset form. `NOTHING_TO_PUBLISH`: toast info "Không có thay đổi để xuất bản". `SITE_INVALID`: `PublishErrorsDialog` (P2-7) liệt kê `errors[].message` kèm vị trí từ `locateError` (ví dụ "Dịch vụ · Sửa laptop: Không được để trống."), mỗi dòng là link tới tab hoặc trang mục. `VALIDATION_FAILED` của PATCH: gắn vào field qua `applyProblemToForm` (knownFields = tên field settings, kể cả `stats.0.v`).
- `Hoàn tác`: vô hiệu khi `!canRevert` hoặc nháp không bẩn; xác nhận (P2-5); thành công reset form, toast "Đã hoàn tác về bản đã xuất bản".
- `warnings` của server hiện dưới field tương ứng ở dạng gợi ý màu `--warning` (ví dụ `settings.seoTitle` → dưới ô Tiêu đề trang).
- `useUnsavedGuard(isDirty)`: `useBlocker` + `ConfirmDialog` "Bỏ thay đổi chưa lưu?" / "Những gì bạn vừa gõ sẽ không được lưu." / `Ở lại` / `Bỏ thay đổi` (P2-4). Đổi tab trong trang không bị chặn (P2-3).
- Không có `site.update`: mọi input `readOnly`, nút ghi vô hiệu. Không có `site.publish`: nút `Lưu & xuất bản` vô hiệu với tooltip.

- [ ] **Step 1:** Test (MSW + `renderWithProviders` với `routes`): hiện dữ liệu fixture; gõ `Hotline` thì badge `Chưa lưu` và preview không đổi (Hotline không ở hero) còn gõ `Tiêu đề · dòng 1` thì preview đổi; `Lưu nháp` gửi PATCH chỉ có field đổi + version; `Lưu & xuất bản` khi form sạch chỉ gọi publish; `SITE_INVALID` mở dialog với link đúng; `NOTHING_TO_PUBLISH` hiện toast; Hoàn tác hỏi xác nhận rồi gọi revert với draftHash; cảnh báo server hiện dưới field; tab nằm trong URL; rời trang khi form bẩn bị hỏi; user chỉ có `site.read` thấy input chỉ đọc.
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: site page with settings tabs, preview and publishing`.

### Task 6: Tab Dịch vụ, Đội ngũ, Hành trình

**Files:** `components/{ServicesList,TeamGrid,TimelineList}.tsx` (+ css), test `site-lists.test.tsx`; cài `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.

**Copy:** tiêu đề mục `Dịch vụ` / `Đội ngũ` / `Hành trình`; tóm tắt mono `{n} dịch vụ · {k} đang hiển thị`, `{n} thành viên`, `{n} mốc · {năm đầu} – {năm cuối}`; nút `Thêm dịch vụ` (icon `plus`), `Thêm thành viên` (icon `user-plus`), `Thêm mốc` (icon `plus`); badge `Đang ẩn`; nhãn media của mốc: `{n} ảnh` / `Trích dẫn` / `Chỉ chữ`; ô ảnh trống `Ảnh chân dung` (nền hatch); `Từ {since}`.

**Hành vi:**
- Dịch vụ: hàng có tay nắm kéo (`grip-vertical`), icon, tiêu đề + thời gian (mono) + mô tả, Switch ẩn/hiện (`useUpdateItem` với `{ version, visible }`, P2-6), nút Sửa → `/site/services/:id`. Hàng ẩn mờ `opacity: .45`.
- Kéo thả (dịch vụ và đội ngũ, D10): `@dnd-kit/sortable`, hỗ trợ bàn phím (Space để nhấc, mũi tên, Space để thả). Thả xong gửi `PATCH {version, position: newIndex}` cho đúng một mục; trong lúc chờ hiển thị thứ tự mới (optimistic), lỗi thì trả lại thứ tự cũ.
- Đội ngũ: lưới thẻ (Card interactive) có ảnh 4:5 (`photo.thumbUrl` hoặc ô trống), tên, vai trò, `Từ {since}`, badge `Đang ẩn`; bấm thẻ → `/site/team/:id`.
- Hành trình: hàng năm (mono 32px), tiêu đề, nội dung, badge nhãn media, nút Sửa → `/site/timeline/:id`. Không kéo thả.
- Thiếu `site.update`: ẩn nút thêm, tay nắm và Switch vô hiệu.

- [ ] **Step 1:** Test: tóm tắt đúng số; bật/tắt Switch gửi `{ version, visible }`; kéo bằng bàn phím một dịch vụ xuống 1 bậc gửi `{ version, position: 1 }` và hiển thị thứ tự mới; lỗi PATCH thì thứ tự quay lại; thẻ đội ngũ có ảnh dùng `thumbUrl`; nhãn media của mốc đúng.
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: services, team and timeline tabs with reordering`.

### Task 7: Trang Thêm/Sửa mục

**Files:** `pages/SiteItemPage.tsx`, `components/{ItemShell,ServiceForm,TeamForm,TimelineForm}.tsx`, `components/previews/{ServicePreview,TeamPreview,TimelinePreview}.tsx`, test `site-item-page.test.tsx`; route `/site/:kind/new`, `/site/:kind/:id` (kind ∉ {services, team, timeline} → 404).

**Copy (theo `ITEM_META` và `renderVals`):**
- Thanh trên dính: nút ghost `← {Dịch vụ|Đội ngũ|Hành trình}`, nhãn mono `Thêm {dịch vụ|thành viên|mốc}` hoặc `Sửa {…} · {số thứ tự 2 chữ số}`; phải: `Xoá` (ghost, icon `trash-2`, chỉ khi sửa), `Huỷ` (outline), nút chính `Thêm {…}` hoặc `Lưu thay đổi` (icon `check`).
- Tiêu đề trang: `Thêm {…}` hoặc tên mục (fallback `Sửa {…}`); mô tả: dịch vụ "Thẻ dịch vụ hiển thị ở mục Dịch vụ trên trang chủ và trang Đặt lịch.", đội ngũ "Hồ sơ hiển thị trên trang Đội ngũ.", mốc "Mốc hiển thị trên trang Hành trình, tự sắp xếp theo năm."
- Dịch vụ: `Biểu tượng` (`Lucide · nét 2px`, lưới 16 ô chọn, ô chọn viền ink), `Nội dung`: `Tên dịch vụ` (placeholder "vd. Sửa laptop"), `Mô tả` (TextArea, hint `{n} / 90 ký tự · một câu, nói rõ sửa được gì`), `Thời gian xử lý` (placeholder "vd. Từ 1 giờ", hint "Hiện ở cuối thẻ dịch vụ.").
- Đội ngũ: `Ảnh chân dung` (khung 4:5, mô tả "Ảnh dọc tỉ lệ 4:5, tối thiểu 800 × 1000 px. Nền trơn, ánh sáng tự nhiên, chụp tại xưởng nếu có thể.", nút `Chọn ảnh` mở `MediaPicker`, nút `Bỏ ảnh` khi đã có); `Thông tin`: `Họ và tên`, `Vai trò` (placeholder "vd. Kỹ thuật viên MacBook"), `Năm gia nhập` (số, hint `Từ {since} · {n} năm tại LAPBEE` hoặc `Từ {since} · thành viên mới`), `Giới thiệu ngắn` (placeholder "Một đến hai câu về kinh nghiệm và chuyên môn.", hint `{n} / 160 ký tự · không bắt buộc`).
- Mốc: `Mốc thời gian`: `Năm`, `Tiêu đề` (placeholder "vd. Mở xưởng mainboard"), `Nội dung` (hint `{n} / 160 ký tự`); `Ảnh hoặc trích dẫn`: 3 ô chọn `Ảnh` ("Tối đa 5 ảnh, ảnh đầu hiển thị lớn."), `Trích dẫn` ("Một câu nói của người trong cuộc."), `Không có` ("Chỉ tiêu đề và nội dung."). Ảnh: danh sách `01`… mỗi hàng thumbnail (chọn bằng MediaPicker), ô `Chú thích ảnh`, nút `Bỏ ảnh`; nút `Thêm ảnh` (vô hiệu khi đủ 5) + `{n} / 5 ảnh`. Trích dẫn: `Trích dẫn` (TextArea), `Người nói`, `Vai trò`.
- `Hiển thị`: dịch vụ và đội ngũ có Select `Vị trí` (`Vị trí {i} / {N}`; thêm mới thì N = số mục + 1, mặc định cuối) và Switch `Hiện trên trang chủ` / `Hiện trên trang Đội ngũ`; mốc chỉ có dòng "Các mốc tự sắp xếp theo năm, từ cũ đến mới."
- Cột phải: nhãn `Xem trước · mục Dịch vụ, trang chủ` / `Xem trước · trang Đội ngũ` / `Xem trước · trang Hành trình`, badge `Đang ẩn` khi tắt hiển thị; xem trước theo prototype (fallback `Tiêu đề`, `Mô tả ngắn về dịch vụ.`, `Họ và tên`); chú thích "Thay đổi lưu vào bản nháp. Bấm “Lưu & xuất bản” ở trang Thông tin website để cập nhật website."

**Hành vi:**
- Validate (zod) trước khi gửi: trường bắt buộc (`title` dịch vụ, `name` thành viên, `title` và `year` của mốc) → "Không được để trống."; `year` 4 chữ số → "Năm gồm 4 chữ số."; `since` là năm hợp lệ (1900 đến năm hiện tại) → "Năm không hợp lệ."; `media = quote` thì `quote.text` bắt buộc.
- Thêm: `useCreateItem` với `position` đã chọn; thành công → về `/site?tab=…` + toast `Đã thêm {…}` / "Bấm “Lưu & xuất bản” để đưa thay đổi lên website." (copy prototype).
- Sửa: `version` chụp lúc mở form; `useUpdateItem` chỉ gửi field đổi; thành công → về tab + toast `Đã cập nhật {…}`.
- Xoá: `ConfirmDialog` "Xoá {tên}?" / "Mục bị xoá khỏi bản nháp. Bấm “Hoàn tác” ở trang Thông tin website nếu xoá nhầm." / `Xoá` (danger); gửi `?version=`; thành công → về tab + toast `Đã xoá {…}`.
- Lỗi: `VALIDATION_FAILED` gắn vào field; `SITE_ITEM_LIMIT` toast "Đã đủ số mục tối đa."; `NOT_FOUND` khi mở → trang "Không tìm thấy mục này" + nút về tab; `VERSION_CONFLICT` → hộp thoại xung đột (toàn cục).
- `useUnsavedGuard` khi form bẩn (trừ khi vừa lưu xong). Thiếu `site.update`: form chỉ đọc, ẩn nút lưu và xoá.

- [ ] **Step 1:** Test: thêm dịch vụ chọn icon `cpu` và vị trí 1 → POST đúng body; sửa chỉ đổi `desc` → PATCH `{ version: <lúc mở>, desc }` ngay cả khi cache đã được làm mới với version khác giữa chừng (Global Constraint); xoá hỏi xác nhận rồi gửi `?version=`; thành viên chọn ảnh qua MediaPicker → `photoMediaId`; mốc chuyển sang `Trích dẫn` mà để trống → lỗi "Không được để trống." ở ô Trích dẫn; thêm ảnh thứ 6 bị vô hiệu; `/site/foo/new` → 404; id không có → "Không tìm thấy mục này".
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: site item pages with previews`.

### Task 8: Lịch sử xuất bản

**Files:** `pages/SiteHistoryPage.tsx` (+ css), test `site-history.test.tsx`; route `/site/history` (`site.read`).

Theo phác thảo §8.6: eyebrow `Thông tin website · Lịch sử`, tiêu đề `Lịch sử xuất bản`; bảng `Bản` (`#{number}`, mono), `Xuất bản lúc` (mono), `Người xuất bản`; bản mới nhất có badge `Hiện hành`, các bản khác có nút `Khôi phục về nháp` (cần `site.update`); phân trang 20/trang; trống: "Chưa xuất bản lần nào."
- Tên người xuất bản: nếu có `user.read` thì tra từ `GET /users?perPage=100` (một lần, cache), không thì "—". Không tìm thấy id thì "—".
- Khôi phục: `ConfirmDialog` "Khôi phục bản #{n} về nháp?" / "Bản nháp hiện tại sẽ bị thay bằng nội dung của bản này. Website chưa thay đổi cho tới khi bạn xuất bản." / `Khôi phục`; gửi `draftHash` hiện tại; thành công → `/site?tab=general` + toast "Đã khôi phục về nháp".

- [ ] **Step 1:** Test: bảng từ fixture, badge `Hiện hành` ở bản có `number` bằng `publicationNumber`, khôi phục gửi đúng `draftHash` và điều hướng, không có `user.read` thì cột tên hiện "—" và không gọi `/users`, phân trang gửi `page=2`.
- [ ] **Step 2:** RED → code → GREEN. Commit `feat: site publication history and restore`.

### Task 9: Kiểm chứng với backend thật, tài liệu

- [ ] **Step 1:** Cập nhật `docs/superpowers/specs/2026-11-23-lapbee-dashboard-design.md` §5.1 với các quyết định P2-1 đến P2-7; cập nhật `README.md` nếu có script mới. Nếu phát hiện thiếu sót API mới thì thêm vào `docs/backend-proposals.md`.
- [ ] **Step 2:** Gates: `npm run typecheck && npm run lint && npm test -- --run && npm run check:api && npm run build && npx prettier --check .`.
- [ ] **Step 3:** Chạy với backend local (seed đã có nội dung site mẫu dạng nháp) bằng `npm run build && npm run preview`, tài khoản thử trong `dev-credentials.local`: sửa settings, Lưu nháp, Lưu & xuất bản (lần đầu), Hoàn tác, thêm/sửa/xoá từng loại mục, kéo thả, chọn và tải ảnh, lịch sử và khôi phục, theme sáng/tối, console không có lỗi CSP. Thử xung đột: mở cùng một mục ở hai tab, lưu tab 1 rồi lưu tab 2 → hộp thoại xung đột. (`SITE_INVALID` khó tạo qua UI vì client đã chặn trường bắt buộc; dialog lỗi được kiểm bằng test ở Task 5.)
- [ ] **Step 3b:** Ảnh local driver được phục vụ ở `http://localhost:3000/media-files/...`: kiểm tra `img-src` của CSP có chặn không. Nếu chặn, ghi quyết định (proxy `/media-files` đã có, URL tuyệt đối từ backend thì cần thêm origin dev vào `img-src` chỉ trong `preview.headers`) và sửa.
- [ ] **Step 4:** Commit `docs: site module decisions`. Push và mở PR vào `develop` (không vào `main`).

## Review Focus

1. **Version cũ bị gửi đi**: cache site được làm mới nền giữa lúc sửa mục; PATCH vẫn phải mang version lúc mở form để backend trả 409 nếu có người khác sửa. Test ở Task 7.
2. **Lưu & xuất bản khi form settings bẩn**: phải PATCH trước rồi publish bằng `draftHash` **mới**; dùng hash cũ sẽ luôn nhận 409. Test ở Task 3.
3. **Kéo thả thất bại**: thứ tự hiển thị phải quay về thứ tự của server, không để lệch. Test ở Task 6.
4. **Rời trang khi đang gõ**: hỏi trước khi bỏ thay đổi; nhưng vừa lưu xong thì không hỏi. Test ở Task 5 và 7.
5. **Người chỉ có `site.read`**: không gửi được request ghi nào từ UI (input chỉ đọc, nút vô hiệu). Test ở Task 5.
