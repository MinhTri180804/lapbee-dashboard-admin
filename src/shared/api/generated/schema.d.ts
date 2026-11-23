// SINH TỰ ĐỘNG từ openapi.json 1.4.0. Không sửa tay. Chạy npm run gen:api.
export interface paths {
    "/admin/v1/api-tokens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Danh sách token
         * @description **Truy cập:** đã đăng nhập và có quyền `system.manage_tokens`.
         *
         *     Không bao giờ trả về giá trị token.
         */
        get: operations["apiTokens.list"];
        put?: never;
        /**
         * Tạo token
         * @description **Truy cập:** đã đăng nhập và có quyền `system.manage_tokens`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     **Xác thực lại:** phải gọi `POST /admin/v1/auth/reauth` trong vòng 5 phút trước đó, nếu không sẽ nhận `REAUTH_REQUIRED`.
         *
         *     Giá trị token chỉ trả về một lần trong response này. Tối đa 2 token còn hiệu lực cùng lúc (để xoay vòng: tạo token mới, cập nhật landing, rồi thu hồi token cũ).
         */
        post: operations["apiTokens.create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/api-tokens/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Thu hồi token
         * @description **Truy cập:** đã đăng nhập và có quyền `system.manage_tokens`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     **Xác thực lại:** phải gọi `POST /admin/v1/auth/reauth` trong vòng 5 phút trước đó, nếu không sẽ nhận `REAUTH_REQUIRED`.
         */
        delete: operations["apiTokens.remove"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/audit-logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tra cứu nhật ký hoạt động
         * @description **Truy cập:** đã đăng nhập và có quyền `audit.read`.
         *
         *     Mới nhất trước. `from`/`to` là thời điểm ISO 8601 có múi giờ. `perPage` mặc định 20, tối đa 100.
         */
        get: operations["audit.search"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Đăng nhập
         * @description **Truy cập:** công khai, không cần đăng nhập. `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Đặt cookie phiên HttpOnly. Sai email, sai mật khẩu, tài khoản bị khoá tạm thời hay bị vô hiệu hoá đều trả cùng `INVALID_CREDENTIALS`. Giới hạn 10 lần / 15 phút theo IP; sai mật khẩu 5 lần liên tiếp thì tài khoản bị khoá tạm thời (1 → 5 → 15 → 60 phút).
         */
        post: operations["auth.doLogin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Đăng xuất
         * @description **Truy cập:** đã đăng nhập.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Thu hồi phiên hiện tại và xoá cookie.
         */
        post: operations["auth.logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Người dùng hiện tại
         * @description **Truy cập:** đã đăng nhập.
         *
         *     Gọi khi tải lại trang để lấy thông tin, quyền và `csrfToken` của phiên.
         */
        get: operations["auth.me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/auth/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Đổi mật khẩu
         * @description **Truy cập:** đã đăng nhập.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     **Xác thực lại:** phải gọi `POST /admin/v1/auth/reauth` trong vòng 5 phút trước đó, nếu không sẽ nhận `REAUTH_REQUIRED`.
         *
         *     Cookie phiên được cấp mới (token cũ hết hiệu lực) và mọi phiên khác của người dùng bị thu hồi. Dùng `csrfToken` mới trong response cho các request sau.
         */
        post: operations["auth.changePassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/auth/reauth": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Xác thực lại bằng mật khẩu
         * @description **Truy cập:** đã đăng nhập.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Mở các thao tác nhạy cảm (đánh dấu 🔒 / `x-requires-recent-auth`) trong 5 phút cho phiên hiện tại.
         */
        post: operations["auth.reauth"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/auth/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Các phiên đăng nhập của tôi
         * @description **Truy cập:** đã đăng nhập.
         */
        get: operations["auth.list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/auth/sessions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Thu hồi một phiên của tôi
         * @description **Truy cập:** đã đăng nhập.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Thu hồi chính phiên hiện tại tương đương đăng xuất (cookie bị xoá).
         */
        delete: operations["auth.revoke"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/auth/setup-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Đặt mật khẩu bằng link một lần
         * @description **Truy cập:** công khai, không cần đăng nhập. `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Dùng cho link thiết lập (người dùng mới) và link đặt lại mật khẩu. `token` lấy từ phần `#token=` của link. Mật khẩu 12–128 ký tự; vi phạm trả `VALIDATION_FAILED` ở field `newPassword`. Giới hạn 10 lần / 15 phút theo IP.
         */
        post: operations["auth.setupPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Danh sách chuyên mục
         * @description **Truy cập:** đã đăng nhập và có quyền `category.read`.
         *
         *     Toàn bộ chuyên mục, sắp theo `position`, kèm số bài (`postCount`, mọi trạng thái).
         */
        get: operations["categories.list"];
        put?: never;
        /**
         * Tạo chuyên mục
         * @description **Truy cập:** đã đăng nhập và có quyền `category.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Tên không trùng (không phân biệt hoa thường và dấu), trùng thì 409 `CATEGORY_NAME_TAKEN`; tên không có chữ hoặc số thì 400 tại `name`. `slug` bỏ trống thì tự sinh từ tên và thêm hậu tố `-2`, `-3`… khi trùng; gõ tay mà trùng thì 409 `SLUG_TAKEN`, trùng slug bị cấm thì 400 tại `slug`. `position` chèn vào vị trí đó và dồn các chuyên mục khác.
         */
        post: operations["categories.create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/categories/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Xoá chuyên mục
         * @description **Truy cập:** đã đăng nhập và có quyền `category.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại qua query. Chuyên mục còn bài (mọi trạng thái) thì 409 `CATEGORY_NOT_EMPTY`, kèm `postCount` trong body lỗi. Sai `version` thì 409 `VERSION_CONFLICT`; không có chuyên mục thì 404 `NOT_FOUND`. Các chuyên mục còn lại được dồn lại 0..N-1.
         */
        delete: operations["categories.remove"];
        options?: never;
        head?: never;
        /**
         * Sửa hoặc di chuyển chuyên mục
         * @description **Truy cập:** đã đăng nhập và có quyền `category.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại và ít nhất một trong `name`, `slug`, `description`, `position`. Đổi tên không đổi slug. `position` chuyển chuyên mục tới vị trí đó, các chuyên mục khác dồn lại 0..N-1. Trùng tên thì 409 `CATEGORY_NAME_TAKEN`; trùng slug thì 409 `SLUG_TAKEN`; slug bị cấm thì 400 tại `slug`; sai `version` thì 409 `VERSION_CONFLICT`. Không có chuyên mục thì 404 `NOT_FOUND`.
         */
        patch: operations["categories.update"];
        trace?: never;
    };
    "/admin/v1/delivery/failures": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Danh sách webhook làm mới landing bị thất bại
         * @description **Truy cập:** đã đăng nhập và có quyền `system.read`.
         *
         *     Chỉ các lần gửi có trạng thái `failed` (hết lượt thử hoặc bị từ chối ngay), mới nhất trước. Không gọi sang landing.
         */
        get: operations["delivery.failures"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Duyệt và tìm ảnh
         * @description **Truy cập:** đã đăng nhập và có quyền `media.read`.
         *
         *     Sắp mới nhất trước. `q` tìm trên cả thư viện và bỏ qua `folderId`. Không có `q`: bỏ trống `folderId` là cả thư viện, `folderId=root` là ảnh ở gốc, `folderId=<id>` là ảnh trong folder đó (thêm `recursive=true` để gồm folder con). `folderId` không tồn tại thì 400. `used` lọc theo việc ảnh có đang được dùng hay không.
         */
        get: operations["media.list"];
        put?: never;
        /**
         * Tải ảnh lên
         * @description **Truy cập:** đã đăng nhập và có quyền `media.upload`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `multipart/form-data` gồm file `file`, `folderId` (không bắt buộc) và `alt` (không bắt buộc). Tên ảnh lấy từ tên file. Ảnh tối đa 10 MB, chỉ nhận JPEG, PNG, WebP, AVIF; loại ảnh được nhận dạng theo nội dung file, không theo tên hay `Content-Type`. Ảnh được xoay đúng chiều và bỏ toàn bộ metadata (EXIF, GPS). Quá 10 MB thì 413 `MEDIA_TOO_LARGE`; loại khác (SVG, GIF…) thì 415 `MEDIA_UNSUPPORTED_TYPE`; file hỏng hoặc quá nhiều điểm ảnh thì 422 `MEDIA_INVALID_IMAGE`; thiếu file hoặc `folderId` không tồn tại thì 400.
         */
        post: operations["media.create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/media/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Chi tiết ảnh
         * @description **Truy cập:** đã đăng nhập và có quyền `media.read`.
         *
         *     Kèm `usages`: những nơi đang dùng ảnh. Ảnh không có thì 404 `NOT_FOUND`.
         */
        get: operations["media.get"];
        put?: never;
        post?: never;
        /**
         * Xoá ảnh
         * @description **Truy cập:** đã đăng nhập và có quyền `media.delete`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại qua query. Ảnh đang được dùng thì 409 `MEDIA_IN_USE`, kèm `usages` (những nơi đang dùng) trong body lỗi. Sai `version` thì 409 `VERSION_CONFLICT`; ảnh không có thì 404 `NOT_FOUND`. Ảnh bị xoá khỏi thư viện ngay; file trên nhà cung cấp được xoá sau đó, lỗi ở bước này không làm request thất bại.
         */
        delete: operations["media.delete"];
        options?: never;
        head?: never;
        /**
         * Sửa ảnh
         * @description **Truy cập:** đã đăng nhập và có quyền `media.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại và ít nhất một trong `name`, `alt`, `folderId`; `folderId: null` chuyển về gốc. `folderId` không tồn tại thì 400 tại `folderId`; sai `version` thì 409 `VERSION_CONFLICT`; ảnh không có thì 404 `NOT_FOUND`.
         */
        patch: operations["media.update"];
        trace?: never;
    };
    "/admin/v1/media/editorjs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Tải ảnh lên từ Editor.js
         * @description **Truy cập:** đã đăng nhập và có quyền `media.upload`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Dành cho công cụ Image của Editor.js: gửi `multipart/form-data` gồm file `image` và `folderId` (không bắt buộc), nhận `{ success: 1, file }` theo định dạng Editor.js yêu cầu. Lỗi vẫn trả `application/problem+json` như mọi route khác. Ảnh tối đa 10 MB, chỉ nhận JPEG, PNG, WebP, AVIF; loại ảnh được nhận dạng theo nội dung file, không theo tên hay `Content-Type`. Ảnh được xoay đúng chiều và bỏ toàn bộ metadata (EXIF, GPS). Quá 10 MB thì 413 `MEDIA_TOO_LARGE`; loại khác (SVG, GIF…) thì 415 `MEDIA_UNSUPPORTED_TYPE`; file hỏng hoặc quá nhiều điểm ảnh thì 422 `MEDIA_INVALID_IMAGE`; thiếu file hoặc `folderId` không tồn tại thì 400.
         */
        post: operations["media.createFromEditor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/media/folders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Danh sách folder
         * @description **Truy cập:** đã đăng nhập và có quyền `media.read`.
         *
         *     Trả cả cây dưới dạng danh sách phẳng, sắp theo `depth` rồi theo tên; client dựng cây từ `parentId`. Folder lồng tối đa 5 cấp.
         */
        get: operations["mediaFolders.list"];
        put?: never;
        /**
         * Tạo folder
         * @description **Truy cập:** đã đăng nhập và có quyền `media.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Tên không trùng trong cùng folder cha (không phân biệt hoa thường và dấu), trùng thì 409 `FOLDER_NAME_TAKEN`. Quá 5 cấp thì 409 `FOLDER_TOO_DEEP`. `parentId` không tồn tại thì 400 tại `parentId`.
         */
        post: operations["mediaFolders.create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/media/folders/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Xoá folder
         * @description **Truy cập:** đã đăng nhập và có quyền `media.delete`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại qua query. Folder còn ảnh hoặc folder con thì 409 `FOLDER_NOT_EMPTY`, kèm `mediaCount` và `folderCount` trong body lỗi. Sai `version` thì 409 `VERSION_CONFLICT`; folder không có thì 404 `NOT_FOUND`.
         */
        delete: operations["mediaFolders.remove"];
        options?: never;
        head?: never;
        /**
         * Đổi tên hoặc chuyển folder
         * @description **Truy cập:** đã đăng nhập và có quyền `media.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại và ít nhất một trong `name`, `parentId`; `parentId: null` chuyển về gốc. Chuyển vào chính nó hoặc folder con thì 409 `FOLDER_CYCLE`; làm cây con vượt 5 cấp thì 409 `FOLDER_TOO_DEEP`; trùng tên thì 409 `FOLDER_NAME_TAKEN`; sai `version` thì 409 `VERSION_CONFLICT`. Folder không có thì 404 `NOT_FOUND`.
         */
        patch: operations["mediaFolders.update"];
        trace?: never;
    };
    "/admin/v1/media/move": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Chuyển nhiều ảnh sang folder khác
         * @description **Truy cập:** đã đăng nhập và có quyền `media.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     `ids` từ 1 đến 100 id không trùng; `folderId: null` chuyển về gốc. Chuyển cả hay không chuyển gì: một id không tồn tại thì 400 tại `ids.<vị trí>` và không ảnh nào được chuyển; `folderId` không tồn tại thì 400 tại `folderId`.
         */
        post: operations["media.move"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Danh sách quyền
         * @description **Truy cập:** đã đăng nhập và có quyền `role.read`.
         *
         *     Mọi quyền mà hệ thống biết, dùng để dựng màn hình phân quyền cho vai trò.
         */
        get: operations["users.permissions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/posts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Danh sách bài viết
         * @description **Truy cập:** đã đăng nhập và có quyền `post.read`.
         *
         *     Mới sửa trước. Lọc theo chuyên mục (`cat`), trạng thái (`status`) và tiêu đề (`q`, bỏ qua hoa thường và dấu); mặc định 8 bài một trang, tối đa 50. Mỗi dòng là bài không có `content`, kèm ảnh bìa và chuyên mục. `counts` luôn tính trên mọi bài, không theo bộ lọc.
         */
        get: operations["posts.list"];
        put?: never;
        /**
         * Tạo bài viết (nháp)
         * @description **Truy cập:** đã đăng nhập và có quyền `post.create`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Bài mới luôn là `draft`. Mọi trường đều tuỳ chọn; `content` mặc định không có khối nào. Khi `slugLocked` là `false`, slug tự sinh từ tiêu đề và thêm hậu tố `-2`, `-3`… khi trùng hoặc rơi vào slug cấm; tiêu đề không có chữ hoặc số thì slug rỗng (`""`). Gửi `slug` thì slug bị khoá (`slugLocked: true`); trùng bài khác thì 409 `SLUG_TAKEN`, slug cấm thì 400 tại `slug`. Chuyên mục không tồn tại thì 400 tại `categoryId`; ảnh không tồn tại thì 400 tại `coverMediaId` hoặc `content.blocks.<i>.data.file.mediaId`. Khối không hỗ trợ thì 422 `BLOCK_TYPE_NOT_ALLOWED`.
         */
        post: operations["posts.create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/posts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Xem bài viết
         * @description **Truy cập:** đã đăng nhập và có quyền `post.read`.
         *
         *     Nội dung trả về dạng Editor.js, có `url` của ảnh trong khối `image`; kèm ảnh bìa (`cover`) và chuyên mục (`category`). Không có bài thì 404 `NOT_FOUND`.
         */
        get: operations["posts.get"];
        put?: never;
        post?: never;
        /**
         * Xoá bài viết
         * @description **Truy cập:** đã đăng nhập và có quyền `post.delete`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Xoá hẳn bài (mọi trạng thái) cùng lịch sử slug của nó. Gửi `version` hiện tại qua query; sai thì 409 `VERSION_CONFLICT`. Không có bài thì 404 `NOT_FOUND`.
         */
        delete: operations["posts.remove"];
        options?: never;
        head?: never;
        /**
         * Sửa bài viết
         * @description **Truy cập:** đã đăng nhập và có quyền `post.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại và ít nhất một trường. Không đổi `status` (xuất bản là thao tác riêng). Gửi `content` là thay toàn bộ nội dung. Khi `slugLocked` là `false`, slug tự sinh từ tiêu đề và thêm hậu tố `-2`, `-3`… khi trùng hoặc rơi vào slug cấm; tiêu đề không có chữ hoặc số thì slug rỗng (`""`). Gửi `slug` thì slug bị khoá (`slugLocked: true`); trùng bài khác thì 409 `SLUG_TAKEN`, slug cấm thì 400 tại `slug`. Chuyên mục không tồn tại thì 400 tại `categoryId`; ảnh không tồn tại thì 400 tại `coverMediaId` hoặc `content.blocks.<i>.data.file.mediaId`. Khối không hỗ trợ thì 422 `BLOCK_TYPE_NOT_ALLOWED`. Bài đang `published` mà thay đổi làm mất điều kiện xuất bản (tiêu đề, slug, chuyên mục) thì 422 `POST_INVALID` và không ghi gì. Sai `version` thì 409 `VERSION_CONFLICT`; không có bài thì 404 `NOT_FOUND`.
         */
        patch: operations["posts.update"];
        trace?: never;
    };
    "/admin/v1/posts/{id}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Xuất bản bài viết
         * @description **Truy cập:** đã đăng nhập và có quyền `post.publish`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Cần tiêu đề, slug hợp lệ không trùng và không bị cấm, chuyên mục còn tồn tại, mọi ảnh còn trong thư viện; thiếu thì 422 `POST_INVALID` kèm tất cả lỗi. `date` trống thì đặt là ngày hôm nay theo giờ Việt Nam; `publishedAt` chỉ đặt ở lần xuất bản đầu tiên. Bài đã `published` thì trả 200, không đổi gì (sai `version` vẫn 409 `VERSION_CONFLICT`). Không có bài thì 404 `NOT_FOUND`.
         */
        post: operations["posts.publish"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/posts/{id}/unpublish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Gỡ bài viết
         * @description **Truy cập:** đã đăng nhập và có quyền `post.publish`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Đưa bài về `draft`, giữ nguyên `publishedAt` và lịch sử slug. Bài đã là `draft` thì trả 200, không đổi gì (sai `version` vẫn 409 `VERSION_CONFLICT`). Không có bài thì 404 `NOT_FOUND`.
         */
        post: operations["posts.unpublish"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Danh sách vai trò
         * @description **Truy cập:** đã đăng nhập và có quyền `role.read`.
         */
        get: operations["roles.list"];
        put?: never;
        /**
         * Tạo vai trò
         * @description **Truy cập:** đã đăng nhập và có quyền `role.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     **Xác thực lại:** phải gọi `POST /admin/v1/auth/reauth` trong vòng 5 phút trước đó, nếu không sẽ nhận `REAUTH_REQUIRED`.
         *
         *     Chỉ gán được quyền mà mình đang có. `permissions` lấy từ `GET /admin/v1/permissions`.
         */
        post: operations["roles.create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/roles/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Xoá vai trò
         * @description **Truy cập:** đã đăng nhập và có quyền `role.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     **Xác thực lại:** phải gọi `POST /admin/v1/auth/reauth` trong vòng 5 phút trước đó, nếu không sẽ nhận `REAUTH_REQUIRED`.
         *
         *     Vai trò hệ thống và vai trò đang gán cho người dùng không xoá được.
         */
        delete: operations["roles.remove"];
        options?: never;
        head?: never;
        /**
         * Sửa vai trò
         * @description **Truy cập:** đã đăng nhập và có quyền `role.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     **Xác thực lại:** phải gọi `POST /admin/v1/auth/reauth` trong vòng 5 phút trước đó, nếu không sẽ nhận `REAUTH_REQUIRED`.
         *
         *     Cần ít nhất một trong `name`, `description`, `permissions`. Vai trò hệ thống không sửa được. Đổi quyền sẽ thu hồi phiên của những người đang giữ vai trò này.
         */
        patch: operations["roles.update"];
        trace?: never;
    };
    "/admin/v1/site": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Xem nháp và bản xuất bản của website
         * @description **Truy cập:** đã đăng nhập và có quyền `site.read`.
         *
         *     Trả nháp, bản xuất bản gần nhất, `dirty`, `draftHash` và cảnh báo mềm. Chưa xuất bản lần nào thì `published` là `null` và `dirty` là `true`.
         */
        get: operations["site.get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/site/publications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lịch sử xuất bản
         * @description **Truy cập:** đã đăng nhập và có quyền `site.read`.
         *
         *     Mới nhất trước.
         */
        get: operations["site.listPublications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/site/publications/{id}/restore-to-draft": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Khôi phục một bản xuất bản cũ về nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Chỉ ghi đè nháp; bản xuất bản hiện hành không đổi. Gửi `draftHash` lấy từ `GET /site`.
         */
        post: operations["site.restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/site/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Xuất bản nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.publish`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `draftHash` lấy từ `GET /site`. Nháp đã đổi thì 409 `VERSION_CONFLICT`; nháp trùng bản xuất bản gần nhất thì 409 `NOTHING_TO_PUBLISH`; nháp không hợp lệ thì 422 `SITE_INVALID` kèm `errors`.
         */
        post: operations["site.publish"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/site/revert": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Hoàn tác nháp về bản xuất bản gần nhất
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `draftHash` lấy từ `GET /site`. Chưa xuất bản lần nào thì 409 `NOT_PUBLISHED`.
         */
        post: operations["site.revert"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/site/services": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Thêm dịch vụ vào nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Không gửi `position` thì mục nằm cuối. Đã đủ số mục tối đa thì trả 409 `SITE_ITEM_LIMIT`.
         */
        post: operations["siteItems.createService"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/site/services/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Xoá dịch vụ khỏi nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại của mục qua query. Sai `version` thì 409 `VERSION_CONFLICT`; mục không có thì 404 `NOT_FOUND`.
         */
        delete: operations["siteItems.removeService"];
        options?: never;
        head?: never;
        /**
         * Sửa dịch vụ trong nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại của mục; trường không gửi giữ nguyên. Sai `version` thì 409 `VERSION_CONFLICT`; mục không có thì 404 `NOT_FOUND`.
         */
        patch: operations["siteItems.updateService"];
        trace?: never;
    };
    "/admin/v1/site/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Sửa settings của nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại của settings và ít nhất một trường settings; trường không gửi giữ nguyên.
         */
        patch: operations["site.update"];
        trace?: never;
    };
    "/admin/v1/site/team": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Thêm thành viên đội ngũ vào nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Không gửi `position` thì mục nằm cuối. Đã đủ số mục tối đa thì trả 409 `SITE_ITEM_LIMIT`.
         */
        post: operations["siteItems.createTeamMember"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/site/team/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Xoá thành viên đội ngũ khỏi nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại của mục qua query. Sai `version` thì 409 `VERSION_CONFLICT`; mục không có thì 404 `NOT_FOUND`.
         */
        delete: operations["siteItems.removeTeamMember"];
        options?: never;
        head?: never;
        /**
         * Sửa thành viên đội ngũ trong nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại của mục; trường không gửi giữ nguyên. Sai `version` thì 409 `VERSION_CONFLICT`; mục không có thì 404 `NOT_FOUND`.
         */
        patch: operations["siteItems.updateTeamMember"];
        trace?: never;
    };
    "/admin/v1/site/timeline": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Thêm mốc hành trình vào nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Không gửi `position` thì mục nằm cuối. Đã đủ số mục tối đa thì trả 409 `SITE_ITEM_LIMIT`.
         */
        post: operations["siteItems.createTimelineEntry"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/site/timeline/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Xoá mốc hành trình khỏi nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại của mục qua query. Sai `version` thì 409 `VERSION_CONFLICT`; mục không có thì 404 `NOT_FOUND`.
         */
        delete: operations["siteItems.removeTimelineEntry"];
        options?: never;
        head?: never;
        /**
         * Sửa mốc hành trình trong nháp
         * @description **Truy cập:** đã đăng nhập và có quyền `site.update`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Gửi `version` hiện tại của mục; trường không gửi giữ nguyên. Sai `version` thì 409 `VERSION_CONFLICT`; mục không có thì 404 `NOT_FOUND`.
         */
        patch: operations["siteItems.updateTimelineEntry"];
        trace?: never;
    };
    "/admin/v1/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Danh sách người dùng
         * @description **Truy cập:** đã đăng nhập và có quyền `user.read`.
         *
         *     `q` tìm theo email hoặc tên.
         */
        get: operations["users.list"];
        put?: never;
        /**
         * Tạo người dùng
         * @description **Truy cập:** đã đăng nhập và có quyền `user.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     **Xác thực lại:** phải gọi `POST /admin/v1/auth/reauth` trong vòng 5 phút trước đó, nếu không sẽ nhận `REAUTH_REQUIRED`.
         *
         *     Người dùng ở trạng thái `pending` cho đến khi đặt mật khẩu qua `setupLink` (hết hạn sau 30 phút). Chỉ gán được vai trò có quyền nằm trong quyền của mình.
         */
        post: operations["users.create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Sửa người dùng
         * @description **Truy cập:** đã đăng nhập và có quyền `user.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     Cần ít nhất một trong `name`, `roleIds`. Đổi `roleIds` cần xác thực lại trong 5 phút (`REAUTH_REQUIRED`) và không được tự đổi vai trò của mình. `version` lấy từ lần đọc gần nhất; nếu người khác đã sửa trước thì trả `VERSION_CONFLICT`.
         */
        patch: operations["users.update"];
        trace?: never;
    };
    "/admin/v1/users/{id}/disable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Vô hiệu hoá người dùng
         * @description **Truy cập:** đã đăng nhập và có quyền `user.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     **Xác thực lại:** phải gọi `POST /admin/v1/auth/reauth` trong vòng 5 phút trước đó, nếu không sẽ nhận `REAUTH_REQUIRED`.
         *
         *     Thu hồi mọi phiên và link chưa dùng của người đó. Không tự vô hiệu hoá chính mình.
         */
        post: operations["users.disable"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/users/{id}/enable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Kích hoạt lại người dùng
         * @description **Truy cập:** đã đăng nhập và có quyền `user.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     **Xác thực lại:** phải gọi `POST /admin/v1/auth/reauth` trong vòng 5 phút trước đó, nếu không sẽ nhận `REAUTH_REQUIRED`.
         */
        post: operations["users.enable"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/users/{id}/reset-link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cấp link đặt lại mật khẩu
         * @description **Truy cập:** đã đăng nhập và có quyền `user.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     **Xác thực lại:** phải gọi `POST /admin/v1/auth/reauth` trong vòng 5 phút trước đó, nếu không sẽ nhận `REAUTH_REQUIRED`.
         *
         *     Link cũ chưa dùng bị vô hiệu. Hết hạn sau 30 phút.
         */
        post: operations["users.resetLink"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/v1/users/{id}/unlock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Mở khoá đăng nhập
         * @description **Truy cập:** đã đăng nhập và có quyền `user.manage`.
         *
         *     **CSRF:** gửi header `X-CSRF-Token`; `Origin` phải nằm trong ADMIN_ORIGINS.
         *
         *     **Xác thực lại:** phải gọi `POST /admin/v1/auth/reauth` trong vòng 5 phút trước đó, nếu không sẽ nhận `REAUTH_REQUIRED`.
         *
         *     Xoá khoá tạm thời do nhập sai mật khẩu. Chỉ super admin (toàn quyền) được gọi.
         */
        post: operations["users.unlock"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tiến trình còn sống
         * @description **Truy cập:** công khai, không cần đăng nhập.
         */
        get: operations["health.live"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Sẵn sàng nhận request
         * @description **Truy cập:** công khai, không cần đăng nhập.
         *
         *     Trả 503 (cùng dạng body) khi Postgres hoặc Redis không trả lời.
         */
        get: operations["health.ready"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/v1/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Danh sách chuyên mục
         * @description **Truy cập:** token API công khai (Bearer). Giới hạn 600 request/phút cho mỗi token và IP.
         *
         *     Mọi chuyên mục theo thứ tự hiển thị. `count` chỉ đếm bài đã xuất bản.
         */
        get: operations["publicCategories.list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/v1/posts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Danh sách bài viết đã xuất bản
         * @description **Truy cập:** token API công khai (Bearer). Giới hạn 600 request/phút cho mỗi token và IP.
         *
         *     Chỉ bài đã xuất bản. Thứ tự: bài nổi bật trước, rồi ngày bài giảm dần, rồi thời điểm xuất bản giảm dần. `cat` là slug chuyên mục. `q` khớp tiêu đề hoặc tóm tắt, không phân biệt hoa thường và dấu, cắt còn 100 ký tự. Ảnh bìa là biến thể `cover`. Chữ thuần (tiêu đề, tóm tắt) trả nguyên văn, không escape.
         */
        get: operations["publicPosts.list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/v1/posts/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Chi tiết bài viết đã xuất bản
         * @description **Truy cập:** token API công khai (Bearer). Giới hạn 600 request/phút cho mỗi token và IP.
         *
         *     Nội dung dạng khối chuẩn hoá (`content.blocks`), HTML nội dòng đã làm sạch lần hai; chỉ field `html` hoặc `…Html` mang HTML, các field khác là chữ thuần. Ảnh bìa là biến thể `cover`, ảnh trong bài là ảnh gốc. Bài nháp, bài đã gỡ, slug cũ hoặc slug sai mẫu: 404 `NOT_FOUND`.
         */
        get: operations["publicPosts.get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/v1/posts/slugs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Danh sách slug bài đã xuất bản
         * @description **Truy cập:** token API công khai (Bearer). Giới hạn 600 request/phút cho mỗi token và IP.
         *
         *     Mọi bài đã xuất bản, không phân trang, `updatedAt` giảm dần (bằng nhau thì theo slug tăng dần). Mỗi phần tử có `noindex`: sitemap nên bỏ qua bài `noindex: true`. Dùng cho sitemap.
         */
        get: operations["publicPosts.slugs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/public/v1/site": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Thông tin website đã xuất bản
         * @description **Truy cập:** token API công khai (Bearer). Giới hạn 600 request/phút cho mỗi token và IP.
         *
         *     Bản xuất bản mới nhất của thông tin website: settings, dịch vụ, đội ngũ và mốc thời gian. Chỉ gồm mục đang hiển thị; không bao giờ trả nháp. Ảnh thành viên là biến thể `portrait`, ảnh mốc thời gian là ảnh gốc. Chưa xuất bản lần nào thì 404 `NOT_FOUND`.
         */
        get: operations["publicSite.get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Problem: {
            type: string;
            title: string;
            status: number;
            code: string;
            detail: string;
            errors?: {
                path: string;
                message: string;
            }[];
        };
        paths_public_v1_posts_slug_get_responses_200_content_application_json_schema____schema0: {
            /** @description HTML nội dòng đã làm sạch: nội dung mục. */
            html: string;
            /** @description Chỉ có khi danh sách là `checklist`. */
            checked?: boolean;
            /** @description Mục con; rỗng khi không có. */
            items: components["schemas"]["paths_public_v1_posts_slug_get_responses_200_content_application_json_schema____schema0"][];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    "apiTokens.list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        name: string;
                        /** Format: date-time */
                        createdAt: string;
                        lastUsedAt: string | null;
                        revokedAt: string | null;
                    }[];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "apiTokens.create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        /** @description Giá trị token `lbp_…`. Chỉ trả về một lần, hãy lưu ngay. */
                        token: string;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`, `REAUTH_REQUIRED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `API_TOKEN_LIMIT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "apiTokens.remove": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`, `REAUTH_REQUIRED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "audit.search": {
        parameters: {
            query?: {
                actor?: string;
                action?: string;
                from?: string;
                to?: string;
                page?: number;
                perPage?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            /** Format: uuid */
                            id: string;
                            /** @description Null khi hệ thống tự thực hiện (ví dụ CLI). */
                            actorId: string | null;
                            action: string;
                            targetType: string;
                            targetId: string;
                            ip: string;
                            userAgent: string;
                            /** @description Chi tiết thay đổi; khoá nhạy cảm (password, token…) bị che. */
                            data: unknown;
                            /** Format: date-time */
                            createdAt: string;
                        }[];
                        total: number;
                        page: number;
                        perPage: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "auth.doLogin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    email: string;
                    password: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        status: "authenticated";
                        user: {
                            /** Format: uuid */
                            id: string;
                            email: string;
                            name: string;
                        };
                        /** @description Gửi lại trong header `X-CSRF-Token` cho mọi request ghi dữ liệu. */
                        csrfToken: string;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `INVALID_CREDENTIALS`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests. Mã lỗi (`code`): `RATE_LIMITED`. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "auth.logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "auth.me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        user: {
                            /** Format: uuid */
                            id: string;
                            email: string;
                            name: string;
                        };
                        /** @description Quyền hiệu lực, sắp xếp theo tên. `["*"]` nghĩa là toàn quyền (super admin). */
                        permissions: string[];
                        csrfToken: string;
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "auth.changePassword": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    currentPassword: string;
                    newPassword: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        csrfToken: string;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`, `INVALID_CREDENTIALS`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `CSRF_FAILED`, `REAUTH_REQUIRED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "auth.reauth": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    password: string;
                };
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`, `INVALID_CREDENTIALS`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "auth.list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            /** Format: uuid */
                            id: string;
                            ip: string;
                            userAgent: string;
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            lastSeenAt: string;
                            /** @description Phiên của chính request này. */
                            current: boolean;
                        }[];
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "auth.revoke": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "auth.setupPassword": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    token: string;
                    newPassword: string;
                };
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`, `INVALID_LINK`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests. Mã lỗi (`code`): `RATE_LIMITED`. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "categories.list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Sắp theo `position`. */
                        items: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            slug: string;
                            description: string;
                            /** @description Thứ tự hiển thị, từ 0, liên tục. */
                            position: number;
                            /** @description Số bài thuộc chuyên mục, mọi trạng thái. */
                            postCount: number;
                            /** @description Gửi lại khi sửa hoặc xoá chuyên mục. */
                            version: number;
                        }[];
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "categories.create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    /** @description Không gửi: tự sinh từ `name`, thêm hậu tố `-2`, `-3`… nếu trùng. */
                    slug?: string;
                    /** @default  */
                    description?: string;
                    /** @description Vị trí chèn (từ 0); bỏ trống hoặc quá lớn: cuối danh sách. */
                    position?: number;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        name: string;
                        slug: string;
                        description: string;
                        /** @description Thứ tự hiển thị, từ 0, liên tục. */
                        position: number;
                        /** @description Số bài thuộc chuyên mục, mọi trạng thái. */
                        postCount: number;
                        /** @description Gửi lại khi sửa hoặc xoá chuyên mục. */
                        version: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `CATEGORY_NAME_TAKEN`, `SLUG_TAKEN`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "categories.remove": {
        parameters: {
            query: {
                version: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`, `CATEGORY_NOT_EMPTY`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": (components["schemas"]["Problem"] & {
                        /** @constant */
                        code: "CATEGORY_NOT_EMPTY";
                        /** @description Số bài còn thuộc chuyên mục (mọi trạng thái). */
                        postCount: number;
                    }) | components["schemas"]["Problem"];
                };
            };
        };
    };
    "categories.update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    version: number;
                    name?: string;
                    slug?: string;
                    description?: string;
                    /** @description Vị trí mới (từ 0); các chuyên mục khác dồn lại 0..N-1. */
                    position?: number;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        name: string;
                        slug: string;
                        description: string;
                        /** @description Thứ tự hiển thị, từ 0, liên tục. */
                        position: number;
                        /** @description Số bài thuộc chuyên mục, mọi trạng thái. */
                        postCount: number;
                        /** @description Gửi lại khi sửa hoặc xoá chuyên mục. */
                        version: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`, `CATEGORY_NAME_TAKEN`, `SLUG_TAKEN`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "delivery.failures": {
        parameters: {
            query?: {
                page?: number;
                perPage?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            /** Format: uuid */
                            id: string;
                            /** @description Các tag cần làm mới (`site`, `posts`, `post:<slug>`, `categories`). */
                            tags: string[];
                            /** @enum {string} */
                            status: "pending" | "succeeded" | "failed" | "skipped";
                            /** @description Số lần đã gửi. */
                            attempts: number;
                            /** @description Mã HTTP của lần gửi cuối; null khi lỗi mạng hoặc quá hạn. */
                            lastStatusCode: number | null;
                            lastError: string | null;
                            /** Format: date-time */
                            createdAt: string;
                            finishedAt: string | null;
                        }[];
                        total: number;
                        page: number;
                        perPage: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "media.list": {
        parameters: {
            query?: {
                /** @description Bỏ trống: cả thư viện. `root`: chỉ ảnh ở gốc. Hoặc id một folder. */
                folderId?: "root" | string;
                /** @description Chỉ áp dụng khi `folderId` là id folder: gồm cả ảnh ở folder con. Mặc định `false`. */
                recursive?: "true" | "false";
                /** @description Tìm theo tên và mô tả, không phân biệt hoa thường và dấu; tìm trên cả thư viện. */
                q?: string;
                /** @description `true`: chỉ ảnh đang được dùng. `false`: chỉ ảnh chưa dùng. */
                used?: "true" | "false";
                page?: number;
                perPage?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Mới nhất trước. */
                        items: {
                            /** Format: uuid */
                            id: string;
                            /** @description `null`: ảnh ở gốc thư viện. */
                            folderId: string | null;
                            name: string;
                            alt: string;
                            /** @enum {string} */
                            format: "jpeg" | "png" | "webp" | "avif";
                            width: number;
                            height: number;
                            /** @description Dung lượng file đã lưu (sau khi xử lý). */
                            bytes: number;
                            /** @description Ảnh đầy đủ. */
                            url: string;
                            /** @description Ảnh thu nhỏ 400×400 cho lưới thư viện. */
                            thumbUrl: string;
                            uploadedBy: string | null;
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                            /** @description Gửi lại khi sửa ảnh. */
                            version: number;
                        }[];
                        total: number;
                        page: number;
                        perPage: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "media.create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                    /**
                     * Format: uuid
                     * @description Bỏ trống: ảnh nằm ở gốc thư viện.
                     */
                    folderId?: string;
                    /**
                     * @description Mô tả ảnh (alt text), tối đa 300 ký tự.
                     * @default
                     */
                    alt?: string;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        /** @description `null`: ảnh ở gốc thư viện. */
                        folderId: string | null;
                        name: string;
                        alt: string;
                        /** @enum {string} */
                        format: "jpeg" | "png" | "webp" | "avif";
                        width: number;
                        height: number;
                        /** @description Dung lượng file đã lưu (sau khi xử lý). */
                        bytes: number;
                        /** @description Ảnh đầy đủ. */
                        url: string;
                        /** @description Ảnh thu nhỏ 400×400 cho lưới thư viện. */
                        thumbUrl: string;
                        uploadedBy: string | null;
                        /** Format: date-time */
                        createdAt: string;
                        /** Format: date-time */
                        updatedAt: string;
                        /** @description Gửi lại khi sửa ảnh. */
                        version: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `MEDIA_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unsupported Media Type. Mã lỗi (`code`): `MEDIA_UNSUPPORTED_TYPE`. */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Entity. Mã lỗi (`code`): `MEDIA_INVALID_IMAGE`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "media.get": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        /** @description `null`: ảnh ở gốc thư viện. */
                        folderId: string | null;
                        name: string;
                        alt: string;
                        /** @enum {string} */
                        format: "jpeg" | "png" | "webp" | "avif";
                        width: number;
                        height: number;
                        /** @description Dung lượng file đã lưu (sau khi xử lý). */
                        bytes: number;
                        /** @description Ảnh đầy đủ. */
                        url: string;
                        /** @description Ảnh thu nhỏ 400×400 cho lưới thư viện. */
                        thumbUrl: string;
                        uploadedBy: string | null;
                        /** Format: date-time */
                        createdAt: string;
                        /** Format: date-time */
                        updatedAt: string;
                        /** @description Gửi lại khi sửa ảnh. */
                        version: number;
                        /** @description Những nơi đang dùng ảnh này. */
                        usages: {
                            /** @description Module đang dùng ảnh, ví dụ `site`. */
                            source: string;
                            /** @description Loại nơi dùng: `team_member`, `timeline_entry`, `site_publication` (nguồn `site`), `post_cover`, `post_image` (nguồn `content`); nguồn mới thêm loại riêng. */
                            kind: string;
                            /** @description Id của nơi dùng. */
                            id: string;
                            /** @description Tên hiển thị của nơi dùng. */
                            label: string;
                        }[];
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "media.delete": {
        parameters: {
            query: {
                version: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`, `MEDIA_IN_USE`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": (components["schemas"]["Problem"] & {
                        /** @constant */
                        code: "MEDIA_IN_USE";
                        /** @description Những nơi đang dùng ảnh. */
                        usages: {
                            /** @description Module đang dùng ảnh, ví dụ `site`. */
                            source: string;
                            /** @description Loại nơi dùng: `team_member`, `timeline_entry`, `site_publication` (nguồn `site`), `post_cover`, `post_image` (nguồn `content`); nguồn mới thêm loại riêng. */
                            kind: string;
                            /** @description Id của nơi dùng. */
                            id: string;
                            /** @description Tên hiển thị của nơi dùng. */
                            label: string;
                        }[];
                    }) | components["schemas"]["Problem"];
                };
            };
        };
    };
    "media.update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    version: number;
                    name?: string;
                    alt?: string;
                    /** @description `null`: chuyển về gốc. */
                    folderId?: string | null;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        /** @description `null`: ảnh ở gốc thư viện. */
                        folderId: string | null;
                        name: string;
                        alt: string;
                        /** @enum {string} */
                        format: "jpeg" | "png" | "webp" | "avif";
                        width: number;
                        height: number;
                        /** @description Dung lượng file đã lưu (sau khi xử lý). */
                        bytes: number;
                        /** @description Ảnh đầy đủ. */
                        url: string;
                        /** @description Ảnh thu nhỏ 400×400 cho lưới thư viện. */
                        thumbUrl: string;
                        uploadedBy: string | null;
                        /** Format: date-time */
                        createdAt: string;
                        /** Format: date-time */
                        updatedAt: string;
                        /** @description Gửi lại khi sửa ảnh. */
                        version: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "media.createFromEditor": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    image: string;
                    /**
                     * Format: uuid
                     * @description Bỏ trống: ảnh nằm ở gốc thư viện.
                     */
                    folderId?: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        success: 1;
                        file: {
                            url: string;
                            /** Format: uuid */
                            mediaId: string;
                            width: number;
                            height: number;
                        };
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `MEDIA_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unsupported Media Type. Mã lỗi (`code`): `MEDIA_UNSUPPORTED_TYPE`. */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Entity. Mã lỗi (`code`): `MEDIA_INVALID_IMAGE`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "mediaFolders.list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Cả cây, phẳng; sắp theo `depth`, rồi theo tên. */
                        items: {
                            /** Format: uuid */
                            id: string;
                            /** @description `null`: folder gốc. */
                            parentId: string | null;
                            name: string;
                            /** @description Folder gốc có `depth` 1. */
                            depth: number;
                            /** @description Số ảnh nằm trực tiếp trong folder (không tính folder con). */
                            mediaCount: number;
                            /** @description Gửi lại khi sửa hoặc xoá folder. */
                            version: number;
                        }[];
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "mediaFolders.create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    /**
                     * @description `null` hoặc bỏ trống: folder gốc.
                     * @default null
                     */
                    parentId?: string | null;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        /** @description `null`: folder gốc. */
                        parentId: string | null;
                        name: string;
                        /** @description Folder gốc có `depth` 1. */
                        depth: number;
                        /** @description Số ảnh nằm trực tiếp trong folder (không tính folder con). */
                        mediaCount: number;
                        /** @description Gửi lại khi sửa hoặc xoá folder. */
                        version: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `FOLDER_NAME_TAKEN`, `FOLDER_TOO_DEEP`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "mediaFolders.remove": {
        parameters: {
            query: {
                version: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`, `FOLDER_NOT_EMPTY`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": (components["schemas"]["Problem"] & {
                        /** @constant */
                        code: "FOLDER_NOT_EMPTY";
                        /** @description Số ảnh còn trong folder. */
                        mediaCount: number;
                        /** @description Số folder con còn trong folder. */
                        folderCount: number;
                    }) | components["schemas"]["Problem"];
                };
            };
        };
    };
    "mediaFolders.update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    version: number;
                    name?: string;
                    /** @description `null`: chuyển về gốc. */
                    parentId?: string | null;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        /** @description `null`: folder gốc. */
                        parentId: string | null;
                        name: string;
                        /** @description Folder gốc có `depth` 1. */
                        depth: number;
                        /** @description Số ảnh nằm trực tiếp trong folder (không tính folder con). */
                        mediaCount: number;
                        /** @description Gửi lại khi sửa hoặc xoá folder. */
                        version: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`, `FOLDER_NAME_TAKEN`, `FOLDER_CYCLE`, `FOLDER_TOO_DEEP`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "media.move": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    ids: string[];
                    /** @description `null`: chuyển về gốc. */
                    folderId: string | null;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        moved: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "users.permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        key: string;
                        module: string;
                    }[];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "posts.list": {
        parameters: {
            query?: {
                /** @description Chỉ bài thuộc chuyên mục này. */
                cat?: string;
                status?: "draft" | "published";
                /** @description Tìm trong tiêu đề, không phân biệt hoa thường và dấu. */
                q?: string;
                page?: number;
                perPage?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Mới sửa trước; không có `content`. */
                        items: {
                            /** Format: uuid */
                            id: string;
                            title: string;
                            /** @description `""` khi bài chưa có slug (tiêu đề rỗng hoặc chỉ có ký hiệu). */
                            slug: string;
                            /** @description `false`: slug tự sinh từ tiêu đề mỗi lần lưu. Đặt thành `true` khi xuất bản lần đầu. */
                            slugLocked: boolean;
                            /** @description Đúng chữ người dùng nhập. */
                            excerpt: string;
                            /** @description `excerpt`, hoặc khi rỗng: đoạn văn đầu tiên bỏ thẻ, tối đa 110 ký tự. */
                            effectiveExcerpt: string;
                            categoryId: string | null;
                            /** @description `null` khi bài chưa có chuyên mục. */
                            category: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                slug: string;
                            } | null;
                            /** @enum {string} */
                            status: "draft" | "published";
                            /** @description Ngày xuất bản `YYYY-MM-DD`, hoặc `""`. */
                            date: string;
                            featured: boolean;
                            coverMediaId: string | null;
                            /** @description Ảnh của `coverMediaId`; `null` khi không có ảnh bìa hoặc ảnh không còn trong thư viện. */
                            cover: {
                                /** Format: uuid */
                                id: string;
                                /** @description Ảnh gốc. */
                                url: string;
                                /** @description Ảnh thu nhỏ 400×400. */
                                thumbUrl: string;
                                width: number;
                                height: number;
                                alt: string;
                            } | null;
                            alt: string;
                            kw: string;
                            meta: string;
                            noindex: boolean;
                            /** @description Thời điểm xuất bản lần đầu; `null` khi chưa từng xuất bản. */
                            publishedAt: string | null;
                            createdBy: string | null;
                            updatedBy: string | null;
                            /** Format: date-time */
                            createdAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                            /** @description Gửi lại khi sửa hoặc xoá bài. */
                            version: number;
                        }[];
                        /** @description Số bài khớp bộ lọc. */
                        total: number;
                        page: number;
                        perPage: number;
                        /** @description Tính trên mọi bài, không phụ thuộc bộ lọc. */
                        counts: {
                            /** @description Số bài mỗi chuyên mục (chỉ chuyên mục có bài), mọi trạng thái. */
                            byCat: {
                                /** Format: uuid */
                                categoryId: string;
                                count: number;
                            }[];
                            byStatus: {
                                draft: number;
                                published: number;
                            };
                        };
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "posts.create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Được để trống khi là nháp. */
                    title?: string;
                    /** @description Gõ tay thì `slugLocked` thành `true`; trùng bài khác thì 409 `SLUG_TAKEN`. `""` xoá slug. */
                    slug?: "" | string;
                    /** @description `false`: slug tự sinh lại từ tiêu đề mỗi lần lưu (chỉ với bài chưa từng xuất bản); `true`: giữ nguyên slug hiện có. Bài đã xuất bản luôn là `true`. */
                    slugLocked?: boolean;
                    excerpt?: string;
                    /** @description Tài liệu Editor.js `{ time?, version?, blocks: [{ id?, type, data }] }`. Gửi lên là thay toàn bộ nội dung. Khối không hỗ trợ thì 422 `BLOCK_TYPE_NOT_ALLOWED`. */
                    content?: unknown;
                    /** @description `null` chỉ được khi là nháp. */
                    categoryId?: string | null;
                    /** @description Ngày xuất bản `YYYY-MM-DD`, hoặc `""`. */
                    date?: string;
                    featured?: boolean;
                    /** @description Ảnh bìa trong thư viện media; không bắt buộc. */
                    coverMediaId?: string | null;
                    alt?: string;
                    kw?: string;
                    meta?: string;
                    noindex?: boolean;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /** @description `""` khi bài chưa có slug (tiêu đề rỗng hoặc chỉ có ký hiệu). */
                        slug: string;
                        /** @description `false`: slug tự sinh từ tiêu đề mỗi lần lưu. Đặt thành `true` khi xuất bản lần đầu. */
                        slugLocked: boolean;
                        /** @description Đúng chữ người dùng nhập. */
                        excerpt: string;
                        /** @description `excerpt`, hoặc khi rỗng: đoạn văn đầu tiên bỏ thẻ, tối đa 110 ký tự. */
                        effectiveExcerpt: string;
                        /** @description Tài liệu Editor.js. */
                        content: {
                            time: number;
                            version: string;
                            editorVersion: string;
                            blocks: {
                                id: string;
                                /** @enum {string} */
                                type: "paragraph" | "header" | "list" | "code" | "table" | "callout" | "quote" | "image" | "embed" | "delimiter";
                                /** @description Dữ liệu khối đã làm sạch. `image`: `file` có `mediaId`, `url`, `width`, `height` (`url: null` khi ảnh không còn). `embed`: dựng lại `source`, `embed`, `width`, `height`. */
                                data: {
                                    [key: string]: unknown;
                                };
                            }[];
                        };
                        categoryId: string | null;
                        /** @description `null` khi bài chưa có chuyên mục. */
                        category: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            slug: string;
                        } | null;
                        /** @enum {string} */
                        status: "draft" | "published";
                        /** @description Ngày xuất bản `YYYY-MM-DD`, hoặc `""`. */
                        date: string;
                        featured: boolean;
                        coverMediaId: string | null;
                        /** @description Ảnh của `coverMediaId`; `null` khi không có ảnh bìa hoặc ảnh không còn trong thư viện. */
                        cover: {
                            /** Format: uuid */
                            id: string;
                            /** @description Ảnh gốc. */
                            url: string;
                            /** @description Ảnh thu nhỏ 400×400. */
                            thumbUrl: string;
                            width: number;
                            height: number;
                            alt: string;
                        } | null;
                        alt: string;
                        kw: string;
                        meta: string;
                        noindex: boolean;
                        /** @description Thời điểm xuất bản lần đầu; `null` khi chưa từng xuất bản. */
                        publishedAt: string | null;
                        createdBy: string | null;
                        updatedBy: string | null;
                        /** Format: date-time */
                        createdAt: string;
                        /** Format: date-time */
                        updatedAt: string;
                        /** @description Gửi lại khi sửa hoặc xoá bài. */
                        version: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `SLUG_TAKEN`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Entity. Mã lỗi (`code`): `BLOCK_TYPE_NOT_ALLOWED`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "posts.get": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /** @description `""` khi bài chưa có slug (tiêu đề rỗng hoặc chỉ có ký hiệu). */
                        slug: string;
                        /** @description `false`: slug tự sinh từ tiêu đề mỗi lần lưu. Đặt thành `true` khi xuất bản lần đầu. */
                        slugLocked: boolean;
                        /** @description Đúng chữ người dùng nhập. */
                        excerpt: string;
                        /** @description `excerpt`, hoặc khi rỗng: đoạn văn đầu tiên bỏ thẻ, tối đa 110 ký tự. */
                        effectiveExcerpt: string;
                        /** @description Tài liệu Editor.js. */
                        content: {
                            time: number;
                            version: string;
                            editorVersion: string;
                            blocks: {
                                id: string;
                                /** @enum {string} */
                                type: "paragraph" | "header" | "list" | "code" | "table" | "callout" | "quote" | "image" | "embed" | "delimiter";
                                /** @description Dữ liệu khối đã làm sạch. `image`: `file` có `mediaId`, `url`, `width`, `height` (`url: null` khi ảnh không còn). `embed`: dựng lại `source`, `embed`, `width`, `height`. */
                                data: {
                                    [key: string]: unknown;
                                };
                            }[];
                        };
                        categoryId: string | null;
                        /** @description `null` khi bài chưa có chuyên mục. */
                        category: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            slug: string;
                        } | null;
                        /** @enum {string} */
                        status: "draft" | "published";
                        /** @description Ngày xuất bản `YYYY-MM-DD`, hoặc `""`. */
                        date: string;
                        featured: boolean;
                        coverMediaId: string | null;
                        /** @description Ảnh của `coverMediaId`; `null` khi không có ảnh bìa hoặc ảnh không còn trong thư viện. */
                        cover: {
                            /** Format: uuid */
                            id: string;
                            /** @description Ảnh gốc. */
                            url: string;
                            /** @description Ảnh thu nhỏ 400×400. */
                            thumbUrl: string;
                            width: number;
                            height: number;
                            alt: string;
                        } | null;
                        alt: string;
                        kw: string;
                        meta: string;
                        noindex: boolean;
                        /** @description Thời điểm xuất bản lần đầu; `null` khi chưa từng xuất bản. */
                        publishedAt: string | null;
                        createdBy: string | null;
                        updatedBy: string | null;
                        /** Format: date-time */
                        createdAt: string;
                        /** Format: date-time */
                        updatedAt: string;
                        /** @description Gửi lại khi sửa hoặc xoá bài. */
                        version: number;
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "posts.remove": {
        parameters: {
            query: {
                version: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "posts.update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    version: number;
                    /** @description Được để trống khi là nháp. */
                    title?: string;
                    /** @description Gõ tay thì `slugLocked` thành `true`; trùng bài khác thì 409 `SLUG_TAKEN`. `""` xoá slug. */
                    slug?: "" | string;
                    /** @description `false`: slug tự sinh lại từ tiêu đề mỗi lần lưu (chỉ với bài chưa từng xuất bản); `true`: giữ nguyên slug hiện có. Bài đã xuất bản luôn là `true`. */
                    slugLocked?: boolean;
                    excerpt?: string;
                    /** @description Tài liệu Editor.js `{ time?, version?, blocks: [{ id?, type, data }] }`. Gửi lên là thay toàn bộ nội dung. Khối không hỗ trợ thì 422 `BLOCK_TYPE_NOT_ALLOWED`. */
                    content?: unknown;
                    /** @description `null` chỉ được khi là nháp. */
                    categoryId?: string | null;
                    /** @description Ngày xuất bản `YYYY-MM-DD`, hoặc `""`. */
                    date?: string;
                    featured?: boolean;
                    /** @description Ảnh bìa trong thư viện media; không bắt buộc. */
                    coverMediaId?: string | null;
                    alt?: string;
                    kw?: string;
                    meta?: string;
                    noindex?: boolean;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /** @description `""` khi bài chưa có slug (tiêu đề rỗng hoặc chỉ có ký hiệu). */
                        slug: string;
                        /** @description `false`: slug tự sinh từ tiêu đề mỗi lần lưu. Đặt thành `true` khi xuất bản lần đầu. */
                        slugLocked: boolean;
                        /** @description Đúng chữ người dùng nhập. */
                        excerpt: string;
                        /** @description `excerpt`, hoặc khi rỗng: đoạn văn đầu tiên bỏ thẻ, tối đa 110 ký tự. */
                        effectiveExcerpt: string;
                        /** @description Tài liệu Editor.js. */
                        content: {
                            time: number;
                            version: string;
                            editorVersion: string;
                            blocks: {
                                id: string;
                                /** @enum {string} */
                                type: "paragraph" | "header" | "list" | "code" | "table" | "callout" | "quote" | "image" | "embed" | "delimiter";
                                /** @description Dữ liệu khối đã làm sạch. `image`: `file` có `mediaId`, `url`, `width`, `height` (`url: null` khi ảnh không còn). `embed`: dựng lại `source`, `embed`, `width`, `height`. */
                                data: {
                                    [key: string]: unknown;
                                };
                            }[];
                        };
                        categoryId: string | null;
                        /** @description `null` khi bài chưa có chuyên mục. */
                        category: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            slug: string;
                        } | null;
                        /** @enum {string} */
                        status: "draft" | "published";
                        /** @description Ngày xuất bản `YYYY-MM-DD`, hoặc `""`. */
                        date: string;
                        featured: boolean;
                        coverMediaId: string | null;
                        /** @description Ảnh của `coverMediaId`; `null` khi không có ảnh bìa hoặc ảnh không còn trong thư viện. */
                        cover: {
                            /** Format: uuid */
                            id: string;
                            /** @description Ảnh gốc. */
                            url: string;
                            /** @description Ảnh thu nhỏ 400×400. */
                            thumbUrl: string;
                            width: number;
                            height: number;
                            alt: string;
                        } | null;
                        alt: string;
                        kw: string;
                        meta: string;
                        noindex: boolean;
                        /** @description Thời điểm xuất bản lần đầu; `null` khi chưa từng xuất bản. */
                        publishedAt: string | null;
                        createdBy: string | null;
                        updatedBy: string | null;
                        /** Format: date-time */
                        createdAt: string;
                        /** Format: date-time */
                        updatedAt: string;
                        /** @description Gửi lại khi sửa hoặc xoá bài. */
                        version: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`, `SLUG_TAKEN`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Entity. Mã lỗi (`code`): `BLOCK_TYPE_NOT_ALLOWED`, `POST_INVALID`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "posts.publish": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    version: number;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /** @description `""` khi bài chưa có slug (tiêu đề rỗng hoặc chỉ có ký hiệu). */
                        slug: string;
                        /** @description `false`: slug tự sinh từ tiêu đề mỗi lần lưu. Đặt thành `true` khi xuất bản lần đầu. */
                        slugLocked: boolean;
                        /** @description Đúng chữ người dùng nhập. */
                        excerpt: string;
                        /** @description `excerpt`, hoặc khi rỗng: đoạn văn đầu tiên bỏ thẻ, tối đa 110 ký tự. */
                        effectiveExcerpt: string;
                        /** @description Tài liệu Editor.js. */
                        content: {
                            time: number;
                            version: string;
                            editorVersion: string;
                            blocks: {
                                id: string;
                                /** @enum {string} */
                                type: "paragraph" | "header" | "list" | "code" | "table" | "callout" | "quote" | "image" | "embed" | "delimiter";
                                /** @description Dữ liệu khối đã làm sạch. `image`: `file` có `mediaId`, `url`, `width`, `height` (`url: null` khi ảnh không còn). `embed`: dựng lại `source`, `embed`, `width`, `height`. */
                                data: {
                                    [key: string]: unknown;
                                };
                            }[];
                        };
                        categoryId: string | null;
                        /** @description `null` khi bài chưa có chuyên mục. */
                        category: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            slug: string;
                        } | null;
                        /** @enum {string} */
                        status: "draft" | "published";
                        /** @description Ngày xuất bản `YYYY-MM-DD`, hoặc `""`. */
                        date: string;
                        featured: boolean;
                        coverMediaId: string | null;
                        /** @description Ảnh của `coverMediaId`; `null` khi không có ảnh bìa hoặc ảnh không còn trong thư viện. */
                        cover: {
                            /** Format: uuid */
                            id: string;
                            /** @description Ảnh gốc. */
                            url: string;
                            /** @description Ảnh thu nhỏ 400×400. */
                            thumbUrl: string;
                            width: number;
                            height: number;
                            alt: string;
                        } | null;
                        alt: string;
                        kw: string;
                        meta: string;
                        noindex: boolean;
                        /** @description Thời điểm xuất bản lần đầu; `null` khi chưa từng xuất bản. */
                        publishedAt: string | null;
                        createdBy: string | null;
                        updatedBy: string | null;
                        /** Format: date-time */
                        createdAt: string;
                        /** Format: date-time */
                        updatedAt: string;
                        /** @description Gửi lại khi sửa hoặc xoá bài. */
                        version: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Entity. Mã lỗi (`code`): `POST_INVALID`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "posts.unpublish": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    version: number;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uuid */
                        id: string;
                        title: string;
                        /** @description `""` khi bài chưa có slug (tiêu đề rỗng hoặc chỉ có ký hiệu). */
                        slug: string;
                        /** @description `false`: slug tự sinh từ tiêu đề mỗi lần lưu. Đặt thành `true` khi xuất bản lần đầu. */
                        slugLocked: boolean;
                        /** @description Đúng chữ người dùng nhập. */
                        excerpt: string;
                        /** @description `excerpt`, hoặc khi rỗng: đoạn văn đầu tiên bỏ thẻ, tối đa 110 ký tự. */
                        effectiveExcerpt: string;
                        /** @description Tài liệu Editor.js. */
                        content: {
                            time: number;
                            version: string;
                            editorVersion: string;
                            blocks: {
                                id: string;
                                /** @enum {string} */
                                type: "paragraph" | "header" | "list" | "code" | "table" | "callout" | "quote" | "image" | "embed" | "delimiter";
                                /** @description Dữ liệu khối đã làm sạch. `image`: `file` có `mediaId`, `url`, `width`, `height` (`url: null` khi ảnh không còn). `embed`: dựng lại `source`, `embed`, `width`, `height`. */
                                data: {
                                    [key: string]: unknown;
                                };
                            }[];
                        };
                        categoryId: string | null;
                        /** @description `null` khi bài chưa có chuyên mục. */
                        category: {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            slug: string;
                        } | null;
                        /** @enum {string} */
                        status: "draft" | "published";
                        /** @description Ngày xuất bản `YYYY-MM-DD`, hoặc `""`. */
                        date: string;
                        featured: boolean;
                        coverMediaId: string | null;
                        /** @description Ảnh của `coverMediaId`; `null` khi không có ảnh bìa hoặc ảnh không còn trong thư viện. */
                        cover: {
                            /** Format: uuid */
                            id: string;
                            /** @description Ảnh gốc. */
                            url: string;
                            /** @description Ảnh thu nhỏ 400×400. */
                            thumbUrl: string;
                            width: number;
                            height: number;
                            alt: string;
                        } | null;
                        alt: string;
                        kw: string;
                        meta: string;
                        noindex: boolean;
                        /** @description Thời điểm xuất bản lần đầu; `null` khi chưa từng xuất bản. */
                        publishedAt: string | null;
                        createdBy: string | null;
                        updatedBy: string | null;
                        /** Format: date-time */
                        createdAt: string;
                        /** Format: date-time */
                        updatedAt: string;
                        /** @description Gửi lại khi sửa hoặc xoá bài. */
                        version: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "roles.list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            /** Format: uuid */
                            id: string;
                            key: string;
                            name: string;
                            description: string;
                            /** @description Vai trò hệ thống: không sửa, không xoá được. */
                            isSystem: boolean;
                            /** @description Toàn quyền, kể cả các quyền thêm sau này. */
                            grantsAll: boolean;
                            permissions: string[];
                            version: number;
                            userCount: number;
                        }[];
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "roles.create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    key: string;
                    name: string;
                    description?: string;
                    permissions: string[];
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        role: {
                            /** Format: uuid */
                            id: string;
                            key: string;
                            name: string;
                            description: string;
                            /** @description Vai trò hệ thống: không sửa, không xoá được. */
                            isSystem: boolean;
                            /** @description Toàn quyền, kể cả các quyền thêm sau này. */
                            grantsAll: boolean;
                            permissions: string[];
                            version: number;
                        };
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`, `REAUTH_REQUIRED`, `PRIVILEGE_ESCALATION`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `ROLE_KEY_TAKEN`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "roles.remove": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`, `REAUTH_REQUIRED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `SYSTEM_ROLE`, `ROLE_IN_USE`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "roles.update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name?: string;
                    description?: string;
                    permissions?: string[];
                    version: number;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        role: {
                            /** Format: uuid */
                            id: string;
                            key: string;
                            name: string;
                            description: string;
                            /** @description Vai trò hệ thống: không sửa, không xoá được. */
                            isSystem: boolean;
                            /** @description Toàn quyền, kể cả các quyền thêm sau này. */
                            grantsAll: boolean;
                            permissions: string[];
                            version: number;
                        };
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`, `REAUTH_REQUIRED`, `PRIVILEGE_ESCALATION`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `SYSTEM_ROLE`, `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "site.get": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        draft: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            /** @description Sắp theo `position`. */
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                            }[];
                            /** @description Sắp theo `position`. */
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                                version: number;
                            }[];
                        };
                        /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                        published: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                            }[];
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                            }[];
                        } | null;
                        /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                        dirty: boolean;
                        /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                        draftHash: string;
                        /** @description Version của settings, gửi lại khi sửa settings. */
                        version: number;
                        publicationNumber: number | null;
                        publishedAt: string | null;
                        /** @description Id người xuất bản. */
                        publishedBy: string | null;
                        /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                        warnings: {
                            path: string;
                            message: string;
                        }[];
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "site.listPublications": {
        parameters: {
            query?: {
                page?: number;
                perPage?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Mới nhất trước. */
                        items: {
                            /** Format: uuid */
                            id: string;
                            number: number;
                            /** Format: date-time */
                            publishedAt: string;
                            /** @description Id người xuất bản. */
                            publishedBy: string | null;
                        }[];
                        total: number;
                        page: number;
                        perPage: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "site.restore": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    draftHash: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        draft: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            /** @description Sắp theo `position`. */
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                            }[];
                            /** @description Sắp theo `position`. */
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                                version: number;
                            }[];
                        };
                        /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                        published: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                            }[];
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                            }[];
                        } | null;
                        /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                        dirty: boolean;
                        /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                        draftHash: string;
                        /** @description Version của settings, gửi lại khi sửa settings. */
                        version: number;
                        publicationNumber: number | null;
                        publishedAt: string | null;
                        /** @description Id người xuất bản. */
                        publishedBy: string | null;
                        /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                        warnings: {
                            path: string;
                            message: string;
                        }[];
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "site.publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    draftHash: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        publication: {
                            /** Format: uuid */
                            id: string;
                            number: number;
                            /** Format: date-time */
                            publishedAt: string;
                            /** @description Id người xuất bản. */
                            publishedBy: string | null;
                        };
                        site: {
                            draft: {
                                settings: {
                                    /** @default  */
                                    name: string;
                                    /** @default  */
                                    phone: string;
                                    /** @default  */
                                    email: string;
                                    /** @default  */
                                    hours: string;
                                    /** @default  */
                                    address: string;
                                    /** @default  */
                                    seoTitle: string;
                                    /** @default  */
                                    seoDesc: string;
                                    /** @default false */
                                    showEyebrow: boolean;
                                    /** @default  */
                                    eyebrow: string;
                                    /** @default  */
                                    h1a: string;
                                    /** @default  */
                                    h1b: string;
                                    /** @default  */
                                    h1hl: string;
                                    /** @default  */
                                    lead: string;
                                    /** @default  */
                                    cta1: string;
                                    /** @default  */
                                    cta2: string;
                                    stats: {
                                        /** @default  */
                                        v: string;
                                        /** @default  */
                                        l: string;
                                    }[];
                                };
                                /** @description Sắp theo `position`. */
                                services: {
                                    /** @enum {string} */
                                    icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                    title: string;
                                    /** @default  */
                                    desc: string;
                                    /** @default  */
                                    time: string;
                                    /** @default true */
                                    visible: boolean;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    version: number;
                                }[];
                                /** @description Sắp theo `position`. */
                                team: {
                                    name: string;
                                    /** @default  */
                                    role: string;
                                    since: number;
                                    /** @default  */
                                    bio: string;
                                    /** @default true */
                                    visible: boolean;
                                    /**
                                     * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                     * @default null
                                     */
                                    photoMediaId: string | null;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    version: number;
                                    /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                    photo: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                                timeline: {
                                    year: string;
                                    title: string;
                                    /** @default  */
                                    body: string;
                                    /**
                                     * @default none
                                     * @enum {string}
                                     */
                                    media: "photos" | "quote" | "none";
                                    /**
                                     * @default {
                                     *       "text": "",
                                     *       "by": "",
                                     *       "role": ""
                                     *     }
                                     */
                                    quote: {
                                        /** @default  */
                                        text: string;
                                        /** @default  */
                                        by: string;
                                        /** @default  */
                                        role: string;
                                    };
                                    photos: {
                                        /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                        mediaId: string | null;
                                        label: string;
                                        /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                        image: {
                                            /** Format: uuid */
                                            id: string;
                                            /** @description Ảnh gốc. */
                                            url: string;
                                            /** @description Ảnh thu nhỏ 400×400. */
                                            thumbUrl: string;
                                            width: number;
                                            height: number;
                                            alt: string;
                                        } | null;
                                    }[];
                                    /** Format: uuid */
                                    id: string;
                                    version: number;
                                }[];
                            };
                            /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                            published: {
                                settings: {
                                    /** @default  */
                                    name: string;
                                    /** @default  */
                                    phone: string;
                                    /** @default  */
                                    email: string;
                                    /** @default  */
                                    hours: string;
                                    /** @default  */
                                    address: string;
                                    /** @default  */
                                    seoTitle: string;
                                    /** @default  */
                                    seoDesc: string;
                                    /** @default false */
                                    showEyebrow: boolean;
                                    /** @default  */
                                    eyebrow: string;
                                    /** @default  */
                                    h1a: string;
                                    /** @default  */
                                    h1b: string;
                                    /** @default  */
                                    h1hl: string;
                                    /** @default  */
                                    lead: string;
                                    /** @default  */
                                    cta1: string;
                                    /** @default  */
                                    cta2: string;
                                    stats: {
                                        /** @default  */
                                        v: string;
                                        /** @default  */
                                        l: string;
                                    }[];
                                };
                                services: {
                                    /** @enum {string} */
                                    icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                    title: string;
                                    /** @default  */
                                    desc: string;
                                    /** @default  */
                                    time: string;
                                    /** @default true */
                                    visible: boolean;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                }[];
                                team: {
                                    name: string;
                                    /** @default  */
                                    role: string;
                                    since: number;
                                    /** @default  */
                                    bio: string;
                                    /** @default true */
                                    visible: boolean;
                                    /**
                                     * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                     * @default null
                                     */
                                    photoMediaId: string | null;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                    photo: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                timeline: {
                                    year: string;
                                    title: string;
                                    /** @default  */
                                    body: string;
                                    /**
                                     * @default none
                                     * @enum {string}
                                     */
                                    media: "photos" | "quote" | "none";
                                    /**
                                     * @default {
                                     *       "text": "",
                                     *       "by": "",
                                     *       "role": ""
                                     *     }
                                     */
                                    quote: {
                                        /** @default  */
                                        text: string;
                                        /** @default  */
                                        by: string;
                                        /** @default  */
                                        role: string;
                                    };
                                    photos: {
                                        /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                        mediaId: string | null;
                                        label: string;
                                        /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                        image: {
                                            /** Format: uuid */
                                            id: string;
                                            /** @description Ảnh gốc. */
                                            url: string;
                                            /** @description Ảnh thu nhỏ 400×400. */
                                            thumbUrl: string;
                                            width: number;
                                            height: number;
                                            alt: string;
                                        } | null;
                                    }[];
                                    /** Format: uuid */
                                    id: string;
                                }[];
                            } | null;
                            /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                            dirty: boolean;
                            /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                            draftHash: string;
                            /** @description Version của settings, gửi lại khi sửa settings. */
                            version: number;
                            publicationNumber: number | null;
                            publishedAt: string | null;
                            /** @description Id người xuất bản. */
                            publishedBy: string | null;
                            /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                            warnings: {
                                path: string;
                                message: string;
                            }[];
                        };
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`, `NOTHING_TO_PUBLISH`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Entity. Mã lỗi (`code`): `SITE_INVALID`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "site.revert": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    draftHash: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        draft: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            /** @description Sắp theo `position`. */
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                            }[];
                            /** @description Sắp theo `position`. */
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                                version: number;
                            }[];
                        };
                        /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                        published: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                            }[];
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                            }[];
                        } | null;
                        /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                        dirty: boolean;
                        /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                        draftHash: string;
                        /** @description Version của settings, gửi lại khi sửa settings. */
                        version: number;
                        publicationNumber: number | null;
                        publishedAt: string | null;
                        /** @description Id người xuất bản. */
                        publishedBy: string | null;
                        /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                        warnings: {
                            path: string;
                            message: string;
                        }[];
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`, `NOT_PUBLISHED`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "siteItems.createService": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                    title: string;
                    /** @default  */
                    desc?: string;
                    /** @default  */
                    time?: string;
                    /** @default true */
                    visible?: boolean;
                    position?: number;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * Format: uuid
                         * @description Id của mục vừa tạo.
                         */
                        id: string;
                        site: {
                            draft: {
                                settings: {
                                    /** @default  */
                                    name: string;
                                    /** @default  */
                                    phone: string;
                                    /** @default  */
                                    email: string;
                                    /** @default  */
                                    hours: string;
                                    /** @default  */
                                    address: string;
                                    /** @default  */
                                    seoTitle: string;
                                    /** @default  */
                                    seoDesc: string;
                                    /** @default false */
                                    showEyebrow: boolean;
                                    /** @default  */
                                    eyebrow: string;
                                    /** @default  */
                                    h1a: string;
                                    /** @default  */
                                    h1b: string;
                                    /** @default  */
                                    h1hl: string;
                                    /** @default  */
                                    lead: string;
                                    /** @default  */
                                    cta1: string;
                                    /** @default  */
                                    cta2: string;
                                    stats: {
                                        /** @default  */
                                        v: string;
                                        /** @default  */
                                        l: string;
                                    }[];
                                };
                                /** @description Sắp theo `position`. */
                                services: {
                                    /** @enum {string} */
                                    icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                    title: string;
                                    /** @default  */
                                    desc: string;
                                    /** @default  */
                                    time: string;
                                    /** @default true */
                                    visible: boolean;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    version: number;
                                }[];
                                /** @description Sắp theo `position`. */
                                team: {
                                    name: string;
                                    /** @default  */
                                    role: string;
                                    since: number;
                                    /** @default  */
                                    bio: string;
                                    /** @default true */
                                    visible: boolean;
                                    /**
                                     * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                     * @default null
                                     */
                                    photoMediaId: string | null;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    version: number;
                                    /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                    photo: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                                timeline: {
                                    year: string;
                                    title: string;
                                    /** @default  */
                                    body: string;
                                    /**
                                     * @default none
                                     * @enum {string}
                                     */
                                    media: "photos" | "quote" | "none";
                                    /**
                                     * @default {
                                     *       "text": "",
                                     *       "by": "",
                                     *       "role": ""
                                     *     }
                                     */
                                    quote: {
                                        /** @default  */
                                        text: string;
                                        /** @default  */
                                        by: string;
                                        /** @default  */
                                        role: string;
                                    };
                                    photos: {
                                        /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                        mediaId: string | null;
                                        label: string;
                                        /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                        image: {
                                            /** Format: uuid */
                                            id: string;
                                            /** @description Ảnh gốc. */
                                            url: string;
                                            /** @description Ảnh thu nhỏ 400×400. */
                                            thumbUrl: string;
                                            width: number;
                                            height: number;
                                            alt: string;
                                        } | null;
                                    }[];
                                    /** Format: uuid */
                                    id: string;
                                    version: number;
                                }[];
                            };
                            /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                            published: {
                                settings: {
                                    /** @default  */
                                    name: string;
                                    /** @default  */
                                    phone: string;
                                    /** @default  */
                                    email: string;
                                    /** @default  */
                                    hours: string;
                                    /** @default  */
                                    address: string;
                                    /** @default  */
                                    seoTitle: string;
                                    /** @default  */
                                    seoDesc: string;
                                    /** @default false */
                                    showEyebrow: boolean;
                                    /** @default  */
                                    eyebrow: string;
                                    /** @default  */
                                    h1a: string;
                                    /** @default  */
                                    h1b: string;
                                    /** @default  */
                                    h1hl: string;
                                    /** @default  */
                                    lead: string;
                                    /** @default  */
                                    cta1: string;
                                    /** @default  */
                                    cta2: string;
                                    stats: {
                                        /** @default  */
                                        v: string;
                                        /** @default  */
                                        l: string;
                                    }[];
                                };
                                services: {
                                    /** @enum {string} */
                                    icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                    title: string;
                                    /** @default  */
                                    desc: string;
                                    /** @default  */
                                    time: string;
                                    /** @default true */
                                    visible: boolean;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                }[];
                                team: {
                                    name: string;
                                    /** @default  */
                                    role: string;
                                    since: number;
                                    /** @default  */
                                    bio: string;
                                    /** @default true */
                                    visible: boolean;
                                    /**
                                     * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                     * @default null
                                     */
                                    photoMediaId: string | null;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                    photo: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                timeline: {
                                    year: string;
                                    title: string;
                                    /** @default  */
                                    body: string;
                                    /**
                                     * @default none
                                     * @enum {string}
                                     */
                                    media: "photos" | "quote" | "none";
                                    /**
                                     * @default {
                                     *       "text": "",
                                     *       "by": "",
                                     *       "role": ""
                                     *     }
                                     */
                                    quote: {
                                        /** @default  */
                                        text: string;
                                        /** @default  */
                                        by: string;
                                        /** @default  */
                                        role: string;
                                    };
                                    photos: {
                                        /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                        mediaId: string | null;
                                        label: string;
                                        /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                        image: {
                                            /** Format: uuid */
                                            id: string;
                                            /** @description Ảnh gốc. */
                                            url: string;
                                            /** @description Ảnh thu nhỏ 400×400. */
                                            thumbUrl: string;
                                            width: number;
                                            height: number;
                                            alt: string;
                                        } | null;
                                    }[];
                                    /** Format: uuid */
                                    id: string;
                                }[];
                            } | null;
                            /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                            dirty: boolean;
                            /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                            draftHash: string;
                            /** @description Version của settings, gửi lại khi sửa settings. */
                            version: number;
                            publicationNumber: number | null;
                            publishedAt: string | null;
                            /** @description Id người xuất bản. */
                            publishedBy: string | null;
                            /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                            warnings: {
                                path: string;
                                message: string;
                            }[];
                        };
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `SITE_ITEM_LIMIT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "siteItems.removeService": {
        parameters: {
            query: {
                version: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        draft: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            /** @description Sắp theo `position`. */
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                            }[];
                            /** @description Sắp theo `position`. */
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                                version: number;
                            }[];
                        };
                        /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                        published: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                            }[];
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                            }[];
                        } | null;
                        /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                        dirty: boolean;
                        /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                        draftHash: string;
                        /** @description Version của settings, gửi lại khi sửa settings. */
                        version: number;
                        publicationNumber: number | null;
                        publishedAt: string | null;
                        /** @description Id người xuất bản. */
                        publishedBy: string | null;
                        /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                        warnings: {
                            path: string;
                            message: string;
                        }[];
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "siteItems.updateService": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    version: number;
                    position?: number;
                    /** @enum {string} */
                    icon?: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                    title?: string;
                    desc?: string;
                    time?: string;
                    visible?: boolean;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        draft: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            /** @description Sắp theo `position`. */
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                            }[];
                            /** @description Sắp theo `position`. */
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                                version: number;
                            }[];
                        };
                        /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                        published: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                            }[];
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                            }[];
                        } | null;
                        /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                        dirty: boolean;
                        /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                        draftHash: string;
                        /** @description Version của settings, gửi lại khi sửa settings. */
                        version: number;
                        publicationNumber: number | null;
                        publishedAt: string | null;
                        /** @description Id người xuất bản. */
                        publishedBy: string | null;
                        /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                        warnings: {
                            path: string;
                            message: string;
                        }[];
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "site.update": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    version: number;
                    name?: string;
                    phone?: string;
                    email?: string;
                    hours?: string;
                    address?: string;
                    seoTitle?: string;
                    seoDesc?: string;
                    showEyebrow?: boolean;
                    eyebrow?: string;
                    h1a?: string;
                    h1b?: string;
                    h1hl?: string;
                    lead?: string;
                    cta1?: string;
                    cta2?: string;
                    stats?: {
                        /** @default  */
                        v?: string;
                        /** @default  */
                        l?: string;
                    }[];
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        draft: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            /** @description Sắp theo `position`. */
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                            }[];
                            /** @description Sắp theo `position`. */
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                                version: number;
                            }[];
                        };
                        /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                        published: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                            }[];
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                            }[];
                        } | null;
                        /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                        dirty: boolean;
                        /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                        draftHash: string;
                        /** @description Version của settings, gửi lại khi sửa settings. */
                        version: number;
                        publicationNumber: number | null;
                        publishedAt: string | null;
                        /** @description Id người xuất bản. */
                        publishedBy: string | null;
                        /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                        warnings: {
                            path: string;
                            message: string;
                        }[];
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "siteItems.createTeamMember": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    /** @default  */
                    role?: string;
                    since: number;
                    /** @default  */
                    bio?: string;
                    /** @default true */
                    visible?: boolean;
                    /**
                     * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                     * @default null
                     */
                    photoMediaId?: string | null;
                    position?: number;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * Format: uuid
                         * @description Id của mục vừa tạo.
                         */
                        id: string;
                        site: {
                            draft: {
                                settings: {
                                    /** @default  */
                                    name: string;
                                    /** @default  */
                                    phone: string;
                                    /** @default  */
                                    email: string;
                                    /** @default  */
                                    hours: string;
                                    /** @default  */
                                    address: string;
                                    /** @default  */
                                    seoTitle: string;
                                    /** @default  */
                                    seoDesc: string;
                                    /** @default false */
                                    showEyebrow: boolean;
                                    /** @default  */
                                    eyebrow: string;
                                    /** @default  */
                                    h1a: string;
                                    /** @default  */
                                    h1b: string;
                                    /** @default  */
                                    h1hl: string;
                                    /** @default  */
                                    lead: string;
                                    /** @default  */
                                    cta1: string;
                                    /** @default  */
                                    cta2: string;
                                    stats: {
                                        /** @default  */
                                        v: string;
                                        /** @default  */
                                        l: string;
                                    }[];
                                };
                                /** @description Sắp theo `position`. */
                                services: {
                                    /** @enum {string} */
                                    icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                    title: string;
                                    /** @default  */
                                    desc: string;
                                    /** @default  */
                                    time: string;
                                    /** @default true */
                                    visible: boolean;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    version: number;
                                }[];
                                /** @description Sắp theo `position`. */
                                team: {
                                    name: string;
                                    /** @default  */
                                    role: string;
                                    since: number;
                                    /** @default  */
                                    bio: string;
                                    /** @default true */
                                    visible: boolean;
                                    /**
                                     * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                     * @default null
                                     */
                                    photoMediaId: string | null;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    version: number;
                                    /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                    photo: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                                timeline: {
                                    year: string;
                                    title: string;
                                    /** @default  */
                                    body: string;
                                    /**
                                     * @default none
                                     * @enum {string}
                                     */
                                    media: "photos" | "quote" | "none";
                                    /**
                                     * @default {
                                     *       "text": "",
                                     *       "by": "",
                                     *       "role": ""
                                     *     }
                                     */
                                    quote: {
                                        /** @default  */
                                        text: string;
                                        /** @default  */
                                        by: string;
                                        /** @default  */
                                        role: string;
                                    };
                                    photos: {
                                        /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                        mediaId: string | null;
                                        label: string;
                                        /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                        image: {
                                            /** Format: uuid */
                                            id: string;
                                            /** @description Ảnh gốc. */
                                            url: string;
                                            /** @description Ảnh thu nhỏ 400×400. */
                                            thumbUrl: string;
                                            width: number;
                                            height: number;
                                            alt: string;
                                        } | null;
                                    }[];
                                    /** Format: uuid */
                                    id: string;
                                    version: number;
                                }[];
                            };
                            /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                            published: {
                                settings: {
                                    /** @default  */
                                    name: string;
                                    /** @default  */
                                    phone: string;
                                    /** @default  */
                                    email: string;
                                    /** @default  */
                                    hours: string;
                                    /** @default  */
                                    address: string;
                                    /** @default  */
                                    seoTitle: string;
                                    /** @default  */
                                    seoDesc: string;
                                    /** @default false */
                                    showEyebrow: boolean;
                                    /** @default  */
                                    eyebrow: string;
                                    /** @default  */
                                    h1a: string;
                                    /** @default  */
                                    h1b: string;
                                    /** @default  */
                                    h1hl: string;
                                    /** @default  */
                                    lead: string;
                                    /** @default  */
                                    cta1: string;
                                    /** @default  */
                                    cta2: string;
                                    stats: {
                                        /** @default  */
                                        v: string;
                                        /** @default  */
                                        l: string;
                                    }[];
                                };
                                services: {
                                    /** @enum {string} */
                                    icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                    title: string;
                                    /** @default  */
                                    desc: string;
                                    /** @default  */
                                    time: string;
                                    /** @default true */
                                    visible: boolean;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                }[];
                                team: {
                                    name: string;
                                    /** @default  */
                                    role: string;
                                    since: number;
                                    /** @default  */
                                    bio: string;
                                    /** @default true */
                                    visible: boolean;
                                    /**
                                     * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                     * @default null
                                     */
                                    photoMediaId: string | null;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                    photo: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                timeline: {
                                    year: string;
                                    title: string;
                                    /** @default  */
                                    body: string;
                                    /**
                                     * @default none
                                     * @enum {string}
                                     */
                                    media: "photos" | "quote" | "none";
                                    /**
                                     * @default {
                                     *       "text": "",
                                     *       "by": "",
                                     *       "role": ""
                                     *     }
                                     */
                                    quote: {
                                        /** @default  */
                                        text: string;
                                        /** @default  */
                                        by: string;
                                        /** @default  */
                                        role: string;
                                    };
                                    photos: {
                                        /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                        mediaId: string | null;
                                        label: string;
                                        /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                        image: {
                                            /** Format: uuid */
                                            id: string;
                                            /** @description Ảnh gốc. */
                                            url: string;
                                            /** @description Ảnh thu nhỏ 400×400. */
                                            thumbUrl: string;
                                            width: number;
                                            height: number;
                                            alt: string;
                                        } | null;
                                    }[];
                                    /** Format: uuid */
                                    id: string;
                                }[];
                            } | null;
                            /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                            dirty: boolean;
                            /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                            draftHash: string;
                            /** @description Version của settings, gửi lại khi sửa settings. */
                            version: number;
                            publicationNumber: number | null;
                            publishedAt: string | null;
                            /** @description Id người xuất bản. */
                            publishedBy: string | null;
                            /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                            warnings: {
                                path: string;
                                message: string;
                            }[];
                        };
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `SITE_ITEM_LIMIT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "siteItems.removeTeamMember": {
        parameters: {
            query: {
                version: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        draft: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            /** @description Sắp theo `position`. */
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                            }[];
                            /** @description Sắp theo `position`. */
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                                version: number;
                            }[];
                        };
                        /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                        published: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                            }[];
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                            }[];
                        } | null;
                        /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                        dirty: boolean;
                        /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                        draftHash: string;
                        /** @description Version của settings, gửi lại khi sửa settings. */
                        version: number;
                        publicationNumber: number | null;
                        publishedAt: string | null;
                        /** @description Id người xuất bản. */
                        publishedBy: string | null;
                        /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                        warnings: {
                            path: string;
                            message: string;
                        }[];
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "siteItems.updateTeamMember": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    version: number;
                    position?: number;
                    name?: string;
                    role?: string;
                    since?: number;
                    bio?: string;
                    visible?: boolean;
                    /** @description Id ảnh trong thư viện media; `null`: không có ảnh. */
                    photoMediaId?: string | null;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        draft: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            /** @description Sắp theo `position`. */
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                            }[];
                            /** @description Sắp theo `position`. */
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                                version: number;
                            }[];
                        };
                        /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                        published: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                            }[];
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                            }[];
                        } | null;
                        /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                        dirty: boolean;
                        /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                        draftHash: string;
                        /** @description Version của settings, gửi lại khi sửa settings. */
                        version: number;
                        publicationNumber: number | null;
                        publishedAt: string | null;
                        /** @description Id người xuất bản. */
                        publishedBy: string | null;
                        /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                        warnings: {
                            path: string;
                            message: string;
                        }[];
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "siteItems.createTimelineEntry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    year: string;
                    title: string;
                    /** @default  */
                    body?: string;
                    /**
                     * @default none
                     * @enum {string}
                     */
                    media?: "photos" | "quote" | "none";
                    /**
                     * @default {
                     *       "text": "",
                     *       "by": "",
                     *       "role": ""
                     *     }
                     */
                    quote?: {
                        /** @default  */
                        text?: string;
                        /** @default  */
                        by?: string;
                        /** @default  */
                        role?: string;
                    };
                    /**
                     * @description Tối đa 5 ảnh. Khi sửa, gửi `photos` thì thay cả mảng.
                     * @default []
                     */
                    photos?: {
                        /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                        mediaId: string | null;
                        label: string;
                    }[];
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * Format: uuid
                         * @description Id của mục vừa tạo.
                         */
                        id: string;
                        site: {
                            draft: {
                                settings: {
                                    /** @default  */
                                    name: string;
                                    /** @default  */
                                    phone: string;
                                    /** @default  */
                                    email: string;
                                    /** @default  */
                                    hours: string;
                                    /** @default  */
                                    address: string;
                                    /** @default  */
                                    seoTitle: string;
                                    /** @default  */
                                    seoDesc: string;
                                    /** @default false */
                                    showEyebrow: boolean;
                                    /** @default  */
                                    eyebrow: string;
                                    /** @default  */
                                    h1a: string;
                                    /** @default  */
                                    h1b: string;
                                    /** @default  */
                                    h1hl: string;
                                    /** @default  */
                                    lead: string;
                                    /** @default  */
                                    cta1: string;
                                    /** @default  */
                                    cta2: string;
                                    stats: {
                                        /** @default  */
                                        v: string;
                                        /** @default  */
                                        l: string;
                                    }[];
                                };
                                /** @description Sắp theo `position`. */
                                services: {
                                    /** @enum {string} */
                                    icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                    title: string;
                                    /** @default  */
                                    desc: string;
                                    /** @default  */
                                    time: string;
                                    /** @default true */
                                    visible: boolean;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    version: number;
                                }[];
                                /** @description Sắp theo `position`. */
                                team: {
                                    name: string;
                                    /** @default  */
                                    role: string;
                                    since: number;
                                    /** @default  */
                                    bio: string;
                                    /** @default true */
                                    visible: boolean;
                                    /**
                                     * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                     * @default null
                                     */
                                    photoMediaId: string | null;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    version: number;
                                    /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                    photo: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                                timeline: {
                                    year: string;
                                    title: string;
                                    /** @default  */
                                    body: string;
                                    /**
                                     * @default none
                                     * @enum {string}
                                     */
                                    media: "photos" | "quote" | "none";
                                    /**
                                     * @default {
                                     *       "text": "",
                                     *       "by": "",
                                     *       "role": ""
                                     *     }
                                     */
                                    quote: {
                                        /** @default  */
                                        text: string;
                                        /** @default  */
                                        by: string;
                                        /** @default  */
                                        role: string;
                                    };
                                    photos: {
                                        /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                        mediaId: string | null;
                                        label: string;
                                        /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                        image: {
                                            /** Format: uuid */
                                            id: string;
                                            /** @description Ảnh gốc. */
                                            url: string;
                                            /** @description Ảnh thu nhỏ 400×400. */
                                            thumbUrl: string;
                                            width: number;
                                            height: number;
                                            alt: string;
                                        } | null;
                                    }[];
                                    /** Format: uuid */
                                    id: string;
                                    version: number;
                                }[];
                            };
                            /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                            published: {
                                settings: {
                                    /** @default  */
                                    name: string;
                                    /** @default  */
                                    phone: string;
                                    /** @default  */
                                    email: string;
                                    /** @default  */
                                    hours: string;
                                    /** @default  */
                                    address: string;
                                    /** @default  */
                                    seoTitle: string;
                                    /** @default  */
                                    seoDesc: string;
                                    /** @default false */
                                    showEyebrow: boolean;
                                    /** @default  */
                                    eyebrow: string;
                                    /** @default  */
                                    h1a: string;
                                    /** @default  */
                                    h1b: string;
                                    /** @default  */
                                    h1hl: string;
                                    /** @default  */
                                    lead: string;
                                    /** @default  */
                                    cta1: string;
                                    /** @default  */
                                    cta2: string;
                                    stats: {
                                        /** @default  */
                                        v: string;
                                        /** @default  */
                                        l: string;
                                    }[];
                                };
                                services: {
                                    /** @enum {string} */
                                    icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                    title: string;
                                    /** @default  */
                                    desc: string;
                                    /** @default  */
                                    time: string;
                                    /** @default true */
                                    visible: boolean;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                }[];
                                team: {
                                    name: string;
                                    /** @default  */
                                    role: string;
                                    since: number;
                                    /** @default  */
                                    bio: string;
                                    /** @default true */
                                    visible: boolean;
                                    /**
                                     * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                     * @default null
                                     */
                                    photoMediaId: string | null;
                                    /** Format: uuid */
                                    id: string;
                                    position: number;
                                    /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                    photo: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                timeline: {
                                    year: string;
                                    title: string;
                                    /** @default  */
                                    body: string;
                                    /**
                                     * @default none
                                     * @enum {string}
                                     */
                                    media: "photos" | "quote" | "none";
                                    /**
                                     * @default {
                                     *       "text": "",
                                     *       "by": "",
                                     *       "role": ""
                                     *     }
                                     */
                                    quote: {
                                        /** @default  */
                                        text: string;
                                        /** @default  */
                                        by: string;
                                        /** @default  */
                                        role: string;
                                    };
                                    photos: {
                                        /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                        mediaId: string | null;
                                        label: string;
                                        /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                        image: {
                                            /** Format: uuid */
                                            id: string;
                                            /** @description Ảnh gốc. */
                                            url: string;
                                            /** @description Ảnh thu nhỏ 400×400. */
                                            thumbUrl: string;
                                            width: number;
                                            height: number;
                                            alt: string;
                                        } | null;
                                    }[];
                                    /** Format: uuid */
                                    id: string;
                                }[];
                            } | null;
                            /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                            dirty: boolean;
                            /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                            draftHash: string;
                            /** @description Version của settings, gửi lại khi sửa settings. */
                            version: number;
                            publicationNumber: number | null;
                            publishedAt: string | null;
                            /** @description Id người xuất bản. */
                            publishedBy: string | null;
                            /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                            warnings: {
                                path: string;
                                message: string;
                            }[];
                        };
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `SITE_ITEM_LIMIT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "siteItems.removeTimelineEntry": {
        parameters: {
            query: {
                version: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        draft: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            /** @description Sắp theo `position`. */
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                            }[];
                            /** @description Sắp theo `position`. */
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                                version: number;
                            }[];
                        };
                        /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                        published: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                            }[];
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                            }[];
                        } | null;
                        /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                        dirty: boolean;
                        /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                        draftHash: string;
                        /** @description Version của settings, gửi lại khi sửa settings. */
                        version: number;
                        publicationNumber: number | null;
                        publishedAt: string | null;
                        /** @description Id người xuất bản. */
                        publishedBy: string | null;
                        /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                        warnings: {
                            path: string;
                            message: string;
                        }[];
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "siteItems.updateTimelineEntry": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    version: number;
                    year?: string;
                    title?: string;
                    body?: string;
                    /** @enum {string} */
                    media?: "photos" | "quote" | "none";
                    quote?: {
                        text?: string;
                        by?: string;
                        role?: string;
                    };
                    /** @description Tối đa 5 ảnh. Khi sửa, gửi `photos` thì thay cả mảng. */
                    photos?: {
                        /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                        mediaId: string | null;
                        label: string;
                    }[];
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        draft: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            /** @description Sắp theo `position`. */
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                            }[];
                            /** @description Sắp theo `position`. */
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                version: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            /** @description Sắp theo năm tăng dần, cùng năm theo `id`. */
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                                version: number;
                            }[];
                        };
                        /** @description Bản xuất bản gần nhất; `null` khi chưa từng xuất bản. */
                        published: {
                            settings: {
                                /** @default  */
                                name: string;
                                /** @default  */
                                phone: string;
                                /** @default  */
                                email: string;
                                /** @default  */
                                hours: string;
                                /** @default  */
                                address: string;
                                /** @default  */
                                seoTitle: string;
                                /** @default  */
                                seoDesc: string;
                                /** @default false */
                                showEyebrow: boolean;
                                /** @default  */
                                eyebrow: string;
                                /** @default  */
                                h1a: string;
                                /** @default  */
                                h1b: string;
                                /** @default  */
                                h1hl: string;
                                /** @default  */
                                lead: string;
                                /** @default  */
                                cta1: string;
                                /** @default  */
                                cta2: string;
                                stats: {
                                    /** @default  */
                                    v: string;
                                    /** @default  */
                                    l: string;
                                }[];
                            };
                            services: {
                                /** @enum {string} */
                                icon: "laptop" | "apple" | "monitor" | "hard-drive" | "cpu" | "building-2" | "smartphone" | "tablet" | "printer" | "keyboard" | "battery-charging" | "server" | "wifi" | "mouse" | "shield-check" | "wrench";
                                title: string;
                                /** @default  */
                                desc: string;
                                /** @default  */
                                time: string;
                                /** @default true */
                                visible: boolean;
                                /** Format: uuid */
                                id: string;
                                position: number;
                            }[];
                            team: {
                                name: string;
                                /** @default  */
                                role: string;
                                since: number;
                                /** @default  */
                                bio: string;
                                /** @default true */
                                visible: boolean;
                                /**
                                 * @description Id ảnh trong thư viện media; `null`: không có ảnh.
                                 * @default null
                                 */
                                photoMediaId: string | null;
                                /** Format: uuid */
                                id: string;
                                position: number;
                                /** @description Ảnh của `photoMediaId`; `null` khi không có ảnh hoặc ảnh không còn trong thư viện. */
                                photo: {
                                    /** Format: uuid */
                                    id: string;
                                    /** @description Ảnh gốc. */
                                    url: string;
                                    /** @description Ảnh thu nhỏ 400×400. */
                                    thumbUrl: string;
                                    width: number;
                                    height: number;
                                    alt: string;
                                } | null;
                            }[];
                            timeline: {
                                year: string;
                                title: string;
                                /** @default  */
                                body: string;
                                /**
                                 * @default none
                                 * @enum {string}
                                 */
                                media: "photos" | "quote" | "none";
                                /**
                                 * @default {
                                 *       "text": "",
                                 *       "by": "",
                                 *       "role": ""
                                 *     }
                                 */
                                quote: {
                                    /** @default  */
                                    text: string;
                                    /** @default  */
                                    by: string;
                                    /** @default  */
                                    role: string;
                                };
                                photos: {
                                    /** @description Id ảnh trong thư viện media; `null`: chưa gắn ảnh. */
                                    mediaId: string | null;
                                    label: string;
                                    /** @description Ảnh của `mediaId`; `null` khi chưa gắn ảnh hoặc ảnh không còn trong thư viện. */
                                    image: {
                                        /** Format: uuid */
                                        id: string;
                                        /** @description Ảnh gốc. */
                                        url: string;
                                        /** @description Ảnh thu nhỏ 400×400. */
                                        thumbUrl: string;
                                        width: number;
                                        height: number;
                                        alt: string;
                                    } | null;
                                }[];
                                /** Format: uuid */
                                id: string;
                            }[];
                        } | null;
                        /** @description Nháp khác bản xuất bản gần nhất (hoặc chưa từng xuất bản). */
                        dirty: boolean;
                        /** @description Dấu vết của nháp; gửi lại khi xuất bản, hoàn tác hoặc khôi phục. */
                        draftHash: string;
                        /** @description Version của settings, gửi lại khi sửa settings. */
                        version: number;
                        publicationNumber: number | null;
                        publishedAt: string | null;
                        /** @description Id người xuất bản. */
                        publishedBy: string | null;
                        /** @description Cảnh báo mềm (không chặn), ví dụ tiêu đề SEO quá dài. */
                        warnings: {
                            path: string;
                            message: string;
                        }[];
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "users.list": {
        parameters: {
            query?: {
                q?: string;
                status?: "pending" | "active" | "disabled";
                page?: number;
                perPage?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            /** Format: uuid */
                            id: string;
                            email: string;
                            name: string;
                            /** @enum {string} */
                            status: "pending" | "active" | "disabled";
                            roleIds: string[];
                            version: number;
                        }[];
                        total: number;
                        page: number;
                        perPage: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "users.create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    email: string;
                    name: string;
                    roleIds: string[];
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        user: {
                            /** Format: uuid */
                            id: string;
                            email: string;
                            name: string;
                            /** @enum {string} */
                            status: "pending" | "active" | "disabled";
                            roleIds: string[];
                            version: number;
                        };
                        setupLink: {
                            /**
                             * Format: uri
                             * @description Link thiết lập/đặt lại mật khẩu, dùng một lần. Token nằm sau `#token=`.
                             */
                            link: string;
                            /** Format: date-time */
                            expiresAt: string;
                        };
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`, `REAUTH_REQUIRED`, `PRIVILEGE_ESCALATION`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `EMAIL_TAKEN`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "users.update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name?: string;
                    roleIds?: string[];
                    version: number;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        user: {
                            /** Format: uuid */
                            id: string;
                            email: string;
                            name: string;
                            /** @enum {string} */
                            status: "pending" | "active" | "disabled";
                            roleIds: string[];
                            version: number;
                        };
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`, `MALFORMED_JSON`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`, `REAUTH_REQUIRED`, `PRIVILEGE_ESCALATION`, `TARGET_OUTRANKS_ACTOR`, `SELF_ROLE_CHANGE`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `VERSION_CONFLICT`, `LAST_SUPER_ADMIN`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Payload Too Large. Mã lỗi (`code`): `PAYLOAD_TOO_LARGE`. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "users.disable": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        user: {
                            /** Format: uuid */
                            id: string;
                            email: string;
                            name: string;
                            /** @enum {string} */
                            status: "pending" | "active" | "disabled";
                            roleIds: string[];
                            version: number;
                        };
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`, `REAUTH_REQUIRED`, `SELF_DISABLE`, `TARGET_OUTRANKS_ACTOR`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `USER_ALREADY_DISABLED`, `LAST_SUPER_ADMIN`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "users.enable": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        user: {
                            /** Format: uuid */
                            id: string;
                            email: string;
                            name: string;
                            /** @enum {string} */
                            status: "pending" | "active" | "disabled";
                            roleIds: string[];
                            version: number;
                        };
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`, `REAUTH_REQUIRED`, `TARGET_OUTRANKS_ACTOR`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `USER_NOT_DISABLED`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "users.resetLink": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * Format: uri
                         * @description Link thiết lập/đặt lại mật khẩu, dùng một lần. Token nằm sau `#token=`.
                         */
                        link: string;
                        /** Format: date-time */
                        expiresAt: string;
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`, `REAUTH_REQUIRED`, `TARGET_OUTRANKS_ACTOR`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict. Mã lỗi (`code`): `USER_DISABLED`. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "users.unlock": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        user: {
                            /** Format: uuid */
                            id: string;
                            email: string;
                            name: string;
                            /** @enum {string} */
                            status: "pending" | "active" | "disabled";
                            roleIds: string[];
                            version: number;
                        };
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden. Mã lỗi (`code`): `FORBIDDEN`, `CSRF_FAILED`, `REAUTH_REQUIRED`. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "health.live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        status: "ok";
                    };
                };
            };
        };
    };
    "health.ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {string} */
                        db: "up" | "down";
                        /** @enum {string} */
                        redis: "up" | "down";
                    };
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {string} */
                        db: "up" | "down";
                        /** @enum {string} */
                        redis: "up" | "down";
                    };
                };
            };
        };
    };
    "publicCategories.list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Mọi chuyên mục, theo thứ tự hiển thị. */
                        items: {
                            /** Format: uuid */
                            id: string;
                            slug: string;
                            name: string;
                            description: string;
                            /** @description Số bài đã xuất bản trong chuyên mục. */
                            count: number;
                        }[];
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests. Mã lỗi (`code`): `RATE_LIMITED`. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "publicPosts.list": {
        parameters: {
            query?: {
                /** @description Slug chuyên mục. Giá trị không khớp mẫu slug (kể cả `cat=` rỗng) trả 400; slug hợp lệ nhưng không tồn tại cho danh sách rỗng. */
                cat?: string;
                /** @description Tìm trong tiêu đề và tóm tắt, không phân biệt hoa thường và dấu; cắt còn 100 ký tự. */
                q?: string;
                page?: number;
                perPage?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            slug: string;
                            /** @description Chữ thuần. */
                            title: string;
                            /** @description Chữ thuần: tóm tắt người viết, hoặc tự sinh từ đoạn đầu. */
                            excerpt: string;
                            /** @description Ngày hiển thị của bài, `YYYY-MM-DD`. */
                            date: string | null;
                            featured: boolean;
                            /** @description Chữ thuần. */
                            kw: string;
                            category: {
                                slug: string;
                                name: string;
                            };
                            /** @description Ảnh bìa (biến thể `cover`); `null` khi không có. */
                            cover: {
                                /** @description URL của ảnh theo biến thể được dùng ở chỗ này. */
                                url: string;
                                /** @description Chiều rộng của biến thể, theo pixel. */
                                width: number;
                                /** @description Chiều cao của biến thể, theo pixel. */
                                height: number;
                                /** @description Mô tả ảnh trong thư viện media. */
                                alt: string;
                            } | null;
                            readingMinutes: number;
                            /** Format: date-time */
                            publishedAt: string;
                            /** Format: date-time */
                            updatedAt: string;
                        }[];
                        total: number;
                        page: number;
                        perPage: number;
                        totalPages: number;
                    };
                };
            };
            /** @description Bad Request. Mã lỗi (`code`): `VALIDATION_FAILED`. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests. Mã lỗi (`code`): `RATE_LIMITED`. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "publicPosts.get": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        slug: string;
                        /** @description Chữ thuần. */
                        title: string;
                        /** @description Chữ thuần: tóm tắt người viết, hoặc tự sinh từ đoạn đầu. */
                        excerpt: string;
                        /** @description Ngày hiển thị của bài, `YYYY-MM-DD`. */
                        date: string | null;
                        featured: boolean;
                        /** @description Chữ thuần. */
                        kw: string;
                        category: {
                            slug: string;
                            name: string;
                        };
                        /** @description Ảnh bìa (biến thể `cover`); `null` khi không có. */
                        cover: {
                            /** @description URL của ảnh theo biến thể được dùng ở chỗ này. */
                            url: string;
                            /** @description Chiều rộng của biến thể, theo pixel. */
                            width: number;
                            /** @description Chiều cao của biến thể, theo pixel. */
                            height: number;
                            /** @description Mô tả ảnh trong thư viện media. */
                            alt: string;
                        } | null;
                        readingMinutes: number;
                        /** Format: date-time */
                        publishedAt: string;
                        /** Format: date-time */
                        updatedAt: string;
                        content: {
                            /** @constant */
                            schemaVersion: 1;
                            blocks: ({
                                /** @constant */
                                type: "paragraph";
                                /** @description HTML nội dòng đã làm sạch: đoạn văn. */
                                html: string;
                            } | {
                                /** @constant */
                                type: "heading";
                                level: 2 | 3 | 4;
                                /** @description HTML nội dòng đã làm sạch: tiêu đề. */
                                html: string;
                                /** @description Mã neo duy nhất trong bài, dùng cho mục lục. */
                                anchor: string;
                            } | {
                                /** @constant */
                                type: "list";
                                /** @enum {string} */
                                style: "ordered" | "unordered" | "checklist";
                                /** @description Số bắt đầu của danh sách có thứ tự. */
                                start?: number;
                                /** @description Kiểu đánh số của danh sách có thứ tự. */
                                counterType?: string;
                                items: components["schemas"]["paths_public_v1_posts_slug_get_responses_200_content_application_json_schema____schema0"][];
                            } | {
                                /** @constant */
                                type: "quote";
                                /** @description HTML nội dòng đã làm sạch: trích dẫn. */
                                html: string;
                                /** @description HTML nội dòng đã làm sạch: chú thích; bỏ field khi rỗng. */
                                captionHtml?: string;
                            } | {
                                /** @constant */
                                type: "image";
                                image: {
                                    /** @description URL của ảnh theo biến thể được dùng ở chỗ này. */
                                    url: string;
                                    /** @description Chiều rộng của biến thể, theo pixel. */
                                    width: number;
                                    /** @description Chiều cao của biến thể, theo pixel. */
                                    height: number;
                                    /** @description Mô tả ảnh trong thư viện media. */
                                    alt: string;
                                };
                                /** @description HTML nội dòng đã làm sạch: chú thích; bỏ field khi rỗng. */
                                captionHtml?: string;
                                stretched: boolean;
                            } | {
                                /** @constant */
                                type: "divider";
                            } | {
                                /** @constant */
                                type: "code";
                                language: string;
                                /** @description Chữ thuần, không làm sạch; landing tự escape khi hiển thị. */
                                code: string;
                            } | {
                                /** @constant */
                                type: "table";
                                withHeadings: boolean;
                                rows: string[][];
                            } | {
                                /** @constant */
                                type: "callout";
                                variant: string;
                                /** @description Chữ thuần; rỗng thì `""`. */
                                title: string;
                                /** @description HTML nội dòng đã làm sạch: nội dung. */
                                html: string;
                            } | {
                                /** @constant */
                                type: "embed";
                                service: string;
                                id: string;
                                embedUrl: string;
                                width: number;
                                height: number;
                                /** @description HTML nội dòng đã làm sạch: chú thích; bỏ field khi rỗng. */
                                captionHtml?: string;
                            })[];
                        };
                        seo: {
                            title: string;
                            description: string;
                            noindex: boolean;
                        };
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests. Mã lỗi (`code`): `RATE_LIMITED`. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "publicPosts.slugs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: {
                            slug: string;
                            /** Format: date-time */
                            updatedAt: string;
                            noindex: boolean;
                        }[];
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests. Mã lỗi (`code`): `RATE_LIMITED`. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    "publicSite.get": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        settings: {
                            name: string;
                            phone: string;
                            email: string;
                            hours: string;
                            address: string;
                            seoTitle: string;
                            seoDesc: string;
                            showEyebrow: boolean;
                            eyebrow: string;
                            h1a: string;
                            h1b: string;
                            h1hl: string;
                            lead: string;
                            cta1: string;
                            cta2: string;
                            /** @description Đúng 4 mục thống kê. */
                            stats: {
                                v: string;
                                l: string;
                            }[];
                        };
                        /** @description Chỉ mục đang hiển thị, theo thứ tự đã lưu. */
                        services: {
                            /** @description Tên biểu tượng, một trong danh sách cố định của admin. */
                            icon: string;
                            title: string;
                            desc: string;
                            time: string;
                        }[];
                        /** @description Chỉ thành viên đang hiển thị, theo thứ tự đã lưu. */
                        team: {
                            name: string;
                            role: string;
                            /** @description Năm bắt đầu làm việc. */
                            since: number;
                            bio: string;
                            /** @description Ảnh chân dung (biến thể `portrait`); `null` khi không có ảnh hoặc ảnh đã bị xoá. */
                            photo: {
                                /** @description URL của ảnh theo biến thể được dùng ở chỗ này. */
                                url: string;
                                /** @description Chiều rộng của biến thể, theo pixel. */
                                width: number;
                                /** @description Chiều cao của biến thể, theo pixel. */
                                height: number;
                                /** @description Mô tả ảnh trong thư viện media. */
                                alt: string;
                            } | null;
                        }[];
                        /** @description Theo năm tăng dần. */
                        timeline: {
                            /** @description Năm, 4 chữ số. */
                            year: string;
                            title: string;
                            body: string;
                            /** @enum {string} */
                            media: "photos" | "quote" | "none";
                            /** @description Có khi `media` là `quote`, ngược lại `null`. */
                            quote: {
                                text: string;
                                by: string;
                                role: string;
                            } | null;
                            /** @description Có khi `media` là `photos`, ngược lại mảng rỗng. */
                            photos: {
                                label: string;
                                /** @description Ảnh gốc; `null` khi ô chưa gắn ảnh hoặc ảnh đã bị xoá. */
                                image: {
                                    /** @description URL của ảnh theo biến thể được dùng ở chỗ này. */
                                    url: string;
                                    /** @description Chiều rộng của biến thể, theo pixel. */
                                    width: number;
                                    /** @description Chiều cao của biến thể, theo pixel. */
                                    height: number;
                                    /** @description Mô tả ảnh trong thư viện media. */
                                    alt: string;
                                } | null;
                            }[];
                        }[];
                        /**
                         * Format: date-time
                         * @description Thời điểm xuất bản bản mới nhất.
                         */
                        publishedAt: string;
                    };
                };
            };
            /** @description Unauthorized. Mã lỗi (`code`): `UNAUTHENTICATED`. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found. Mã lỗi (`code`): `NOT_FOUND`. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests. Mã lỗi (`code`): `RATE_LIMITED`. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
}
