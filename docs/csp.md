# Content Security Policy

Chuỗi CSP giai đoạn 1 (trùng với `preview.headers` trong `vite.config.ts`):

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https://res.cloudinary.com http://localhost:3000; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'
```

`http://localhost:3000` trong `img-src` chỉ dành cho `npm run preview` (xem mục "Origin ảnh local khi chạy thử" bên dưới); CSP production không được có origin này.

Header này chỉ có ở `npm run preview`. Ở production, Caddy đặt header theo spec deploy của backend (`lapbee-backend/docs/superpowers/specs/2026-11-23-lapbee-backend-p5-deploy-design.md`) và §4.8 của spec dashboard (`docs/superpowers/specs/2026-11-23-lapbee-dashboard-design.md`).

Bản build không nhúng font dạng `data:` (`build.assetsInlineLimit` trong `vite.config.ts`), vì `font-src 'self'` chặn chúng.

## Ý nghĩa từng directive

| Directive                                               | Lý do                                                                         |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `default-src 'self'`                                    | Mặc định chặn mọi nguồn ngoài                                                 |
| `script-src 'self'`                                     | Chỉ chạy script của bundle, không inline, không `eval`                        |
| `style-src 'self'`                                      | Chỉ CSS từ file; không dùng style inline                                      |
| `img-src 'self' data: blob: https://res.cloudinary.com` | Ảnh từ Cloudinary, ảnh local `/media-files`, `data:` và `blob:` cho xem trước |
| `font-src 'self'`                                       | Font được đóng gói qua `@fontsource`                                          |
| `connect-src 'self'`                                    | API gọi cùng origin (`/admin/v1`)                                             |
| `object-src 'none'`                                     | Không cho plugin, `<object>`, `<embed>`                                       |
| `base-uri 'none'`                                       | Chặn đổi `<base>`                                                             |
| `form-action 'self'`                                    | Form chỉ gửi về cùng origin                                                   |
| `frame-ancestors 'none'`                                | Không cho trang khác nhúng dashboard (chống clickjacking)                     |

## Origin ảnh local khi chạy thử

Khi backend dùng driver media `local`, URL ảnh là URL tuyệt đối dựng từ `MEDIA_PUBLIC_BASE_URL` (mặc định `http://localhost:3000`), ví dụ `http://localhost:3000/media-files/lapbee/2026/11/<id>.png`. Origin này khác origin của dashboard (`http://localhost:5173`), nên `img-src 'self'` chặn ảnh dù proxy `/media-files` đã có. Vì vậy `vite.config.ts` thêm `http://localhost:3000` (hằng `LOCAL_MEDIA_ORIGIN`) vào `img-src`, và chỉ trong `preview.headers`.

- Production dùng Cloudinary (`https://res.cloudinary.com` đã được cho phép); CSP do Caddy đặt không có `localhost`.
- Cách khác, không cần nới CSP: đặt `MEDIA_PUBLIC_BASE_URL` của backend bằng origin của dashboard (`http://localhost:5173`). Khi đó URL ảnh là `http://localhost:5173/media-files/...`, đi qua proxy `/media-files` sẵn có và khớp `'self'`.

## Bổ sung ở giai đoạn 4

- Khối embed của bài viết cần `frame-src https://www.youtube.com https://player.vimeo.com https://codepen.io https://codesandbox.io`.
- Editor.js chèn thẻ `<style>` lúc chạy, trái với `style-src 'self'`. Quyết định: thêm hash `'sha256-…'` của từng thẻ style vào `style-src`, không dùng nonce hay `'unsafe-inline'`. Lý do, hệ quả và việc phải làm khi nâng phiên bản: `docs/adr/0005-editorjs-style-csp.md`. Giá trị hash và test so khớp làm ở giai đoạn 4b.
