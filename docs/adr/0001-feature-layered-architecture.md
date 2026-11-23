# 0001. Kiến trúc theo feature, chia tầng repository – adapter – hook

- Ngày: 23.11.2026 · Trạng thái: chấp nhận

## Bối cảnh
Dashboard bám một hợp đồng API đã đóng băng, có nhiều nghiệp vụ riêng (nháp/xuất bản, `draftHash`, step-up, `version`, Editor.js). Cần dễ mở rộng và dễ test.

## Các hướng
- **A. Feature + TanStack Query + repository tự viết** (chọn).
- B. Redux Toolkit + RTK Query codegen: thêm Redux trong khi gần như không có client state; adapter dễ bị bỏ qua.
- C. Orval sinh client + hook: hook trả thẳng DTO, query key theo quy ước công cụ, khó kiểm soát cache khi mọi route ghi site trả về toàn bộ site.

## Quyết định
`features/<tên>/{api/repo.ts, model/adapters.ts, hooks/, components/, pages/, index.ts}`; `shared/` không import `features/`; feature chỉ import feature khác qua `index.ts`. Component không import `repo.ts` hay type sinh ra.

## Hệ quả
- Viết tay khoảng 58 hàm repository (mỗi hàm vài dòng, có kiểu sinh sẵn).
- Adapter là hàm thuần, test TDD được; đổi DTO chỉ sửa một chỗ.
