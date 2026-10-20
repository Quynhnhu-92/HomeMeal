# HomeMeal

HomeMeal — Dịch vụ nấu ăn và đi chợ minh bạch.

## Giới thiệu

HomeMeal là dự án nền tảng kết nối khách hàng với đầu bếp, hỗ trợ tìm kiếm dịch vụ nấu ăn, lên thực đơn, đặt tiệc và quản lý đơn hàng.

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
<!-- Trigger Vercel deployment for HomeMeal -->
