import React from 'react';
import { useApp } from '../../../context/AppContext';
import { formatVND } from '../../../utils/pricing';
import { ArrowLeft, DollarSign, Receipt, CheckCircle, ShieldCheck, Wallet } from 'lucide-react';

export const CookEarningsPage: React.FC = () => {
  const { orders, navigateTo } = useApp();

  const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'paid');

  const totalLaborEarnings = completedOrders.reduce((sum, o) => sum + (o.totalLaborFee || 0), 0);
  const totalReimbursedGrocery = completedOrders.reduce((sum, o) => sum + (o.actualGroceryTotal || 0), 0);
  const totalSettlement = totalLaborEarnings + totalReimbursedGrocery;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigateTo('/cook/dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Bảng điều khiển đầu bếp</span>
      </button>

      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-8 shadow-xs">
        <div className="border-b border-border-soft pb-4 mb-6">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">Tài chính minh bạch</span>
          <h1 className="text-2xl font-bold text-accent">Báo cáo thu nhập & Hoàn tiền chợ</h1>
          <p className="text-xs text-muted mt-1">
            HomeMeal tách bạch hoàn toàn tiền công nấu của đầu bếp với khoản hoàn trả tiền chợ theo hóa đơn thực tế.
          </p>
        </div>

        {/* Big Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-6 rounded-2xl bg-surface-alt border border-brand space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-accent">
              <span>THU NHẬP CÔNG NẤU TẠI GIA</span>
              <Wallet className="w-5 h-5 text-detail" />
            </div>
            <p className="text-3xl font-extrabold text-accent">{formatVND(totalLaborEarnings)}</p>
            <p className="text-[11px] text-accent font-medium">
              Tiền công nấu trực tiếp tại nhà khách
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-alt border border-border-soft space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-ink">
              <span>HOÀN TRẢ TIỀN CHỢ (HÓA ĐƠN)</span>
              <Receipt className="w-5 h-5 text-muted" />
            </div>
            <p className="text-3xl font-extrabold text-ink">{formatVND(totalReimbursedGrocery)}</p>
            <p className="text-[11px] text-muted">
              Hoàn trả 100% theo chứng từ thực tế
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-alt border border-border-soft space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-ink">
              <span>TỔNG QUYẾT TOÁN NHẬN VỀ</span>
              <DollarSign className="w-5 h-5 text-muted" />
            </div>
            <p className="text-3xl font-extrabold text-ink">{formatVND(totalSettlement)}</p>
            <p className="text-[11px] text-muted">
              Tiền công + 100% chi phí đi chợ
            </p>
          </div>
        </div>

        {/* Orders Breakdown */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-accent">Bảng kê chi tiết từng đơn hàng hoàn tất:</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-alt text-muted border-b border-border-soft">
                  <th className="py-3 px-3">Mã đơn</th>
                  <th className="py-3 px-3">Ngày phục vụ</th>
                  <th className="py-3 px-3">Khách hàng</th>
                  <th className="py-3 px-3">Hình thức</th>
                  <th className="py-3 px-3 text-right">Tiền công nấu</th>
                  <th className="py-3 px-3 text-right">Hoàn tiền chợ</th>
                  <th className="py-3 px-3 text-center">Trạng thái thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {completedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-alt/50">
                    <td className="py-3 px-3 font-mono font-bold text-accent">#{o.orderCode}</td>
                    <td className="py-3 px-3 text-muted">{o.date}</td>
                    <td className="py-3 px-3 text-ink font-medium">{o.customerName}</td>
                    <td className="py-3 px-3 text-muted">{o.serviceType === 'party_at_home' ? 'Nấu tiệc tại gia' : 'Nấu cơm tại nhà'}</td>
                    <td className="py-3 px-3 text-right font-bold text-accent">{formatVND(o.totalLaborFee)}</td>
                    <td className="py-3 px-3 text-right font-medium text-ink">{formatVND(o.actualGroceryTotal)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent bg-surface-alt px-2.5 py-0.5 rounded-full border border-border-soft">
                        <CheckCircle className="w-3 h-3 text-detail" /> Đã chuyển khoản
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
