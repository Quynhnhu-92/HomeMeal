import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatVND } from '../../../utils/pricing';
import { 
  Plus, 
  Trash2, 
  Camera, 
  Store, 
  Calendar, 
  AlertTriangle, 
  Check, 
  ArrowLeft, 
  Receipt,
  CheckCircle,
  Eye
} from 'lucide-react';
import { ImageWithFallback } from '../../common/ImageWithFallback';

export const CookShoppingPage: React.FC = () => {
  const { 
    orders, 
    addShoppingEvidenceItem, 
    deleteShoppingEvidenceItem, 
    requestBudgetChange, 
    updateOrderStatus,
    navigateTo 
  } = useApp();

  // Pick the active order
  const urlParams = new URLSearchParams(window.location.search);
  const orderIdParam = urlParams.get('orderId');
  const targetOrder = orders.find((o) => o.id === orderIdParam) || orders[0];

  const [selectedOrderId, setSelectedOrderId] = useState(targetOrder?.id || orders[0]?.id);
  const currentOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Add Item form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('500');
  const [unit, setUnit] = useState('gram');
  const [estimatedPrice, setEstimatedPrice] = useState(50000);
  const [actualPrice, setActualPrice] = useState(52000);
  const [storeName, setStoreName] = useState('Chợ Tân Định');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('https://images.unsplash.com/photo-1554415707-9e44667ff221?auto=format&fit=crop&w=500&q=80');

  // Request budget change form state
  const [showBudgetChangeModal, setShowBudgetChangeModal] = useState(false);
  const [bcrItem, setBcrItem] = useState('Tôm càng xanh sống loại 1');
  const [bcrDifference, setBcrDifference] = useState(80000);
  const [bcrReason, setBcrReason] = useState('Giá tôm hôm nay tại vựa tăng đột xuất do nguồn hàng khan hiếm.');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addShoppingEvidenceItem(currentOrder.id, {
      name,
      quantity,
      unit,
      estimatedPrice,
      actualPrice,
      subtotal: actualPrice,
      storeName,
      purchaseTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      receiptImageUrl: receiptUrl,
      notes,
      status: actualPrice > estimatedPrice ? 'price_increased' : 'purchased',
      approvedByCustomer: true,
    });

    setName('');
    setShowAddModal(false);
  };

  const handleSendBudgetChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    requestBudgetChange(currentOrder.id, {
      originalBudget: currentOrder.estimatedGroceryBudget,
      requestedBudget: currentOrder.estimatedGroceryBudget + bcrDifference,
      difference: bcrDifference,
      reason: bcrReason,
      affectedItem: bcrItem,
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=80',
    });
    setShowBudgetChangeModal(false);
  };

  const handleCompleteShopping = () => {
    updateOrderStatus(
      currentOrder.id,
      'evidence_submitted',
      `Đầu bếp đã hoàn tất đi chợ và tải lên toàn bộ hóa đơn (${formatVND(currentOrder.actualGroceryTotal)})`
    );
  };

  const budget = currentOrder.estimatedGroceryBudget || 0;
  const actual = currentOrder.actualGroceryTotal || 0;
  const remaining = budget - actual;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigateTo('/cook/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Bảng điều khiển đầu bếp</span>
        </button>

        {/* Order Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Đang quản lý đơn:</span>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-border-soft rounded-xl text-xs font-bold text-accent"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.orderCode} - {o.customerName} ({o.mealOccasion})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-border-soft space-y-1">
          <span className="text-xs text-muted">Ngân sách khách duyệt trần:</span>
          <p className="text-2xl font-bold text-ink">{formatVND(budget)}</p>
          <p className="text-[11px] text-muted">Không được vượt quá nếu chưa xin phép</p>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border-soft space-y-1">
          <span className="text-xs text-muted">Thực chi đã ghi nhận:</span>
          <p className="text-2xl font-bold text-accent">{formatVND(actual)}</p>
          <p className="text-[11px] text-muted">{currentOrder.shoppingList.length} món nguyên liệu</p>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border-soft space-y-1">
          <span className="text-xs text-muted">Ngân sách còn lại:</span>
          <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-accent' : 'text-accent'}`}>
            {formatVND(remaining)}
          </p>
          <p className="text-[11px] text-muted">
            {remaining >= 0 ? 'Trong hạn mức an toàn' : 'Vượt mức! Cần gửi xin duyệt'}
          </p>
        </div>
      </div>

      {/* Main Checklist Container */}
      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-soft">
          <div>
            <h2 className="text-xl font-bold text-accent">Danh mục nguyên liệu & Hóa đơn đối soát</h2>
            <p className="text-xs text-muted">
              Nhập chi tiết từng món mua tại sạp chợ hoặc siêu thị, chụp ảnh hóa đơn gửi khách kiểm tra.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBudgetChangeModal(true)}
              className="px-3.5 py-2 bg-surface-alt border border-accent text-accent font-semibold text-xs rounded-xl hover:bg-surface-alt flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-accent" />
              <span>Xin duyệt tăng ngân sách</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-accent text-on-accent font-semibold text-xs rounded-xl hover:bg-accent-hover flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm món đã mua</span>
            </button>
          </div>
        </div>

        {/* Evidence Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-alt text-muted border-b border-border-soft">
                <th className="py-2.5 px-3">Nguyên liệu</th>
                <th className="py-2.5 px-3">Địa điểm mua</th>
                <th className="py-2.5 px-3">Số lượng</th>
                <th className="py-2.5 px-3 text-right">Đơn giá thực</th>
                <th className="py-2.5 px-3 text-center">Ảnh chứng từ</th>
                <th className="py-2.5 px-3">Ghi chú</th>
                <th className="py-2.5 px-3 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {currentOrder.shoppingList.map((item) => (
                <tr key={item.id} className="hover:bg-surface-alt/50">
                  <td className="py-3 px-3 font-semibold text-ink">{item.name}</td>
                  <td className="py-3 px-3 text-muted">{item.storeName}</td>
                  <td className="py-3 px-3 text-muted">{item.quantity} {item.unit}</td>
                  <td className="py-3 px-3 text-right font-bold text-accent">{formatVND(item.actualPrice)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-accent bg-surface-alt px-2 py-0.5 rounded border border-border-soft">
                      <Camera className="w-3 h-3 text-accent" /> Có ảnh
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted text-[11px] max-w-xs truncate">{item.notes || '—'}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => deleteShoppingEvidenceItem(currentOrder.id, item.id)}
                      className="p-1 text-accent hover:bg-surface-alt rounded"
                      title="Xóa món này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submit to Customer button */}
        <div className="pt-4 border-t border-border-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            Khi đã mua đủ nguyên liệu, bấm nút bên dưới để gửi chứng từ cho khách hàng và bắt đầu chuyển sang bước nấu món.
          </p>

          <button
            onClick={handleCompleteShopping}
            className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-accent-hover text-on-accent font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-on-accent" />
            <span>Hoàn thành đi chợ & Gửi hóa đơn cho khách</span>
          </button>
        </div>
      </div>

      {/* Modal: Add Ingredient */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-surface-alt rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-border-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border-soft bg-surface flex justify-between items-center">
              <h3 className="font-bold text-accent text-base">Thêm nguyên liệu thực mua tại chợ</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted hover:text-accent">✕</button>
            </div>

            <form onSubmit={handleAddItem} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-ink mb-1">Tên nguyên liệu:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tôm sú tươi, Rau thơm tổng hợp..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-border-soft focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Số lượng:</label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-border-soft focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Đơn vị:</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-border-soft focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Đơn giá thực mua (VNĐ):</label>
                  <input
                    type="number"
                    step="5000"
                    value={actualPrice}
                    onChange={(e) => setActualPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-border-soft focus:ring-2 focus:ring-accent font-bold text-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Nơi mua sắm:</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-border-soft focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Ảnh hóa đơn hoặc sạp chợ:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    placeholder="URL ảnh hóa đơn..."
                    className="flex-1 px-3 py-2 bg-surface rounded-xl border border-border-soft text-xs focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Ghi chú nguồn gốc:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tôm tươi sống nhảy tanh tách tại sạp quen..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-border-soft"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border-soft text-xs font-semibold rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-on-accent text-xs font-bold rounded-lg hover:bg-accent-hover"
                >
                  Lưu món vào danh sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Budget Change */}
      {showBudgetChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-surface-alt rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-border-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border-soft bg-surface flex justify-between items-center text-accent">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-base">Gửi yêu cầu xin duyệt tăng ngân sách</h3>
              </div>
              <button onClick={() => setShowBudgetChangeModal(false)} className="text-muted hover:text-accent">✕</button>
            </div>

            <form onSubmit={handleSendBudgetChangeRequest} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-surface-alt rounded-xl border border-border-soft text-accent text-xs">
                Khi gửi yêu cầu này, hệ thống sẽ tạm dừng quy trình đi chợ và thông báo ngay đến ứng dụng của khách hàng. Khách có thể <strong>Đồng ý</strong> hoặc <strong>Yêu cầu đổi món khác</strong>.
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Món nguyên liệu bị tăng giá:</label>
                <input
                  type="text"
                  value={bcrItem}
                  onChange={(e) => setBcrItem(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-border-soft focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Số tiền chênh lệch cần duyệt thêm (VNĐ):</label>
                <input
                  type="number"
                  step="10000"
                  value={bcrDifference}
                  onChange={(e) => setBcrDifference(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-border-soft font-bold text-accent focus:ring-2 focus:ring-accent"
                  required
                />
                <p className="text-[11px] text-muted mt-1">
                  Ngân sách mới đề xuất: <strong>{formatVND(currentOrder.estimatedGroceryBudget + bcrDifference)}</strong> (cũ: {formatVND(currentOrder.estimatedGroceryBudget)})
                </p>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Giải trình lý do & phương án thay thế:</label>
                <textarea
                  rows={3}
                  value={bcrReason}
                  onChange={(e) => setBcrReason(e.target.value)}
                  placeholder="Nêu lý do giá tăng tại chợ và phương án thay thế nếu khách không đồng ý tăng tiền..."
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-border-soft"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBudgetChangeModal(false)}
                  className="px-4 py-2 border border-border-soft text-xs font-semibold rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent hover:bg-accent-hover text-on-accent text-xs font-bold rounded-lg"
                >
                  Gửi yêu cầu tới khách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
