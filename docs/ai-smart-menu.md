# AI Smart Menu

Trang `/smart-menu` dùng API Express hiện có: `POST /api?resource=smart-menu`. Gemini được gọi ở server bằng `@google/genai`; khóa không vào bundle Vite. API này không đọc/ghi PostgreSQL. Không cần chạy migration cho tính năng này.

## Chạy cục bộ

1. `npm ci` (Node 24 đã được kiểm tra).
2. Thiết lập `GEMINI_API_KEY` trong môi trường server hoặc `.env` (không commit). `GEMINI_MODEL` tùy chọn, mặc định `gemini-2.5-flash`.
3. Đặt `APP_ORIGIN=http://localhost:3000` khi dùng cục bộ.
4. Chạy `npm run dev:api` và `npm run dev` ở hai terminal.

Không có `DATABASE_URL`, API Smart Menu vẫn chạy; các API đăng nhập cũ vẫn yêu cầu database. Chỉ dùng database phát triển riêng khi kiểm thử đăng nhập, không dùng database production của nhóm.

## Vercel

- Framework: Vite; root: gốc repository; install: `npm ci`; build: `npm run build`; output: `dist`; Node 24.x.
- `GEMINI_API_KEY`: khóa Gemini có quyền truy cập model, chỉ phía server. Không đặt tên `VITE_GEMINI_API_KEY`.
- `GEMINI_MODEL`: tùy chọn, mặc định `gemini-2.5-flash`; tài khoản phải có quyền/quota cho model đã chọn.
- `APP_ORIGIN`: origin chính xác của website production, gồm `https://`, không có đường dẫn. Chỉ scope Production nếu muốn Preview dùng `VERCEL_URL` như API hiện có.
- Dùng môi trường/quota AI của dự án riêng; không sao chép khóa hay database của nhóm. Không cần database để tạo AI/mẫu.
- Sau khi người sở hữu xác nhận triển khai, thêm biến bằng Vercel Settings → Environment Variables và redeploy. Không nhập khóa trong chat hoặc commit `.env`.
- API dùng function `api/index.ts` hiện có. Vite `server.proxy` chỉ áp dụng local; không thay bằng địa chỉ localhost trong production. `vercel.json` ưu tiên filesystem (static assets và API), trả 404 cho API không tồn tại, sau đó mới fallback SPA.
- Mỗi lần gọi AI có timeout 50 giây (client 60 giây). Với gói Vercel có giới hạn function ngắn hơn, cấu hình thời lượng phù hợp với gói hoặc dùng kế hoạch ngắn hơn. Kế hoạch tối đa 3 phương án × 7 ngày × 3 bữa có thể bị timeout/quota; lỗi phải hiện rõ, không coi là thành công.
- API giới hạn theo IP: 8 yêu cầu/10 phút, 4 yêu cầu đồng thời và 80 yêu cầu/10 phút trên mỗi instance. Đây không phải hạn mức dùng chung giữa các function instance. Bổ sung Vercel Firewall rate limiting cho `/api` (hoặc rule theo query resource `smart-menu` nếu gói hỗ trợ), đặt hạn mức chi tiêu/quota tại Google trước khi mở rộng truy cập công khai.

## Hành vi và giới hạn

