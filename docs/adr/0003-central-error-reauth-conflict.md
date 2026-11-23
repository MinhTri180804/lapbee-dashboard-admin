# 0003. Xử lý lỗi, step-up và xung đột ở một chỗ

- Ngày: 23.11.2026 · Trạng thái: chấp nhận

## Quyết định
- Mọi lỗi HTTP đi qua một response interceptor, chuyển thành `ProblemError` (có `status`, `code`, `detail`, `fieldErrors`), `NetworkError` hoặc `UnexpectedError`. UI rẽ nhánh theo `code`, không theo `detail`.
- `401 UNAUTHENTICATED` → sự kiện `session:expired` → xoá cache, về `/login?next=…`. `401 INVALID_CREDENTIALS` để form xử lý.
- `403 REAUTH_REQUIRED` → sự kiện `reauth:required`; một promise dùng chung (single-flight) chờ `ReauthDialog` gọi `POST /auth/reauth`; xong thì gửi lại các request bị chặn; huỷ thì `ReauthCancelledError` (không toast).
- `409 VERSION_CONFLICT` → không thử lại; `MutationCache.onError` mở `ConflictDialog`, "Tải lại" invalidate `mutation.meta.invalidates`.
- Lỗi khác → toast theo bảng `code → câu tiếng Việt`, trừ mutation có `meta.handlesErrors` (form tự gắn lỗi bằng `applyProblemToForm`).
- Tầng axios không import React: giao tiếp với UI qua event bus nhỏ (`shared/api/events.ts`).

## Hệ quả
Màn hình không tự xử lý 401, step-up hay conflict. Thêm mã lỗi chỉ là thêm một dòng vào bảng.
