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
      <div className="bg-white rounded-3xl border border-[#E5ECE7] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <Shield className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Trung tâm Quản trị Nền tảng
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263B35]">Giám sát Vận hành & Giải quyết Tranh chấp</h1>
          <p className="text-xs sm:text-sm text-[#738078] mt-1">
            Kiểm tra tính minh bạch của hóa đơn mua sắm, thẩm định đầu bếp và xử lý khiếu nại khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {disputedOrders.length > 0 && (
            <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-xl text-xs font-bold border border-rose-300">
              {disputedOrders.length} khiếu nại đang chờ xử lý
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E5ECE7] pb-2 text-xs sm:text-sm font-semibold">
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
                ? 'text-[#285E56] border-b-2 border-[#285E56]'
                : 'text-[#738078] hover:text-[#263B35]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="-mt-4 flex justify-end">
        <button
          onClick={() => navigateTo('/admin/users')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold ${activeTab === 'users' ? 'bg-[#285E56] text-white' : 'border border-[#E5ECE7] bg-white text-[#285E56]'}`}
        >
          Quản lý tài khoản
        </button>
      </div>

      {activeTab === 'users' && (
        <section className="bg-white rounded-2xl border border-[#E5ECE7] p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#263B35]">Phân quyền tài khoản</h2>
            <p className="mt-1 text-xs text-[#738078]">Đang đăng nhập: {authUser?.email}. Đăng ký công khai chỉ có quyền Khách hàng.</p>
          </div>
          {usersError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{usersError}</p>}
          {usersLoading ? <p className="py-6 text-center text-sm text-[#738078]">Đang tải tài khoản…</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-left text-sm">
                <thead><tr className="border-b border-[#E5ECE7] text-xs text-[#738078]"><th className="py-3 pr-3">Tên</th><th className="py-3 pr-3">Email</th><th className="py-3 pr-3">Vai trò</th><th className="py-3">Ngày tạo</th></tr></thead>
                <tbody className="divide-y divide-[#E5ECE7]">
                  {managedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 pr-3 font-medium">{user.full_name}</td>
                      <td className="py-3 pr-3 text-[#738078]">{user.email}</td>
                      <td className="py-3 pr-3">
                        <select value={user.role} onChange={(event) => void updateUserRole(user.id, event.target.value as ManagedUser['role'])} className="rounded-lg border border-[#E5ECE7] bg-white px-2 py-1.5 text-xs">
                          <option value="customer">Khách hàng</option>
                          <option value="cook">Đầu bếp</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </td>
                      <td className="py-3 text-xs text-[#738078]">{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {managedUsers.length === 0 && <p className="py-6 text-center text-sm text-[#738078]">Chưa có tài khoản.</p>}
            </div>
          )}
        </section>
      )}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7]">
              <span className="text-xs text-[#738078]">Tổng số đơn hàng:</span>
              <p className="text-2xl font-bold text-[#263B35] mt-1">{orders.length}</p>
              <p className="text-[11px] text-[#738078]">Tất cả các dịch vụ</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7]">
              <span className="text-xs text-[#738078]">Đầu bếp đã kiểm định:</span>
              <p className="text-2xl font-bold text-[#285E56] mt-1">{cooks.length}</p>
              <p className="text-[11px] text-emerald-700">100% đạt chuẩn VSATTP</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7]">
              <span className="text-xs text-[#738078]">Tiền chợ đã đối soát:</span>
              <p className="text-2xl font-bold text-[#285E56] mt-1">
                {formatVND(orders.reduce((sum, o) => sum + (o.actualGroceryTotal || 0), 0))}
              </p>
              <p className="text-[11px] text-[#738078]">Có biên lai đầy đủ</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E5ECE7]">
              <span className="text-xs text-[#738078]">Vấn đề cần can thiệp:</span>
              <p className="text-2xl font-bold text-rose-700 mt-1">{disputedOrders.length}</p>
              <p className="text-[11px] text-rose-600 font-medium">Cần Admin giải quyết</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DISPUTES (SCENARIO D RESOLUTION) */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900">
            <strong>Quy tắc xử lý tranh chấp:</strong> Admin đối soát ảnh biên lai gốc. Nếu biên lai mờ hoặc không có tên món, hệ thống sẽ khấu trừ khoản tiền đó khỏi hóa đơn và chuyển đơn hàng sang trạng thái chờ thanh toán phần còn lại.
          </div>

          {disputedOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-rose-300 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span className="font-bold text-base text-[#263B35]">Khiếu nại Đơn #{order.orderCode}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 text-xs font-bold">
                  {formatVND(order.dispute?.reportedAmount || 0)} tranh chấp
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 bg-[#FFFDF7] p-4 rounded-xl border border-[#E5ECE7]">
                  <p><strong>Khách hàng:</strong> {order.customerName} ({order.customerPhone})</p>
                  <p><strong>Đầu bếp:</strong> {order.cook?.name}</p>
                  <p><strong>Lý do khiếu nại:</strong> {order.dispute?.reason}</p>
                  <p><strong>Mô tả của khách:</strong> "{order.dispute?.description}"</p>
                </div>

                <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-[#E5ECE7]">
                  <p className="font-semibold text-[#263B35]">Quyết định giải quyết của Admin:</p>
                  <textarea
                    rows={2}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-[#E5ECE7] text-xs"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleResolve(order.id)}
                      className="px-4 py-2 bg-[#285E56] hover:bg-[#1f4b44] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
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
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E5ECE7] text-xs text-[#738078]">
              Hiện không có khiếu nại nào đang mở. Tất cả hóa đơn đều minh bạch và đã được khách xác nhận!
            </div>
          )}
        </div>
      )}

      {/* TAB: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-[#E5ECE7] p-6 space-y-4">
          <h3 className="font-bold text-base text-[#263B35]">Tất cả đơn hàng trên hệ thống</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50 text-[#738078] border-b border-[#E5ECE7]">
                  <th className="py-2.5 px-3">Mã đơn</th>
                  <th className="py-2.5 px-3">Khách hàng</th>
                  <th className="py-2.5 px-3">Đầu bếp</th>
                  <th className="py-2.5 px-3 text-right">Tiền chợ thực</th>
                  <th className="py-2.5 px-3 text-right">Tiền công</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5ECE7]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#285E56]">#{o.orderCode}</td>
                    <td className="py-2.5 px-3 font-medium text-[#263B35]">{o.customerName}</td>
                    <td className="py-2.5 px-3 text-[#738078]">{o.cook?.name}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{formatVND(o.actualGroceryTotal)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#285E56]">{formatVND(o.totalLaborFee)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={o.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => navigateTo(`/orders/${o.id}`)}
                        className="text-[#285E56] hover:underline font-semibold"
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
        <div className="bg-white rounded-2xl border border-[#E5ECE7] p-6 space-y-4">
          <h3 className="font-bold text-base text-[#263B35]">Danh sách đầu bếp đối tác</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {cooks.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-[#E5ECE7] bg-[#FFFDF7] flex gap-3 items-center">
                <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover border border-[#B8E4D3]" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-[#263B35]">{c.name}</h4>
                  <p className="text-[11px] text-[#738078]">{c.title}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">✓ Đã kiểm tra lý lịch & VSATTP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
