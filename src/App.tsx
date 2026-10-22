import React, { Suspense, lazy, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { NotificationToast } from './components/common/NotificationToast';

// Views
import { HomePage } from './components/views/HomePage';
import { MealPlannerPage } from './components/views/MealPlannerPage';
import { MenuPage } from './components/views/MenuPage';
import { CooksPage } from './components/views/CooksPage';
import { CookDetailPage } from './components/views/CookDetailPage';
import { PartyBookingPage } from './components/views/PartyBookingPage';
import { OrdersPage } from './components/views/OrdersPage';
import { OrderDetailPage } from './components/views/OrderDetailPage';
import { OrderBillPage } from './components/views/OrderBillPage';
import { QuotationsPage } from './components/views/QuotationsPage';
import { SupportPage } from './components/views/SupportPage';
import { AccountPage } from './components/views/AccountPage';
import { NotFoundPage } from './components/views/NotFoundPage';

// Cook Portal
import { CookDashboardPage } from './components/views/cook/CookDashboardPage';
import { CookShoppingPage } from './components/views/cook/CookShoppingPage';
import { CookEarningsPage } from './components/views/cook/CookEarningsPage';

// Admin Portal
import { AdminDashboardPage } from './components/views/admin/AdminDashboardPage';

const SmartMenuPage = lazy(() => import('./components/views/SmartMenuPage').then((module) => ({ default: module.SmartMenuPage })));

const AppContent: React.FC = () => {
  const { currentPath, authUser, authLoading, navigateTo } = useApp();
  const pathname = currentPath.split(/[?#]/)[0] || '/';
  const requiredRole = pathname.startsWith('/admin')
    ? 'admin'
    : pathname === '/cook' || pathname.startsWith('/cook/')
      ? 'cook'
      : pathname === '/orders' || pathname.startsWith('/orders/')
        ? 'order-reader'
        : pathname === '/quotations' || pathname === '/party-booking' || pathname === '/meal-planner'
        ? 'customer'
        : null;
  const hasRequiredRole = authUser && (requiredRole === 'order-reader' || authUser.role === requiredRole);

  useEffect(() => {
    if (!requiredRole || authLoading) return;
    if (!authUser) {
      navigateTo(`/login?next=${encodeURIComponent(currentPath)}`);
      return;
    }
    if (!hasRequiredRole) {
      navigateTo(authUser.role === 'admin' ? '/admin' : authUser.role === 'cook' ? '/cook/dashboard' : '/');
    }
  }, [authLoading, authUser, currentPath, navigateTo, requiredRole, hasRequiredRole]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [currentPath]);

  // Route matching
  const renderCurrentView = () => {
    if (requiredRole && authLoading) {
      return <div className="px-4 py-20 text-center text-sm text-[#738078]">Đang kiểm tra quyền truy cập…</div>;
    }
    if (requiredRole && !authUser) {
      return <div className="px-4 py-20 text-center text-sm text-[#738078]">Đang chuyển đến trang đăng nhập…</div>;
    }
    if (requiredRole && !hasRequiredRole) {
      return <div className="px-4 py-20 text-center text-sm text-[#738078]">Bạn không có quyền truy cập trang này.</div>;
    }

    // 1. Static Exact Routes
    if (pathname === '/') return <HomePage />;
    if (pathname === '/meal-planner') return <MealPlannerPage />;
    if (pathname === '/menu') return <MenuPage />;
    if (pathname === '/smart-menu') return <Suspense fallback={<div role="status" className="px-4 py-16 text-center text-sm text-[#285E56]">Đang mở trợ lý thực đơn…</div>}><SmartMenuPage /></Suspense>;
    if (pathname === '/cooks') return <CooksPage />;
    if (pathname === '/party-booking') return <PartyBookingPage />;
    if (pathname === '/quotations') return <QuotationsPage />;
    if (pathname === '/orders') return <OrdersPage />;
    if (pathname === '/account' || pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') return <AccountPage />;
    if (pathname === '/support') return <SupportPage />;

    // 2. Cook Routes
    if (pathname === '/cook/dashboard' || pathname === '/cook/orders') return <CookDashboardPage />;
    if (pathname === '/cook/shopping') return <CookShoppingPage />;
    if (pathname === '/cook/earnings') return <CookEarningsPage />;

    // 3. Admin Routes
    if (
      pathname === '/admin' ||
      pathname === '/admin/orders' ||
      pathname === '/admin/cooks' ||
      pathname === '/admin/users' ||
      pathname === '/admin/disputes' ||
      pathname === '/admin/payments'
    ) {
      return <AdminDashboardPage />;
    }

    // 4. Dynamic Parameter Routes:
    // /cooks/:id
    if (pathname.startsWith('/cooks/')) {
      const cookId = pathname.replace('/cooks/', '');
      return <CookDetailPage cookId={cookId} />;
    }

    // /orders/:id/bill or /orders/:id/payment
    if (pathname.match(/^\/orders\/[^/]+\/(bill|payment)$/)) {
      const match = pathname.match(/^\/orders\/([^/]+)\/(bill|payment)$/);
      const orderId = match ? match[1] : '';
      return <OrderBillPage orderId={orderId} />;
    }

    // /orders/:id or /cook/orders/:id
    if (pathname.startsWith('/orders/')) {
      const orderId = pathname.replace('/orders/', '').split('/')[0];
      return <OrderDetailPage orderId={orderId} />;
    }
    if (pathname.startsWith('/cook/orders/')) {
      const orderId = pathname.replace('/cook/orders/', '').split('/')[0];
      return <OrderDetailPage orderId={orderId} />;
    }

    // 5. Fallback 404
    return <NotFoundPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-page-background text-[#263B35]">
      <Navbar />
      <main className="flex-1">{renderCurrentView()}</main>
      <Footer />
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
