export type ServiceType = 
  | 'cook_at_home'         // Đầu bếp đến tận nhà khách hàng để nấu
  | 'party_at_home'        // Đầu bếp đến tận nhà nấu tiệc / mâm cỗ quy mô lớn
  | 'cook_and_deliver';    // (Tùy chọn phụ trợ cũ)

export type DishComplexity = 'simple' | 'moderate' | 'complex';

export type DishCategory = 
  | 'meat'          // Món thịt
  | 'fish'          // Món cá
  | 'seafood'       // Hải sản
  | 'vegetable'     // Rau củ
  | 'soup'          // Món canh
  | 'tofu'          // Đậu hũ & Trứng
  | 'vegetarian'    // Món chay
  | 'dessert'       // Tráng miệng & Ăn kèm
  | 'banquet';      // Món tiệc / Cỗ đặc biệt

export interface Ingredient {
  id: string;
  name: string;
  estimatedQuantity: string;
  unit: string;
  estimatedPrice: number; // VND
  allergen?: boolean;
}

export interface Dish {
  id: string;
  name: string;
  vietnameseName: string;
  category: DishCategory;
  description: string;
  suggestedPortion: string; // e.g. "3-4 người"
  complexity: DishComplexity;
  estimatedCost: number; // Chi phí nguyên liệu ước tính (VND)
  prepTimeMinutes: number;
  dietaryTags: string[]; // ["Ít dầu mỡ", "Giàu đạm", "Không bột ngọt"]
  ingredients: Ingredient[];
  imageUrl: string;
  popular?: boolean;
}

export interface Cook {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  serviceAreas: string[]; // ["Quận 1", "Bình Thạnh", "Thủ Đức"]
  specialties: string[];
  supportedEvents: string[]; // ["Bữa cơm thường ngày", "Tiệc sinh nhật", "Giỗ chạp", "Tiệc > 30 người"]
  maxGuests: number;
  baseLaborFee: number; // Giá công khởi điểm cho bữa nhỏ (VND)
  bio: string;
  verified: boolean;
  hygieneCertificate: boolean;
  sampleDishIds: string[];
}

export type OrderStatus =
  | 'draft'
  | 'awaiting_cook'
  | 'awaiting_quotation'
  | 'quotation_submitted'
  | 'confirmed'
  | 'shopping_in_progress'
  | 'evidence_submitted'
  | 'awaiting_budget_approval'
  | 'preparing_meal'
  | 'ready_for_service'
  | 'delivering_or_serving'
  | 'service_completed'
  | 'awaiting_payment'
  | 'paid'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface ShoppingEvidenceItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  estimatedPrice: number;
  actualPrice: number;
  subtotal: number;
  storeName: string;
  purchaseTime: string;
  receiptImageUrl?: string;
  ingredientImageUrl?: string;
  notes?: string;
  status: 'pending' | 'purchased' | 'substituted' | 'price_increased';
  approvedByCustomer?: boolean;
}

export interface BudgetChangeRequest {
  id: string;
  originalBudget: number;
  requestedBudget: number;
  difference: number;
  reason: string;
  affectedItem: string;
  evidencePhotoUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'alternative_requested';
  requestedAt: string;
  responseNote?: string;
}

export interface Quotation {
  id: string;
  cookId: string;
  cookName: string;
  orderId: string;
  laborFee: number;
  assistantCount: number;
  assistantFee: number;
  equipmentFee: number;
  estimatedPrepTimeHours: number;
  proposedSubstitutions?: string;
  surchargeNotes?: string;
  totalLaborAndServices: number;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

export interface OrderItem {
  dish: Dish;
  quantity: number;
  excludedIngredients?: string[];
  specialNotes?: string;
}

export interface Order {
  id: string;
  orderCode: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  date: string;
  servingTime: string;
  guestCount: number;
  mealOccasion: string; // "Cơm gia đình", "Sinh nhật", "Cúng giỗ", "Họp mặt bạn bè"
  serviceType: ServiceType;
  items: OrderItem[];
  allergies: string[];
  generalPreferences: string;
  
  // Grocery Financials (Minh bạch nguyên liệu)
  estimatedGroceryBudget: number; // Ngân sách khách định mức
  actualGroceryTotal: number;     // Chi phí thực tế dựa trên hóa đơn
  shoppingList: ShoppingEvidenceItem[];
  budgetChangeRequests: BudgetChangeRequest[];
  
  // Service Fees (Tách bạch tiền công)
  cookId?: string;
  cook?: Cook;
  baseLaborFee: number;
  complexityAdjustment: number;
  guestCountAdjustment: number;
  deliveryFee: number;
  additionalServiceFee: number; // Phụ bếp, dọn dẹp thêm
  totalLaborFee: number;
  
  // Quotation for large events
  quotation?: Quotation;
  
  // Total calculation
  finalPayableAmount: number; // = actualGroceryTotal + totalLaborFee + deliveryFee + additionalServiceFee
  
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note: string }[];
  
  // Dispute & review
  dispute?: {
    id: string;
    reason: string;
    description: string;
    reportedAmount: number;
    evidenceUrl?: string;
    status: 'open' | 'investigating' | 'resolved';
    createdAt: string;
  };
  review?: {
    rating: number;
    foodQuality: number;
    transparency: number;
    professionalism: number;
    punctuality: number;
    comment: string;
    createdAt: string;
  };
  
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'cook' | 'admin';
  address: string;
  avatar: string;
}
