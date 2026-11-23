# 0004. Kiểu DTO sinh từ openapi.json

- Ngày: 23.11.2026 · Trạng thái: chấp nhận

## Quyết định
- `openapi-typescript` sinh `src/shared/api/generated/schema.d.ts` từ `../lapbee-backend/openapi.json` (đổi bằng `OPENAPI_PATH`). File sinh ra không sửa tay, bị loại khỏi ESLint và Prettier.
- `npm run gen:api` sinh lại; `npm run check:api` báo đỏ khi file đã commit lệch `openapi.json`.
- `src/shared/api/types.ts` đặt tên gọn bằng helper `Body`, `Res`, `Query`, `PathParams`.
- Ngoại lệ: kiểu `data` của 10 khối Editor.js gõ tay ở `features/posts/model/blocks.ts`, vì OpenAPI để `content` là `unknown`. Ghi nguồn: README backend và `block-handlers.ts`.
- Repo dùng `typescript ~6.0.3` (giống backend; typescript-eslint chưa hỗ trợ TS 7). `openapi-typescript` khai peer TS 5, xử lý bằng `overrides`.

## Hệ quả
Backend đổi hợp đồng thì `gen:api` rồi `typecheck` chỉ ra mọi chỗ phải sửa.
