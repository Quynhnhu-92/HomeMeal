# Vercel, Neon và xác thực thật

Bản sửa dựa trên `785c808` của **Quynhnhu-92/HomeMeal**. Giữ mô hình `cook_at_home`, công thức phí giao hàng 0 đ, giao diện/nhập món riêng của commit đó và AI Smart Menu đang phát triển. Backend từ lịch sử `87e8ef6`/`a769fbc` được khôi phục và tích hợp lại, không thay frontend bằng phiên bản cũ. Không dùng `MOCK_USERS` hoặc role trong localStorage để xác thực.

## Cấu hình dự án homemeal-web

| Thiết lập | Giá trị |
|---|---|
| Repository | `Quynhnhu-92/HomeMeal` |
| Production branch | `main` |
| Root directory | Gốc repository, có `package.json` |
| Framework | Vite |
| Node | 24.x, đồng bộ `package.json.engines` |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist` |

Không chọn `npm run dev`/`dev:api` làm lệnh build. Không thêm migration/seed vào build. `esbuild ^0.28.2` tương thích Vite 8; giữ lockfile mới trong lần commit được người sở hữu xác nhận, không dùng `--force`/`--legacy-peer-deps`.

`api/index.ts` export Express app cho Vercel Function; `server/index.ts` chỉ dùng local. `api/tsconfig.json` tách type Node khỏi type Vite và định nghĩa đường dẫn types để bộ transpile TypeScript 7 của Vercel làm việc trong thư mục tạm. `vercel.json` xử lý filesystem trước (assets và function `/api`), chặn API không tồn tại bằng 404, sau đó mới trả `index.html` cho các URL React. Không trộn cấu hình `routes` này với `rewrites`/`redirects` khác mà chưa kiểm tra thứ tự.

## Environment Variables

Thiết lập qua Vercel → Settings → Environment Variables, không dán giá trị vào Git/chat:

- **`DATABASE_URL`**: PostgreSQL URI từ Neon. Dùng connection string **pooled** (hostname thường có `-pooler`) cho Vercel. Backend giữ pool nhỏ (`max: 3`). Với host `.neon.tech`, ứng dụng yêu cầu `sslmode=verify-full`, xác minh chứng chỉ và hostname. Không tắt TLS.
- **`APP_ORIGIN`**: origin production chính xác, ví dụ `https://ten-mien-cua-ban`, không có path. Scope Production để Preview có thể dùng `VERCEL_URL` tự cấp. Nếu dùng domain Preview riêng, cấu hình origin đúng cho môi trường đó.
- **`GEMINI_API_KEY`**, tùy chọn **`GEMINI_MODEL`**: theo [AI Smart Menu](ai-smart-menu.md). Không dùng tiền tố `VITE_` cho khóa. Thiếu khóa thì AI báo rõ; gợi ý mẫu được ghi nhãn riêng.

`DATABASE_URL` chỉ cần khi chạy API tài khoản, không cần để build frontend hoặc chạy API Smart Menu. Khi không có database, API tài khoản trả 503 chứ không chuyển sang đăng nhập giả. `APP_ORIGIN` dùng để kiểm tra Origin cho thao tác ghi; origin sai sẽ nhận 403.

Sau khi được người sở hữu xác nhận commit/push/triển khai, cần tạo deployment mới để nhận code và Environment Variables. Thay đổi trong workspace không tự sửa deployment đã thất bại.

## Database, admin ban đầu và local

1. Dùng **Neon branch/database phát triển riêng**, không dùng database production của nhóm để kiểm thử. Hoặc dùng PostgreSQL local.
2. Đặt `DATABASE_URL` cho đúng database dự định chuẩn bị và chạy `npm run db:migrate`. Schema có `app_users` và `auth_sessions`, chạy lại không tạo trùng bảng. Không ghi đè/xóa bảng người dùng có sẵn. Nếu bảng đang có cấu trúc khác, cần kiểm tra migration riêng; `CREATE TABLE IF NOT EXISTS` không nâng cấp schema cũ tự động.
3. Admin đầu tiên do người có quyền vận hành tạo bằng `npm run db:seed-admin`, với `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD` (12–128 ký tự) và tùy chọn `INITIAL_ADMIN_NAME` trong môi trường của tiến trình đó. Không để mật khẩu khởi tạo trong Git hoặc cấu hình Vercel lâu dài. Script từ chối tạo thêm admin ban đầu nếu đã có admin.
4. Local: `APP_ORIGIN=http://localhost:3000`, chạy `npm run dev:api` và `npm run dev`. Vite proxy `/api` sang cổng 3001; đây không phải cấu hình production.

