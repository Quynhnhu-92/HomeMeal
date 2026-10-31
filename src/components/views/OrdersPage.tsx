import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatVND } from '../../utils/pricing';
import { 
  ShoppingBag, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Users, 
  Receipt, 
  AlertTriangle, 
  FileText,
  CheckCircle,
  ChefHat
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'action_needed' | 'in_progress' | 'completed' | 'disputed'>('all');

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'action_needed') {
      return (
        order.status === 'service_completed' ||
        order.status === 'awaiting_budget_approval' ||
        order.status === 'quotation_submitted' ||
        order.status === 'disputed'
      );
    }
    if (activeTab === 'in_progress') {
      return (
        order.status === 'confirmed' ||
        order.status === 'shopping_in_progress' ||
        order.status === 'evidence_submitted' ||
        order.status === 'preparing_meal' ||
        order.status === 'serving_at_home'
      );
    }
    if (activeTab === 'completed') {
      return order.status === 'paid' || order.status === 'completed';
    }
    if (activeTab === 'disputed') {
      return order.status === 'disputed';
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border-soft">
        <div>
          <span className="text-xs font-bold text-accent uppercase tracking-wider">Lịch sử dịch vụ</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-accent">Đơn hàng của tôi</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Theo dõi tiến độ đi chợ, duyệt hóa đơn thực tế và thanh toán sau khi hoàn tất bữa ăn.
          </p>
        </div>

        <button
          onClick={() => navigateTo('/meal-planner')}
          className="cta-primary px-5 py-2.5 bg-brand text-on-brand font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 hover:bg-brand-hover shadow-sm self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4 text-on-brand" />
          <span>Đặt bữa ăn mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Tất cả đơn' },
          { id: 'action_needed', label: 'Cần bạn xử lý (Duyệt / Thanh toán / Báo giá)' },
          { id: 'in_progress', label: 'Đang nấu / Đi chợ' },
          { id: 'completed', label: 'Đã hoàn tất & Đã thanh toán' },
          { id: 'disputed', label: 'Đang khiếu nại' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-brand text-ink shadow-xs'
                : 'bg-surface border border-border-soft text-ink hover:bg-surface-alt'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const isPendingBillReview = order.status === 'service_completed';
          const isPendingBudget = order.status === 'awaiting_budget_approval';
          const isPendingQuote = order.status === 'quotation_submitted';
          const isDisputed = order.status === 'disputed';

          return (
            <div
              key={order.id}
              className={`bg-surface rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
                isPendingBillReview
                  ? 'border-accent ring-2 ring-accent/10'
                  : isPendingBudget
                  ? 'border-accent ring-2 ring-accent/10'
                  : isPendingQuote
                  ? 'border-accent ring-2 ring-accent/10'
                  : isDisputed
                  ? 'border-accent ring-2 ring-accent/10'
                  : 'border-border-soft hover:border-brand'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-soft">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-base text-accent">
                    #{order.orderCode}
                  </span>
                  <StatusBadge status={order.status} />
                </div>

                <div className="text-xs text-muted flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-detail" /> {order.date}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-detail" /> {order.servingTime}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="space-y-1 md:col-span-2">
                  <h3 className="font-bold text-accent text-base">{order.mealOccasion}</h3>
                  <p className="text-xs text-muted">
                    Quy mô: <strong>{order.guestCount} người ăn</strong> · Đầu bếp: <strong>{order.cook?.name || 'HomeMeal Chef'}</strong>
                  </p>
                  <p className="text-xs text-muted line-clamp-1 pt-1">
                    Thực đơn ({order.items.length} món): {order.items.map((i) => i.dish.name).join(', ')}
                  </p>
                </div>

                {/* Financial overview */}
                <div className="bg-surface-alt p-3.5 rounded-xl border border-border-soft space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Ngân sách chợ:</span>
                    <span className="font-semibold text-ink">{formatVND(order.estimatedGroceryBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Thực chi trên hóa đơn:</span>
                    <span className={`font-bold ${order.actualGroceryTotal > 0 ? 'text-accent' : 'text-muted'}`}>
                      {order.actualGroceryTotal > 0 ? formatVND(order.actualGroceryTotal) : 'Chưa đi chợ'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Tiền công nấu:</span>
                    <span className="font-semibold text-accent">{formatVND(order.totalLaborFee)}</span>
                  </div>
                  <div className="pt-1 border-t border-border-soft flex justify-between font-bold text-xs sm:text-sm">
                    <span className="text-ink">Tổng thanh toán:</span>
                    <span className="text-accent">{formatVND(order.finalPayableAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Scenario Action Prompts */}
              {isPendingBillReview && (
                <div className="p-3 bg-surface-alt rounded-xl border border-border-soft text-xs text-accent mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-detail shrink-0" />
                    <span>Bữa ăn đã được nấu và phục vụ hoàn tất! Mời bạn kiểm tra hóa đơn và thanh toán.</span>
                  </div>
                  <button
                    onClick={() => navigateTo(`/orders/${order.id}/bill`)}
                    className="px-3 py-1 bg-brand hover:bg-brand-hover text-on-brand font-bold rounded-lg text-xs"
                  >
                    Xem hóa đơn & Thanh toán
                  </button>
                </div>
              )}

              {isPendingBudget && (
                <div className="p-3 bg-surface-alt rounded-xl border border-border-soft text-xs text-accent mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-detail shrink-0" />
                    <span>Đầu bếp đang xin phép tăng ngân sách đi chợ. Vui lòng phê duyệt hoặc yêu cầu đổi món.</span>
                  </div>
                  <button
                    onClick={() => navigateTo(`/orders/${order.id}`)}
                    className="px-3 py-1 bg-brand hover:bg-brand-hover text-on-brand font-bold rounded-lg text-xs"
                  >
                    Xử lý yêu cầu
                  </button>
                </div>
              )}

              {isPendingQuote && (
                <div className="p-3 bg-surface-alt rounded-xl border border-border-soft text-xs text-accent mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-detail shrink-0" />
                    <span>Đầu bếp đã gửi bảng báo giá chi tiết gồm tiền công và nhân sự phụ bếp tiệc.</span>
                  </div>
                  <button
                    onClick={() => navigateTo(`/orders/${order.id}`)}
                    className="px-3 py-1 bg-brand hover:bg-brand-hover text-on-brand font-bold rounded-lg text-xs"
                  >
                    Xem báo giá
                  </button>
                </div>
              )}

              {isDisputed && (
                <div className="p-3 bg-surface-alt rounded-xl border border-border-soft text-xs text-accent mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-detail shrink-0" />
                    <span>Đơn hàng đang trong trạng thái khiếu nại chứng từ. Tiền chưa bị trừ.</span>
                  </div>
                  <button
                    onClick={() => navigateTo(`/orders/${order.id}`)}
                    className="px-3 py-1 bg-brand hover:bg-brand-hover text-on-brand font-bold rounded-lg text-xs"
                  >
                    Xem tiến độ giải quyết
                  </button>
                </div>
              )}

              {/* Bottom Footer Actions */}
              <div className="pt-3 border-t border-border-soft flex items-center justify-between">
                <span className="text-xs text-muted">
                  {order.shoppingList.length > 0
                    ? `Đã tải lên ${order.shoppingList.length} chứng từ nguyên liệu`
                    : 'Chưa có chứng từ đi chợ'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo(`/orders/${order.id}`)}
                    className="px-4 py-2 bg-surface-alt hover:bg-border-soft text-ink font-semibold text-xs rounded-xl flex items-center gap-1"
                  >
                    <span>Chi tiết đơn & Tiến trình</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 bg-surface rounded-2xl border border-border-soft space-y-3">
            <ShoppingBag className="w-10 h-10 text-muted mx-auto opacity-50" />
            <h3 className="font-bold text-accent">Không có đơn hàng nào ở mục này</h3>
            <p className="text-xs text-muted">Hãy thử chọn bộ lọc khác hoặc đặt một bữa ăn mới.</p>
          </div>
        )}
      </div>
    </div>
  );
};
