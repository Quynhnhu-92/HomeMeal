import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, Dish, Cook, UserProfile, OrderStatus, ShoppingEvidenceItem, BudgetChangeRequest, Quotation } from '../types';
import { MOCK_ORDERS, MOCK_DISHES, MOCK_COOKS, MOCK_USERS } from '../data/mockData';
import { calculateLaborFee } from '../utils/pricing';
import { getEarliestDeliveryDate, formatDateForInput, formatTimeForInput, validateDeliveryDateTime } from '../utils/dateTimeValidation';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: 'customer' | 'cook' | 'admin') => void;
  
  orders: Order[];
  cooks: Cook[];
  dishes: Dish[];
  
  // Draft order builder
  draftOrder: Partial<Order>;
  updateDraftOrder: (data: Partial<Order>) => void;
  resetDraftOrder: () => void;
  submitDraftOrder: () => string; // returns created order ID
  
  // Order actions
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  
  // Budget & evidence
  approveBudgetChange: (orderId: string, requestId: string) => void;
  rejectBudgetChange: (orderId: string, requestId: string, responseNote?: string) => void;
  requestBudgetChange: (orderId: string, request: Omit<BudgetChangeRequest, 'id' | 'status' | 'requestedAt'>) => void;
  addShoppingEvidenceItem: (orderId: string, item: Omit<ShoppingEvidenceItem, 'id'>) => void;
  deleteShoppingEvidenceItem: (orderId: string, itemId: string) => void;
  
  // Quotations
  acceptQuotation: (orderId: string) => void;
  rejectQuotation: (orderId: string) => void;
  submitCookQuotation: (orderId: string, quotationData: Omit<Quotation, 'id' | 'orderId' | 'status' | 'submittedAt'>) => void;
  
  // Dispute & Payment
  fileDispute: (orderId: string, reason: string, description: string, reportedAmount: number) => void;
  resolveDispute: (orderId: string, adminResolution: string) => void;
  processPayment: (orderId: string, paymentMethod: string) => void;
  submitReview: (orderId: string, review: { rating: number; foodQuality: number; transparency: number; professionalism: number; punctuality: number; comment: string }) => void;
  
  // Reset demo
  resetToInitialDemoData: () => void;
  
  // Active route helper
  currentPath: string;
  navigateTo: (path: string) => void;
  
  // Global toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_ORDERS = 'homemeal_orders_v1';
