import React from 'react';
import { ShoppingEvidenceItem } from '../../types';
import { formatVND } from '../../utils/pricing';
import { X, CheckCircle, Store, Calendar, FileText } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface EvidenceModalProps {
  item: ShoppingEvidenceItem | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-surface-alt rounded-2xl max-w-2xl w-full overflow-hidden shadow-lg border border-border-soft max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border-soft flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-surface-alt text-accent">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-accent text-base sm:text-lg">{item.name}</h3>
              <p className="text-xs text-muted">Chứng từ mua sắm nguyên liệu thực tế</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-surface-alt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-accent mb-1.5">Ảnh hóa đơn / Biên lai tính tiền:</p>
              <div className="aspect-4/3 rounded-xl overflow-hidden border border-border-soft bg-surface-alt">
                <ImageWithFallback
                  src={item.receiptImageUrl || 'https://images.unsplash.com/photo-1554415707-9e44667ff221?auto=format&fit=crop&w=600&q=80'}
                  alt={`Hóa đơn ${item.name}`}
                  fallbackType="receipt"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-accent mb-1.5">Ảnh nguyên liệu / Sạp mua:</p>
              <div className="aspect-4/3 rounded-xl overflow-hidden border border-border-soft bg-surface-alt">
                <ImageWithFallback
                  src={item.ingredientImageUrl || item.receiptImageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
                  alt={`Nguyên liệu ${item.name}`}
                  fallbackType="receipt"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="bg-surface-alt/60 rounded-xl p-4 border border-brand/40 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1 border-b border-border-soft">
              <span className="text-muted flex items-center gap-1.5">
                <Store className="w-4 h-4 text-detail" /> Địa điểm mua:
              </span>
              <span className="font-semibold text-ink">{item.storeName || 'Chợ truyền thống'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border-soft">
              <span className="text-muted flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-detail" /> Thời gian mua sắm:
              </span>
              <span className="font-semibold text-ink">{item.purchaseTime}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border-soft">
              <span className="text-muted">Khối lượng thực mua:</span>
              <span className="font-semibold text-ink">{item.quantity} {item.unit}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border-soft">
              <span className="text-muted">Đơn giá ước tính ban đầu:</span>
              <span className="text-muted line-through">{formatVND(item.estimatedPrice)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border-soft">
              <span className="text-accent font-semibold">Giá thực mua trên hóa đơn:</span>
              <span className="font-bold text-accent text-base">{formatVND(item.actualPrice)}</span>
            </div>
            {item.notes && (
              <div className="pt-1">
                <span className="text-muted block mb-1">Ghi chú của đầu bếp:</span>
                <p className="p-2.5 bg-surface rounded-lg border border-border-soft text-xs text-ink italic">
                  "{item.notes}"
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 bg-surface rounded-xl border border-border-soft text-xs text-accent">
            <CheckCircle className="w-4 h-4 text-detail shrink-0" />
            <span>
              Chứng từ này được đính kèm vào hóa đơn cuối cùng. Bạn chỉ thanh toán đúng số tiền thực chi này.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-alt border-t border-border-soft flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand text-on-brand text-xs sm:text-sm font-semibold rounded-lg hover:bg-brand-hover"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
