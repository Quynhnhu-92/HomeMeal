import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Dish, DishCategory } from '../../types';
import { calculateLaborFee, formatVND } from '../../utils/pricing';
import { 
  validateDeliveryDateTime, 
  getEarliestDeliveryDate, 
  formatDateForInput, 
  formatTimeForInput, 
  getNow 
} from '../../utils/dateTimeValidation';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Utensils, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  ChefHat, 
  Star, 
  ShieldCheck, 
  Receipt, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Truck,
  Sparkles,
  PenTool,
  ListPlus
} from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

const STEPS = [
  'Thời gian & Địa chỉ nhà bạn',
  'Điền món ăn yêu cầu',
  'Nguyên liệu & Kiêng khem',
  'Ngân sách đi chợ',
  'Tính công đầu bếp tại gia',
  'Chọn đầu bếp',
  'Xác nhận đơn',
];

export const MealPlannerPage: React.FC = () => {
  const { dishes, cooks, draftOrder, updateDraftOrder, submitDraftOrder, navigateTo, authUser, showToast } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [newExcludedIngredient, setNewExcludedIngredient] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  // Custom dish input state
  const [customDishName, setCustomDishName] = useState('');
  const [customDishCategory, setCustomDishCategory] = useState<DishCategory>('meat');
  const [customDishNotes, setCustomDishNotes] = useState('');
  const [customDishPortion, setCustomDishPortion] = useState('');
  const [customDishCost, setCustomDishCost] = useState('');
  const [bulkInputText, setBulkInputText] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Validate date & time with 4-hour advance constraint
  const timeValidation = validateDeliveryDateTime(draftOrder.date, draftOrder.servingTime);

  // Auto-set earliest valid date & time if currently empty or invalid on first mount
  useEffect(() => {
    if (!draftOrder.date || !draftOrder.servingTime) {
      const earliest = getEarliestDeliveryDate();
      updateDraftOrder({
        date: formatDateForInput(earliest),
        servingTime: formatTimeForInput(earliest),
        serviceType: 'cook_at_home',
      });
    }
  }, []);

  const handleApplyEarliestTime = () => {
    const earliest = getEarliestDeliveryDate();
    updateDraftOrder({
      date: formatDateForInput(earliest),
      servingTime: formatTimeForInput(earliest),
    });
  };

  // Selected dishes
  const selectedItems = draftOrder.items || [];
  const selectedDishes = selectedItems.map((i) => i.dish);

  // Calculate estimated ingredient cost
  const estimatedIngredientTotal = selectedItems.reduce(
    (sum, item) => sum + (item.dish.estimatedCost || 0) * item.quantity,
    0
  );

  // Calculate labor fee for cooking at home
  const guestCount = draftOrder.guestCount || 4;
  const feeCalc = calculateLaborFee(guestCount, selectedDishes, 'cook_at_home');

  // Add custom dish directly entered by user
  const handleAddCustomDish = (presetName?: string, presetCat?: DishCategory) => {
    const name = (presetName || customDishName).trim();
    if (!name) {
      alert('Vui lòng nhập tên món ăn bạn muốn.');
      return;
    }

    const newDishId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cat = presetCat || customDishCategory;

    let parsedCost = Number(customDishCost);
    if (!parsedCost || parsedCost <= 0) {
      if (cat === 'seafood') parsedCost = 120000;
      else if (cat === 'meat' || cat === 'fish') parsedCost = 85000;
      else if (cat === 'soup') parsedCost = 45000;
      else if (cat === 'vegetable') parsedCost = 30000;
      else if (cat === 'vegetarian') parsedCost = 40000;
      else parsedCost = 65000;
    }

    const newDish: Dish = {
      id: newDishId,
      name,
      vietnameseName: name,
      category: cat,
      description: customDishNotes.trim() || 'Món ăn do khách yêu cầu nấu theo khẩu vị riêng',
      suggestedPortion: customDishPortion.trim() || `${guestCount} người ăn`,
      complexity: cat === 'banquet' || cat === 'seafood' ? 'complex' : cat === 'soup' || cat === 'vegetable' ? 'simple' : 'moderate',
      estimatedCost: parsedCost,
      prepTimeMinutes: 30,
      dietaryTags: ['Nấu theo yêu cầu'],
      ingredients: [],
      imageUrl: '',
    };

    updateDraftOrder({
      items: [
        ...(draftOrder.items || []),
        {
          dish: newDish,
          quantity: 1,
          specialNotes: customDishNotes.trim() || undefined,
        },
      ],
    });

    setCustomDishName('');
    setCustomDishNotes('');
    setCustomDishCost('');
  };

  // Add multiple dishes from multiline input
  const handleAddBulkDishes = () => {
    const lines = bulkInputText
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•\d.)\s]+/, ''))
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      alert('Vui lòng nhập ít nhất một tên món ăn.');
      return;
    }

    const newItems = lines.map((dishName, idx) => {
      const lower = dishName.toLowerCase();
      let cat: DishCategory = 'meat';
      let estCost = 80000;
      if (lower.includes('canh') || lower.includes('súp') || lower.includes('cháo')) {
        cat = 'soup';
        estCost = 45000;
      } else if (lower.includes('rau') || lower.includes('cải') || lower.includes('xào') || lower.includes('luộc')) {
        cat = 'vegetable';
        estCost = 30000;
      } else if (lower.includes('cá ') || lower.includes('tôm') || lower.includes('mực') || lower.includes('hải sản') || lower.includes('cua')) {
        cat = 'seafood';
        estCost = 110000;
      } else if (lower.includes('chè') || lower.includes('trái cây') || lower.includes('tráng miệng')) {
        cat = 'dessert';
        estCost = 35000;
      }

      const newDish: Dish = {
        id: `bulk_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        name: dishName,
        vietnameseName: dishName,
        category: cat,
        description: 'Món ăn yêu cầu theo thực đơn gia đình',
        suggestedPortion: `${guestCount} người ăn`,
        complexity: cat === 'seafood' ? 'complex' : cat === 'soup' || cat === 'vegetable' ? 'simple' : 'moderate',
        estimatedCost: estCost,
        prepTimeMinutes: 30,
        dietaryTags: ['Nấu theo yêu cầu'],
        ingredients: [],
        imageUrl: '',
      };
      return { dish: newDish, quantity: 1 };
    });

    updateDraftOrder({
      items: [...(draftOrder.items || []), ...newItems],
    });

    setBulkInputText('');
    setShowBulkInput(false);
  };

  const handleUpdateQuantity = (dishId: string, delta: number) => {
    const updated = selectedItems
      .map((i) => {
        if (i.dish.id === dishId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      })
      .filter(Boolean) as typeof selectedItems;
    updateDraftOrder({ items: updated });
  };

  const handleRemoveDish = (dishId: string) => {
    const updated = selectedItems.filter((i) => i.dish.id !== dishId);
    updateDraftOrder({ items: updated });
  };

  const handleClearAllDishes = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả các món đã điền không?')) {
      updateDraftOrder({ items: [] });
    }
  };

  // Allergies & excluded ingredients
  const handleAddAllergy = () => {
    if (newAllergy.trim() && !(draftOrder.allergies || []).includes(newAllergy.trim())) {
      updateDraftOrder({ allergies: [...(draftOrder.allergies || []), newAllergy.trim()] });
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (idx: number) => {
    const updated = (draftOrder.allergies || []).filter((_, i) => i !== idx);
    updateDraftOrder({ allergies: updated });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Step 1: Validate 4-hour rule & address
      if (!timeValidation.isValid) {
        alert(`Quy định đặt món: ${timeValidation.message}`);
        return;
      }
      if (!draftOrder.customerAddress?.trim()) {
        alert('Vui lòng nhập địa chỉ nhận món ăn để đầu bếp giao đến.');
        return;
      }
    }
    if (currentStep === 2) {
      // Step 2: Validate at least 1 dish
      if (selectedItems.length === 0) {
        alert('Vui lòng điền ít nhất 1 món ăn bạn muốn cho bữa cơm của bạn.');
        return;
      }
    }
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    if (!authUser) { navigateTo('/login?next=%2Fmeal-planner'); return; }
    if (authUser.role !== 'customer') { showToast('Vui lòng dùng tài khoản Khách hàng để đặt dịch vụ.'); return; }
    if (!timeValidation.isValid) {
      alert(`Quy định đặt món: ${timeValidation.message}`);
      setCurrentStep(1);
      return;
    }
    const newOrderId = submitDraftOrder();
    navigateTo(`/orders/${newOrderId}`);
  };

  // The latest dish editor also edits imported Smart Menu items via selectedItems.

  const budget = draftOrder.estimatedGroceryBudget || 400000;
  const budgetDifference = budget - estimatedIngredientTotal;

  const minDateAllowed = formatDateForInput(getNow());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {selectedDishes.some((dish) => dish.id.startsWith('smart-')) && (
        <div role="status" className="rounded-2xl border border-[#B8E4D3] bg-[#E7F5EF] p-4 text-sm leading-6 text-[#285E56]">
          Đã nhận thực đơn Smart Menu cho {guestCount} người. Mỗi món x1 đã gồm khẩu phần cho cả nhóm; giá nguyên liệu là ước tính. Bạn vẫn cần chọn lịch, địa chỉ, đầu bếp và tự xác nhận đơn ở bước cuối.
        </div>
      )}
      {/* Header & Stepper */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5ECE7] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#285E56] uppercase tracking-wider">
                Quy trình đặt nấu bữa ăn
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Truck className="w-3 h-3 text-emerald-600" />
                Giao món nóng sốt tận nơi
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#263B35]">
              {STEPS[currentStep - 1]}
            </h1>
          </div>
          <div className="text-xs text-[#738078] flex items-center gap-2">
            <span>Bước {currentStep} / {STEPS.length}</span>
            <span className="font-semibold text-[#285E56]">
              ({Math.round((currentStep / STEPS.length) * 100)}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E7F5EF] h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-[#285E56] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step Pills on Desktop */}
        <div className="hidden lg:grid grid-cols-7 gap-2 text-[11px] font-medium text-center text-[#738078]">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className={`py-1.5 px-1 rounded-lg truncate ${
                currentStep === idx + 1
                  ? 'bg-[#285E56] text-white font-semibold'
                  : currentStep > idx + 1
                  ? 'bg-[#E7F5EF] text-[#285E56]'
                  : 'bg-stone-50'
              }`}
            >
              {idx + 1}. {step}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: THỜI GIAN, ĐỊA CHỈ & QUY MÔ (ĐẦU BẾP ĐẾN TẬN NHÀ NẤU ĂN, BẮT BUỘC ĐẶT TRƯỚC 4 TIẾNG) */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5ECE7] shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#E5ECE7]">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#263B35]">
                Thời gian phục vụ & Địa chỉ gian bếp nhà bạn
              </h2>
              <p className="text-xs sm:text-sm text-[#738078] mt-0.5">
                Đầu bếp HomeMeal đến tận gian bếp nhà bạn nấu nóng hổi, đi chợ mua nguyên liệu tươi sống trong ngày, dọn mâm lên bàn và dọn dẹp sạch sẽ sau khi dùng bữa.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold shrink-0">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Yêu cầu đặt trước tối thiểu 4 tiếng</span>
            </div>
          </div>

          {/* 4-Hour Rule Live Verification Banner */}
          {!timeValidation.isValid ? (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-2 animate-pulse">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <p className="font-bold text-rose-800">
                    ⚠️ Giờ phục vụ không hợp lệ (Không được chọn cách hiện tại dưới 4 tiếng)
                  </p>
                  <p className="text-rose-700">
                    {timeValidation.message}
                  </p>
                </div>
              </div>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleApplyEarliestTime}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Tự động chọn giờ sớm nhất khả dụng ({timeValidation.suggestedFormatted})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Thời gian hợp lệ:</strong> Phục vụ lúc <strong>{draftOrder.servingTime} ngày {draftOrder.date}</strong> (cách hiện tại {Math.floor(timeValidation.hoursUntilDelivery)} giờ {Math.round((timeValidation.hoursUntilDelivery - Math.floor(timeValidation.hoursUntilDelivery)) * 60)} phút - Đầu bếp có đủ thời gian chuẩn bị & di chuyển tới nhà bạn).
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#263B35] mb-1.5 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#285E56]" /> Ngày đầu bếp tới nấu:
              </label>
              <input
                type="date"
                min={minDateAllowed}
                value={draftOrder.date || ''}
                onChange={(e) => updateDraftOrder({ date: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-[#FFFDF7] border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#285E56] font-medium ${
                  !timeValidation.isValid ? 'border-rose-400 ring-1 ring-rose-200' : 'border-[#E5ECE7]'
                }`}
              />
              <p className="text-[11px] text-[#738078] mt-1">
                Sớm nhất: hôm nay hoặc ngày mai
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263B35] mb-1.5 flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#285E56]" /> Giờ ăn cơm mong muốn:
              </label>
              <input
                type="time"
                value={draftOrder.servingTime || ''}
                onChange={(e) => updateDraftOrder({ servingTime: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-[#FFFDF7] border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#285E56] font-medium ${
                  !timeValidation.isValid ? 'border-rose-400 ring-1 ring-rose-200 bg-rose-50/40 text-rose-900' : 'border-[#E5ECE7]'
                }`}
              />
              <p className="text-[11px] text-[#738078] mt-1">
                * Đầu bếp sẽ đến sớm 1-2 tiếng trước giờ ăn để nấu trực tiếp
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263B35] mb-1.5 flex items-center gap-1">
                <Users className="w-4 h-4 text-[#285E56]" /> Số lượng khách ăn:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={draftOrder.guestCount || 4}
                  onChange={(e) => updateDraftOrder({ guestCount: Math.max(1, parseInt(e.target.value) || 1) })}
                  placeholder="Nhập số người ăn..."
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#285E56] font-bold text-[#263B35]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#738078] pointer-events-none">
                  người ăn
                </span>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">
                Tùy ý nhập số lượng người ăn cho bữa cơm của bạn
              </p>
              {guestCount > 20 && (
                <p className="text-[11px] text-amber-700 mt-1 font-medium">
                  * Quy mô trên 20 khách sẽ có cơ chế gửi bảng báo giá cụ thể từ đầu bếp.
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#263B35] mb-1.5 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#285E56]" /> Địa chỉ nhà bạn (Nơi đầu bếp đến nấu):
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Căn hộ 12.04, Toà Landmark 3, Vinhomes Central Park, Bình Thạnh"
                value={draftOrder.customerAddress || ''}
                onChange={(e) => updateDraftOrder({ customerAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#285E56]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263B35] mb-1.5">Dịp bữa ăn:</label>
              <input
                type="text"
                placeholder="Ví dụ: Cơm tối thường nhật, Sinh nhật con, Giỗ ông bà..."
                value={draftOrder.mealOccasion || 'Bữa cơm gia đình'}
                onChange={(e) => updateDraftOrder({ mealOccasion: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#285E56]"
              />
            </div>
          </div>

          <div className="p-4 bg-[#FFFDF7] rounded-xl border border-[#E5ECE7] text-xs text-[#738078] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#285E56] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#263B35]">Cam kết chất lượng giao nhận:</span> Món ăn sau khi nấu xong tại bếp riêng của đầu bếp sẽ được đóng hộp sinh học giữ nhiệt, niêm phong cẩn thận và giao nhanh qua thùng giữ nhiệt để đảm bảo giữ nguyên độ nóng, mùi thơm và hương vị khi đến tay gia đình bạn.
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ĐIỀN MÓN ĂN YÊU CẦU (KHÁCH TỰ ĐIỀN MÓN ĂN THEO Ý MUỐN) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5ECE7] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E7F5EF] text-[#285E56] text-xs font-bold border border-[#B8E4D3]">
                    Khẩu vị riêng 100%
                  </span>
                  <span className="text-xs text-[#738078]">Không giới hạn theo danh mục cố định</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#263B35]">
                  Tự điền món ăn gia đình bạn muốn
                </h2>
                <p className="text-xs sm:text-sm text-[#738078] mt-1">
                  Nhập bất kỳ món ăn nào bạn thèm hôm nay (món mặn, xào, canh, hải sản, món chay...). Đầu bếp sẽ mua nguyên liệu tươi ngon tại chợ và chế biến theo đúng khẩu vị riêng của gia đình bạn.
                </p>
              </div>

              {/* Status summary */}
              <div className="text-left sm:text-right bg-[#FFFDF7] p-3.5 rounded-xl border border-[#E5ECE7] shrink-0">
                <span className="text-xs text-[#738078] block">Thực đơn đã điền:</span>
                <span className="text-base font-extrabold text-[#285E56]">
                  {selectedItems.length} món ăn
                </span>
                <span className="text-[11px] text-[#738078] block mt-0.5">
                  Ước tính tiền chợ: {formatVND(estimatedIngredientTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Main Input Form */}
          <div className="bg-white rounded-2xl p-6 border border-[#B8E4D3] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5ECE7] pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#285E56]" />
                <h3 className="font-bold text-[#263B35] text-sm sm:text-base">
                  Điền món ăn bạn muốn đầu bếp nấu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkInput(!showBulkInput)}
                className="text-xs font-semibold text-[#285E56] hover:underline flex items-center gap-1.5 self-start sm:self-auto"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>{showBulkInput ? 'Đóng nhập nhanh' : 'Nhập nhanh nhiều món (mỗi dòng 1 món)'}</span>
              </button>
            </div>

            {/* Bulk multiline input drawer */}
            {showBulkInput && (
              <div className="p-4 bg-[#E7F5EF] rounded-xl border border-[#B8E4D3] space-y-3">
                <label className="block text-xs font-bold text-[#285E56]">
                  Dán hoặc gõ danh sách món ăn (mỗi dòng một món):
                </label>
                <textarea
                  rows={4}
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                  placeholder="Ví dụ:&#10;Thịt kho hột vịt nước dừa&#10;Canh chua cá lóc bông điên điển&#10;Rau muống xào tỏi giòn&#10;Dưa hấu tráng miệng"
                  className="w-full p-3 bg-white border border-[#B8E4D3] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#285E56] outline-none"
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-[#738078]">
                    Hệ thống tự động phân loại món và đưa vào mâm cơm ngay lập tức.
                  </span>
                  <button
                    type="button"
                    onClick={handleAddBulkDishes}
                    className="px-4 py-2 bg-[#285E56] hover:bg-[#1f4b44] text-white text-xs font-bold rounded-lg transition-all shadow-xs self-start sm:self-auto"
                  >
                    Thêm danh sách món này
                  </button>
                </div>
              </div>
            )}

            {/* Single dish entry inputs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              {/* Dish Name */}
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-[#263B35] mb-1">
                  Tên món ăn bạn muốn: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customDishName}
                  onChange={(e) => setCustomDishName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomDish();
                    }
                  }}
                  placeholder="Ví dụ: Sườn ram mặn, Canh cải nấu tôm, Cá bống kho..."
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-xs sm:text-sm font-semibold text-[#263B35] focus:ring-2 focus:ring-[#285E56] outline-none"
                />
              </div>

              {/* Category */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-[#263B35] mb-1">
                  Phân loại món:
                </label>
                <select
                  value={customDishCategory}
                  onChange={(e) => setCustomDishCategory(e.target.value as DishCategory)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#285E56] outline-none"
                >
                  <option value="meat">Món thịt (Kho, rim, xào...)</option>
                  <option value="fish">Món cá (Kho tộ, chiên...)</option>
                  <option value="seafood">Hải sản (Tôm, cua, mực...)</option>
                  <option value="soup">Món canh / Súp / Lẩu</option>
                  <option value="vegetable">Món rau (Xào, luộc, gỏi...)</option>
                  <option value="vegetarian">Món chay thanh đạm</option>
                  <option value="dessert">Tráng miệng / Ăn kèm</option>
                  <option value="banquet">Món tiệc / Cỗ đặc biệt</option>
                </select>
              </div>

              {/* Portion / Quantity */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-[#263B35] mb-1">
                  Định lượng / Số phần:
                </label>
                <input
                  type="text"
                  value={customDishPortion}
                  onChange={(e) => setCustomDishPortion(e.target.value)}
                  placeholder={`Mặc định: ${guestCount} người ăn (hoặc: 1 đĩa lớn, 2 tô)`}
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#285E56] outline-none"
                />
              </div>

              {/* Custom Notes / Taste Preferences */}
              <div className="md:col-span-8">
                <label className="block text-xs font-bold text-[#263B35] mb-1">
                  Ghi chú khẩu vị & cách nấu cho món này (tùy chọn):
                </label>
                <input
                  type="text"
                  value={customDishNotes}
                  onChange={(e) => setCustomDishNotes(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomDish();
                    }
                  }}
                  placeholder="Ví dụ: Ít cay cho trẻ nhỏ, thịt kho mềm rục, không nêm bột ngọt, đậm đà..."
                  className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#285E56] outline-none"
                />
              </div>

              {/* Action Button */}
              <div className="md:col-span-4 flex items-end">
                <button
                  type="button"
                  onClick={() => handleAddCustomDish()}
                  className="w-full py-2.5 px-4 bg-[#285E56] hover:bg-[#1f4b44] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 h-[42px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm món vào mâm cơm</span>
                </button>
              </div>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="pt-2 border-t border-[#E5ECE7]">
              <div className="flex items-center gap-1.5 text-xs text-[#738078] mb-2 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#F2AD72]" />
                <span>Gợi ý bấm nhanh món ăn gia đình quen thuộc:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Thịt kho tàu nước dừa', cat: 'meat' as DishCategory },
                  { name: 'Sườn non ram mặn', cat: 'meat' as DishCategory },
                  { name: 'Gà ta kho sả ớt', cat: 'meat' as DishCategory },
                  { name: 'Cá lóc đồng kho tộ', cat: 'fish' as DishCategory },
                  { name: 'Canh chua cá lóc', cat: 'soup' as DishCategory },
                  { name: 'Canh cua rau đay mồng tơi', cat: 'soup' as DishCategory },
                  { name: 'Canh sườn hầm rau củ', cat: 'soup' as DishCategory },
                  { name: 'Rau muống xào tỏi', cat: 'vegetable' as DishCategory },
                  { name: 'Bò xào bông thiên lý', cat: 'meat' as DishCategory },
                  { name: 'Đậu hũ sốt cà chua', cat: 'vegetarian' as DishCategory },
                  { name: 'Tôm rim thịt ba chỉ', cat: 'seafood' as DishCategory },
                  { name: 'Trứng chiên thịt bằm', cat: 'meat' as DishCategory },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddCustomDish(item.name, item.cat)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-[#E7F5EF] text-stone-700 hover:text-[#285E56] rounded-lg text-xs font-medium border border-stone-200 hover:border-[#B8E4D3] transition-colors flex items-center gap-1"
                  >
                    <span>+ {item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List of Entered Dishes */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5ECE7] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#285E56]" />
                <h3 className="font-bold text-[#263B35] text-base">
                  Mâm cơm của bạn ({selectedItems.length} món)
                </h3>
              </div>
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllDishes}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold hover:underline"
                >
                  Xóa tất cả món
                </button>
              )}
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#B8E4D3] bg-[#FFFDF7] space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E7F5EF] text-[#285E56] flex items-center justify-center mx-auto text-xl">
                  🍲
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#263B35]">Chưa có món ăn nào trong mâm cơm</h4>
                  <p className="text-xs text-[#738078] max-w-md mx-auto">
                    Hãy nhập tên món bạn muốn ăn ở khung phía trên, hoặc bấm vào các món gợi ý để thêm nhanh vào thực đơn.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item, idx) => (
                  <div
                    key={item.dish.id || idx}
                    className="p-4 rounded-xl border border-[#E5ECE7] bg-[#FFFDF7] hover:border-[#B8E4D3] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-6 h-6 rounded-full bg-[#E7F5EF] text-[#285E56] font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-sm sm:text-base text-[#263B35]">
                          {item.dish.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-[#285E56] bg-[#E7F5EF] px-2 py-0.5 rounded-md border border-[#B8E4D3]">
                          {item.dish.category === 'meat' ? 'Món thịt' :
                           item.dish.category === 'fish' ? 'Món cá' :
                           item.dish.category === 'seafood' ? 'Hải sản' :
                           item.dish.category === 'soup' ? 'Món canh' :
                           item.dish.category === 'vegetable' ? 'Món rau' :
                           item.dish.category === 'vegetarian' ? 'Món chay' :
                           item.dish.category === 'dessert' ? 'Tráng miệng' : 'Món tiệc/cỗ'}
                        </span>
                        {item.dish.suggestedPortion && (
                          <span className="text-[11px] text-[#738078] bg-stone-100 px-2 py-0.5 rounded-md">
                            {item.dish.suggestedPortion}
                          </span>
                        )}
                      </div>

                      {item.specialNotes && (
                        <p className="text-xs text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-block">
                          ✍️ Khẩu vị: {item.specialNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5ECE7]">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1.5 bg-white border border-[#E5ECE7] rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.dish.id, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[#263B35] hover:bg-stone-100 text-xs"
                          title="Giảm số lượng"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-[#263B35]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.dish.id, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[#263B35] hover:bg-stone-100 text-xs"
                          title="Tăng số lượng"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Estimated Cost */}
                      <div className="text-right min-w-[90px]">
                        <span className="text-[10px] text-[#738078] block">Ước tính chợ:</span>
                        <span className="text-xs font-bold text-[#285E56]">
                          {formatVND(item.dish.estimatedCost * item.quantity)}
                        </span>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveDish(item.dish.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa món này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: NGUYÊN LIỆU & KIÊNG KHEM */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5ECE7] shadow-xs space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#263B35] mb-2">
              Khẩu vị, dị ứng & yêu cầu nêm nếm
            </h2>
            <p className="text-xs sm:text-sm text-[#738078]">
              Đầu bếp HomeMeal sẽ nêm nếm cá nhân hóa hoàn toàn theo ý gia đình bạn.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lưu ý quan trọng về dị ứng thực phẩm:</p>
              Nếu trong gia đình có người dị ứng nghiêm trọng (hải sản, đậu phộng, trứng...), hãy ghi rõ bên dưới để đầu bếp chuẩn bị dao thớt riêng biệt và kiểm tra nhãn thành phần khi đi chợ.
            </div>
          </div>

          {/* Allergies list */}
          <div>
            <label className="block text-xs font-semibold text-[#263B35] mb-2">Dị ứng thực phẩm cần tránh tuyệt đối:</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(draftOrder.allergies || []).map((allergy, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200"
                >
                  <span>{allergy}</span>
                  <button onClick={() => handleRemoveAllergy(idx)} className="text-rose-600 hover:text-rose-900">
                    ×
                  </button>
                </span>
              ))}
              {(draftOrder.allergies || []).length === 0 && (
                <span className="text-xs text-[#738078] italic">Chưa có ghi chú dị ứng nào</span>
              )}
            </div>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="Nhập chất dị ứng (vd: Đậu phộng, Tôm cua...)"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                className="flex-1 px-3 py-2 bg-[#FFFDF7] border border-[#E5ECE7] rounded-lg text-xs focus:ring-2 focus:ring-[#285E56]"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-2 bg-[#285E56] text-white text-xs font-semibold rounded-lg hover:bg-[#1f4b44]"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <label className="block text-xs font-semibold text-[#263B35] mb-1.5">
              Ghi chú nêm nếm & yêu cầu riêng:
            </label>
            <textarea
              rows={3}
              placeholder="Ví dụ: Bớt bột ngọt, ít đường ngọt theo kiểu miền Trung, rau muống xào mềm cho ông bà dễ nhai, không cho ớt cay vào canh..."
              value={draftOrder.generalPreferences || ''}
              onChange={(e) => updateDraftOrder({ generalPreferences: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#285E56]"
            />
          </div>
        </div>
      )}

      {/* STEP 4: NGÂN SÁCH ĐI CHỢ */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5ECE7] shadow-xs space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#263B35] mb-2">
              Thiết lập trần ngân sách nguyên liệu
            </h2>
            <p className="text-xs sm:text-sm text-[#738078]">
              Bạn đặt mức tiền tối đa cho đầu bếp đi chợ. Đầu bếp chỉ mua trong giới hạn này và bạn <strong>chỉ thanh toán đúng số tiền trên hóa đơn thực tế</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-[#E7F5EF]/60 border border-[#B8E4D3] space-y-2">
              <span className="text-xs text-[#738078]">Chi phí nguyên liệu ước tính:</span>
              <p className="text-2xl font-bold text-[#285E56]">{formatVND(estimatedIngredientTotal)}</p>
              <p className="text-[11px] text-[#738078]">Dựa trên giá trung bình tại chợ và siêu thị hôm nay</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5ECE7] space-y-2">
              <span className="text-xs text-[#738078]">Ước tính trên mỗi khách:</span>
              <p className="text-2xl font-bold text-[#263B35]">
                {formatVND(guestCount > 0 ? estimatedIngredientTotal / guestCount : 0)}
              </p>
              <p className="text-[11px] text-[#738078]">Quy mô {guestCount} người ăn</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5ECE7] space-y-2">
              <span className="text-xs text-[#738078]">Chênh lệch ngân sách:</span>
              <p className={`text-2xl font-bold ${budgetDifference >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {budgetDifference >= 0 ? `+${formatVND(budgetDifference)}` : formatVND(budgetDifference)}
              </p>
              <p className="text-[11px] text-[#738078]">
                {budgetDifference >= 0 ? 'Ngân sách đủ để đầu bếp mua thực phẩm ngon' : 'Ngân sách thấp hơn giá ước tính của các món đã chọn'}
              </p>
            </div>
          </div>

          <div className="max-w-lg space-y-3">
            <label className="block text-xs font-semibold text-[#263B35]">
              Hạn mức ngân sách đi chợ bạn phê duyệt (VNĐ):
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                step="50000"
                min="100000"
                value={budget}
                onChange={(e) => updateDraftOrder({ estimatedGroceryBudget: Number(e.target.value) })}
                className="flex-1 px-3.5 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-base font-bold text-[#285E56] focus:ring-2 focus:ring-[#285E56]"
              />
              <button
                type="button"
                onClick={() => updateDraftOrder({ estimatedGroceryBudget: Math.ceil(estimatedIngredientTotal / 50000) * 50000 })}
                className="px-4 py-2 bg-[#E7F5EF] text-[#285E56] text-xs font-semibold rounded-xl hover:bg-[#B8E4D3]"
              >
                Đặt theo ước tính
              </button>
            </div>
            <p className="text-xs text-[#738078]">
              * Nếu đầu bếp đi chợ hết ít hơn ngân sách này (ví dụ hết 350.000đ), bạn chỉ trả 350.000đ. Không bao giờ thu cố định!
            </p>
          </div>
        </div>
      )}

      {/* STEP 5: TÍNH CÔNG ĐẦU BẾP TẠI GIA */}
      {currentStep === 5 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5ECE7] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#263B35] mb-1">
                Bảng tính tiền công đầu bếp nấu tại gia
              </h2>
              <p className="text-xs sm:text-sm text-[#738078]">
                Đầu bếp đến tận nhà nấu nướng trực tiếp tại gian bếp của bạn, dọn dẹp sạch sẽ sau bữa ăn. Hoàn toàn không tốn phí ship.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#738078]">Tổng tiền công đầu bếp tại gia:</span>
              <p className="text-2xl font-extrabold text-[#285E56]">{formatVND(feeCalc.totalLaborFee)}</p>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-3 bg-[#FFFDF7] p-5 rounded-2xl border border-[#E5ECE7] text-xs sm:text-sm">
            <h3 className="font-bold text-[#263B35] border-b border-[#E5ECE7] pb-2">Chi tiết từng cấu phần tính công:</h3>
            {feeCalc.breakdownSummary.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-[#E5ECE7]/50">
                <span className="text-[#263B35]">{item.split(':')[0]}</span>
                <span className="font-semibold text-[#285E56]">{item.split(':')[1] || ''}</span>
              </div>
            ))}
          </div>

          {feeCalc.requiresQuotation && (
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-900 text-xs">
              <p className="font-semibold mb-1">Quy mô lớn cần xác nhận báo giá:</p>
              Vì số lượng khách lớn ({guestCount} người) hoặc thực đơn nhiều món, sau khi bạn gửi yêu cầu, đầu bếp sẽ xem xét và gửi một bảng báo giá chính xác (bao gồm nhân sự phụ bếp nếu cần) trước khi bạn xác nhận đặt.
            </div>
          )}
        </div>
      )}

      {/* STEP 6: CHỌN ĐẦU BẾP */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E5ECE7] shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-[#263B35] mb-1">
              Chọn đầu bếp chuẩn bị bữa ăn
            </h2>
            <p className="text-xs sm:text-sm text-[#738078]">
              Dựa trên khu vực hoạt động, kinh nghiệm nấu nướng và sở trường ẩm thực của từng đầu bếp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cooks.map((cook) => {
              const isSelected = (draftOrder.cookId || cooks[0].id) === cook.id;

              return (
                <div
                  key={cook.id}
                  onClick={() => updateDraftOrder({ cookId: cook.id })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#285E56] bg-[#E7F5EF]/30 shadow-md ring-2 ring-[#285E56]/20'
                      : 'border-[#E5ECE7] bg-white hover:border-[#B8E4D3]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#B8E4D3] shrink-0">
                        <ImageWithFallback
                          src={cook.avatar}
                          alt={cook.name}
                          fallbackType="cook"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-base text-[#263B35]">{cook.name}</h3>
                          {cook.verified && (
                            <span title="Đã kiểm định VSATTP">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#738078]">{cook.title}</p>
                        <div className="flex items-center gap-1 text-xs text-[#285E56] font-semibold mt-0.5">
                          <Star className="w-3 h-3 fill-[#F2AD72] text-[#F2AD72]" />
                          <span>{cook.rating}</span>
                          <span className="text-[#738078] font-normal">({cook.reviewCount} đánh giá)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#738078] line-clamp-2 mb-3">{cook.bio}</p>

                    <div className="text-xs space-y-1 text-[#738078] pt-2 border-t border-[#E5ECE7]">
                      <p>Khu vực: {cook.serviceAreas.join(', ')}</p>
                      <p>Công suất: Tối đa {cook.maxGuests} khách</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5ECE7] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#285E56]">
                      {isSelected ? 'Đang chọn đầu bếp này' : 'Bấm để chọn'}
                    </span>
                    <span className="text-xs font-bold text-[#263B35]">
                      Khởi điểm {formatVND(cook.baseLaborFee)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 7: XÁC NHẬN ĐƠN HÀNG */}
      {currentStep === 7 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5ECE7] shadow-xs space-y-6">
          <div className="border-b border-[#E5ECE7] pb-4">
            <span className="text-xs font-bold text-[#285E56] uppercase tracking-wider">Tổng kết đơn đặt món</span>
            <h2 className="text-xl font-bold text-[#263B35]">Xem lại thông tin trước khi gửi</h2>
            <p className="text-xs text-[#738078] mt-1">
              Gửi yêu cầu này hoàn toàn <strong>CHƯA BỊ TRỪ TIỀN</strong>. Bạn chỉ thanh toán sau khi bữa ăn hoàn tất và nhận đủ hóa đơn đi chợ thật.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            {/* Left Column: Details */}
            <div className="space-y-4">
              <div className="bg-stone-50 p-4 rounded-xl border border-[#E5ECE7] space-y-2">
                <h3 className="font-bold text-[#263B35]">Thông tin phục vụ:</h3>
                <div className="flex justify-between">
                  <span className="text-[#738078]">Ngày giờ giao:</span>
                  <span className="font-semibold text-[#285E56]">{draftOrder.date} lúc {draftOrder.servingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738078]">Số lượng khách:</span>
                  <span className="font-semibold text-[#263B35]">{guestCount} người</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738078]">Hình thức dịch vụ:</span>
                  <span className="font-semibold text-[#285E56]">
                    Đầu bếp đến nhà đi chợ, nấu ăn và dọn dẹp
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#738078]">Địa chỉ nấu tại nhà:</span>
                  <span className="font-semibold text-[#263B35] text-right line-clamp-1">{draftOrder.customerAddress}</span>
                </div>
                {draftOrder.mealOccasion && (
                  <div className="flex justify-between">
                    <span className="text-[#738078]">Dịp bữa ăn:</span>
                    <span className="font-semibold text-[#263B35]">{draftOrder.mealOccasion}</span>
                  </div>
                )}
              </div>

              {/* Menu items list */}
              <div className="bg-stone-50 p-4 rounded-xl border border-[#E5ECE7] space-y-2">
                <h3 className="font-bold text-[#263B35]">Món ăn đã chọn ({selectedItems.length} món):</h3>
                <ul className="space-y-1.5 divide-y divide-[#E5ECE7]">
                  {selectedItems.map((item, idx) => (
                    <li key={idx} className="pt-1.5 flex justify-between items-center text-xs">
                      <span>{item.dish.name} (x{item.quantity})</span>
                      <span className="font-medium text-[#285E56]">{formatVND(item.dish.estimatedCost * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Financial Separation */}
            <div className="space-y-4">
              <div className="bg-[#E7F5EF] p-5 rounded-2xl border border-[#B8E4D3] space-y-3">
                <h3 className="font-bold text-[#285E56] text-base">Bảng dự toán chi phí minh bạch:</h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#B8E4D3]/40">
                    <span className="text-[#263B35]">1. Ngân sách tiền chợ bạn phê duyệt:</span>
                    <span className="font-bold text-[#285E56]">{formatVND(budget)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#B8E4D3]/40">
                    <span className="text-[#263B35]">2. Tiền công đầu bếp đến tận nhà nấu:</span>
                    <span className="font-bold text-[#285E56]">{formatVND(feeCalc.totalLaborFee)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#B8E4D3]/40">
                    <span className="text-[#263B35]">3. Phí giao hàng & di chuyển:</span>
                    <span className="font-bold text-emerald-700">Miễn phí (Nấu tại nhà bạn)</span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-extrabold text-[#263B35]">
                    <span>Tổng dự kiến tối đa:</span>
                    <span className="text-base text-[#285E56]">{formatVND(budget + feeCalc.totalLaborFee)}</span>
                  </div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl text-[11px] text-[#738078] space-y-1">
                  <p className="font-semibold text-[#285E56]">Chính sách thanh toán:</p>
                  <p>• Bạn chỉ thanh toán tiền chợ theo hóa đơn thực mua tại chợ, không bao giờ thu trọn gói.</p>
                  <p>• Thanh toán chỉ diễn ra SAU KHI đầu bếp đã nấu xong, dọn mâm lên bàn và bạn dùng bữa xong.</p>
                  <p>• Có quyền khiếu nại từng dòng hóa đơn nếu thấy sai khác.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Action Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5ECE7]">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="px-5 py-2.5 bg-white border border-[#E5ECE7] text-[#263B35] font-semibold text-xs sm:text-sm rounded-xl hover:bg-stone-50 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
        ) : <div />}

        {currentStep < STEPS.length ? (
          <button
            type="button"
            onClick={handleNext}
            className={`px-6 py-2.5 font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-all ${
              currentStep === 1 && !timeValidation.isValid
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-[#285E56] hover:bg-[#1f4b44] text-white'
            }`}
          >
            <span>Tiếp tục: {STEPS[currentStep]}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-8 py-3 bg-[#285E56] hover:bg-[#1f4b44] text-white font-bold text-sm sm:text-base rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Check className="w-5 h-5 text-[#B8E4D3]" />
            <span>Gửi yêu cầu đặt bữa (Chưa trừ tiền)</span>
          </button>
        )}
      </div>
    </div>
  );
};