const STORAGE_KEY_ROLE = 'homemeal_user_role_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.customer);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        return parsed.map((o) => ({
          ...o,
          serviceType: (o.serviceType as string) === 'party_at_home' ? 'party_at_home' : 'cook_at_home',
          deliveryFee: 0,
        }));
      }
    } catch {
      // ignore
    }
    return MOCK_ORDERS;
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  const switchRole = (role: 'customer' | 'cook' | 'admin') => {
    setCurrentUser(MOCK_USERS[role]);
    localStorage.setItem(STORAGE_KEY_ROLE, role);
    showToast(`Đã chuyển vai trò: ${role === 'customer' ? 'Khách hàng' : role === 'cook' ? 'Đầu bếp' : 'Quản trị viên'}`);
  };

  // Draft order initial state with 4-hour advance constraint
  const earliestDelivery = getEarliestDeliveryDate();
  const initialDraftOrder: Partial<Order> = {
    serviceType: 'cook_at_home',
    guestCount: 4,
    date: formatDateForInput(earliestDelivery),
    servingTime: formatTimeForInput(earliestDelivery),
    mealOccasion: 'Bữa cơm gia đình',
    items: [
      { dish: MOCK_DISHES[0], quantity: 1 },
      { dish: MOCK_DISHES[1], quantity: 1 },
      { dish: MOCK_DISHES[2], quantity: 1 },
    ],
    allergies: [],
    generalPreferences: '',
    estimatedGroceryBudget: 400000,
    customerName: currentUser.name,
    customerPhone: currentUser.phone,
    customerAddress: currentUser.address,
  };

  const [draftOrder, setDraftOrder] = useState<Partial<Order>>(initialDraftOrder);

  const updateDraftOrder = (data: Partial<Order>) => {
    setDraftOrder((prev) => ({ ...prev, ...data }));
  };

  const resetDraftOrder = () => {
    setDraftOrder(initialDraftOrder);
  };

  const submitDraftOrder = (): string => {
    const dishes = (draftOrder.items || []).map((i) => i.dish);
    const guestCount = draftOrder.guestCount || 4;
    const serviceType = draftOrder.serviceType || 'cook_at_home';
    const feeCalc = calculateLaborFee(guestCount, dishes, serviceType);

    const newId = 'ord_' + Date.now();
    const orderCode = 'HM-' + Math.floor(1000 + Math.random() * 9000);

    const requiresQuotation = feeCalc.requiresQuotation;

    const validation = validateDeliveryDateTime(draftOrder.date, draftOrder.servingTime);
    const finalDate = validation.isValid && draftOrder.date ? draftOrder.date : validation.earliestDateStr;
    const finalTime = validation.isValid && draftOrder.servingTime ? draftOrder.servingTime : validation.earliestTimeStr;

    const newOrder: Order = {
      id: newId,
      orderCode,
      customerId: currentUser.id,
      customerName: draftOrder.customerName || currentUser.name,
      customerPhone: draftOrder.customerPhone || currentUser.phone,
      customerAddress: draftOrder.customerAddress || currentUser.address,
      date: finalDate,
      servingTime: finalTime,
      guestCount,
      mealOccasion: draftOrder.mealOccasion || 'Bữa cơm gia đình',
      serviceType,
      items: draftOrder.items || [],
      allergies: draftOrder.allergies || [],
      generalPreferences: draftOrder.generalPreferences || '',
      estimatedGroceryBudget: draftOrder.estimatedGroceryBudget || 400000,
      actualGroceryTotal: 0,
      shoppingList: [],
      budgetChangeRequests: [],
      cookId: draftOrder.cookId || MOCK_COOKS[0].id,
      cook: MOCK_COOKS.find((c) => c.id === (draftOrder.cookId || MOCK_COOKS[0].id)) || MOCK_COOKS[0],
      baseLaborFee: feeCalc.baseLaborFee,
      complexityAdjustment: feeCalc.complexityAdjustment,
      guestCountAdjustment: feeCalc.guestAdjustment,
      deliveryFee: 0,
      additionalServiceFee: feeCalc.additionalServiceFee,
      totalLaborFee: feeCalc.totalLaborFee,
      finalPayableAmount: feeCalc.totalLaborFee + feeCalc.additionalServiceFee,
      status: requiresQuotation ? 'awaiting_quotation' : 'awaiting_cook',
      statusHistory: [
        {
          status: requiresQuotation ? 'awaiting_quotation' : 'awaiting_cook',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: requiresQuotation
            ? 'Đã gửi yêu cầu tiệc lớn. Đầu bếp sẽ gửi bảng báo giá chi tiết.'
            : 'Đã gửi yêu cầu đặt bữa. Đang chờ đầu bếp xác nhận.',
        },
      ],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setOrders((prev) => [newOrder, ...prev]);
    resetDraftOrder();
    showToast(`Đã tạo đơn ${orderCode} thành công!`);
    return newId;
  };

  const getOrderById = (id: string): Order | undefined => {
    return orders.find((o) => o.id === id || o.orderCode === id);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const newHistory = [
          ...ord.statusHistory,
          {
            status,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            note: note || `Trạng thái chuyển sang: ${status}`,
          },
        ];
        return {
          ...ord,
          status,
          statusHistory: newHistory,
        };
      })
    );
  };

  // Grocery budget change approvals
  const approveBudgetChange = (orderId: string, requestId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const req = ord.budgetChangeRequests.find((r) => r.id === requestId);
        if (!req) return ord;

        const updatedRequests = ord.budgetChangeRequests.map((r) =>
          r.id === requestId ? { ...r, status: 'approved' as const } : r
        );

        // Adjust approved budget
        const newBudget = req.requestedBudget;
        return {
          ...ord,
          estimatedGroceryBudget: newBudget,
          status: 'shopping_in_progress',
          budgetChangeRequests: updatedRequests,
          statusHistory: [
            ...ord.statusHistory,
            {
              status: 'shopping_in_progress',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: `Khách hàng đã đồng ý tăng ngân sách lên ${new Intl.NumberFormat('vi-VN').format(newBudget)} đ (+${new Intl.NumberFormat('vi-VN').format(req.difference)} đ). Tiếp tục đi chợ.`,
            },
          ],
        };
      })
    );
    showToast('Đã phê duyệt điều chỉnh ngân sách đi chợ!');
  };

  const rejectBudgetChange = (orderId: string, requestId: string, responseNote?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedRequests = ord.budgetChangeRequests.map((r) =>
          r.id === requestId
            ? { ...r, status: 'alternative_requested' as const, responseNote: responseNote || 'Khách yêu cầu thay thế nguyên liệu tương đương để giữ nguyên ngân sách ban đầu.' }
            : r
        );
        return {
          ...ord,
          budgetChangeRequests: updatedRequests,
          status: 'shopping_in_progress',
          statusHistory: [
            ...ord.statusHistory,
            {
              status: 'shopping_in_progress',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: 'Khách hàng yêu cầu tìm giải pháp thay thế, giữ nguyên định mức ngân sách cũ.',
            },
          ],
        };
      })
    );
    showToast('Đã yêu cầu đầu bếp đổi nguyên liệu để giữ đúng ngân sách!');
  };

  const requestBudgetChange = (
    orderId: string,
    requestData: Omit<BudgetChangeRequest, 'id' | 'status' | 'requestedAt'>
  ) => {
    const newReq: BudgetChangeRequest = {
      ...requestData,
      id: 'bcr_' + Date.now(),
      status: 'pending',
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: 'awaiting_budget_approval',
          budgetChangeRequests: [...ord.budgetChangeRequests, newReq],
          statusHistory: [
            ...ord.statusHistory,
            {
              status: 'awaiting_budget_approval',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: `Đầu bếp yêu cầu duyệt tăng thêm ${new Intl.NumberFormat('vi-VN').format(requestData.difference)} đ do giá "${requestData.affectedItem}" tăng.`,
            },
          ],
        };
      })
    );
    showToast('Đã gửi yêu cầu điều chỉnh ngân sách tới khách hàng!');
  };

  const addShoppingEvidenceItem = (orderId: string, itemData: Omit<ShoppingEvidenceItem, 'id'>) => {
    const newItem: ShoppingEvidenceItem = {
      ...itemData,
      id: 'shop_' + Date.now(),
    };

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedList = [...ord.shoppingList, newItem];
        const actualGroceryTotal = updatedList.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const finalPayableAmount = actualGroceryTotal + ord.totalLaborFee + (ord.deliveryFee || 0) + ord.additionalServiceFee;

        return {
          ...ord,
          shoppingList: updatedList,
          actualGroceryTotal,
          finalPayableAmount,
        };
      })
    );
    showToast(`Đã thêm nguyên liệu: ${itemData.name}`);
  };

  const deleteShoppingEvidenceItem = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedList = ord.shoppingList.filter((item) => item.id !== itemId);
        const actualGroceryTotal = updatedList.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const finalPayableAmount = actualGroceryTotal + ord.totalLaborFee + (ord.deliveryFee || 0) + ord.additionalServiceFee;

        return {
          ...ord,
          shoppingList: updatedList,
          actualGroceryTotal,
          finalPayableAmount,
        };
      })
    );
    showToast('Đã xóa món khỏi danh sách đi chợ');
  };

  // Quotation workflows
  const acceptQuotation = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId || !ord.quotation) return ord;
        const acceptedQuote = { ...ord.quotation, status: 'accepted' as const };
        const totalLaborFee = acceptedQuote.laborFee + acceptedQuote.assistantFee + acceptedQuote.equipmentFee;

        return {
          ...ord,
          quotation: acceptedQuote,
          totalLaborFee,
          status: 'confirmed',
          statusHistory: [
            ...ord.statusHistory,
            {
              status: 'confirmed',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: `Khách hàng đã đồng ý bảng báo giá (${new Intl.NumberFormat('vi-VN').format(totalLaborFee)} đ). Đơn hàng đã chính thức được chốt!`,
            },
          ],
        };
      })
    );
    showToast('Đã chấp thuận báo giá tiệc thành công!');
  };

  const rejectQuotation = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId || !ord.quotation) return ord;
        return {
          ...ord,
          quotation: { ...ord.quotation, status: 'rejected' as const },
          status: 'cancelled',
          statusHistory: [
            ...ord.statusHistory,
            {
              status: 'cancelled',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: 'Khách hàng từ chối báo giá. Đơn hàng kết thúc.',
            },
          ],
        };
      })
    );
    showToast('Đã từ chối báo giá.');
  };

  const submitCookQuotation = (
    orderId: string,
    quotationData: Omit<Quotation, 'id' | 'orderId' | 'status' | 'submittedAt'>
  ) => {
    const newQuote: Quotation = {
      ...quotationData,
      id: 'quote_' + Date.now(),
      orderId,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          quotation: newQuote,
          status: 'quotation_submitted',
          statusHistory: [
            ...ord.statusHistory,
            {
              status: 'quotation_submitted',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: `Đầu bếp ${quotationData.cookName} đã gửi bảng báo giá chi tiết gồm ${quotationData.assistantCount} phụ bếp và công nấu.`,
            },
          ],
        };
      })
    );
    showToast('Đã gửi báo giá tới khách hàng!');
  };

  // Disputes & payments
  const fileDispute = (
    orderId: string,
    reason: string,
    description: string,
    reportedAmount: number
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: 'disputed',
          dispute: {
            id: 'disp_' + Date.now(),
            reason,
            description,
            reportedAmount,
            status: 'open',
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          },
          statusHistory: [
            ...ord.statusHistory,
            {
              status: 'disputed',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: `Khách hàng khiếu nại khoản tiền: ${new Intl.NumberFormat('vi-VN').format(reportedAmount)} đ. Lý do: ${reason}. Hệ thống tạm khóa thanh toán.`,
            },
          ],
        };
      })
    );
    showToast('Đã ghi nhận khiếu nại. HomeMeal và đầu bếp sẽ phản hồi trong 30 phút.');
  };

  const resolveDispute = (orderId: string, adminResolution: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId || !ord.dispute) return ord;
        const adjustedActualGrocery = Math.max(0, ord.actualGroceryTotal - (ord.dispute.reportedAmount || 0));
        const newTotal = adjustedActualGrocery + ord.totalLaborFee + ord.deliveryFee;

        return {
          ...ord,
          actualGroceryTotal: adjustedActualGrocery,
          finalPayableAmount: newTotal,
          status: 'awaiting_payment',
          dispute: {
            ...ord.dispute,
            status: 'resolved',
          },
          statusHistory: [
            ...ord.statusHistory,
            {
              status: 'awaiting_payment',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: `Admin giải quyết: ${adminResolution}. Đã khấu trừ khoản không rõ chứng từ. Mời khách thanh toán số tiền còn lại.`,
            },
          ],
        };
      })
    );
    showToast('Đã xử lý tranh chấp và cập nhật hóa đơn!');
  };

  const processPayment = (orderId: string, paymentMethod: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: 'paid',
          statusHistory: [
            ...ord.statusHistory,
            {
              status: 'paid',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: `Thanh toán thành công qua phương thức: ${paymentMethod}. Toàn bộ dịch vụ hoàn tất tốt đẹp!`,
            },
          ],
        };
      })
    );
    showToast('Thanh toán thành công! Cảm ơn bạn đã tin dùng HomeMeal.');
  };

  const submitReview = (
    orderId: string,
    review: { rating: number; foodQuality: number; transparency: number; professionalism: number; punctuality: number; comment: string }
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          review: {
            ...review,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          },
        };
      })
    );
    showToast('Cảm ơn bạn đã gửi đánh giá bữa ăn!');
  };

  const resetToInitialDemoData = () => {
    setOrders(MOCK_ORDERS);
    localStorage.removeItem(STORAGE_KEY_ORDERS);
    showToast('Đã khôi phục dữ liệu mẫu ban đầu!');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        orders,
        cooks: MOCK_COOKS,
        dishes: MOCK_DISHES,
        draftOrder,
        updateDraftOrder,
        resetDraftOrder,
        submitDraftOrder,
        getOrderById,
        updateOrderStatus,
        approveBudgetChange,
        rejectBudgetChange,
        requestBudgetChange,
        addShoppingEvidenceItem,
        deleteShoppingEvidenceItem,
        acceptQuotation,
        rejectQuotation,
        submitCookQuotation,
        fileDispute,
        resolveDispute,
        processPayment,
        submitReview,
        resetToInitialDemoData,
        currentPath,
        navigateTo,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
