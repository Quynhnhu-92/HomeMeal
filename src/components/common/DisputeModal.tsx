import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { formatVND } from '../../utils/pricing';

interface DisputeModalProps {
  orderId: string;
  orderCode: string;
  actualTotal: number;
  onClose: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  orderId,
  orderCode,
  actualTotal,
  onClose,
}) => {
  const { fileDispute } = useApp();
  const [reason, setReason] = useState('Hóa đơn mờ chữ hoặc không khớp giá thị trường');
  const [reportedAmount, setReportedAmount] = useState<number>(50000);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Vui lòng nhập mô tả chi tiết vấn đề bạn cần làm rõ.');
      return;
    }
    fileDispute(orderId, reason, description, reportedAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-surface-alt rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-border-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border-soft flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2 text-accent">
            <ShieldAlert className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-accent text-base">Khiếu nại chứng từ / Yêu cầu giải trình</h3>
              <p className="text-xs text-muted">Đơn hàng: #{orderCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted hover:bg-surface-alt">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-surface-alt rounded-xl border border-border-soft text-accent text-xs">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-accent" /> Quyền lợi bảo vệ khách hàng:
            </p>
            Khi gửi yêu cầu, đơn hàng sẽ chuyển sang trạng thái <strong>Đang khiếu nại</strong> và hệ thống <strong>tạm ngừng thu khoản tiền này</strong> cho tới khi đầu bếp bổ sung chứng từ giải trình.
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Lý do khiếu nại:</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-surface rounded-lg border border-border-soft focus:ring-2 focus:ring-accent text-xs sm:text-sm"
            >
              <option value="Hóa đơn mờ chữ hoặc không có tên món">Hóa đơn mờ chữ hoặc không có tên món</option>
              <option value="Giá nguyên liệu vượt quá mức thỏa thuận không báo trước">Giá nguyên liệu vượt quá mức thỏa thuận không báo trước</option>
              <option value="Khối lượng mua thực tế ít hơn số lượng ghi trên hóa đơn">Khối lượng mua thực tế ít hơn số lượng ghi trên hóa đơn</option>
              <option value="Đầu bếp tự ý thay đổi nguyên liệu không đạt yêu cầu">Đầu bếp tự ý thay đổi nguyên liệu không đạt yêu cầu</option>
              <option value="Khác">Lý do khác</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">
              Số tiền bạn thấy chưa hợp lý (VNĐ):
            </label>
            <input
              type="number"
              step="10000"
              min="10000"
              max={actualTotal}
              value={reportedAmount}
              onChange={(e) => setReportedAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface rounded-lg border border-border-soft focus:ring-2 focus:ring-accent text-xs sm:text-sm"
            />
            <p className="text-[11px] text-muted mt-1">
              Khoản tiền đề nghị giải trình: <strong>{formatVND(reportedAmount)}</strong> (Tổng tiền đi chợ: {formatVND(actualTotal)})
            </p>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">
              Chi tiết thắc mắc / Mô tả cụ thể:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Khoản tiền thịt bò ghi 320.000đ nhưng hóa đơn viết tay nhòe mực, đề nghị đầu bếp gửi lại hình chụp rõ hoặc giải thích lý do..."
              className="w-full px-3 py-2 bg-surface rounded-lg border border-border-soft focus:ring-2 focus:ring-accent text-xs sm:text-sm"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border-soft bg-surface text-muted font-medium rounded-lg hover:bg-surface-alt"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-on-accent font-medium rounded-lg hover:bg-accent-hover transition-colors"
            >
              Gửi khiếu nại & Khóa thanh toán
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
