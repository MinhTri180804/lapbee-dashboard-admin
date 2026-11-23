# 0002. Phiên cookie, CSRF trong bộ nhớ, cùng origin

- Ngày: 23.11.2026 · Trạng thái: chấp nhận

## Bối cảnh
Backend dùng phiên phía server, cookie HttpOnly `__Host-lb_sid` (`lb_sid` khi dev), `SameSite=Strict`, kiểm `Origin` và header `X-CSRF-Token` (spec backend §11.1). Spec deploy P5 đặt dashboard và `/admin/v1/*` cùng origin `https://admin.<domain>`.

## Quyết định
- axios `baseURL: '/admin/v1'`, `withCredentials: true`. Dev: Vite proxy `/admin/v1` và `/media-files` sang `http://localhost:3000`, FE chạy ở `http://localhost:5173`.
- FE không đọc cookie. `csrfToken` lấy từ login, `GET /auth/me`, `POST /auth/password`; chỉ giữ trong session store ở bộ nhớ. Tải lại trang thì gọi `/auth/me` để lấy lại.
- Request POST/PUT/PATCH/DELETE gắn `X-CSRF-Token`.
- `CSRF_FAILED`: lấy lại token qua `/auth/me` (single-flight) và thử lại đúng một lần.

## Hệ quả
- XSS không lấy được phiên, nhưng vẫn thao tác được trong phiên đang mở, nên cần CSP chặt (ADR sau, giai đoạn 4).
- Không dùng localStorage cho bất cứ dữ liệu phiên nào.
