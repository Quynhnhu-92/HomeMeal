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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#738078] hover:text-[#285E56]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Bảng điều khiển đầu bếp</span>
      </button>

      <div className="bg-white rounded-3xl border border-[#E5ECE7] p-6 sm:p-8 shadow-xs">
        <div className="border-b border-[#E5ECE7] pb-4 mb-6">
          <span className="text-xs font-bold text-[#285E56] uppercase tracking-wider">Tài chính minh bạch</span>
          <h1 className="text-2xl font-bold text-[#263B35]">Báo cáo thu nhập & Hoàn tiền chợ</h1>
          <p className="text-xs text-[#738078] mt-1">
            HomeMeal tách bạch hoàn toàn tiền công nấu của đầu bếp với khoản hoàn trả tiền chợ theo hóa đơn thực tế.
          </p>
        </div>

        {/* Big Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-6 rounded-2xl bg-[#E7F5EF] border border-[#B8E4D3] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#285E56]">
              <span>THU NHẬP CÔNG NẤU TẠI GIA</span>
              <Wallet className="w-5 h-5 text-[#285E56]" />
            </div>
            <p className="text-3xl font-extrabold text-[#285E56]">{formatVND(totalLaborEarnings)}</p>
            <p className="text-[11px] text-[#285E56]/80 font-medium">
              Tiền công nấu trực tiếp tại nhà khách
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFDF7] border border-[#E5ECE7] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#263B35]">
              <span>HOÀN TRẢ TIỀN CHỢ (HÓA ĐƠN)</span>
              <Receipt className="w-5 h-5 text-[#738078]" />
            </div>
            <p className="text-3xl font-extrabold text-[#263B35]">{formatVND(totalReimbursedGrocery)}</p>
            <p className="text-[11px] text-[#738078]">
              Hoàn trả 100% theo chứng từ thực tế
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFDF7] border border-[#E5ECE7] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#263B35]">
              <span>TỔNG QUYẾT TOÁN NHẬN VỀ</span>
              <DollarSign className="w-5 h-5 text-[#738078]" />
            </div>
            <p className="text-3xl font-extrabold text-[#263B35]">{formatVND(totalSettlement)}</p>
            <p className="text-[11px] text-[#738078]">
              Tiền công + 100% chi phí đi chợ
            </p>
          </div>
        </div>

        {/* Orders Breakdown */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-[#263B35]">Bảng kê chi tiết từng đơn hàng hoàn tất:</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50 text-[#738078] border-b border-[#E5ECE7]">
                  <th className="py-3 px-3">Mã đơn</th>
                  <th className="py-3 px-3">Ngày phục vụ</th>
                  <th className="py-3 px-3">Khách hàng</th>
                  <th className="py-3 px-3">Hình thức</th>
                  <th className="py-3 px-3 text-right">Tiền công nấu</th>
                  <th className="py-3 px-3 text-right">Hoàn tiền chợ</th>
                  <th className="py-3 px-3 text-center">Trạng thái thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5ECE7]">
                {completedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-[#285E56]">#{o.orderCode}</td>
                    <td className="py-3 px-3 text-[#738078]">{o.date}</td>
                    <td className="py-3 px-3 text-[#263B35] font-medium">{o.customerName}</td>
                    <td className="py-3 px-3 text-[#738078]">{o.serviceType === 'party_at_home' ? 'Nấu tiệc tại gia' : 'Nấu cơm tại nhà'}</td>
                    <td className="py-3 px-3 text-right font-bold text-[#285E56]">{formatVND(o.totalLaborFee)}</td>
                    <td className="py-3 px-3 text-right font-medium text-[#263B35]">{formatVND(o.actualGroceryTotal)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Đã chuyển khoản
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
