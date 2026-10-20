import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChefHat, ShoppingBag, User, Shield, Menu, X, Bell, RefreshCw } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, switchRole, currentPath, navigateTo, orders, resetToInitialDemoData } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Count active orders needing attention
  const pendingActionsCount = orders.filter(
    (o) =>
      o.status === 'service_completed' ||
      o.status === 'awaiting_budget_approval' ||
      o.status === 'quotation_submitted' ||
      o.status === 'disputed'
  ).length;

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Đặt bữa ăn', path: '/meal-planner' },
    { label: 'Thực đơn', path: '/menu' },
    { label: 'Đầu bếp', path: '/cooks' },
    { label: 'Tiệc & Mâm cỗ', path: '/party-booking' },
    { label: 'Đơn hàng', path: '/orders', badge: pendingActionsCount > 0 ? pendingActionsCount : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#E5ECE7]">
      {/* Scenario Demo Banner */}
      <div className="bg-[#E7F5EF] text-[#285E56] text-xs py-1.5 px-4 border-b border-[#B8E4D3]/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] sm:text-xs">
            <span className="font-semibold whitespace-nowrap">Kịch bản thử nghiệm:</span>
            <button
              onClick={() => navigateTo('/orders/ord_01/bill')}
              className="text-[#285E56] hover:underline whitespace-nowrap bg-white/70 px-2 py-0.5 rounded"
            >
              Kịch bản A: Bữa cơm gia đình (Thanh toán sau)
            </button>
            <span className="text-[#285E56]/40">|</span>
            <button
              onClick={() => navigateTo('/orders/ord_02')}
              className="text-[#285E56] hover:underline whitespace-nowrap bg-white/70 px-2 py-0.5 rounded"
            >
              Kịch bản B: Tiệc 25 người (Duyệt báo giá)
            </button>
            <span className="text-[#285E56]/40">|</span>
            <button
              onClick={() => navigateTo('/orders/ord_03')}
              className="text-[#285E56] hover:underline whitespace-nowrap bg-white/70 px-2 py-0.5 rounded"
            >
              Kịch bản C: Duyệt tăng ngân sách
            </button>
            <span className="text-[#285E56]/40">|</span>
            <button
              onClick={() => navigateTo('/orders/ord_04')}
              className="text-[#285E56] hover:underline whitespace-nowrap bg-white/70 px-2 py-0.5 rounded"
            >
              Kịch bản D: Khiếu nại hóa đơn
            </button>
          </div>

          <button
            onClick={resetToInitialDemoData}
            title="Khôi phục trạng thái mẫu ban đầu"
            className="flex items-center gap-1 text-[11px] text-[#285E56] hover:text-[#263B35] whitespace-nowrap shrink-0 font-medium"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Khôi phục mẫu</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar - strict 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => navigateTo('/')}
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#285E56] whitespace-nowrap shrink-0 group text-left"
        >
          <div className="w-9 h-9 rounded-lg bg-[#285E56] text-[#FFFDF7] flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-[#1f4b44] transition-colors">
            H
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-xl font-bold">HomeMeal</span>
            <span className="text-[10px] tracking-normal font-normal text-[#738078] hidden sm:block">
              Nấu cơm & Đi chợ minh bạch
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#263B35]">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigateTo(link.path)}
              className={`relative whitespace-nowrap shrink-0 py-1 transition-colors hover:text-[#285E56] ${
                isActive(link.path)
                  ? 'text-[#285E56] font-semibold border-b-2 border-[#285E56]'
                  : 'text-[#263B35]'
              }`}
            >
              {link.label}
              {link.badge && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-bold bg-[#F2AD72] text-[#263B35] rounded-full">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => navigateTo('/support')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-[#285E56] ${
              isActive('/support') ? 'text-[#285E56] font-semibold' : 'text-[#738078]'
            }`}
          >
            Hỗ trợ & Chính sách
          </button>
        </nav>

        {/* Zone 3: Primary Action & Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5ECE7] bg-white text-xs font-medium text-[#263B35] hover:border-[#B8E4D3] transition-all"
            >
              {currentUser.role === 'customer' && <User className="w-3.5 h-3.5 text-[#285E56]" />}
              {currentUser.role === 'cook' && <ChefHat className="w-3.5 h-3.5 text-[#F2AD72]" />}
              {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5 text-[#C94C4C]" />}
              <span className="hidden sm:inline">
                {currentUser.role === 'customer'
                  ? 'Khách hàng'
                  : currentUser.role === 'cook'
                  ? 'Đầu bếp'
                  : 'Quản trị viên'}
              </span>
            </button>

            {roleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E5ECE7] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setRoleMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-[#E5ECE7] text-[11px] font-semibold text-[#738078] uppercase">
                  Chuyển vai trò xem thử
                </div>
                <button
                  onClick={() => switchRole('customer')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#E7F5EF] ${
                    currentUser.role === 'customer' ? 'text-[#285E56] font-semibold bg-[#E7F5EF]/50' : 'text-[#263B35]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#285E56]" />
                    <div>
                      <p className="font-medium">Khách hàng</p>
                      <p className="text-[10px] text-[#738078]">Đặt bữa, duyệt hóa đơn</p>
                    </div>
                  </div>
                  {currentUser.role === 'customer' && <span className="text-[10px] text-[#285E56]">Đang chọn</span>}
                </button>
                <button
                  onClick={() => {
                    switchRole('cook');
                    navigateTo('/cook/dashboard');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#E7F5EF] ${
                    currentUser.role === 'cook' ? 'text-[#285E56] font-semibold bg-[#E7F5EF]/50' : 'text-[#263B35]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-[#F2AD72]" />
                    <div>
                      <p className="font-medium">Đầu bếp</p>
                      <p className="text-[10px] text-[#738078]">Nhận đơn, tải hóa đơn chợ</p>
                    </div>
                  </div>
                  {currentUser.role === 'cook' && <span className="text-[10px] text-[#285E56]">Đang chọn</span>}
                </button>
                <button
                  onClick={() => {
                    switchRole('admin');
                    navigateTo('/admin');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#E7F5EF] ${
                    currentUser.role === 'admin' ? 'text-[#285E56] font-semibold bg-[#E7F5EF]/50' : 'text-[#263B35]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#C94C4C]" />
                    <div>
                      <p className="font-medium">Quản trị viên</p>
                      <p className="text-[10px] text-[#738078]">Giám sát hóa đơn & khiếu nại</p>
                    </div>
                  </div>
                  {currentUser.role === 'admin' && <span className="text-[10px] text-[#285E56]">Đang chọn</span>}
                </button>
              </div>
            )}
          </div>

          {/* Role specific primary action */}
          {currentUser.role === 'cook' ? (
            <button
              onClick={() => navigateTo('/cook/dashboard')}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#285E56] rounded-lg hover:bg-[#1f4b44] transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              Góc Đầu Bếp
            </button>
          ) : currentUser.role === 'admin' ? (
            <button
              onClick={() => navigateTo('/admin')}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#285E56] rounded-lg hover:bg-[#1f4b44] transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              Trang Quản Trị
            </button>
          ) : (
            <button
              onClick={() => navigateTo('/meal-planner')}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#285E56] rounded-lg hover:bg-[#1f4b44] transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Đặt bữa ăn ngay</span>
            </button>
          )}

          {/* Account profile link */}
          <button
            onClick={() => navigateTo('/account')}
            title="Tài khoản cá nhân"
            className="p-2 rounded-lg border border-[#E5ECE7] bg-white text-[#263B35] hover:text-[#285E56] hover:border-[#B8E4D3]"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#263B35] hover:bg-[#E7F5EF]"
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5ECE7] bg-[#FFFDF7] px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigateTo(link.path);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between ${
                isActive(link.path)
                  ? 'bg-[#E7F5EF] text-[#285E56] font-semibold'
                  : 'text-[#263B35] hover:bg-stone-50'
              }`}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="px-2 py-0.5 text-xs bg-[#F2AD72] text-[#263B35] rounded-full font-bold">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              navigateTo('/support');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-[#738078] hover:bg-stone-50 rounded-lg"
          >
            Hỗ trợ & Chính sách
          </button>
          <div className="pt-2 border-t border-[#E5ECE7]">
            <p className="px-3 text-xs text-[#738078] mb-1 font-semibold">Chế độ trải nghiệm:</p>
            <div className="grid grid-cols-3 gap-2 px-1">
              <button
                onClick={() => {
                  switchRole('customer');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 text-xs rounded border text-center ${
                  currentUser.role === 'customer'
                    ? 'border-[#285E56] bg-[#E7F5EF] font-bold text-[#285E56]'
                    : 'border-stone-200'
                }`}
              >
                Khách
              </button>
              <button
                onClick={() => {
                  switchRole('cook');
                  navigateTo('/cook/dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 text-xs rounded border text-center ${
                  currentUser.role === 'cook'
                    ? 'border-[#285E56] bg-[#E7F5EF] font-bold text-[#285E56]'
                    : 'border-stone-200'
                }`}
              >
                Đầu bếp
              </button>
              <button
                onClick={() => {
                  switchRole('admin');
                  navigateTo('/admin');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 text-xs rounded border text-center ${
                  currentUser.role === 'admin'
                    ? 'border-[#285E56] bg-[#E7F5EF] font-bold text-[#285E56]'
                    : 'border-stone-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