- `generate`: trả 1 hoặc 3 phương án, mỗi phương án 1/3/7 ngày, 1–3 bữa/ngày. Backend kiểm tra cấu trúc, số bữa, khoảng giá trị, ngân sách, thời gian và xung đột nguyên liệu; phản hồi không đạt bị từ chối.
- `replace`: thay một món, giữ món khác, kiểm tra trần ngân sách còn lại. Nếu AI lỗi, món cũ được giữ. Thay một món bằng AI không biến cả kế hoạch mẫu thành kế hoạch AI.
- Gợi ý mẫu là dữ liệu minh họa được ghi nhãn; lọc theo nguyên liệu, chế độ ăn, thời gian và ngân sách. Món mẫu được luân phiên theo ngày; không cam kết cá nhân hóa mục tiêu hoặc phong cách ẩm thực. Không tự động thay kết quả AI bằng mẫu một cách âm thầm.
- Calories/macro tính trên mỗi người, giá nguyên liệu tính cho tất cả người ăn. Các giá trị đều ước tính, chưa đối chiếu cơ sở dữ liệu dinh dưỡng chuyên ngành. Không phải tư vấn y tế.
- Không tạo kế hoạch cá nhân hóa cho người dưới 18 tuổi, phụ nữ mang thai hoặc người khai báo bệnh lý cần chế độ ăn riêng; hiển thị hướng dẫn gặp chuyên gia.
- Lọc dị ứng bằng chỉ dẫn AI và đối chiếu từ khóa bảo thủ, không chứng nhận an toàn dị ứng hay kiểm soát được nhiễm chéo. Người dùng phải xem thành phần và xác nhận lại với đầu bếp. Không tự áp dụng điều trị bệnh hoặc mục tiêu giảm cân cực đoan.
- Tuổi/chiều cao/cân nặng chỉ ở state trong trang và yêu cầu đến backend; tuổi dùng cho kiểm tra người trưởng thành, cả ba chỉ số không được chuyển tiếp đến Google. Sở thích/nguyên liệu được gửi đến Google để gợi ý món. Không log prompt, không lưu hồ sơ vào database/localStorage. Dữ liệu gửi đến Google chịu chính sách dữ liệu của dịch vụ/model/tài khoản tương ứng.
- Yêu thích lưu tối đa 12 kế hoạch theo ID tài khoản trên trình duyệt hiện tại, không đồng bộ đa thiết bị. Chỉ lưu món, định lượng/nguyên liệu, ước tính và số người; không lưu hồ sơ chỉ số cơ thể/dị ứng. Dữ liệu không được mã hóa trên thiết bị; người dùng có thể xóa từng thực đơn.
- Đặt từng bữa qua `updateDraftOrder`, tiếp tục wizard `/meal-planner` hiện có, không tạo hệ thống đặt riêng. Mỗi món x1 đã gồm toàn bộ số người; tiền công do `calculateLaborFee` hiện có tính. Khách chưa đăng nhập được chuyển qua login rồi quay lại wizard. Không tự xác nhận, không tự thanh toán. Luồng đặt hiện tại vẫn là localStorage/mock như README; tính năng này không nâng cấp nghiệp vụ đơn hàng lên production.
- HomeMeal ưu tiên `cook_at_home`: đầu bếp đến nhà khách để nấu ăn; không tính phí giao hàng. Smart Menu dùng đúng mô hình và quy tắc giá này.

## Kiểm tra sau khi triển khai được xác nhận

1. Mở trực tiếp `/smart-menu`, làm mới trang; thử menu điều hướng trên desktop và điện thoại.
2. Không nhập chỉ số cơ thể, tạo bữa cho 2 người với ngân sách 200.000 đ. Kiểm tra nhãn ước tính, số người, tổng nguyên liệu/công nấu (phí giao hàng 0 đ).
3. Chọn 3 phương án, 3/7 ngày và số bữa; kiểm tra đủ ngày/bữa hoặc lỗi rõ ràng nếu quá thời gian/quota.
4. Thêm dị ứng, chọn ăn chay/thuần chay; đối chiếu toàn bộ nguyên liệu. Thử đổi món, tạo lại, giảm ngân sách. Không dùng bộ lọc tự động như chứng nhận dị ứng.
5. Với môi trường thử nghiệm thiếu/sai khóa, xác nhận thông báo lỗi và nút xem mẫu hoạt động; không hiển thị mẫu là AI.
6. Khai báo tuổi dưới 18/mang thai/bệnh lý: phải hiển thị hướng dẫn chuyên gia, không gửi yêu cầu cá nhân hóa.
7. Đăng nhập bằng tài khoản Khách hàng ở database phát triển riêng, lưu/xem/xóa yêu thích; đăng xuất không hiển thị mục yêu thích của tài khoản khác.
8. Chọn xác nhận đã xem nguyên liệu, bấm đặt Home Cook. Kiểm tra wizard điền món, số người, ngân sách; chọn lịch/địa chỉ/đầu bếp, đối chiếu tiền công. Chưa bấm xác nhận thì không có đơn mới hoặc thanh toán.
9. Kiểm tra lại trang chủ, menu, login/register, đơn hàng và khu vực quản trị theo quyền hiện có.

Kiểm tra tự động cục bộ: `node --import tsx --test tests/smart-menu.test.ts`, `npm run lint`, `npm run build`. Test AI dùng transport giả lập được ghi rõ; không chứng minh khóa/quota/model thực đã hoạt động.
