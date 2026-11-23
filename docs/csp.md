# Content Security Policy

Chuỗi CSP giai đoạn 1 (trùng với `preview.headers` trong `vite.config.ts`):

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https://res.cloudinary.com; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'
```

Header này chỉ có ở `npm run preview`. Môi trường production đặt header bằng Caddy (spec P5).

## Ý nghĩa từng directive

| Directive                                      | Lý do                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| `default-src 'self'`                           | Mặc định chặn mọi nguồn ngoài                                           |
| `script-src 'self'`                            | Chỉ chạy script của bundle, không inline, không `eval`                  |
| `style-src 'self'`                             | Chỉ CSS từ file; không dùng style inline                                |
| `img-src 'self' data: blob: https://res.cloudinary.com` | Ảnh từ Cloudinary, ảnh local `/media-files`, `data:` và `blob:` cho xem trước |
| `font-src 'self'`                              | Font được đóng gói qua `@fontsource`                                    |
| `connect-src 'self'`                           | API gọi cùng origin (`/admin/v1`)                                       |
| `object-src 'none'`                            | Không cho plugin, `<object>`, `<embed>`                                 |
| `base-uri 'none'`                              | Chặn đổi `<base>`                                                       |
| `form-action 'self'`                           | Form chỉ gửi về cùng origin                                             |
| `frame-ancestors 'none'`                       | Không cho trang khác nhúng dashboard (chống clickjacking)               |

## Bổ sung ở giai đoạn 4

- Khối embed của bài viết cần `frame-src https://www.youtube.com https://player.vimeo.com https://codepen.io https://codesandbox.io`.
- Editor.js chèn thẻ `<style>` lúc chạy, trái với `style-src 'self'`. Cần quyết định: dùng nonce cho `<style>` (Caddy sinh nonce mỗi response và Editor.js nhận qua cấu hình) hay chấp nhận `style-src-elem` riêng. Chưa chốt; xử lý khi làm giai đoạn 4.
