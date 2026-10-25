import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChefHat, ShoppingBag, User, Shield, Menu, X, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, authUser, logout, showToast, currentPath, navigateTo, orders } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let previous = window.scrollY > 64;
    setIsScrolled(previous);
    const handleScroll = () => {
      const next = window.scrollY > 64;
      if (next !== previous) {
        previous = next;
        setIsScrolled(next);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { label: 'AI Gợi Ý Thực Đơn', path: '/smart-menu' },
    { label: 'Đầu bếp', path: '/cooks' },
    { label: 'Tiệc & Mâm cỗ', path: '/party-booking' },
    { label: 'Đơn hàng', path: '/orders', badge: pendingActionsCount > 0 ? pendingActionsCount : undefined },
  ];

  return (
    <header data-scrolled={isScrolled} className="site-header sticky top-0 z-40 bg-surface-alt backdrop-blur-md border-b border-border-soft">
      {/* Main Top Bar - strict 3-zone contract */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => navigateTo('/')}
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-accent whitespace-nowrap shrink-0 group text-left"
        >
          <img
            src="/brand/homemeal-footer.svg"
            alt=""
            aria-hidden="true"
            width={1286}
            height={784}
            decoding="async"
            className="h-auto w-9 shrink-0 min-[360px]:w-12 sm:w-16"
          />
          <div className="flex flex-col">
            <span className="leading-none text-xl font-bold">HomeMeal</span>
            <span className="text-[10px] tracking-normal font-normal text-ink hidden sm:block">
              Nấu cơm & Đi chợ minh bạch
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden 2xl:flex items-center gap-3 text-sm font-medium text-ink">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigateTo(link.path)}
              className={`relative whitespace-nowrap shrink-0 py-1 transition-colors hover:text-accent ${
                isActive(link.path)
                  ? 'text-accent font-semibold border-b-2 border-accent'
                  : 'text-ink'
              }`}
            >
              {link.label}
              {link.badge && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-bold bg-brand text-ink rounded-full">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => navigateTo('/support')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-accent ${
              isActive('/support') ? 'text-accent font-semibold' : 'text-ink'
            }`}
          >
            Hỗ trợ & Chính sách
          </button>
        </nav>

        {/* Zone 3: Primary Action & Account */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Account menu */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-soft bg-surface text-xs font-medium text-ink hover:border-brand transition-all"
            >
              {(!authUser || currentUser.role === 'customer') && <User className="w-3.5 h-3.5 text-detail" />}
              {currentUser.role === 'cook' && <ChefHat className="w-3.5 h-3.5 text-detail" />}
              {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5 text-detail" />}
              <span className="hidden sm:inline">
                {!authUser ? 'Đăng nhập' : currentUser.role === 'customer'
                  ? 'Khách hàng'
                  : currentUser.role === 'cook'
                  ? 'Đầu bếp'
                  : 'Quản trị viên'}
              </span>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-lg border border-border-soft py-2 z-50">
                <p className="px-3 py-2 text-xs text-ink">{authUser ? `Đã đăng nhập: ${authUser.email}` : 'Bạn chưa đăng nhập'}</p>
                <button onClick={() => { navigateTo(authUser ? '/account' : '/login'); setRoleMenuOpen(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-surface-alt">{authUser ? 'Tài khoản cá nhân' : 'Đăng nhập / Đăng ký'}</button>
                {authUser && <button onClick={() => { void logout().then(() => { setRoleMenuOpen(false); navigateTo('/'); }).catch((error) => showToast(error.message || 'Không thể đăng xuất.')); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-alt"><LogOut size={15} />Đăng xuất</button>}
              </div>
            )}
          </div>

          {/* Role specific primary action */}
          {currentUser.role === 'cook' ? (
            <button
              onClick={() => navigateTo('/cook/dashboard')}
              className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-medium text-on-brand bg-brand rounded-lg hover:bg-brand-hover transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              Góc Đầu Bếp
            </button>
          ) : currentUser.role === 'admin' ? (
            <button
              onClick={() => navigateTo('/admin')}
              className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-medium text-on-brand bg-brand rounded-lg hover:bg-brand-hover transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              Trang Quản Trị
            </button>
          ) : (
            <button
              onClick={() => navigateTo('/meal-planner')}
              className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-medium text-on-brand bg-brand rounded-lg hover:bg-brand-hover transition-colors whitespace-nowrap shrink-0 shadow-sm items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Đặt bữa ăn ngay</span>
            </button>
          )}

          {/* Account profile link */}
          <button
            onClick={() => navigateTo('/account')}
            title="Tài khoản cá nhân"
            className="p-2 rounded-lg border border-border-soft bg-surface text-ink hover:text-accent hover:border-brand"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="2xl:hidden p-2 rounded-lg text-ink hover:bg-surface-alt"
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="2xl:hidden border-t border-border-soft bg-surface-alt px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigateTo(link.path);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between ${
                isActive(link.path)
                  ? 'bg-brand text-ink font-semibold'
                  : 'text-ink hover:bg-surface-alt'
              }`}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="px-2 py-0.5 text-xs bg-brand text-ink rounded-full font-bold">
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
            className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-surface-alt rounded-lg"
          >
            Hỗ trợ & Chính sách
          </button>
          <div className="pt-2 border-t border-border-soft">
            <button onClick={() => { navigateTo(authUser?.role === 'admin' ? '/admin' : authUser?.role === 'cook' ? '/cook/dashboard' : '/account'); setMobileMenuOpen(false); }} className="w-full px-3 py-2 text-left text-sm font-semibold text-accent">{authUser?.role === 'admin' ? 'Trang Quản Trị' : authUser?.role === 'cook' ? 'Góc Đầu Bếp' : authUser ? 'Tài khoản cá nhân' : 'Đăng nhập / Đăng ký'}</button>
            {authUser && <button onClick={() => { void logout().then(() => { setMobileMenuOpen(false); navigateTo('/'); }).catch((error) => showToast(error.message || 'Không thể đăng xuất.')); }} className="w-full px-3 py-2 text-left text-sm text-ink">Đăng xuất</button>}
          </div>
        </div>
      )}
    </header>
  );
};
