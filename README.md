# LAPBEE Dashboard

Dashboard quản trị cho website LAPBEE: đăng nhập, quản lý phiên, và (ở các giai đoạn sau) quản lý nội dung site, thư viện ảnh, bài viết, người dùng và vai trò. Đây là SPA React gọi API `/admin/v1` của backend NestJS. Giai đoạn 1 gồm nền tảng, đăng nhập, thiết lập mật khẩu, khung giao diện và trang tài khoản. Giai đoạn 2 thêm quản lý nội dung site (`/site`). Giai đoạn 3 thêm thư viện ảnh (`/media`).

## Yêu cầu

- Node 24 (xem `.nvmrc`), chạy `nvm use`.
- Repo backend ở `../lapbee-backend`.

## Chạy backend cục bộ

Làm theo mục "Chạy cục bộ" trong `../lapbee-backend/README.md` (cài đặt, docker compose, migration, seed, tạo super admin bằng CLI, `npm run start:dev`). Backend nghe ở `http://localhost:3000`. Origin của dashboard `http://localhost:5173` phải có trong `ADMIN_ORIGINS` của backend.

## Chạy dashboard

```bash
npm ci
npm run dev
```

Mở `http://localhost:5173`. Vite proxy `/admin/v1` và `/media-files` về `http://localhost:3000`.

Biến môi trường (xem `.env.example`):

- `VITE_LANDING_URL`: URL website landing cho liên kết "Xem website". Có thể để trống.

## Script

| Lệnh                | Việc                                                      |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Chạy Vite dev server ở cổng 5173                          |
| `npm run build`     | Kiểm tra kiểu rồi build vào `dist/`                       |
| `npm run preview`   | Phục vụ bản build ở cổng 5173, có header CSP              |
| `npm run typecheck` | Chạy `tsc` cho `tsconfig.json` và `tsconfig.node.json`    |
| `npm run lint`      | Chạy ESLint                                               |
| `npm run format`    | Chạy Prettier ghi đè                                      |
| `npm test`          | Chạy Vitest (thêm `-- --run` để chạy một lần)             |
| `npm run gen:api`   | Sinh kiểu DTO từ `../lapbee-backend/openapi.json`         |
| `npm run check:api` | Kiểm tra kiểu đã sinh còn khớp `openapi.json` của backend |

## Khi backend đổi openapi.json

1. Chạy `npm run gen:api` để sinh lại kiểu.
2. Sửa code bị lỗi kiểu, rồi commit kiểu đã sinh cùng thay đổi.
3. `npm run check:api` (cũng nên chạy trong CI) báo lỗi nếu kiểu đã commit lệch `openapi.json`.

Xem `docs/adr/0004-generated-dto-types.md`.

## Cấu trúc

- `src/app/`: router, providers, query client, khung giao diện (layout), các trang cấp app, hộp thoại đăng nhập lại và xung đột.
- `src/features/`: mỗi tính năng một thư mục (hiện có `auth`, `site` gồm thông tin chung, trang chủ, dịch vụ, đội ngũ, hành trình, lịch sử xuất bản, và `media`).
  - `media/pages`: `MediaLibraryPage` (`/media`, trạng thái trong URL). `media/components`: cây thư mục, lưới và thẻ ảnh, panel chi tiết, thanh chọn, hộp thoại chuyển, thao tác thư mục, danh sách tải lên, `MediaPicker`. `media/hooks`: danh sách, chi tiết, thư mục, mutation, hàng đợi tải lên. `media/model`: adapter DTO và dựng cây thư mục (số đếm cộng dồn, kiểm tra độ sâu).
- `src/shared/`: code dùng chung: `api` (axios, lỗi, CSRF), `auth`, `form` (xử lý lỗi `ProblemDetails` vào form, `use-rebasing-form.ts` giữ thay đổi chưa lưu khi version nền đổi), `lib`, `styles`, `theme`, `ui`.
- `src/test/`: tiện ích test, MSW handlers, fixtures.
- `scripts/`: `gen-api.mjs`, `check-api.mjs`.
- `docs/`: tài liệu thiết kế.

## Nhánh và quy trình merge

- `main`: nhánh deploy. Chỉ merge vào `main` khi đã xong một version và đã test trực tiếp.
- `develop`: nhánh tích hợp. Mỗi giai đoạn hoặc tính năng làm trên nhánh `feat/...` rồi mở PR vào `develop`.
- Không mở PR thẳng từ nhánh tính năng vào `main`.

## Tài liệu

- Thiết kế: `docs/superpowers/specs/2026-11-23-lapbee-dashboard-design.md`
- Quyết định kiến trúc: `docs/adr/`
- Đề xuất cho backend: `docs/backend-proposals.md`
- CSP: `docs/csp.md`
