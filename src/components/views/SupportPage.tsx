import React, { useState } from 'react';
import { FAQS } from '../../data/mockData';
import { 
  HelpCircle, 
  ShieldCheck, 
  Receipt, 
  FileText, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MessageSquare, 
  ChevronDown, 
  CheckCircle2,
  Clock
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactSubject, setContactSubject] = useState('Thắc mắc về hóa đơn mua sắm');
  const [contactMessage, setContactMessage] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedMessage(true);
  };

  const policies = [
    {
      title: 'Hủy đơn TRƯỚC KHI đầu bếp đi chợ',
      content: 'Khách hàng được quyền hủy đơn miễn phí 100% nếu đầu bếp chưa bắt đầu quy trình đi chợ (trước trạng thái "Đang đi chợ"). Bạn không phải chịu bất kỳ khoản chi phí nào.'
    },
    {
      title: 'Hủy đơn SAU KHI đầu bếp đã mua nguyên liệu',
      content: 'Nếu đầu bếp đã đi chợ và có hóa đơn chứng từ, khách hàng có trách nhiệm thanh toán số tiền nguyên liệu thực tế đã mua. Toàn bộ thực phẩm tươi sống sẽ được bàn giao lại cho khách hàng. Tiền công nấu nướng sẽ được miễn hoặc giảm tùy theo thỏa thuận.'
    },
    {
      title: 'Xử lý biến động giá nguyên liệu tại chợ',
      content: 'Đầu bếp tuyệt đối không được tự ý mua nguyên liệu vượt trần ngân sách thỏa thuận ban đầu. Nếu giá tăng đột xuất (do ngày lễ, rằm...), đầu bếp phải chụp ảnh bảng giá và gửi thông báo xin duyệt qua ứng dụng. Chỉ khi khách hàng bấm "Đồng ý" thì đầu bếp mới được mua.'
    },
    {
      title: 'Hóa đơn mờ chữ hoặc chứng từ không rõ ràng',
      content: 'Khách hàng có quyền từ chối thanh toán các khoản tiền không có chứng từ hoặc hóa đơn bị nhòe mực, không ghi rõ món. Hệ thống sẽ tạm khóa thanh toán khoản tiền đó cho đến khi đầu bếp hoặc ban quản trị xác minh.'
    },
    {
      title: 'Thay thế nguyên liệu tương đương',
      content: 'Nếu một loại nguyên liệu bị hết hàng tại chợ, đầu bếp phải liên hệ xin ý kiến khách hàng để thay thế loại tương đương với mức giá hợp lý, không được tự ý đổi món mà không thông báo.'
    },
    {
      title: 'Phục vụ trễ giờ hoặc dịch vụ chưa đạt yêu cầu',
      content: 'Nếu đầu bếp phục vụ trễ giờ quá 30 phút mà không có lý do bất khả kháng, tiền công phục vụ sẽ được giảm trừ theo thang quy chuẩn của HomeMeal. Khách hàng có quyền khiếu nại trực tiếp trước khi xác nhận hóa đơn.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-10 shadow-xs">
        <span className="text-xs font-bold text-accent uppercase tracking-wider">Trung tâm trợ giúp</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-accent">Chính sách & Hỗ trợ Khách hàng</h1>
        <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
          HomeMeal xây dựng bộ quy tắc vận hành minh bạch nhằm bảo đảm quyền lợi tối đa cho cả khách hàng lẫn đầu bếp gia đình.
        </p>
        <div className="mt-4 p-3 bg-surface-alt rounded-xl border border-border-soft text-[11px] text-accent">
          * Lưu ý mẫu quy chế: Toàn bộ điều khoản bên dưới được soạn thảo để minh họa quy trình vận hành và cần được chủ sở hữu doanh nghiệp rà soát pháp lý khi triển khai thực tế.
        </div>
      </div>

      {/* Policies Grid */}
      <div className="space-y-4" id="policies">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-detail" />
          <h2 className="text-xl font-bold text-accent">Quy định minh bạch & Chính sách hủy/hoàn tiền</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p, idx) => (
            <div key={idx} className="bg-surface rounded-2xl border border-border-soft p-5 space-y-2 hover:border-brand transition-colors">
              <h3 className="font-bold text-sm text-accent flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-surface-alt text-accent flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span>{p.title}</span>
              </h3>
              <p className="text-xs text-muted leading-relaxed pl-7">
                {p.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4" id="faqs">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-detail" />
          <h2 className="text-xl font-bold text-accent">Câu hỏi thường gặp (FAQ)</h2>
        </div>

        <div className="bg-surface rounded-2xl border border-border-soft divide-y divide-border-soft">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="p-4 sm:p-5">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-ink"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <p className="mt-3 text-xs text-muted leading-relaxed animate-in fade-in duration-150">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-accent">Liên hệ với ban quản trị HomeMeal</h2>
          <p className="text-xs text-muted mt-1">Đội ngũ hỗ trợ phản hồi trong vòng 30 phút đối với các vấn đề liên quan đến đơn hàng đang diễn ra.</p>
        </div>

        {submittedMessage ? (
          <div className="p-6 bg-surface-alt rounded-2xl border border-border-soft text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-detail mx-auto" />
            <h3 className="font-bold text-accent">Đã gửi tin nhắn hỗ trợ thành công!</h3>
            <p className="text-xs text-accent">Chuyên viên HomeMeal sẽ liên hệ với bạn qua số điện thoại hoặc email đã cung cấp.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitContact} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-ink mb-1">Chủ đề cần hỗ trợ:</label>
                <select
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-border-soft rounded-xl text-xs sm:text-sm"
                >
                  <option value="Thắc mắc về hóa đơn mua sắm">Thắc mắc về hóa đơn mua sắm</option>
                  <option value="Yêu cầu hỗ trợ đơn tiệc quy mô lớn">Yêu cầu hỗ trợ tiệc lớn trên 50 người</option>
                  <option value="Đăng ký gia nhập mạng lưới đầu bếp">Đăng ký làm đầu bếp đối tác</option>
                  <option value="Khiếu nại thái độ hoặc chất lượng">Khiếu nại chất lượng phục vụ</option>
                  <option value="Khác">Vấn đề khác</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Số điện thoại liên hệ:</label>
                <input
                  type="text"
                  defaultValue="0908 123 456"
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-border-soft rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Nội dung chi tiết:</label>
              <textarea
                rows={3}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Mô tả cụ thể yêu cầu của bạn..."
                className="w-full px-3.5 py-2.5 bg-surface-alt border border-border-soft rounded-xl text-xs sm:text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
            >
              Gửi yêu cầu hỗ trợ
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
