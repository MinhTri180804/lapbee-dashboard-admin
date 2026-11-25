# Đề xuất gửi backend

Những chỗ dashboard cần mà `openapi.json` v1.4.0 chưa có. Dashboard **không** tự làm thay; hiện đang ẩn hoặc làm cách khác như ghi bên dưới.

| # | Đề xuất | Lý do | Dashboard đang làm |
|---|---|---|---|
| 1 | `GET /site/publications/:id` trả snapshot | Xem trước bản cũ trước khi khôi phục | Chỉ hiện số, thời điểm, người xuất bản |
| 2 | Trả tên người cùng với `publishedBy`, `createdBy`, `uploadedBy`, `actorId` (ví dụ `{ id, name }`) | Hiện tên mà không cần quyền `user.read` | Tra từ `GET /users`; thiếu quyền thì hiện "—" |
| 3 | Trường `lockedUntil` (hoặc `locked: boolean`) trong user | Biết người dùng đang bị khoá tạm thời | Nút "Mở khoá" luôn hiện với super admin |
| 4 | Nhãn tiếng Việt cho quyền trong `GET /permissions` | Một nguồn nhãn cho mọi client | FE giữ bảng nhãn riêng |
| 5 | `GET /media` trả `usageCount` mỗi ảnh | Thẻ ảnh hiện "Dùng N nơi" như thiết kế | Chỉ hiện ở panel chi tiết |
| 6 | API tổng dung lượng thư viện (ví dụ `GET /media/stats`) | Header "26 ảnh · 7,4 MB" | Ẩn phần dung lượng |
| 7 | `GET /auth/me` trả `idleExpiresAt`, `absoluteExpiresAt` | Cảnh báo hết phiên chính xác | Ước lượng ở client (25/30 phút) |
| 8 | `GET /auth/me` trả tên vai trò | Hiện vai trò ở sidebar | "Super admin" khi `["*"]`, còn lại hiện email |
| 9 | Kiểu cho `content` trong OpenAPI (discriminated union theo `type`) | FE sinh kiểu khối thay vì gõ tay | Gõ tay theo README và `block-handlers.ts` |
| 10 | Spec §8.5 và §17 cập nhật: 10 khối, `checklist`, route `/media/editorjs` | Spec lệch README và code | Theo README và OpenAPI |
| 11 | Schema của `GET /public/v1/posts/{slug}` dùng `$defs` (mục danh sách đệ quy) mà openapi-typescript không resolve được; nên đặt dưới `components.schemas` (ví dụ schema đệ quy có tên) | Sinh kiểu không cần xử lý đặc biệt | `scripts/gen-api.mjs` hoist `$defs` trong bộ nhớ trước khi sinh kiểu |
| 12 | `POST /media/delete` (xoá nhiều ảnh) | Dọn thư viện nhanh; hiện chỉ chuyển nhiều ảnh được (`POST /media/move`) | Chỉ xoá từng ảnh ở panel chi tiết |
| 13 | `GET /media` có tuỳ chọn trả tổng dung lượng và số ảnh theo từng thư mục con (không chỉ trực tiếp) | FE đang tự cộng `mediaCount` cho cây thư mục | FE cộng dồn từ danh sách phẳng |
