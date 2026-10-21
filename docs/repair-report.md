# Báo cáo sửa deployment và khôi phục backend

Nền: commit `785c8087877d0a797a8e7cad88d6e4eed3764b8f` của `Quynhnhu-92/HomeMeal`. Không thay repository gốc, không kết nối/test database production. Báo cáo ghi nhận bản sửa đã kiểm thử trước khi đưa lên branch và Pull Request của fork; không triển khai production.

## Kết quả

- Giữ giao diện mới, nhập món riêng, mô hình `cook_at_home` và phí giao hàng 0 đ. Các trang Home/Footer/PartyBooking/Support/OrderBill/CookEarnings, dữ liệu mẫu, types, pricing và dateTimeValidation giữ nguyên từng byte so với commit nền; các vùng auth/AI được hợp nhất có chủ đích.
- Giữ AI chưa commit, đã xác minh nguyên vẹn các module provider/handler/validation và gợi ý mẫu. Chuyển draft AI sang nấu tại nhà, không thu phí giao hàng; không tạo hệ thống đặt mới.
- Khôi phục Express API, PostgreSQL, schema, migration/seed từ lịch sử. Tài khoản thật, mật khẩu scrypt, phiên hash/cookie, phân quyền server, quản lý quyền admin; không còn self-role switch. Form hồ sơ lưu thật bằng API, không chỉ báo thành công.
- Sửa esbuild tương thích Vite, tạo lockfile, Node 24.x, routing Vercel và tsconfig riêng cho API/TypeScript 7.

## Kiểm tra đã thực hiện

| Kiểm tra | Kết quả |
|---|---|
| `npm ci --cache /workspace/.npm-cache --no-audit --no-fund` | Thành công, 199 packages |
| `npm run lint` | Thành công |
| `tsc -p api/tsconfig.json --noEmit` | Thành công |
| `npm run test:smart-menu` | 18/18 đạt |
| `npm run test:auth` | 13/13 đạt (gồm test cha và 12 nhóm tích hợp) |
| `npm run build` | Thành công |
| `git diff --check` | Thành công |
| Bộ đóng gói `@vercel/node` chạy cục bộ | Thành công, `nodejs24.x`, handler `api/index.js`; không có lỗi TypeScript |
| Chạy artifact API đã đóng gói | Đăng ký PostgreSQL thật, quyền Customer bị từ chối Admin, AI báo thiếu khóa đúng |
| Bộ kiểm tra cấu hình `@vercel/routing-utils` | Không có lỗi cấu hình route |
| Chromium desktop/mobile | Đăng ký thật, profile sau reload, admin cấp/thu hồi Cook, chặn quyền, logout, AI → đủ 7 bước đặt → `cook_at_home` và 0 phí giao hàng; không có lỗi runtime/tràn ngang |

Các test xác thực dùng PostgreSQL thật trong container riêng trên loopback và được xóa sau kiểm thử. Không dùng mock xác thực. Test transport AI có mô phỏng được ghi rõ; gợi ý mẫu không được giả là AI thật.

Bộ đóng gói Vercel và browser QA chạy ngoài checkout, trong `/workspace/vercel-repair-qa`, không thêm dependency Vercel/Playwright vào ứng dụng. Lỗi cache npm mặc định của sandbox được xử lý bằng cache ở `/workspace/.npm-cache`, không tắt TLS/checksum. Bản sao lưu đã kiểm tra ở `/workspace/HomeMeal-preserved-20261020-084718/source-before-repair.tar.gz`; không nằm trong Git.

## Còn cần lưu ý

- Chưa triển khai Vercel thực tế hoặc xác minh kết nối tới Neon của người sở hữu. Cần thiết lập `DATABASE_URL` pooled và `APP_ORIGIN` trong môi trường đúng, rồi thực hiện deployment khi đã có xác nhận. Không tự chạy migration production.
- Chưa có `GEMINI_API_KEY`, nên chưa kiểm chứng Gemini thật. Cấu hình khóa riêng trên Vercel khi muốn dùng AI.
- Build còn cảnh báo chunk chính khoảng 520 kB; không chặn build. AI tải theo route riêng.
- Đơn hàng/báo giá/thanh toán/tranh chấp vẫn dùng localStorage/dữ liệu minh họa của dự án, chưa có backend nghiệp vụ/kiểm tra chủ đơn production. Hồ sơ Cook thực chưa liên kết bảng đầu bếp mẫu. Đây là giới hạn còn lại, không phải xác thực giả.
- Chưa có tự khôi phục mật khẩu qua email; trang hỗ trợ thông báo đúng giới hạn. Rate limit xác thực/AI trong tiến trình cần bổ sung Firewall cho nhiều instance.

Hướng dẫn triển khai đầy đủ: [Vercel/Neon](vercel-neon.md). Hướng dẫn AI: [AI Smart Menu](ai-smart-menu.md).

## File đã sửa so với commit 785c808

- `.env.example`
- `package.json`
- `src/App.tsx`
- `src/components/common/Navbar.tsx`
- `src/components/views/AccountPage.tsx`
- `src/components/views/MealPlannerPage.tsx`
- `src/components/views/OrderDetailPage.tsx`
- `src/components/views/admin/AdminDashboardPage.tsx`
- `src/components/views/cook/CookDashboardPage.tsx`
- `src/context/AppContext.tsx`
- `vite.config.ts`

## File khôi phục hoặc tạo mới

- `README.md`
- `api/index.ts`
- `api/tsconfig.json`
- `db/schema.sql`
- `docs/ai-smart-menu.md`
- `docs/repair-report.md`
- `docs/vercel-neon.md`
- `package-lock.json`
- `scripts/migrate.ts`
- `scripts/seed-admin.ts`
- `scripts/test-auth.sh`
- `server/app.ts`
- `server/db.ts`
- `server/index.ts`
- `server/passwords.ts`
- `server/smart-menu/handler.ts`
- `server/smart-menu/provider.ts`
- `server/smart-menu/validation.ts`
- `shared/smartMenu.ts`
- `src/components/views/SmartMenuPage.tsx`
- `src/utils/smartMenuSamples.ts`
- `tests/auth.test.ts`
- `tests/smart-menu.test.ts`
- `vercel.json`
