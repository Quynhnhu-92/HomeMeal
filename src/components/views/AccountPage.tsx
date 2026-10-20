import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, Mail, MapPin, Shield, ChefHat, Check, UserCheck } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { currentUser, switchRole, showToast } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [address, setAddress] = useState(currentUser.address);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Đã lưu thông tin tài khoản thành công!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-3xl border border-[#E5ECE7] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5ECE7]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#B8E4D3] shrink-0 bg-stone-100">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#263B35]">{currentUser.name}</h1>
              <p className="text-xs text-[#738078] flex items-center gap-1.5 mt-0.5">
                <span>Vai trò hiện tại:</span>
                <span className="font-bold text-[#285E56] capitalize">
                  {currentUser.role === 'customer' ? 'Khách hàng' : currentUser.role === 'cook' ? 'Đầu bếp gia đình' : 'Quản trị viên'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Role Switcher Sandbox */}
        <div className="py-6 border-b border-[#E5ECE7] space-y-3">
          <h2 className="text-sm font-bold text-[#263B35]">Chuyển đổi góc nhìn trải nghiệm:</h2>
          <p className="text-xs text-[#738078]">
            Chọn vai trò bên dưới để kiểm tra toàn bộ tính năng của từng đối tượng người dùng.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => switchRole('customer')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                currentUser.role === 'customer'
                  ? 'border-[#285E56] bg-[#E7F5EF] font-bold text-[#285E56]'
                  : 'border-[#E5ECE7] hover:border-[#B8E4D3]'
              }`}
            >
              <User className="w-5 h-5 text-[#285E56]" />
              <div>
                <p className="text-xs font-semibold">Khách hàng</p>
                <p className="text-[10px] text-[#738078]">Đặt bữa, duyệt hóa đơn</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => switchRole('cook')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                currentUser.role === 'cook'
                  ? 'border-[#285E56] bg-[#E7F5EF] font-bold text-[#285E56]'
                  : 'border-[#E5ECE7] hover:border-[#B8E4D3]'
              }`}
            >
              <ChefHat className="w-5 h-5 text-[#F2AD72]" />
              <div>
                <p className="text-xs font-semibold">Đầu bếp</p>
                <p className="text-[10px] text-[#738078]">Nhận đơn, tải ảnh chợ</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => switchRole('admin')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                currentUser.role === 'admin'
                  ? 'border-[#285E56] bg-[#E7F5EF] font-bold text-[#285E56]'
                  : 'border-[#E5ECE7] hover:border-[#B8E4D3]'
              }`}
            >
              <Shield className="w-5 h-5 text-[#C94C4C]" />
              <div>
                <p className="text-xs font-semibold">Quản trị viên</p>
                <p className="text-[10px] text-[#738078]">Xử lý tranh chấp</p>
              </div>
            </button>
          </div>
        </div>

        {/* Form Profile */}
        <form onSubmit={handleSave} className="pt-6 space-y-4 text-xs sm:text-sm">
          <h2 className="text-sm font-bold text-[#263B35]">Thông tin cá nhân & Địa chỉ lưu sẵn:</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#263B35] mb-1">Họ và tên:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl focus:ring-2 focus:ring-[#285E56]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#263B35] mb-1">Số điện thoại:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl focus:ring-2 focus:ring-[#285E56]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#263B35] mb-1">Địa chỉ giao nhận / Nấu ăn mặc định:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl focus:ring-2 focus:ring-[#285E56]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#285E56] hover:bg-[#1f4b44] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
