import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Order, Dish, Cook, UserProfile, OrderStatus, ShoppingEvidenceItem, BudgetChangeRequest, Quotation } from '../types';
import { MOCK_ORDERS, MOCK_DISHES, MOCK_COOKS } from '../data/mockData';
import { calculateLaborFee } from '../utils/pricing';
import { normalizeOrder } from '../utils/normalizeOrder';
import { getEarliestServiceDate, formatDateForInput, formatTimeForInput, validateServiceDateTime } from '../utils/dateTimeValidation';

interface AppContextType {
  currentUser: UserProfile;
  authUser: UserProfile | null;
  authLoading: boolean;
  authError: string;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (profile: Pick<UserProfile, 'name' | 'phone' | 'address'>) => Promise<void>;

  
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
const GUEST: UserProfile = { id: '', name: '', email: '', phone: '', address: '', avatar: '', role: 'customer' };

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const sessionVersion = useRef(0);
  const currentUser = authUser || GUEST;
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        return parsed.map(normalizeOrder);
      }
    } catch {
      // ignore
    }
    return MOCK_ORDERS;
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search + window.location.hash || '/';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const applyAuthenticatedUser = (user: UserProfile) => {
    setAuthUser({ ...user, avatar: user.avatar || '' });
    setAuthError('');
  };

  useEffect(() => {
    let cancelled = false;
    const restore = () => {
      const version = sessionVersion.current;
      return fetch('/api?resource=auth&action=me', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not restore the sign-in session.');
        const result: { user: UserProfile | null } = await response.json();
        if (cancelled || version !== sessionVersion.current) return;
        if (result.user) applyAuthenticatedUser(result.user);
        else setAuthUser(null);
      })
      .catch(() => { if (!cancelled && version === sessionVersion.current) { setAuthUser(null); setAuthError('Không thể kết nối dịch vụ tài khoản. Vui lòng thử lại.'); } })
      .finally(() => { if (!cancelled) setAuthLoading(false); });
    };
    void restore();
    const refresh = () => { if (!document.hidden) void restore(); };
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => { cancelled = true; clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);

  const submitAuth = async (action: 'login' | 'register', payload: Record<string, string>) => {
    sessionVersion.current++;
    const response = await fetch('/api?resource=auth', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, action }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
    applyAuthenticatedUser(result.user as UserProfile);
    return result.user as UserProfile;
  };

  const login = (email: string, password: string) => submitAuth('login', { email, password });
  const register = (name: string, email: string, password: string) =>
    submitAuth('register', { name, email, password });

  const logout = async () => {
      sessionVersion.current++;
      const response = await fetch('/api?resource=auth', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      if (!response.ok) throw new Error('Không thể đăng xuất. Vui lòng thử lại.');
      setAuthUser(null);
  };

  const updateProfile = async (profile: Pick<UserProfile, 'name' | 'phone' | 'address'>) => {
    const response = await fetch('/api?resource=auth&action=profile', { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Không lưu được hồ sơ.');
    sessionVersion.current++;
    applyAuthenticatedUser(result.user);
  };

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search + window.location.hash || '/');
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

  const allowRole = (...roles: UserProfile['role'][]) => {
    if (authUser && roles.includes(authUser.role)) return true;
    showToast('Bạn không có quyền thực hiện thao tác này.');
    return false;
  };

  // Draft order initial state with 4-hour advance constraint
  const earliestService = getEarliestServiceDate();
  const initialDraftOrder: Partial<Order> = {
    serviceType: 'cook_at_home',
    guestCount: 4,
    date: formatDateForInput(earliestService),
    servingTime: formatTimeForInput(earliestService),
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
  const draftOrderRef = useRef(draftOrder);

  useEffect(() => {
    if (!authUser) return;
    const updatedDraftOrder = {
      ...draftOrderRef.current,
      customerName: authUser.name,
      customerPhone: draftOrderRef.current.customerPhone || authUser.phone,
      customerAddress: draftOrderRef.current.customerAddress || authUser.address,
    };
    draftOrderRef.current = updatedDraftOrder;
    setDraftOrder(updatedDraftOrder);
  }, [authUser]);

  const updateDraftOrder = (data: Partial<Order>) => {
    const updatedDraftOrder = { ...draftOrderRef.current, ...data };
    draftOrderRef.current = updatedDraftOrder;
    setDraftOrder(updatedDraftOrder);
  };

  const resetDraftOrder = () => {
    const resetDraft = {
      ...initialDraftOrder,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      customerAddress: currentUser.address,
    };
    draftOrderRef.current = resetDraft;
    setDraftOrder(resetDraft);
  };

  const submitDraftOrder = (): string => {
    if (!authUser || authUser.role !== 'customer') throw new Error('Vui lòng đăng nhập bằng tài khoản Khách hàng để đặt dịch vụ.');
    const submittedDraft = draftOrderRef.current;
    const dishes = (submittedDraft.items || []).map((i) => i.dish);
    const guestCount = submittedDraft.guestCount || 4;
    const serviceType = submittedDraft.serviceType || 'cook_at_home';
    const feeCalc = calculateLaborFee(guestCount, dishes, serviceType);

    const newId = 'ord_' + Date.now();
    const orderCode = 'HM-' + Math.floor(1000 + Math.random() * 9000);

    const requiresQuotation = feeCalc.requiresQuotation;

    const validation = validateServiceDateTime(submittedDraft.date, submittedDraft.servingTime);
    const finalDate = validation.isValid && submittedDraft.date ? submittedDraft.date : validation.earliestDateStr;
    const finalTime = validation.isValid && submittedDraft.servingTime ? submittedDraft.servingTime : validation.earliestTimeStr;

    const newOrder: Order = {
      id: newId,
      orderCode,
      customerId: currentUser.id,
      customerName: submittedDraft.customerName || currentUser.name,
      customerPhone: submittedDraft.customerPhone || currentUser.phone,
      customerAddress: submittedDraft.customerAddress || currentUser.address,
      date: finalDate,
      servingTime: finalTime,
      guestCount,
      mealOccasion: submittedDraft.mealOccasion || 'Bữa cơm gia đình',
      serviceType,
      items: submittedDraft.items || [],
      allergies: submittedDraft.allergies || [],
      generalPreferences: submittedDraft.generalPreferences || '',
      estimatedGroceryBudget: submittedDraft.estimatedGroceryBudget || 400000,
      actualGroceryTotal: 0,
      shoppingList: [],
      budgetChangeRequests: [],
      cookId: submittedDraft.cookId || MOCK_COOKS[0].id,
      cook: MOCK_COOKS.find((c) => c.id === (submittedDraft.cookId || MOCK_COOKS[0].id)) || MOCK_COOKS[0],
      baseLaborFee: feeCalc.baseLaborFee,
      complexityAdjustment: feeCalc.complexityAdjustment,
      guestCountAdjustment: feeCalc.guestAdjustment,
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
    if (!allowRole('cook', 'admin')) return;
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
    if (!allowRole('customer')) return;
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
    if (!allowRole('customer')) return;
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
    if (!allowRole('cook')) return;
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
    if (!allowRole('cook')) return;
    const newItem: ShoppingEvidenceItem = {
      ...itemData,
      id: 'shop_' + Date.now(),
    };

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedList = [...ord.shoppingList, newItem];
        const actualGroceryTotal = updatedList.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const finalPayableAmount = actualGroceryTotal + ord.totalLaborFee + ord.additionalServiceFee;

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
    if (!allowRole('cook')) return;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedList = ord.shoppingList.filter((item) => item.id !== itemId);
        const actualGroceryTotal = updatedList.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const finalPayableAmount = actualGroceryTotal + ord.totalLaborFee + ord.additionalServiceFee;

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
    if (!allowRole('customer')) return;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId || !ord.quotation) return ord;
        const acceptedQuote = { ...ord.quotation, status: 'accepted' as const };
        const totalLaborFee = acceptedQuote.laborFee;
        const additionalServiceFee = acceptedQuote.assistantFee + acceptedQuote.equipmentFee;
        const totalServiceFee = totalLaborFee + additionalServiceFee;
        const finalPayableAmount =
          ord.actualGroceryTotal + totalLaborFee + additionalServiceFee;

        return {
          ...ord,
          quotation: acceptedQuote,
          totalLaborFee,
          additionalServiceFee,
          finalPayableAmount,
          status: 'confirmed',
          statusHistory: [
            ...ord.statusHistory,
            {
              status: 'confirmed',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note: `Khách hàng đã đồng ý bảng báo giá (${new Intl.NumberFormat('vi-VN').format(totalServiceFee)} đ). Đơn hàng đã chính thức được chốt!`,
            },
          ],
        };
      })
    );
    showToast('Đã chấp thuận báo giá tiệc thành công!');
  };

  const rejectQuotation = (orderId: string) => {
    if (!allowRole('customer')) return;
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
    if (!allowRole('cook')) return;
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
    if (!allowRole('customer')) return;
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
    if (!allowRole('admin')) return;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId || !ord.dispute) return ord;
        const adjustedActualGrocery = Math.max(0, ord.actualGroceryTotal - (ord.dispute.reportedAmount || 0));
        const newTotal = adjustedActualGrocery + ord.totalLaborFee + ord.additionalServiceFee;

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
    if (!allowRole('customer')) return;
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
    if (!allowRole('customer')) return;
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
        authUser, authLoading, authError, login, register, logout, updateProfile,
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
