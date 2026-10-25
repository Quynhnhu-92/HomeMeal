import React, { useState } from 'react';
import type { FormEvent } from 'react';
import type { Order, Quotation, UserProfile } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { formatVND } from '../../../utils/pricing';
import { StatusBadge } from '../../common/StatusBadge';
import { 
  ChefHat, 
  ShoppingBag, 
  Receipt, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  FileText,
  UserCheck
} from 'lucide-react';

export const CookDashboardPage: React.FC = () => {
  const { currentUser, orders, navigateTo, updateOrderStatus, submitCookQuotation } = useApp();

  // Statistics
  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'paid' && o.status !== 'cancelled');
  const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'paid');
  
  const totalLaborEarnings = completedOrders.reduce((sum, o) => sum + (o.totalLaborFee || 0), 0);
  const totalReimbursedGrocery = completedOrders.reduce((sum, o) => sum + (o.actualGroceryTotal || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-surface-alt text-accent">
              <ChefHat className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Góc làm việc của Đầu bếp
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-accent">Bảng điều khiển & Đơn nhận nấu</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Quản lý quy trình đi chợ chụp hóa đơn, nấu nướng và theo dõi thu nhập tiền công minh bạch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('/cook/shopping')}
            className="px-4 py-2.5 bg-accent text-on-accent font-semibold text-xs sm:text-sm rounded-xl hover:bg-accent-hover shadow-sm flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4 text-on-accent" />
            <span>Mục đi chợ & Hóa đơn</span>
          </button>
          <button
            onClick={() => navigateTo('/cook/earnings')}
            className="px-4 py-2.5 bg-surface border border-border-soft text-ink font-semibold text-xs sm:text-sm rounded-xl hover:bg-surface-alt"
          >
            Báo cáo thu nhập
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-border-soft space-y-1">
          <span className="text-xs text-muted">Đơn đang thực hiện:</span>
          <p className="text-2xl font-bold text-accent">{activeOrders.length}</p>
          <p className="text-[11px] text-muted">Cần đi chợ & nấu ăn</p>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border-soft space-y-1">
          <span className="text-xs text-muted">Thu nhập công nấu:</span>
          <p className="text-2xl font-bold text-accent">{formatVND(totalLaborEarnings)}</p>
          <p className="text-[11px] text-accent font-medium">Tiền công thuần của bạn</p>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border-soft space-y-1">
          <span className="text-xs text-muted">Tiền chợ đã hoàn trả:</span>
          <p className="text-2xl font-bold text-ink">{formatVND(totalReimbursedGrocery)}</p>
          <p className="text-[11px] text-muted">Theo hóa đơn chợ thật</p>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border-soft space-y-1">
          <span className="text-xs text-muted">Đơn đã hoàn tất:</span>
          <p className="text-2xl font-bold text-accent">{completedOrders.length}</p>
          <p className="text-[11px] text-muted">100% đánh giá 5 sao</p>
        </div>
      </div>

      {/* Orders to Manage */}
      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-accent">Đơn hàng cần xử lý</h2>
            <p className="text-xs text-muted">Cập nhật trạng thái từng bước: Đi chợ → Nấu nướng → Phục vụ xong</p>
          </div>
          <span className="text-xs font-semibold text-accent bg-surface-alt px-3 py-1 rounded-lg">
            {orders.length} tổng số đơn
          </span>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-2xl border border-border-soft bg-surface-alt flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand transition-all"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm text-accent">#{order.orderCode}</span>
                  <StatusBadge status={order.status} size="sm" />
                  <span className="text-xs text-muted">· {order.mealOccasion}</span>
                </div>
                <p className="text-xs text-ink">
                  Khách: <strong>{order.customerName}</strong> ({order.customerPhone}) · {order.guestCount} người ăn
                </p>
                <p className="text-xs text-muted line-clamp-1">
                  Địa chỉ: {order.customerAddress}
                </p>
                <div className="flex items-center gap-4 text-xs font-medium text-accent pt-1">
                  <span>Ngân sách chợ: {formatVND(order.estimatedGroceryBudget)}</span>
                  <span>·</span>
                  <span>Công nấu: {formatVND(order.totalLaborFee)}</span>
                </div>
              </div>

                {order.status === 'awaiting_quotation' && (
                  <>
                    <p className="text-xs text-muted pt-2">{order.generalPreferences}</p>
                    <CookQuotationForm
                      order={order}
                      currentUser={currentUser}
                      onSubmit={submitCookQuotation}
                    />
                  </>
                )}
              {/* Action Controls for Cook */}
              <div className="flex flex-wrap items-center gap-2">
                {order.status === 'awaiting_cook' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'confirmed', 'Đầu bếp đã nhận đơn!')}
                    className="px-3.5 py-1.5 bg-accent text-on-accent text-xs font-semibold rounded-lg hover:bg-accent-hover"
                  >
                    Chấp nhận đơn
                  </button>
                )}

                {order.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(order.id, 'shopping_in_progress', 'Đầu bếp bắt đầu đi chợ');
                      navigateTo(`/cook/shopping?orderId=${order.id}`);
                    }}
                    className="px-3.5 py-1.5 bg-accent text-on-accent text-xs font-semibold rounded-lg hover:bg-accent-hover"
                  >
                    Bắt đầu đi chợ
                  </button>
                )}

                {order.status === 'shopping_in_progress' && (
                  <button
                    onClick={() => navigateTo(`/cook/shopping?orderId=${order.id}`)}
                    className="px-3.5 py-1.5 bg-accent text-on-accent text-xs font-semibold rounded-lg hover:bg-accent-hover"
                  >
                    Tải hóa đơn chợ & Quản lý
                  </button>
                )}

                {order.status === 'evidence_submitted' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing_meal', 'Đầu bếp bắt đầu nấu nướng')}
                    className="px-3.5 py-1.5 bg-accent text-on-accent text-xs font-semibold rounded-lg hover:bg-accent-hover"
                  >
                    Bắt đầu nấu món
                  </button>
                )}

                {order.status === 'preparing_meal' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'serving_at_home', 'Đầu bếp đang tới nhà khách hàng & bắt đầu nấu tại gian bếp')}
                    className="px-3.5 py-1.5 bg-accent text-on-accent text-xs font-semibold rounded-lg hover:bg-accent-hover"
                  >
                    Đến nhà khách nấu
                  </button>
                )}

                {order.status === 'serving_at_home' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'service_completed', 'Đã nấu xong, dọn mâm cơm lên bàn ăn nóng hổi và dọn dẹp sạch sẽ gian bếp')}
                    className="px-3.5 py-1.5 bg-accent text-on-accent text-xs font-semibold rounded-lg hover:bg-accent-hover"
                  >
                    Xác nhận nấu & dọn xong
                  </button>
                )}

                <button
                  onClick={() => navigateTo(`/cook/orders/${order.id}`)}
                  className="px-3 py-1.5 border border-border-soft text-xs font-semibold text-ink rounded-lg hover:bg-surface-alt"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface CookQuotationFormProps {
  order: Order;
  currentUser: UserProfile;
  onSubmit: (
    orderId: string,
    quotationData: Omit<Quotation, 'id' | 'orderId' | 'status' | 'submittedAt'>
  ) => void;
}

