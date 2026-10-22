import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUGGESTED_MENUS } from '../../data/mockData';
import { formatVND } from '../../utils/pricing';
import { 
  ShoppingBag, 
  Receipt, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Star, 
  Users, 
  MapPin, 
  Calendar, 
  ChefHat, 
  Sparkles, 
  CheckCircle2, 
  Search,
  Check
} from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { 
  validateServiceDateTime,
  getEarliestServiceDate,
  formatDateForInput, 
  formatTimeForInput, 
  getNow 
} from '../../utils/dateTimeValidation';

export const HomePage: React.FC = () => {
  const { navigateTo, cooks, dishes, updateDraftOrder } = useApp();

  // Quick planner form state with 4-hour advance constraint
  const earliestService = getEarliestServiceDate();
  const [quickGuests, setQuickGuests] = useState(4);
  const [quickDate, setQuickDate] = useState(() => formatDateForInput(earliestService));
  const [quickTime, setQuickTime] = useState(() => formatTimeForInput(earliestService));
  const [quickMealType, setQuickMealType] = useState('Bữa cơm gia đình');
  const [quickBudget, setQuickBudget] = useState(400000);

  const quickValidation = validateServiceDateTime(quickDate, quickTime);

  const handleQuickPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickValidation.isValid) {
      alert(`Quy định đặt món: ${quickValidation.message}`);
      return;
    }
    updateDraftOrder({
      guestCount: quickGuests,
      date: quickDate,
      servingTime: quickTime,
      mealOccasion: quickMealType,
      estimatedGroceryBudget: quickBudget,
      serviceType: 'cook_at_home',
    });
    navigateTo('/meal-planner');
  };

  const handleSelectSuggestedMenu = (menu: typeof SUGGESTED_MENUS[0]) => {
    const matchedDishes = dishes.filter((d) => menu.dishIds.includes(d.id));
    const earliest = getEarliestServiceDate();
    updateDraftOrder({
      guestCount: menu.id.includes('4') ? 4 : menu.id.includes('6') ? 6 : menu.id.includes('15') ? 12 : 25,
      items: matchedDishes.map((dish) => ({ dish, quantity: 1 })),
      mealOccasion: menu.title,
      serviceType: 'cook_at_home',
      date: formatDateForInput(earliest),
      servingTime: formatTimeForInput(earliest),
    });
    navigateTo('/meal-planner');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-page-background pt-10 sm:pt-16 pb-12 sm:pb-20 border-b border-[#E5ECE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E7F5EF] border border-[#B8E4D3] text-[#285E56] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#F2AD72]" />
                <span>Dịch vụ đầu bếp đến tận nhà nấu ăn & Đi chợ minh bạch</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#263B35] tracking-tight leading-[1.2] text-balance">
                Bữa cơm chân tình <br />
                <span className="text-[#285E56] underline decoration-[#B8E4D3] decoration-wavy decoration-2">
                  cho người bận rộn
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#738078] leading-relaxed max-w-xl">
                Bạn tự điền món yêu thích, đặt ngân sách đi chợ tùy ý. Đầu bếp HomeMeal đến tận gian bếp nhà bạn nấu nướng nóng hổi, đi chợ mua nguyên liệu tươi sống trong ngày, dọn mâm lên bàn và dọn dẹp sạch sẽ sau khi dùng bữa. Gửi ảnh biên lai hóa đơn thật tại chợ và <strong>chỉ thanh toán sau khi bạn đã dùng bữa trọn vẹn</strong>.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigateTo('/meal-planner')}
                  className="px-6 py-3.5 bg-[#285E56] text-white font-semibold text-sm sm:text-base rounded-xl hover:bg-[#1f4b44] transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5 text-[#B8E4D3]" />
                  <span>Đặt đầu bếp tới nhà ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-action border border-action text-white font-semibold text-sm sm:text-base rounded-xl hover:bg-action-hover transition-all"
                >
                  Khám phá cách hoạt động
                </button>
              </div>

              {/* Key Trust Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E5ECE7] max-w-lg">
                <div className="text-left">
                  <p className="text-lg font-bold text-[#285E56]">100%</p>
                  <p className="text-xs text-[#738078]">Hóa đơn thực tế</p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-[#285E56]">0 đ</p>
                  <p className="text-xs text-[#738078]">Phí ẩn</p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-[#285E56]">Sau bữa</p>
                  <p className="text-xs text-[#738078]">Mới cần thanh toán</p>
                </div>
              </div>
            </div>

            {/* Right Column: Transparent Workflow & Trust Card (Không dùng hình minh họa món lẻ) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#B8E4D3] bg-gradient-to-br from-white via-[#FFFDF7] to-[#E7F5EF] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE7]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#285E56] text-white flex items-center justify-center font-bold text-sm">
                      ✓
                    </div>
                    <div>
                      <h3 className="font-bold text-[#263B35] text-sm sm:text-base">Quy trình nấu cơm minh bạch</h3>
                      <p className="text-[11px] text-[#738078]">Tự do yêu cầu theo khẩu vị riêng</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#285E56] bg-[#E7F5EF] px-2.5 py-1 rounded-full border border-[#B8E4D3]">
                    100% Tiền chợ thật
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#E5ECE7] flex items-start gap-3 shadow-xs">
                    <span className="w-6 h-6 rounded-full bg-[#E7F5EF] text-[#285E56] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                    <div>
                      <h4 className="font-bold text-[#263B35]">Tự điền bất kỳ món ăn bạn muốn</h4>
                      <p className="text-[#738078] mt-0.5 leading-relaxed">Không ép mua theo combo. Bạn chỉ cần ghi tên món và khẩu vị yêu thích (ít cay, nấu mềm, đậm đà...).</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#E5ECE7] flex items-start gap-3 shadow-xs">
                    <span className="w-6 h-6 rounded-full bg-[#E7F5EF] text-[#285E56] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                    <div>
                      <h4 className="font-bold text-[#263B35]">Đầu bếp đi chợ & chụp hóa đơn thật</h4>
                      <p className="text-[#738078] mt-0.5 leading-relaxed">Mua thực phẩm tươi mới trong ngày theo ngân sách của bạn, có biên lai đối soát từng đồng.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#E5ECE7] flex items-start gap-3 shadow-xs">
                    <span className="w-6 h-6 rounded-full bg-[#E7F5EF] text-[#285E56] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                    <div>
                      <h4 className="font-bold text-[#263B35]">Đầu bếp đến tận nhà & nấu nướng trực tiếp</h4>
                      <p className="text-[#738078] mt-0.5 leading-relaxed">Nấu nóng sốt ngay trên bếp nhà bạn, dọn mâm cơm lên bàn ăn và dọn dẹp sạch sẽ sau bữa.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#E5ECE7] flex items-start gap-3 shadow-xs">
                    <span className="w-6 h-6 rounded-full bg-[#E7F5EF] text-[#285E56] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                    <div>
                      <h4 className="font-bold text-[#263B35]">Dùng bữa trọn vẹn mới thanh toán</h4>
                      <p className="text-[#738078] mt-0.5 leading-relaxed">Hài lòng với bữa ăn mới tiến hành thanh toán tiền chợ và tiền công tách bạch.</p>
                    </div>
                  </div>
                </div>

                {/* Trust guarantee badge */}
                <div className="bg-[#285E56] text-white p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#B8E4D3]" />
                    <span className="font-medium">Chỉ cần đặt trước tối thiểu 4 tiếng</span>
                  </div>
                  <span className="font-bold text-[#B8E4D3]">An tâm 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Quick Meal Planner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg border border-[#E5ECE7] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E5ECE7]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#263B35]">Lên kế hoạch bữa ăn tức thì</h2>
              <p className="text-xs sm:text-sm text-[#738078]">
                Tùy chỉnh số lượng người ăn, mức ngân sách nguyên liệu và thời gian đầu bếp đến phục vụ tại nhà.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#285E56] bg-[#E7F5EF] px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>Tiền công & tiền chợ luôn tách bạch</span>
            </div>
          </div>

          {/* 4-hour validation feedback if invalid */}
          {!quickValidation.isValid && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold">⚠️ Lưu ý đặt trước:</span>
                <span>{quickValidation.message}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuickDate(quickValidation.earliestDateStr);
                  setQuickTime(quickValidation.earliestTimeStr);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shrink-0 self-start sm:self-auto"
              >
                Chỉnh về giờ sớm nhất ({quickValidation.earliestTimeStr})
              </button>
            </div>
          )}

          <form onSubmit={handleQuickPlan} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#263B35] mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#285E56]" /> Số người ăn:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quickGuests}
                  onChange={(e) => setQuickGuests(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="Nhập số..."
                  className="w-full px-3 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-xs sm:text-sm font-bold text-[#263B35] focus:ring-2 focus:ring-[#285E56]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#738078] pointer-events-none">
                  người
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263B35] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#285E56]" /> Ngày đầu bếp tới:
              </label>
              <input
                type="date"
                min={formatDateForInput(getNow())}
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                className={`w-full px-3 py-2.5 bg-[#FFFDF7] border rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#285E56] ${
                  !quickValidation.isValid ? 'border-rose-400 bg-rose-50/30' : 'border-[#E5ECE7]'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263B35] mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#285E56]" /> Giờ dọn cơm ăn:
              </label>
              <input
                type="time"
                value={quickTime}
                onChange={(e) => setQuickTime(e.target.value)}
                className={`w-full px-3 py-2.5 bg-[#FFFDF7] border rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#285E56] ${
                  !quickValidation.isValid ? 'border-rose-400 bg-rose-50/30 text-rose-900' : 'border-[#E5ECE7]'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263B35] mb-1.5">Dịp bữa ăn:</label>
              <select
                value={quickMealType}
                onChange={(e) => setQuickMealType(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#285E56]"
              >
                <option value="Bữa cơm gia đình">Cơm gia đình hàng ngày</option>
                <option value="Mâm cơm cuối tuần">Mâm cơm cuối tuần</option>
                <option value="Tiệc sinh nhật">Tiệc sinh nhật tại nhà</option>
                <option value="Đám giỗ / Cúng gia tiên">Đám giỗ / Mâm cúng</option>
                <option value="Tiệc họp mặt bạn bè">Họp mặt bạn bè</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#263B35] mb-1.5">Ngân sách đi chợ:</label>
              <select
                value={quickBudget}
                onChange={(e) => setQuickBudget(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-[#FFFDF7] border border-[#E5ECE7] rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#285E56]"
              >
                <option value={300000}>300.000 đ (~75k/người)</option>
                <option value={400000}>400.000 đ (~100k/người)</option>
                <option value={600000}>600.000 đ (~150k/người)</option>
                <option value={1000000}>1.000.000 đ (Hải sản/Tiệc)</option>
                <option value={3000000}>3.000.000 đ (Đại tiệc)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className={`w-full py-2.5 px-4 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 h-[42px] ${
                  !quickValidation.isValid
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-[#285E56] hover:bg-[#1f4b44] text-white'
                }`}
              >
                <span>{!quickValidation.isValid ? 'Cần cách 4 tiếng' : 'Lên kế hoạch bữa ăn'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. Suggested Menus */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#263B35]">Thực đơn gợi ý hoàn chỉnh</h2>
            <p className="text-xs sm:text-sm text-[#738078]">Dành cho người bận rộn chưa biết chọn món gì. Giá nguyên liệu và tiền công được ghi rõ ràng dưới dạng minh họa.</p>
          </div>
          <span className="text-xs text-[#738078] italic">* Toàn bộ giá hiển thị là ước tính mẫu</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUGGESTED_MENUS.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-2xl border border-[#E5ECE7] p-5 flex flex-col justify-between hover:shadow-lg transition-all hover:border-[#B8E4D3]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#285E56] bg-[#E7F5EF] px-2.5 py-0.5 rounded-full">
                    {menu.guestCount}
                  </span>
                  <span className="text-[#738078]">{menu.dishCount} món</span>
                </div>

                <h3 className="font-bold text-base text-[#263B35] line-clamp-2">{menu.title}</h3>

                <p className="text-xs text-[#738078] line-clamp-2">{menu.description}</p>

                <div className="pt-2 border-t border-[#E5ECE7] space-y-1.5">
                  <p className="text-xs font-semibold text-[#263B35]">Món ăn trong mâm:</p>
                  <ul className="text-xs text-[#738078] space-y-1">
                    {menu.dishes.map((d, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#285E56] shrink-0" />
                        <span className="line-clamp-1">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E5ECE7] space-y-2">
                <div className="text-[11px] space-y-1 text-[#738078]">
                  <div className="flex justify-between">
                    <span>Tiền chợ ước tính:</span>
                    <span className="font-medium text-[#263B35]">{menu.estimatedGrocery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Công nấu ước tính:</span>
                    <span className="font-medium text-[#285E56]">{menu.estimatedLabor}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectSuggestedMenu(menu)}
                  className="w-full mt-2 py-2 bg-[#E7F5EF] hover:bg-[#285E56] text-[#285E56] hover:text-white text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-1"
                >
                  <span>Chọn mâm cơm này</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured Cooks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#263B35]">Đầu bếp tiêu biểu</h2>
            <p className="text-xs sm:text-sm text-[#738078]">Được thẩm định tay nghề, vệ sinh an toàn thực phẩm và cam kết minh bạch chứng từ mua sắm</p>
          </div>
          <button
            onClick={() => navigateTo('/cooks')}
            className="text-xs sm:text-sm font-semibold text-[#285E56] hover:underline flex items-center gap-1"
          >
            Xem tất cả đầu bếp <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cooks.map((cook) => (
            <div
              key={cook.id}
              className="bg-white rounded-2xl border border-[#E5ECE7] p-5 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#B8E4D3] shrink-0">
                    <ImageWithFallback
                      src={cook.avatar}
                      alt={cook.name}
                      fallbackType="cook"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-[#263B35] text-sm sm:text-base">{cook.name}</h3>
                      {cook.verified && (
                        <span title="Đã xác thực danh tính & chứng nhận VSATTP">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#738078] line-clamp-1">{cook.title}</p>
                    <div className="flex items-center gap-1 text-xs text-[#285E56] font-semibold mt-0.5">
                      <Star className="w-3 h-3 fill-[#F2AD72] text-[#F2AD72]" />
                      <span>{cook.rating}</span>
                      <span className="text-[#738078] font-normal">({cook.reviewCount} đánh giá)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#738078] line-clamp-2 mb-3">{cook.bio}</p>

                <div className="space-y-1.5 text-xs text-[#738078] py-2 border-t border-[#E5ECE7]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#285E56] shrink-0" />
                    <span className="line-clamp-1">Khu vực: {cook.serviceAreas.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#285E56] shrink-0" />
                    <span>Quy mô: Phục vụ tới {cook.maxGuests} khách</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ChefHat className="w-3.5 h-3.5 text-[#285E56] shrink-0" />
                    <span className="line-clamp-1">Sở trường: {cook.specialties.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5ECE7] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#738078]">Công nấu khởi điểm:</p>
                  <p className="text-xs font-bold text-[#285E56]">{formatVND(cook.baseLaborFee)}</p>
                </div>
                <button
                  onClick={() => navigateTo(`/cooks/${cook.id}`)}
                  className="px-3 py-1.5 bg-[#285E56] hover:bg-[#1f4b44] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Xem hồ sơ
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Trust & Transparency Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#E7F5EF] rounded-3xl p-8 sm:p-12 border border-[#B8E4D3]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#285E56]">Uy tín & Minh bạch</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#263B35] mt-1">
              5 Nguyên tắc cốt lõi bảo vệ khách hàng
            </h2>
            <p className="text-xs sm:text-sm text-[#738078] mt-2">
              Đầu bếp nấu trực tiếp tại nhà, chi phí nguyên liệu và tiền công được trình bày rõ ràng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center sm:text-left">
            <div className="bg-white rounded-2xl p-5 border border-[#B8E4D3]/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#285E56] text-white flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h3 className="font-bold text-[#263B35] text-sm mb-1.5">Khách tự đặt ngân sách</h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Bạn đặt trần ngân sách nguyên liệu. Đầu bếp mua trong giới hạn này, không được tự ý vượt mức.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#B8E4D3]/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#285E56] text-white flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h3 className="font-bold text-[#263B35] text-sm mb-1.5">Ảnh hóa đơn mua sắm thật</h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Đầu bếp chụp ảnh hóa đơn, phiếu cân, ảnh sạp chợ tươi sống để bạn kiểm tra từng ký thịt mớ rau.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#B8E4D3]/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#285E56] text-white flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h3 className="font-bold text-[#263B35] text-sm mb-1.5">Tách bạch công nấu</h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Tiền công tính theo số người và độ khó món ăn. Đầu bếp không hưởng chênh lệch giá nguyên liệu.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#B8E4D3]/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#285E56] text-white flex items-center justify-center font-bold text-sm mb-3">
                4
              </div>
              <h3 className="font-bold text-[#263B35] text-sm mb-1.5">Giá tăng phải xin phép</h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Gặp ngày giáp tết hay rằm biển động giá tăng? Đầu bếp gửi ảnh xin duyệt, bạn đồng ý mới được mua.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#B8E4D3]/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#285E56] text-white flex items-center justify-center font-bold text-sm mb-3">
                5
              </div>
              <h3 className="font-bold text-[#263B35] text-sm mb-1.5">Thanh toán sau bữa ăn</h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Món ăn dọn lên bàn đầy đủ, bạn kiểm tra đúng yêu cầu và hóa đơn minh bạch mới cần thanh toán.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#285E56]">Quy trình chuẩn</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#263B35] mt-1">
            Cách HomeMeal đồng hành cùng bữa cơm nhà
          </h2>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E5ECE7] relative">
              <span className="text-xs font-bold text-[#F2AD72] block mb-2">BƯỚC 1</span>
              <h3 className="font-bold text-base text-[#263B35] mb-2">Chọn món & Đặt ngân sách</h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Chọn món yêu thích từ thực đơn hoặc mâm gợi ý, ghi chú kiêng dị ứng và đặt định mức tiền chợ.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E5ECE7] relative">
              <span className="text-xs font-bold text-[#F2AD72] block mb-2">BƯỚC 2</span>
              <h3 className="font-bold text-base text-[#263B35] mb-2">Đầu bếp đi chợ & Gửi ảnh</h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Đầu bếp chọn nguyên liệu tươi sạch sớm tại chợ hoặc siêu thị, chụp ảnh hóa đơn gửi lên app.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E5ECE7] relative">
              <span className="text-xs font-bold text-[#F2AD72] block mb-2">BƯỚC 3</span>
              <h3 className="font-bold text-base text-[#263B35] mb-2">Đến nhà nấu & Dọn dẹp sạch</h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Đầu bếp mang nguyên liệu tươi đến tận nhà bạn, nấu nướng nóng hổi tại gian bếp, dọn mâm lên bàn và lau dọn sạch sẽ sau bữa ăn.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E5ECE7] relative">
              <span className="text-xs font-bold text-[#F2AD72] block mb-2">BƯỚC 4</span>
              <h3 className="font-bold text-base text-[#263B35] mb-2">Kiểm tra & Thanh toán</h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Xem lại bảng chi tiết từng món nguyên liệu thực chi + tiền công. Hài lòng mới xác nhận trả tiền.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 text-center bg-gradient-to-r from-[#285E56] to-[#1f4b44] rounded-2xl p-8 text-white">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Sẵn sàng trải nghiệm bữa cơm ấm cúng?</h3>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto mb-6">
            Không còn nỗi lo tan sở tất bật đi chợ hay ăn cơm hộp ngấy mỡ. Đầu bếp tâm huyết đã sẵn sàng phục vụ gia đình bạn.
          </p>
          <button
            onClick={() => navigateTo('/meal-planner')}
            className="px-6 py-3 bg-[#B8E4D3] text-[#285E56] font-bold text-sm sm:text-base rounded-xl hover:bg-white transition-all shadow-md"
          >
            Lên kế hoạch bữa ăn ngay hôm nay
          </button>
        </div>
      </section>
    </div>
  );
};
