// SINH TỰ ĐỘNG từ openapi.json 1.4.0. Không sửa tay. Chạy npm run gen:api.
export const PERMISSION_KEYS = [
  "audit.read",
  "category.manage",
  "category.read",
  "media.delete",
  "media.read",
  "media.update",
  "media.upload",
  "post.create",
  "post.delete",
  "post.publish",
  "post.read",
  "post.update",
  "role.manage",
  "role.read",
  "site.publish",
  "site.read",
  "site.update",
  "system.manage_tokens",
  "system.read",
  "user.manage",
  "user.read",
] as const;

export type Permission = (typeof PERMISSION_KEYS)[number];
