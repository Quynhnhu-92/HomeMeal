import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/pricing';
import { ShoppingEvidenceItem } from '../../types';
import { EvidenceModal } from '../common/EvidenceModal';
import { DisputeModal } from '../common/DisputeModal';
import { 
  ArrowLeft, 
  Receipt, 
  CheckCircle, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard, 
  Building2, 
  QrCode, 
  Eye, 
  Sparkles, 
  Heart,
  Star
} from 'lucide-react';

interface OrderBillPageProps {
  orderId: string;
}

export const OrderBillPage: React.FC<OrderBillPageProps> = ({ orderId }) => {
  const { getOrderById, navigateTo, processPayment, submitReview } = useApp();
  const order = getOrderById(orderId);

  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState<ShoppingEvidenceItem | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank_transfer' | 'momo' | 'card'>('bank_transfer');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Review states after payment
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Bữa ăn rất ngon, cô Bích Huệ nấu chuẩn vị gia đình và hóa đơn đi chợ chụp rất rõ ràng!');
  const [reviewed, setReviewed] = useState(false);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-accent">Không tìm thấy hóa đơn</h2>
        <button
          onClick={() => navigateTo('/orders')}
          className="mt-4 px-4 py-2 bg-brand text-on-brand rounded-xl text-xs font-semibold"
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  const handleSimulatedPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
      processPayment(order.id, selectedPaymentMethod === 'bank_transfer' ? 'Chuyển khoản VietQR' : selectedPaymentMethod === 'momo' ? 'Ví MoMo' : 'Thẻ Visa/Mastercard');
    }, 1200);
  };

  const handleSendReview = () => {
    submitReview(order.id, {
      rating: reviewRating,
      foodQuality: 5,
      transparency: 5,
      professionalism: 5,
      punctuality: 5,
      comment: reviewComment,
    });
    setReviewed(true);
  };

  const isDisputed = order.status === 'disputed';
  const isPaid = order.status === 'paid' || order.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigateTo(`/orders/${order.id}`)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại trang chi tiết đơn #{order.orderCode}</span>
      </button>

      {/* Main Invoice Container */}
      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-10 shadow-lg space-y-8">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-soft">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-brand text-ink flex items-center justify-center font-bold text-base">
                H
              </div>
              <span className="text-xl font-extrabold text-accent">HomeMeal Invoice</span>
            </div>
            <p className="text-xs text-muted">
              Hóa đơn quyết toán dịch vụ · Mã đơn: <strong>#{order.orderCode}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-muted">
            <p>Ngày phục vụ: <strong className="text-ink">{order.date}</strong></p>
            <p>Khách hàng: <strong className="text-ink">{order.customerName}</strong></p>
            <p>Đầu bếp: <strong className="text-accent">{order.cook?.name}</strong></p>
          </div>
        </div>

        {/* Notice of Separation */}
        <div className="p-4 bg-surface-alt rounded-2xl border border-brand text-xs text-accent flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0 text-detail" />
          <div>
            <strong>Cam kết thanh toán minh bạch:</strong> Chi phí nguyên liệu được thanh toán theo đúng hóa đơn thực tế của đầu bếp. Tiền công nấu ăn được tính riêng biệt và không kèm bất kỳ phụ phí ẩn nào.
          </div>
        </div>

        {/* SECTION A: INGREDIENT EXPENSES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-soft">
            <h3 className="font-bold text-base text-accent flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand text-ink flex items-center justify-center text-xs">A</span>
              <span>Chi phí nguyên liệu thực chi (Có chứng từ hóa đơn)</span>
            </h3>
            <span className="text-xs text-muted">
              Ngân sách duyệt: <strong>{formatVND(order.estimatedGroceryBudget)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-alt text-muted border-b border-border-soft">
                  <th className="py-2.5 px-3">Tên nguyên liệu</th>
                  <th className="py-2.5 px-3">Nơi mua</th>
                  <th className="py-2.5 px-3">Số lượng</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá thực</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  <th className="py-2.5 px-3 text-center">Chứng từ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {order.shoppingList.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-alt/60">
                    <td className="py-2.5 px-3 font-medium text-ink">{item.name}</td>
                    <td className="py-2.5 px-3 text-muted">{item.storeName}</td>
                    <td className="py-2.5 px-3 text-muted">{item.quantity} {item.unit}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{formatVND(item.actualPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-accent">{formatVND(item.subtotal)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedEvidenceItem(item)}
                        className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline font-semibold bg-surface-alt px-2 py-0.5 rounded"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Xem ảnh</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center p-3.5 bg-surface-alt rounded-xl text-xs font-bold">
            <span className="text-ink">CỘNG TIỀN CHỢ THỰC TẾ (Mục A):</span>
            <span className="text-base text-accent">{formatVND(order.actualGroceryTotal)}</span>
          </div>

          {order.actualGroceryTotal < order.estimatedGroceryBudget && (
            <p className="text-[11px] text-accent italic">
              * Đi chợ tiết kiệm được {formatVND(order.estimatedGroceryBudget - order.actualGroceryTotal)} so với dự tính ban đầu. Khoản dư này không bị tính vào hóa đơn!
            </p>
          )}
        </div>

        {/* SECTION B: SERVICE FEES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-soft">
            <h3 className="font-bold text-base text-accent flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand text-ink flex items-center justify-center text-xs">B</span>
              <span>Chi phí công đầu bếp đến nhà nấu ăn</span>
            </h3>
          </div>

          <div className="bg-surface-alt rounded-xl border border-border-soft p-4 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border-soft/60">
              <span className="text-ink">
                Tiền công nấu tại gia ({order.guestCount} khách · {order.items.length} món):
              </span>
              <span className="font-semibold text-ink">{formatVND(order.totalLaborFee)}</span>
            </div>

            {order.additionalServiceFee > 0 && (
              <div className="flex justify-between py-1 border-b border-border-soft/60">
                <span className="text-ink">Phí phụ bếp & Thiết bị chuyên dụng:</span>
                <span className="font-semibold text-ink">{formatVND(order.additionalServiceFee)}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 font-bold text-xs">
              <span className="text-ink">CỘNG TIỀN CÔNG ĐẦU BẾP (Mục B):</span>
              <span className="text-accent">{formatVND(order.totalLaborFee + order.additionalServiceFee)}</span>
            </div>
          </div>
        </div>

        {/* SECTION C: FINAL TOTAL */}
        <div className="p-6 bg-gradient-to-br from-surface-alt to-surface rounded-2xl border-2 border-brand space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Mục C: Tổng quyết toán</span>
              <h4 className="text-xl font-extrabold text-accent">Tổng số tiền thanh toán</h4>
              <p className="text-[11px] text-muted mt-0.5">= Tiền chợ thực tế (A) + Tiền công & Dịch vụ (B)</p>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-accent">
                {formatVND(order.finalPayableAmount)}
              </span>
            </div>
          </div>

          {/* Dispute Warning if any */}
          {isDisputed && (
            <div className="p-3 bg-surface-alt border border-border-soft text-accent rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-detail shrink-0" />
              <span>Đơn hàng đang có khiếu nại chưa giải quyết. Hệ thống tạm khóa thanh toán đối với khoản tiền này.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setShowDisputeModal(true)}
              className="text-xs text-accent hover:underline font-semibold"
            >
              Báo sai sót / Đặt câu hỏi về khoản tiền này
            </button>

            {isPaid ? (
              <div className="flex items-center gap-2 text-accent bg-surface-alt px-4 py-2 rounded-xl text-xs font-bold">
                <CheckCircle className="w-4 h-4 text-detail" />
                <span>ĐÃ THANH TOÁN THÀNH CÔNG</span>
              </div>
            ) : (
              <button
                disabled={isDisputed}
                onClick={() => setShowPaymentModal(true)}
                className={`w-full sm:w-auto px-8 py-3.5 text-on-brand font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                  isDisputed
                    ? 'bg-border-soft cursor-not-allowed text-muted'
                    : 'bg-brand hover:bg-brand-hover'
                }`}
              >
                <CreditCard className="w-4 h-4 text-on-brand" />
                <span>Xác nhận hoàn thành & Thanh toán ngay</span>
              </button>
            )}
          </div>
        </div>

        {/* Review Section after Payment */}
        {isPaid && (
          <div className="p-6 bg-surface-alt rounded-2xl border border-border-soft space-y-4">
            <h4 className="font-bold text-base text-accent flex items-center gap-2">
              <Star className="w-5 h-5 text-detail fill-detail" />
              <span>Đánh giá trải nghiệm bữa ăn</span>
            </h4>

            {reviewed || order.review ? (
              <div className="p-4 bg-surface-alt rounded-xl border border-border-soft text-xs text-accent space-y-1">
                <p className="font-bold">Cảm ơn bạn đã đánh giá 5 sao cho đầu bếp!</p>
                <p className="italic">"{order.review?.comment || reviewComment}"</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">Độ hài lòng chung:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`text-lg ${star <= reviewRating ? 'text-accent' : 'text-muted'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Viết nhận xét về độ ngon món ăn, sự nhiệt tình và độ minh bạch chứng từ..."
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-border-soft focus:ring-2 focus:ring-accent"
                />

                <button
                  onClick={handleSendReview}
                  className="px-4 py-2 bg-brand text-on-brand font-semibold rounded-lg hover:bg-brand-hover"
                >
                  Gửi đánh giá
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simulated Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-surface-alt rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-border-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border-soft bg-surface flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-accent">Thanh toán dịch vụ HomeMeal</h3>
                <p className="text-xs text-muted">Đơn #{order.orderCode} · Số tiền: {formatVND(order.finalPayableAmount)}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-muted hover:text-accent">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-surface-alt rounded-xl border border-border-soft text-accent text-xs">
                * Đây là giao diện thanh toán mô phỏng (Demo Prototype). Bạn sẽ không bị trừ tiền thật trong tài khoản ngân hàng.
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-ink">Chọn phương thức thanh toán:</label>

                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                  selectedPaymentMethod === 'bank_transfer' ? 'border-brand bg-surface-alt' : 'border-border-soft'
                }`}>
                  <input
                    type="radio"
                    name="payMethod"
                    value="bank_transfer"
                    checked={selectedPaymentMethod === 'bank_transfer'}
                    onChange={() => setSelectedPaymentMethod('bank_transfer')}
                  />
                  <Building2 className="w-4 h-4 text-detail" />
                  <div>
                    <p className="font-bold text-xs text-ink">Chuyển khoản ngân hàng 24/7 (VietQR)</p>
                    <p className="text-[10px] text-muted">Quét mã QR qua mọi ứng dụng ngân hàng</p>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                  selectedPaymentMethod === 'momo' ? 'border-brand bg-surface-alt' : 'border-border-soft'
                }`}>
                  <input
                    type="radio"
                    name="payMethod"
                    value="momo"
                    checked={selectedPaymentMethod === 'momo'}
                    onChange={() => setSelectedPaymentMethod('momo')}
                  />
                  <QrCode className="w-4 h-4 text-detail" />
                  <div>
                    <p className="font-bold text-xs text-ink">Ví điện tử MoMo</p>
                    <p className="text-[10px] text-muted">Thanh toán tức thì</p>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                  selectedPaymentMethod === 'card' ? 'border-brand bg-surface-alt' : 'border-border-soft'
                }`}>
                  <input
                    type="radio"
                    name="payMethod"
                    value="card"
                    checked={selectedPaymentMethod === 'card'}
                    onChange={() => setSelectedPaymentMethod('card')}
                  />
                  <CreditCard className="w-4 h-4 text-detail" />
                  <div>
                    <p className="font-bold text-xs text-ink">Thẻ Quốc tế (Visa / Mastercard / JCB)</p>
                    <p className="text-[10px] text-muted">Cổng thẻ nội địa và quốc tế</p>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t border-border-soft flex justify-end gap-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-border-soft text-xs font-semibold rounded-lg"
                >
                  Hủy
                </button>
                <button
                  disabled={isProcessingPayment}
                  onClick={handleSimulatedPayment}
                  className="px-6 py-2 bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  {isProcessingPayment ? 'Đang xác thực...' : `Thanh toán ${formatVND(order.finalPayableAmount)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedEvidenceItem && (
        <EvidenceModal item={selectedEvidenceItem} onClose={() => setSelectedEvidenceItem(null)} />
      )}

      {showDisputeModal && (
        <DisputeModal
          orderId={order.id}
          orderCode={order.orderCode}
          actualTotal={order.actualGroceryTotal}
          onClose={() => setShowDisputeModal(false)}
        />
      )}
    </div>
  );
};
