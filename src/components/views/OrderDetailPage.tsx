import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatVND } from '../../utils/pricing';
import { ShoppingEvidenceItem } from '../../types';
import { EvidenceModal } from '../common/EvidenceModal';
import { DisputeModal } from '../common/DisputeModal';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Receipt, 
  CheckCircle, 
  AlertTriangle, 
  ChefHat, 
  Phone, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  DollarSign,
  HelpCircle,
  Eye,
  Check,
  X
} from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface OrderDetailPageProps {
  orderId: string;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId }) => {
  const { 
    getOrderById, 
    navigateTo, 
    approveBudgetChange, 
    rejectBudgetChange,
    acceptQuotation,
    rejectQuotation,
    currentUser,
  } = useApp();

  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState<ShoppingEvidenceItem | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'evidence' | 'quotation'>('timeline');

  const order = getOrderById(orderId);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-accent">Không tìm thấy đơn hàng</h2>
        <p className="text-xs text-muted">Mã đơn hàng không hợp lệ hoặc đã bị xóa.</p>
        <button
          onClick={() => navigateTo('/orders')}
          className="px-5 py-2.5 bg-brand text-on-brand text-xs font-semibold rounded-xl"
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  const pendingBudgetRequest = order.budgetChangeRequests.find((r) => r.status === 'pending');
  const quotation = order.quotation;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách đơn hàng</span>
        </button>

        <div className="flex items-center gap-2">
          {currentUser.role === 'cook' && (
            <button
              onClick={() => {
                navigateTo(`/cook/orders/${order.id}`);
              }}
              className="text-xs font-medium text-accent hover:underline bg-surface-alt px-2.5 py-1 rounded-lg"
            >
              Xem đơn trong Góc Đầu Bếp
            </button>
          )}
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-soft">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-accent">Đơn hàng #{order.orderCode}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-muted mt-1">
              Khởi tạo ngày: {order.createdAt} · Dịp: <strong>{order.mealOccasion}</strong>
            </p>
          </div>

          {/* Quick Pay CTA if completed */}
          {order.status === 'service_completed' && (
            <button
              onClick={() => navigateTo(`/orders/${order.id}/bill`)}
              className="px-6 py-3 bg-brand hover:bg-brand-hover text-on-brand font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Receipt className="w-4 h-4 text-on-brand" />
              <span>Xem hóa đơn & Thanh toán</span>
            </button>
          )}

          {order.status === 'paid' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-alt border border-border-soft text-accent rounded-xl text-xs font-bold">
              <CheckCircle className="w-4 h-4 text-detail" />
              <span>Đã thanh toán trọn vẹn</span>
            </div>
          )}
        </div>

        {/* SCENARIO B BANNER: BÁO GIÁ ĐỢI DUYỆT */}
        {order.status === 'quotation_submitted' && quotation && (
          <div className="p-5 bg-surface-alt/80 rounded-2xl border border-border-soft space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-accent font-bold text-base">
                <FileText className="w-5 h-5 text-detail" />
                <span>Đầu bếp đã gửi Bảng báo giá tiệc tại nhà #{quotation.id}</span>
              </div>
              <span className="text-xs bg-brand text-on-brand font-bold px-2 py-0.5 rounded">
                Chờ bạn phê duyệt
              </span>
            </div>

            <p className="text-xs text-accent leading-relaxed">
              Dựa trên quy mô <strong>{order.guestCount} khách</strong> và các yêu cầu tiệc của bạn, đầu bếp <strong>{quotation.cookName}</strong> đã lập dự toán công nấu và nhân sự hỗ trợ chi tiết.
            </p>

            <div className="bg-surface rounded-xl p-4 border border-border-soft grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted block">Công nấu chính:</span>
                <span className="font-bold text-ink">{formatVND(quotation.laborFee)}</span>
              </div>
              <div>
                <span className="text-muted block">Phụ bếp ({quotation.assistantCount} người):</span>
                <span className="font-bold text-ink">{formatVND(quotation.assistantFee)}</span>
              </div>
              <div>
                <span className="text-muted block">Dụng cụ chuyên dụng:</span>
                <span className="font-bold text-ink">{formatVND(quotation.equipmentFee)}</span>
              </div>
              <div>
                <span className="text-muted block">Tổng tiền dịch vụ:</span>
                <span className="font-bold text-accent text-sm">{formatVND(quotation.totalLaborAndServices)}</span>
              </div>
            </div>

            {quotation.surchargeNotes && (
              <p className="text-xs text-accent italic">
                * Ghi chú từ đầu bếp: "{quotation.surchargeNotes}"
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => acceptQuotation(order.id)}
                className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Đồng ý báo giá & Chốt lịch nấu</span>
              </button>
              <button
                onClick={() => rejectQuotation(order.id)}
                className="px-4 py-2.5 bg-surface border border-accent text-accent font-semibold text-xs rounded-xl hover:bg-surface-alt"
              >
                Từ chối báo giá
              </button>
            </div>
          </div>
        )}

        {/* SCENARIO C BANNER: XIN PHÉP TĂNG NGÂN SÁCH ĐI CHỢ */}
        {order.status === 'awaiting_budget_approval' && pendingBudgetRequest && (
          <div className="p-5 bg-surface-alt rounded-2xl border border-accent space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-accent font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-detail" />
                <span>Yêu cầu phê duyệt điều chỉnh ngân sách đi chợ</span>
              </div>
              <span className="text-xs bg-surface-alt text-accent font-bold px-2 py-0.5 rounded">
                Tạm dừng đi chợ chờ ý kiến bạn
              </span>
            </div>

            <p className="text-xs sm:text-sm text-accent leading-relaxed">
              Đầu bếp phát hiện nguyên liệu <strong>"{pendingBudgetRequest.affectedItem}"</strong> tại chợ có giá biến động.
            </p>

            <div className="bg-surface rounded-xl p-4 border border-border-soft space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Ngân sách ban đầu:</span>
                <span className="font-semibold text-ink">{formatVND(pendingBudgetRequest.originalBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Ngân sách mới đề xuất:</span>
                <span className="font-bold text-accent">{formatVND(pendingBudgetRequest.requestedBudget)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border-soft pt-1">
                <span>Số tiền chênh lệch cần duyệt thêm:</span>
                <span className="text-accent">+{formatVND(pendingBudgetRequest.difference)}</span>
              </div>
              <div className="pt-1">
                <span className="text-muted block mb-1">Giải trình cụ thể của đầu bếp:</span>
                <p className="p-2.5 bg-surface-alt rounded-lg text-ink italic">
                  "{pendingBudgetRequest.reason}"
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => approveBudgetChange(order.id, pendingBudgetRequest.id)}
                className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Đồng ý duyệt tăng +{formatVND(pendingBudgetRequest.difference)}</span>
              </button>
              <button
                onClick={() => rejectBudgetChange(order.id, pendingBudgetRequest.id)}
                className="px-4 py-2.5 bg-surface border border-accent text-accent font-semibold text-xs rounded-xl hover:bg-surface-alt"
              >
                Yêu cầu đổi sang nguyên liệu khác (giữ ngân sách cũ)
              </button>
            </div>
          </div>
        )}

        {/* SCENARIO D BANNER: KHIẾU NẠI ĐANG XỬ LÝ */}
        {order.status === 'disputed' && order.dispute && (
          <div className="p-5 bg-surface-alt rounded-2xl border border-accent space-y-3">
            <div className="flex items-center gap-2 text-accent font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-detail" />
              <span>Đơn hàng đang có khiếu nại chứng từ</span>
            </div>
            <p className="text-xs text-accent">
              Khách hàng đã gửi yêu cầu làm rõ về khoản tiền <strong>{formatVND(order.dispute.reportedAmount)}</strong>. Hệ thống đã tạm dừng thanh toán tự động.
            </p>
            <div className="bg-surface p-3.5 rounded-xl border border-border-soft text-xs space-y-1">
              <p><strong>Lý do:</strong> {order.dispute.reason}</p>
              <p><strong>Mô tả của bạn:</strong> {order.dispute.description}</p>
              <p className="text-[11px] text-muted">Gửi lúc: {order.dispute.createdAt}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-accent font-semibold">
                Đội ngũ chăm sóc khách hàng và đầu bếp đang đối soát biên lai. Bạn không bị thu tiền trong lúc này.
              </span>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          {/* Col 1: Service & Time */}
          <div className="space-y-3 bg-surface-alt p-4 rounded-2xl border border-border-soft">
            <h3 className="font-bold text-accent">Thông tin thời gian & Địa chỉ phục vụ tại gia:</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-detail" />
                <span>{order.date} lúc {order.servingTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-detail" />
                <span>{order.guestCount} người ăn</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-accent">
                <span>Hình thức: {order.serviceType === 'party_at_home' ? 'Đầu bếp nấu tiệc tại gia' : 'Đầu bếp đến tận nhà nấu ăn'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-detail shrink-0 mt-0.5" />
                <span className="line-clamp-2">{order.customerAddress}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Cook Info */}
          <div className="space-y-3 bg-surface-alt p-4 rounded-2xl border border-border-soft">
            <h3 className="font-bold text-accent">Đầu bếp đảm nhận:</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-brand shrink-0">
                <ImageWithFallback
                  src={order.cook?.avatar || ''}
                  alt={order.cook?.name || 'Đầu bếp'}
                  fallbackType="cook"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-accent">{order.cook?.name}</h4>
                <p className="text-[11px] text-muted line-clamp-1">{order.cook?.title}</p>
                <div className="flex items-center gap-1 text-[11px] text-accent font-semibold">
                  <Phone className="w-3 h-3" />
                  <span>0912 345 678 (Liên hệ)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Financial Summary */}
          <div className="space-y-3 bg-surface-alt p-4 rounded-2xl border border-brand">
            <h3 className="font-bold text-accent">Tóm tắt chi phí:</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Ngân sách chợ phê duyệt:</span>
                <span className="font-semibold text-ink">{formatVND(order.estimatedGroceryBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Thực chi trên hóa đơn:</span>
                <span className="font-bold text-accent">
                  {order.actualGroceryTotal > 0 ? formatVND(order.actualGroceryTotal) : 'Đang đi chợ'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tiền công nấu:</span>
                <span className="font-semibold text-ink">{formatVND(order.totalLaborFee)}</span>
              </div>
              <div className="pt-1.5 border-t border-brand/50 flex justify-between font-bold text-xs sm:text-sm">
                <span>Tổng phải thanh toán:</span>
                <span className="text-base text-accent">{formatVND(order.finalPayableAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls: Timeline vs Evidence */}
        <div className="pt-4 border-t border-border-soft">
          <div className="flex items-center gap-3 border-b border-border-soft pb-2 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'timeline'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted hover:text-accent'
              }`}
            >
              Tiến trình đơn hàng ({order.statusHistory.length} cập nhật)
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`pb-2 transition-colors relative flex items-center gap-1.5 ${
                activeTab === 'evidence'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted hover:text-accent'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Chứng từ & Hóa đơn đi chợ ({order.shoppingList.length})</span>
            </button>
          </div>

          {/* TAB 1: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="py-6 space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-soft">
                {order.statusHistory.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-brand text-ink flex items-center justify-center text-[10px] font-bold ring-4 ring-surface">
                      ✓
                    </span>
                    <div className="bg-surface-alt p-3.5 rounded-xl border border-border-soft space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-ink">{step.note}</span>
                        <span className="text-[11px] text-muted">{step.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SHOPPING EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="py-6 space-y-6">
              <div className="flex items-center justify-between text-xs">
                <p className="text-muted">
                  Đầu bếp đã cập nhật <strong>{order.shoppingList.length} món nguyên liệu</strong> có biên lai đối soát.
                </p>
                <span className="font-bold text-accent">
                  Tổng thực chi: {formatVND(order.actualGroceryTotal)} / Ngân sách {formatVND(order.estimatedGroceryBudget)}
                </span>
              </div>

              {order.shoppingList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {order.shoppingList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedEvidenceItem(item)}
                      className="bg-surface-alt rounded-xl border border-border-soft p-3 hover:border-brand hover:shadow-md transition-all cursor-pointer space-y-2 text-xs"
                    >
                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-surface-alt relative">
                        <ImageWithFallback
                          src={item.receiptImageUrl || item.ingredientImageUrl || ''}
                          alt={item.name}
                          fallbackType="receipt"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-ink/90 text-on-accent text-[10px] flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Xem ảnh
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-accent line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] text-muted">Tại: {item.storeName} ({item.quantity} {item.unit})</p>
                        <div className="flex justify-between items-center pt-1 font-bold">
                          <span className="text-muted font-normal">Thực trả:</span>
                          <span className="text-accent">{formatVND(item.actualPrice)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-surface-alt rounded-xl border border-border-soft text-xs text-muted">
                  Đầu bếp chưa bắt đầu đi chợ hoặc đang mua sắm. Chứng từ sẽ xuất hiện ngay khi đầu bếp chụp ảnh.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer dispute & help bar */}
        <div className="pt-4 border-t border-border-soft flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted">
            <HelpCircle className="w-4 h-4 text-detail" />
            <span>Có thắc mắc về giá cả hoặc chất lượng phục vụ?</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDisputeModal(true)}
              className="px-3 py-1.5 border border-border-soft text-accent bg-surface-alt hover:bg-surface-alt rounded-lg font-semibold"
            >
              Khiếu nại hóa đơn / Báo sai sót
            </button>
            <button
              onClick={() => navigateTo('/support')}
              className="px-3 py-1.5 border border-border-soft hover:bg-surface-alt rounded-lg text-ink"
            >
              Xem chính sách hoàn tiền
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedEvidenceItem && (
        <EvidenceModal item={selectedEvidenceItem} onClose={() => setSelectedEvidenceItem(null)} />
      )}

      {showDisputeModal && (
        <DisputeModal
          orderId={order.id}
          orderCode={order.orderCode}
          actualTotal={order.actualGroceryTotal || order.estimatedGroceryBudget}
          onClose={() => setShowDisputeModal(false)}
        />
      )}
    </div>
  );
};
