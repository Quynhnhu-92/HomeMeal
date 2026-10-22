import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Receipt, Clock, Heart, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="bg-[#285E56] text-[#FFFDF7] pt-14 pb-10 border-t border-[#1f4b44]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-white/10 text-sm">
          <div className="flex items-start gap-3">
            <Receipt className="w-5 h-5 text-[#B8E4D3] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">Minh bạch hóa đơn</h4>
              <p className="text-xs text-white/70 mt-1">Đầu bếp chụp hóa đơn thực tế tại chợ, khách chỉ trả đúng tiền thực chi.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#B8E4D3] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">Thanh toán sau</h4>
              <p className="text-xs text-white/70 mt-1">Chỉ thanh toán khi đầu bếp đã nấu xong, dọn mâm lên bàn và bạn kiểm tra hài lòng.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#B8E4D3] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">Tách bạch tiền công</h4>
              <p className="text-xs text-white/70 mt-1">Công nấu tính theo độ khó và số lượng người, không kèm chênh lệch nguyên liệu.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-[#B8E4D3] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white">Chuẩn vị gia đình</h4>
              <p className="text-xs text-white/70 mt-1">Đầu bếp có tâm, nguyên liệu tươi mới, nêm nếm theo khẩu vị riêng của bạn.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 py-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#B8E4D3] text-[#285E56] flex items-center justify-center font-bold text-lg">
                H
              </div>
              <span className="text-xl font-bold tracking-tight text-white">HomeMeal</span>
            </div>
            <p className="text-sm font-medium text-[#B8E4D3] italic mb-3">
              "Bữa cơm chân tình cho người bận rộn"
            </p>
            <p className="text-xs text-white/75 leading-relaxed max-w-sm mb-4">
              Nền tảng kết nối dịch vụ đầu bếp đến tận nhà nấu cơm gia đình và tiệc tại gia theo ngân sách thực tế. Trao quyền cho khách hàng tự điền món ăn và kiểm tra chứng từ minh bạch, không phí ẩn.
            </p>
            <div className="space-y-1.5 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#B8E4D3]" />
                <span>68 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#B8E4D3]" />
                <span>Hotline: 1900 6868 (8:00 - 21:00)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#B8E4D3]" />
                <span>lienhe@homemeal.vn</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-[#B8E4D3] mb-3">Dịch vụ</h5>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <button onClick={() => navigateTo('/meal-planner')} className="hover:text-white transition-colors">
                  Đặt bữa cơm gia đình
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/party-booking')} className="hover:text-white transition-colors">
                  Đặt tiệc & cỗ tại gia
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/menu')} className="hover:text-white transition-colors">
                  Thực đơn gợi ý
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/cooks')} className="hover:text-white transition-colors">
                  Đội ngũ đầu bếp
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/quotations')} className="hover:text-white transition-colors">
                  Báo giá tiệc theo yêu cầu
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-[#B8E4D3] mb-3">Chính sách & Hỗ trợ</h5>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <button onClick={() => navigateTo('/support')} className="hover:text-white transition-colors">
                  Trung tâm trợ giúp & FAQ
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/support#cancellation')} className="hover:text-white transition-colors">
                  Chính sách hủy đơn & Hoàn tiền
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/support#evidence')} className="hover:text-white transition-colors">
                  Quy định chứng từ mua sắm
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/support#disputes')} className="hover:text-white transition-colors">
                  Quy trình giải quyết khiếu nại
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/support#terms')} className="hover:text-white transition-colors">
                  Điều khoản dịch vụ
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-[#B8E4D3] mb-3">Dành cho đối tác</h5>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <button onClick={() => navigateTo('/cook/dashboard')} className="hover:text-white transition-colors">
                  Góc làm việc của đầu bếp
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/support#cook-register')} className="hover:text-white transition-colors">
                  Đăng ký trở thành đầu bếp
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/cook/earnings')} className="hover:text-white transition-colors">
                  Chính sách thu nhập & công nấu
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/admin')} className="hover:text-white transition-colors">
                  Cổng quản trị viên
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-3">
          <p>© 2026 HomeMeal Vietnam. Nền tảng nguyên mẫu phục vụ trình bày đồ án và đánh giá học thuật.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#B8E4D3]">Phiên bản thử nghiệm tương tác 1.0</span>
            <span>·</span>
            <button onClick={() => navigateTo('/support')} className="hover:underline">Bảo mật thông tin</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
