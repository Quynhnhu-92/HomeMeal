import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/pricing';
import { FileText, Check, X, ArrowRight, ShieldCheck, Users } from 'lucide-react';

export const QuotationsPage: React.FC = () => {
  const { orders, acceptQuotation, rejectQuotation, navigateTo } = useApp();

  const quotationOrders = orders.filter((o) => o.quotation);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border-soft shadow-xs">
        <span className="text-xs font-bold text-accent uppercase tracking-wider">Tiệc & Cỗ lớn</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-accent">Bảng báo giá tiệc tại nhà</h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Theo dõi và phê duyệt các bảng báo giá nhân sự phụ bếp, dụng cụ và tiền công nấu ăn trước khi chốt lịch.
        </p>
      </div>

      <div className="space-y-4">
        {quotationOrders.map((order) => {
          const q = order.quotation!;
          const isPending = q.status === 'pending';

          return (
            <div
              key={q.id}
              className={`bg-surface rounded-2xl border p-6 space-y-4 transition-all ${
                isPending ? 'border-accent ring-2 ring-accent/10 shadow-md' : 'border-border-soft'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-soft">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-detail" />
                    <h3 className="font-bold text-base text-accent">Báo giá cho Đơn #{order.orderCode}</h3>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      q.status === 'accepted'
                        ? 'bg-surface-alt text-accent'
                        : q.status === 'rejected'
                        ? 'bg-surface-alt text-accent'
                        : 'bg-surface-alt text-accent'
                    }`}>
                      {q.status === 'accepted' ? 'Đã duyệt' : q.status === 'rejected' ? 'Đã từ chối' : 'Chờ bạn phê duyệt'}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Đầu bếp lập dự toán: <strong>{q.cookName}</strong> · Quy mô: <strong>{order.guestCount} khách</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted">Tổng tiền công & Dịch vụ tiệc:</span>
                  <p className="text-xl font-extrabold text-accent">{formatVND(q.totalLaborAndServices)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-alt p-4 rounded-xl border border-border-soft text-xs">
                <div>
                  <span className="text-muted block">Công nấu chính:</span>
                  <span className="font-bold text-ink">{formatVND(q.laborFee)}</span>
                </div>
                <div>
                  <span className="text-muted block">Phụ bếp ({q.assistantCount} người):</span>
                  <span className="font-bold text-ink">{formatVND(q.assistantFee)}</span>
                </div>
                <div>
                  <span className="text-muted block">Dụng cụ chuyên dụng:</span>
                  <span className="font-bold text-ink">{formatVND(q.equipmentFee)}</span>
                </div>
                <div>
                  <span className="text-muted block">Thời gian chuẩn bị:</span>
                  <span className="font-bold text-ink">{q.estimatedPrepTimeHours} giờ</span>
                </div>
              </div>

              {q.surchargeNotes && (
                <p className="text-xs text-muted italic bg-surface-alt p-3 rounded-lg border border-border-soft">
                  "{q.surchargeNotes}"
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => navigateTo(`/orders/${order.id}`)}
                  className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Xem thực đơn & chi tiết đơn</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {isPending && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => rejectQuotation(order.id)}
                      className="px-4 py-2 border border-accent text-accent text-xs font-semibold rounded-xl hover:bg-surface-alt"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => acceptQuotation(order.id)}
                      className="px-5 py-2 bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold rounded-xl shadow-sm flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Đồng ý báo giá</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {quotationOrders.length === 0 && (
          <div className="text-center py-16 bg-surface rounded-2xl border border-border-soft text-xs text-muted">
            Bạn chưa có yêu cầu báo giá tiệc nào. Hãy đặt tiệc quy mô lớn tại mục "Tiệc tại nhà".
          </div>
        )}
      </div>
    </div>
  );
};
