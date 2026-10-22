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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5ECE7]">
        <div>
          <span className="text-xs font-bold text-[#285E56] uppercase tracking-wider">Lịch sử dịch vụ</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263B35]">Đơn hàng của tôi</h1>
          <p className="text-xs sm:text-sm text-[#738078] mt-1">
            Theo dõi tiến độ đi chợ, duyệt hóa đơn thực tế và thanh toán sau khi hoàn tất bữa ăn.
          </p>
        </div>

        <button
          onClick={() => navigateTo('/meal-planner')}
          className="px-5 py-2.5 bg-[#285E56] text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 hover:bg-[#1f4b44] shadow-sm self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4 text-[#B8E4D3]" />
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
                ? 'bg-[#285E56] text-white shadow-xs'
                : 'bg-white border border-[#E5ECE7] text-[#263B35] hover:bg-[#E7F5EF]'
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
              className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
                isPendingBillReview
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                  : isPendingBudget
                  ? 'border-amber-400 ring-2 ring-amber-400/10'
                  : isPendingQuote
                  ? 'border-indigo-400 ring-2 ring-indigo-400/10'
                  : isDisputed
                  ? 'border-rose-400 ring-2 ring-rose-400/10'
                  : 'border-[#E5ECE7] hover:border-[#B8E4D3]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5ECE7]">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-base text-[#285E56]">
                    #{order.orderCode}
                  </span>
                  <StatusBadge status={order.status} />
                </div>

                <div className="text-xs text-[#738078] flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#285E56]" /> {order.date}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#285E56]" /> {order.servingTime}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="space-y-1 md:col-span-2">
                  <h3 className="font-bold text-[#263B35] text-base">{order.mealOccasion}</h3>
                  <p className="text-xs text-[#738078]">
                    Quy mô: <strong>{order.guestCount} người ăn</strong> · Đầu bếp: <strong>{order.cook?.name || 'HomeMeal Chef'}</strong>
                  </p>
                  <p className="text-xs text-[#738078] line-clamp-1 pt-1">
                    Thực đơn ({order.items.length} món): {order.items.map((i) => i.dish.name).join(', ')}
                  </p>
                </div>

                {/* Financial overview */}
                <div className="bg-[#FFFDF7] p-3.5 rounded-xl border border-[#E5ECE7] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#738078]">Ngân sách chợ:</span>
                    <span className="font-semibold text-[#263B35]">{formatVND(order.estimatedGroceryBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#738078]">Thực chi trên hóa đơn:</span>
                    <span className={`font-bold ${order.actualGroceryTotal > 0 ? 'text-[#285E56]' : 'text-[#738078]'}`}>
                      {order.actualGroceryTotal > 0 ? formatVND(order.actualGroceryTotal) : 'Chưa đi chợ'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#738078]">Tiền công nấu:</span>
                    <span className="font-semibold text-[#285E56]">{formatVND(order.totalLaborFee)}</span>
                  </div>
                  <div className="pt-1 border-t border-[#E5ECE7] flex justify-between font-bold text-xs sm:text-sm">
                    <span className="text-[#263B35]">Tổng thanh toán:</span>
                    <span className="text-[#285E56]">{formatVND(order.finalPayableAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Scenario Action Prompts */}
              {isPendingBillReview && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Bữa ăn đã được nấu và phục vụ hoàn tất! Mời bạn kiểm tra hóa đơn và thanh toán.</span>
                  </div>
                  <button
                    onClick={() => navigateTo(`/orders/${order.id}/bill`)}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs"
                  >
                    Xem hóa đơn & Thanh toán
                  </button>
                </div>
              )}

              {isPendingBudget && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Đầu bếp đang xin phép tăng ngân sách đi chợ. Vui lòng phê duyệt hoặc yêu cầu đổi món.</span>
                  </div>
                  <button
                    onClick={() => navigateTo(`/orders/${order.id}`)}
                    className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs"
                  >
                    Xử lý yêu cầu
                  </button>
                </div>
              )}

              {isPendingQuote && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-xs text-indigo-900 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-700 shrink-0" />
                    <span>Đầu bếp đã gửi bảng báo giá chi tiết gồm tiền công và nhân sự phụ bếp tiệc.</span>
                  </div>
                  <button
                    onClick={() => navigateTo(`/orders/${order.id}`)}
                    className="px-3 py-1 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg text-xs"
                  >
                    Xem báo giá
                  </button>
                </div>
              )}

              {isDisputed && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>Đơn hàng đang trong trạng thái khiếu nại chứng từ. Tiền chưa bị trừ.</span>
                  </div>
                  <button
                    onClick={() => navigateTo(`/orders/${order.id}`)}
                    className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs"
                  >
                    Xem tiến độ giải quyết
                  </button>
                </div>
              )}

              {/* Bottom Footer Actions */}
              <div className="pt-3 border-t border-[#E5ECE7] flex items-center justify-between">
                <span className="text-xs text-[#738078]">
                  {order.shoppingList.length > 0
                    ? `Đã tải lên ${order.shoppingList.length} chứng từ nguyên liệu`
                    : 'Chưa có chứng từ đi chợ'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo(`/orders/${order.id}`)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#263B35] font-semibold text-xs rounded-xl flex items-center gap-1"
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
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E5ECE7] space-y-3">
            <ShoppingBag className="w-10 h-10 text-[#738078] mx-auto opacity-50" />
            <h3 className="font-bold text-[#263B35]">Không có đơn hàng nào ở mục này</h3>
            <p className="text-xs text-[#738078]">Hãy thử chọn bộ lọc khác hoặc đặt một bữa ăn mới.</p>
          </div>
        )}
      </div>
    </div>
  );
};
