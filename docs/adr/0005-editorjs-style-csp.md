# 0005. CSP cho thẻ style do Editor.js chèn: dùng hash

- Ngày: 26.11.2026 · Trạng thái: chấp nhận (giá trị hash và test làm ở giai đoạn 4b)

## Bối cảnh
Editor.js và các tool của nó chèn thẻ `<style>` vào `<head>` lúc chạy. Dashboard là SPA tĩnh do Caddy phục vụ, và `style-src 'self'` (xem `docs/csp.md`) chặn mọi thẻ `<style>` nội dòng, nên editor sẽ mất giao diện nếu không nới CSP.

## Các phương án
1. Nonce: Caddy dùng templates để chèn `'nonce-<runtime>'` vào header và vào `index.html` mỗi response. Nhưng Editor.js không đọc nonce từ trang để gắn vào thẻ nó chèn, nên phải vá thư viện hoặc tool, và `index.html` không còn là file tĩnh.
2. `'unsafe-inline'` cho `style-src`: đơn giản nhất nhưng bỏ hẳn lớp bảo vệ khỏi CSS inline cho cả ứng dụng.
3. Hash: thêm `'sha256-…'` của từng thẻ style đã biết vào `style-src`. Giữ SPA tĩnh, không cần nonce, trình duyệt chỉ cho phép đúng nội dung đã liệt kê.

## Quyết định (P4-2)
Dùng hash: `style-src 'self' 'sha256-…' …`, mỗi thẻ style của Editor.js và từng tool một giá trị. Không dùng nonce, không dùng `'unsafe-inline'`. Spec §4.8 đã cập nhật theo. Ở giai đoạn 4a chỉ ghi quyết định; giá trị hash và test làm ở 4b cùng editor.

## Hệ quả
- Mỗi lần nâng Editor.js hoặc một tool, nội dung style có thể đổi, phải tính lại hash và cập nhật cả `vite.config.ts` lẫn `docs/csp.md`.
- Giai đoạn 4b thêm test: lấy text của các thẻ `<style>` thực sự được chèn khi khởi tạo editor, tính sha256 và so với CSP trong `vite.config.ts` và `docs/csp.md`. Lệch thì test đỏ, nên nâng phiên bản mà quên hash sẽ bị bắt trước khi deploy.
- Khối embed cần thêm `frame-src https://www.youtube.com https://player.vimeo.com https://codepen.io https://codesandbox.io` (làm ở 4b).
- Style gắn bằng thuộc tính `style=""` (nếu có) không được hash chấp nhận; nếu tool nào cần thì xử lý riêng ở 4b.
