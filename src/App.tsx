import React from 'react';
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

const AppContent: React.FC = () => {
  const { currentPath } = useApp();

  // Route matching
  const renderCurrentView = () => {
    // 1. Static Exact Routes
    if (currentPath === '/') return <HomePage />;
    if (currentPath === '/meal-planner') return <MealPlannerPage />;
    if (currentPath === '/menu' || currentPath.startsWith('/menu?')) return <MenuPage />;
    if (currentPath === '/cooks') return <CooksPage />;
    if (currentPath === '/party-booking') return <PartyBookingPage />;
    if (currentPath === '/quotations') return <QuotationsPage />;
    if (currentPath === '/orders') return <OrdersPage />;
    if (currentPath === '/account' || currentPath === '/login' || currentPath === '/register' || currentPath === '/forgot-password') return <AccountPage />;
    if (currentPath === '/support') return <SupportPage />;

    // 2. Cook Routes
    if (currentPath === '/cook/dashboard' || currentPath === '/cook/orders') return <CookDashboardPage />;
    if (currentPath === '/cook/shopping' || currentPath.startsWith('/cook/shopping?')) return <CookShoppingPage />;
    if (currentPath === '/cook/earnings') return <CookEarningsPage />;

    // 3. Admin Routes
    if (
      currentPath === '/admin' ||
      currentPath === '/admin/orders' ||
      currentPath === '/admin/cooks' ||
      currentPath === '/admin/disputes' ||
      currentPath === '/admin/payments'
    ) {
      return <AdminDashboardPage />;
    }

    // 4. Dynamic Parameter Routes:
    // /cooks/:id
    if (currentPath.startsWith('/cooks/')) {
      const cookId = currentPath.replace('/cooks/', '');
      return <CookDetailPage cookId={cookId} />;
    }

    // /orders/:id/bill or /orders/:id/payment
    if (currentPath.match(/^\/orders\/[^/]+\/(bill|payment)/)) {
      const match = currentPath.match(/^\/orders\/([^/]+)\/(bill|payment)/);
      const orderId = match ? match[1] : '';
      return <OrderBillPage orderId={orderId} />;
    }

    // /orders/:id or /cook/orders/:id
    if (currentPath.startsWith('/orders/')) {
      const orderId = currentPath.replace('/orders/', '').split('/')[0];
      return <OrderDetailPage orderId={orderId} />;
    }
    if (currentPath.startsWith('/cook/orders/')) {
      const orderId = currentPath.replace('/cook/orders/', '').split('/')[0];
      return <OrderDetailPage orderId={orderId} />;
    }

    // 5. Fallback 404
    return <NotFoundPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#263B35]">
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
