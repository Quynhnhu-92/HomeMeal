import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatVND } from '../../../utils/pricing';
import { StatusBadge } from '../../common/StatusBadge';
import { 
  Shield, 
  Users, 
  ChefHat, 
  Receipt, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Check, 
  Search,
  Filter
} from 'lucide-react';

type ManagedUser = {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'cook' | 'admin';
  created_at: string;
};

export const AdminDashboardPage: React.FC = () => {
  const { orders, cooks, resolveDispute, navigateTo, authUser, currentPath } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'cooks' | 'disputes' | 'users'>('overview');
  const [resolutionText, setResolutionText] = useState('Đã đối chiếu hóa đơn, đồng ý khấu trừ khoản tiền mờ chữ không rõ ràng.');

  const disputedOrders = orders.filter((o) => o.status === 'disputed' && o.dispute);

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    const tab = currentPath.split(/[?#]/)[0].split('/')[2];
    setActiveTab(['orders', 'cooks', 'disputes', 'users'].includes(tab) ? tab as typeof activeTab : 'overview');
  }, [currentPath]);

  useEffect(() => {
    if (activeTab !== 'users') return;
    let cancelled = false;
    setUsersLoading(true);
    setUsersError('');
    fetch('/api?resource=admin/users', { credentials: 'same-origin' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Không tải được danh sách tài khoản.');
        if (!cancelled) setManagedUsers(result.users as ManagedUser[]);
      })
      .catch((error: unknown) => {
        if (!cancelled) setUsersError(error instanceof Error ? error.message : 'Không tải được danh sách tài khoản.');
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab]);

  const handleResolve = (orderId: string) => {
    resolveDispute(orderId, resolutionText);
  };

  const updateUserRole = async (userId: string, role: ManagedUser['role']) => {
    setUsersError('');
    try {
      const response = await fetch('/api?resource=admin/users', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Không cập nhật được quyền.');
      setManagedUsers((current) => current.map((item) => item.id === userId ? { ...item, role } : item));
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : 'Không cập nhật được quyền.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-surface-alt text-accent">
              <Shield className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Trung tâm Quản trị Nền tảng
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-accent">Giám sát Vận hành & Giải quyết Tranh chấp</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Kiểm tra tính minh bạch của hóa đơn mua sắm, thẩm định đầu bếp và xử lý khiếu nại khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {disputedOrders.length > 0 && (
            <span className="px-3 py-1 bg-surface-alt text-accent rounded-xl text-xs font-bold border border-accent">
              {disputedOrders.length} khiếu nại đang chờ xử lý
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border-soft pb-2 text-xs sm:text-sm font-semibold">
        {[
          { id: 'overview', label: 'Tổng quan hệ thống' },
          { id: 'disputes', label: `Khiếu nại hóa đơn (${disputedOrders.length})` },
          { id: 'orders', label: `Quản lý đơn hàng (${orders.length})` },
          { id: 'cooks', label: `Xác thực đầu bếp (${cooks.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigateTo(tab.id === 'overview' ? '/admin' : `/admin/${tab.id}`)}
            className={`pb-2 px-3 transition-colors ${
              activeTab === tab.id
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted hover:text-accent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="-mt-4 flex justify-end">
        <button
          onClick={() => navigateTo('/admin/users')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === 'users' ? 'bg-brand text-ink' : 'border border-border-soft bg-surface text-accent'}`}
        >
          Quản lý tài khoản
        </button>
      </div>

      {activeTab === 'users' && (
        <section className="bg-surface rounded-2xl border border-border-soft p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-accent">Phân quyền tài khoản</h2>
            <p className="mt-1 text-xs text-muted">Đang đăng nhập: {authUser?.email}. Đăng ký công khai chỉ có quyền Khách hàng.</p>
          </div>
          {usersError && <p role="alert" className="rounded-lg bg-surface-alt p-3 text-sm text-accent">{usersError}</p>}
          {usersLoading ? <p className="py-6 text-center text-sm text-muted">Đang tải tài khoản…</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-left text-sm">
                <thead><tr className="border-b border-border-soft text-xs text-muted"><th className="py-3 pr-3">Tên</th><th className="py-3 pr-3">Email</th><th className="py-3 pr-3">Vai trò</th><th className="py-3">Ngày tạo</th></tr></thead>
                <tbody className="divide-y divide-border-soft">
                  {managedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 pr-3 font-medium">{user.full_name}</td>
                      <td className="py-3 pr-3 text-muted">{user.email}</td>
                      <td className="py-3 pr-3">
                        <select value={user.role} onChange={(event) => void updateUserRole(user.id, event.target.value as ManagedUser['role'])} className="rounded-lg border border-border-soft bg-surface px-2 py-1.5 text-xs">
                          <option value="customer">Khách hàng</option>
                          <option value="cook">Đầu bếp</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </td>
                      <td className="py-3 text-xs text-muted">{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {managedUsers.length === 0 && <p className="py-6 text-center text-sm text-muted">Chưa có tài khoản.</p>}
            </div>
          )}
        </section>
      )}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface p-5 rounded-2xl border border-border-soft">
              <span className="text-xs text-muted">Tổng số đơn hàng:</span>
              <p className="text-2xl font-bold text-ink mt-1">{orders.length}</p>
              <p className="text-[11px] text-muted">Tất cả các dịch vụ</p>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-border-soft">
              <span className="text-xs text-muted">Đầu bếp đã kiểm định:</span>
              <p className="text-2xl font-bold text-accent mt-1">{cooks.length}</p>
              <p className="text-[11px] text-accent">100% đạt chuẩn VSATTP</p>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-border-soft">
              <span className="text-xs text-muted">Tiền chợ đã đối soát:</span>
              <p className="text-2xl font-bold text-accent mt-1">
                {formatVND(orders.reduce((sum, o) => sum + (o.actualGroceryTotal || 0), 0))}
              </p>
              <p className="text-[11px] text-muted">Có biên lai đầy đủ</p>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-border-soft">
              <span className="text-xs text-muted">Vấn đề cần can thiệp:</span>
              <p className="text-2xl font-bold text-accent mt-1">{disputedOrders.length}</p>
              <p className="text-[11px] text-accent font-medium">Cần Admin giải quyết</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DISPUTES (SCENARIO D RESOLUTION) */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="bg-surface-alt border border-border-soft rounded-2xl p-4 text-xs text-accent">
            <strong>Quy tắc xử lý tranh chấp:</strong> Admin đối soát ảnh biên lai gốc. Nếu biên lai mờ hoặc không có tên món, hệ thống sẽ khấu trừ khoản tiền đó khỏi hóa đơn và chuyển đơn hàng sang trạng thái chờ thanh toán phần còn lại.
          </div>

          {disputedOrders.map((order) => (
            <div key={order.id} className="bg-surface rounded-2xl border border-accent p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border-soft">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-detail" />
                  <span className="font-bold text-base text-ink">Khiếu nại Đơn #{order.orderCode}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-surface-alt text-accent text-xs font-bold">
                  {formatVND(order.dispute?.reportedAmount || 0)} tranh chấp
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 bg-surface-alt p-4 rounded-xl border border-border-soft">
                  <p><strong>Khách hàng:</strong> {order.customerName} ({order.customerPhone})</p>
                  <p><strong>Đầu bếp:</strong> {order.cook?.name}</p>
                  <p><strong>Lý do khiếu nại:</strong> {order.dispute?.reason}</p>
                  <p><strong>Mô tả của khách:</strong> "{order.dispute?.description}"</p>
                </div>

                <div className="space-y-2 bg-surface-alt p-4 rounded-xl border border-border-soft">
                  <p className="font-semibold text-ink">Quyết định giải quyết của Admin:</p>
                  <textarea
                    rows={2}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-lg border border-border-soft text-xs"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleResolve(order.id)}
                      className="px-4 py-2 bg-brand hover:bg-brand-hover text-on-brand font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Xác nhận khấu trừ {formatVND(order.dispute?.reportedAmount || 0)} & Cập nhật hóa đơn</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {disputedOrders.length === 0 && (
            <div className="text-center py-12 bg-surface rounded-2xl border border-border-soft text-xs text-muted">
              Hiện không có khiếu nại nào đang mở. Tất cả hóa đơn đều minh bạch và đã được khách xác nhận!
            </div>
          )}
        </div>
      )}

      {/* TAB: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-surface rounded-2xl border border-border-soft p-6 space-y-4">
          <h3 className="font-bold text-base text-accent">Tất cả đơn hàng trên hệ thống</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-alt text-muted border-b border-border-soft">
                  <th className="py-2.5 px-3">Mã đơn</th>
                  <th className="py-2.5 px-3">Khách hàng</th>
                  <th className="py-2.5 px-3">Đầu bếp</th>
                  <th className="py-2.5 px-3 text-right">Tiền chợ thực</th>
                  <th className="py-2.5 px-3 text-right">Tiền công</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-alt/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-accent">#{o.orderCode}</td>
                    <td className="py-2.5 px-3 font-medium text-ink">{o.customerName}</td>
                    <td className="py-2.5 px-3 text-muted">{o.cook?.name}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{formatVND(o.actualGroceryTotal)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-accent">{formatVND(o.totalLaborFee)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={o.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => navigateTo(`/orders/${o.id}`)}
                        className="text-accent hover:underline font-semibold"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: COOKS */}
      {activeTab === 'cooks' && (
        <div className="bg-surface rounded-2xl border border-border-soft p-6 space-y-4">
          <h3 className="font-bold text-base text-accent">Danh sách đầu bếp đối tác</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {cooks.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-border-soft bg-surface-alt flex gap-3 items-center">
                <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover border border-brand" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-accent">{c.name}</h4>
                  <p className="text-[11px] text-muted">{c.title}</p>
                  <p className="text-[11px] text-accent font-semibold mt-1">✓ Đã kiểm tra lý lịch & VSATTP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
