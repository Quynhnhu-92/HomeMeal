# HomeMeal

HomeMeal — Dịch vụ nấu ăn và đi chợ minh bạch.

## Giới thiệu

HomeMeal là dự án nền tảng kết nối khách hàng với đầu bếp, hỗ trợ tìm kiếm dịch vụ đầu bếp đến nhà (`cook_at_home`, không tính phí giao hàng), lên thực đơn, đặt tiệc và quản lý đơn hàng.

## Công nghệ

- React
- TypeScript
- Vite

## Chạy dự án trên máy tính

Cài đặt các thư viện:

```bash
npm install
```

Khởi chạy môi trường phát triển:

```bash
npm run dev
```

Tạo bản build:

```bash
npm run build
```

## AI Smart Menu

Trang `/smart-menu` gợi ý thực đơn qua Gemini phía server, hỗ trợ gợi ý mẫu được ghi nhãn khi AI chưa khả dụng, lưu yêu thích trên thiết bị theo tài khoản và chuyển từng bữa vào quy trình đặt hiện có. Cần cấu hình `GEMINI_API_KEY` ở server/Vercel để gọi AI thật; không cần database cho API thực đơn. Không đặt khóa trong biến `VITE_*`.

Xem [hướng dẫn cấu hình, giới hạn và kiểm thử AI Smart Menu](docs/ai-smart-menu.md). Chạy kiểm thử riêng bằng `node --import tsx --test tests/smart-menu.test.ts`.

## PostgreSQL và phân quyền

Backend dùng PostgreSQL. Tạo database PostgreSQL được quản lý (ví dụ Neon) và dùng connection string có SSL/pooling; không lưu database trong thư mục của Vercel vì filesystem ở đó không bền vững.

1. Sao chép `.env.example` thành `.env`, rồi điền `DATABASE_URL` và `APP_ORIGIN=http://localhost:3000`.
2. Chạy `npm run db:migrate` để tạo bảng `app_users` và `auth_sessions`.
3. Điền tạm `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD` (ít nhất 12 ký tự) và `INITIAL_ADMIN_NAME` trong `.env`, rồi chạy `npm run db:seed-admin`. Xóa mật khẩu khởi tạo khỏi `.env` sau khi tạo admin.
4. Chạy `npm run dev:api` trong một cửa sổ terminal và `npm run dev` trong cửa sổ khác.

Đăng ký công khai chỉ tạo tài khoản Khách hàng. Admin đăng nhập, mở `/admin`, vào tab “Quản lý tài khoản” để cấp hoặc thu hồi quyền Đầu bếp/Quản trị viên. API kiểm tra role từ PostgreSQL cho mỗi yêu cầu; role không lấy từ trình duyệt. Phiên đăng nhập dùng cookie `HttpOnly`, `SameSite=Lax`, token ngẫu nhiên được lưu dạng hash; mật khẩu được hash bằng `scrypt`.

### Cấu hình Vercel

- Thêm `DATABASE_URL` trong Vercel → Project Settings → Environment Variables. Đặt `APP_ORIGIN` đúng domain production (nên giới hạn biến này ở Production); Preview tự dùng URL deployment của Vercel.
- Chạy `npm run db:migrate` một lần với `DATABASE_URL` của database production, rồi chạy `npm run db:seed-admin` một lần để tạo admin đầu tiên. Không đưa mật khẩu admin vào Git hoặc Vercel.
- API được triển khai như Vercel Function tại `/api`; phần giao diện tiếp tục được Vite build như trước.
- Trước khi mở đăng ký công khai, bật giới hạn tốc độ/WAF cho `/api`; bộ đếm đăng nhập trong tiến trình chỉ là lớp bổ sung, không chia sẻ giữa các function instance.

**Giới hạn hiện tại:** luồng đơn hàng, báo giá, thanh toán và dữ liệu mẫu vẫn dùng `localStorage`/mock data phía trình duyệt; chúng chưa được chuyển sang PostgreSQL và chưa có phân quyền dữ liệu ở server. Không dùng dữ liệu đơn hàng hiện tại cho khách thật cho đến khi các API nghiệp vụ được migrate.


## Triển khai và kiểm thử xác thực

Backend đăng ký/đăng nhập, phiên và phân quyền dùng PostgreSQL thật; giao diện không có chức năng tự chọn role. Xem [hướng dẫn Vercel, Neon và kiểm thử](docs/vercel-neon.md).

```bash
npm ci
npm run lint
npm run test:smart-menu
npm run test:auth # cần Docker; tự tạo và hủy PostgreSQL kiểm thử riêng
npm run build
```

Không tự chạy migration hoặc seed bằng database production. Các nghiệp vụ đơn hàng/báo giá/thanh toán hiện vẫn là luồng localStorage minh họa; xác thực không dùng dữ liệu mẫu.