Không tự chạy bước 2/3 trên production từ tác vụ phát triển này. Database production và migration production chỉ do người sở hữu thực hiện khi đã xác định đúng đích.

## Hành vi xác thực

- Đăng ký luôn tạo Customer, bỏ qua role client cố gửi. Mật khẩu băm `scrypt` với salt ngẫu nhiên.
- Phiên ngẫu nhiên 7 ngày, token chỉ lưu dạng hash trong PostgreSQL; cookie `HttpOnly`, `SameSite=Lax`, `Secure` ở production. Đăng xuất xóa phiên server và cookie. Phiên hết hạn không được sử dụng.
- Cook/Admin do Admin cấp qua **Quản lý tài khoản**, API đọc quyền từ database cho mỗi yêu cầu. Không cho sửa role qua API hồ sơ hoặc nút chọn vai trò. Kiểm tra quyền lại trong transaction đổi role; đồng bộ thao tác cấp quyền và bảo vệ admin cuối cùng.
- Hồ sơ có thể sửa tên, điện thoại, địa chỉ qua API thật. Không thay đổi email/mật khẩu/role bằng endpoint này.
- Frontend chặn trang theo phiên, cập nhật phiên khi tải lại, focus và mỗi phút. `/cooks` vẫn là trang công khai, không bị nhầm với `/cook/`. Cook/Admin có thể xem chi tiết đơn; thao tác nghiệp vụ client cũng kiểm tra vai trò.
- Quên mật khẩu qua email chưa được triển khai; trang hỗ trợ thông báo rõ, không báo gửi email giả.
- Bộ giới hạn đăng nhập trong tiến trình không chia sẻ giữa các function instance. Thiết lập Vercel Firewall rate limiting và quota AI thích hợp trước khi mở truy cập rộng.

## Kiểm thử

```bash
npm ci
npm run lint
npx tsc -p api/tsconfig.json --noEmit
npm run test:smart-menu
npm run test:auth
npm run build
```

`test:auth` cần Docker, tự khởi tạo container PostgreSQL riêng trên loopback/cổng ngẫu nhiên, chạy schema/seed/HTTP API thật rồi xóa container và dữ liệu kiểm thử. Không đọc `DATABASE_URL` production từ `.env` làm đích test. Khi chạy trực tiếp file test, bắt buộc cung cấp `HOMEMEAL_TEST_DATABASE_URL` với host loopback và tên database `homemeal_test_*`; URL khác bị từ chối. Tuyệt đối không sửa điều kiện này để chạy production.

Kiểm thử AI có mô phỏng transport được ghi rõ. Chưa có khóa/quota thì không thể chứng minh Gemini thật hoạt động. Xem hướng dẫn AI để kiểm tra sau khi cấu hình khóa riêng.

## Kiểm tra sau deployment được xác nhận

1. Mở `/`, `/menu`, `/cooks`, `/meal-planner`, `/smart-menu` trực tiếp và refresh; JS/CSS phải tải đúng, API phải trả JSON (không phải `index.html`).
2. Trên **deployment Preview + database phát triển riêng**, đăng ký Customer, đăng xuất/đăng nhập, refresh để kiểm tra phiên; đăng nhập sai phải bị từ chối.
3. Customer không vào được Admin/Cook; sửa role trong localStorage/header không có tác dụng. Admin đăng nhập, cấp/thu hồi Cook rồi kiểm tra phiên đang có đọc quyền mới từ server.
4. Sửa hồ sơ, tải lại; thay đổi phải được lưu. Không có menu tự cấp role.
5. Kiểm tra nhập món riêng và AI → wizard → xác nhận: dịch vụ `cook_at_home`, đầu bếp tới nhà, phí giao hàng 0 đ. Trước khi bấm gửi không tạo đơn hoặc thanh toán.
6. Kiểm tra màn hình điện thoại và desktop, các tab đơn hàng/đầu bếp/quản trị và báo giá.

**Giới hạn nghiệp vụ còn lại:** đơn hàng, báo giá, hóa đơn, tranh chấp và thanh toán vẫn là dữ liệu minh họa/localStorage theo kiến trúc hiện có, chưa có API phân quyền theo chủ đơn và đồng bộ giữa các thiết bị. Việc khôi phục xác thực thật không biến các nghiệp vụ này thành hệ thống production hoàn chỉnh. Tài khoản Cook PostgreSQL chưa có bảng hồ sơ đầu bếp liên kết danh sách đầu bếp mẫu. Không dùng các luồng thanh toán minh họa để thu tiền thật.