const CookQuotationForm: React.FC<CookQuotationFormProps> = ({ order, currentUser, onSubmit }) => {
  const requestedAssistantCount = Number(
    order.generalPreferences.match(/Cần\s+(\d+)\s+phụ bếp/)?.[1] || 0
  );
  const [laborFee, setLaborFee] = useState(
    order.quotation?.laborFee ?? Math.max(0, order.totalLaborFee - order.additionalServiceFee)
  );
  const [assistantCount, setAssistantCount] = useState(
    order.quotation?.assistantCount ?? requestedAssistantCount
  );
  const [assistantFee, setAssistantFee] = useState(order.quotation?.assistantFee ?? 0);
  const [equipmentFee, setEquipmentFee] = useState(order.quotation?.equipmentFee ?? 0);
  const [estimatedPrepTimeHours, setEstimatedPrepTimeHours] = useState(
    order.quotation?.estimatedPrepTimeHours ?? 4
  );
  const [surchargeNotes, setSurchargeNotes] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const totalLaborAndServices = laborFee + assistantFee + equipmentFee;

    onSubmit(order.id, {
      cookId: order.cookId || currentUser.id,
      cookName: order.cook?.name || currentUser.name,
      laborFee,
      assistantCount,
      assistantFee,
      equipmentFee,
      estimatedPrepTimeHours,
      surchargeNotes,
      totalLaborAndServices,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-brand bg-surface p-4 space-y-3">
      <h3 className="text-sm font-bold text-accent">Gửi báo giá cho khách</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <label className="space-y-1">
          <span className="block font-medium">Công nấu (VNĐ)</span>
          <input type="number" min="0" step="50000" required value={laborFee} onChange={(event) => setLaborFee(Number(event.target.value))} className="w-full rounded-lg border border-border-soft px-2 py-1.5" />
        </label>
        <label className="space-y-1">
          <span className="block font-medium">Số phụ bếp</span>
          <input type="number" min="0" step="1" required value={assistantCount} onChange={(event) => setAssistantCount(Number(event.target.value))} className="w-full rounded-lg border border-border-soft px-2 py-1.5" />
        </label>
        <label className="space-y-1">
          <span className="block font-medium">Phí phụ bếp (VNĐ)</span>
          <input type="number" min="0" step="50000" required value={assistantFee} onChange={(event) => setAssistantFee(Number(event.target.value))} className="w-full rounded-lg border border-border-soft px-2 py-1.5" />
        </label>
        <label className="space-y-1">
          <span className="block font-medium">Phí thiết bị (VNĐ)</span>
          <input type="number" min="0" step="50000" required value={equipmentFee} onChange={(event) => setEquipmentFee(Number(event.target.value))} className="w-full rounded-lg border border-border-soft px-2 py-1.5" />
        </label>
        <label className="space-y-1">
          <span className="block font-medium">Thời gian chuẩn bị (giờ)</span>
          <input type="number" min="0.5" step="0.5" required value={estimatedPrepTimeHours} onChange={(event) => setEstimatedPrepTimeHours(Number(event.target.value))} className="w-full rounded-lg border border-border-soft px-2 py-1.5" />
        </label>
        <label className="space-y-1 sm:col-span-3">
          <span className="block font-medium">Ghi chú báo giá</span>
          <input value={surchargeNotes} onChange={(event) => setSurchargeNotes(event.target.value)} className="w-full rounded-lg border border-border-soft px-2 py-1.5" />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-accent">
          Tổng dịch vụ: {formatVND(laborFee + assistantFee + equipmentFee)}
        </span>
        <button type="submit" className="rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-on-accent hover:bg-accent-hover">
          Gửi báo giá
        </button>
      </div>
    </form>
  );
};
