# Content Security Policy

Chuỗi CSP giai đoạn 1 (trùng với `preview.headers` trong `vite.config.ts`):

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https://res.cloudinary.com; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'
```

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

## Bổ sung ở giai đoạn 4

- Khối embed của bài viết cần `frame-src https://www.youtube.com https://player.vimeo.com https://codepen.io https://codesandbox.io`.
- Editor.js chèn thẻ `<style>` lúc chạy, trái với `style-src 'self'`. Spec §4.8 chọn nonce: `style-src 'self' 'nonce-<runtime>'`. Cách cấp nonce cho một SPA tĩnh (nonce phải đổi theo từng response) sẽ quyết định ở giai đoạn 4.
