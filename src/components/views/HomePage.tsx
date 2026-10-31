import { HomeProcessTimeline } from './HomeProcessTimeline';
import { HomeHero } from './HomeHero';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUGGESTED_MENUS } from '../../data/mockData';
import { formatVND } from '../../utils/pricing';
import { 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Star, 
  Users, 
  MapPin, 
  Calendar, 
  ChefHat, 
  CheckCircle2, 
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
    navigateTo(quickGuests >= 10 ? '/party-booking' : '/meal-planner');
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
      <HomeHero />

      {/* 2. Interactive Quick Meal Planner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="meal-planner-frame brand-glass-frame bg-surface rounded-2xl shadow-lg border border-border-soft p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border-soft">
            <div>
              <h2 className="section-heading text-xl sm:text-2xl font-bold text-accent">Lên kế hoạch bữa ăn tức thì</h2>
              <p className="text-xs sm:text-sm text-muted">
                Tùy chỉnh số lượng người ăn, mức ngân sách nguyên liệu và thời gian đầu bếp đến phục vụ tại nhà.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-accent bg-surface-alt px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>Tiền công & tiền chợ luôn tách bạch</span>
            </div>
          </div>

          {/* 4-hour validation feedback if invalid */}
          {!quickValidation.isValid && (
            <div className="mb-4 p-3 rounded-xl bg-surface-alt border border-accent text-accent text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                className="px-2.5 py-1 bg-brand hover:bg-brand-hover text-on-brand font-medium rounded-lg shrink-0 self-start sm:self-auto"
              >
                Chỉnh về giờ sớm nhất ({quickValidation.earliestTimeStr})
              </button>
            </div>
          )}

          <form onSubmit={handleQuickPlan} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-detail" /> Số người ăn:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={3}
                  max={100}
                  value={quickGuests}
                  onChange={(e) => { const count = Math.max(3, parseInt(e.target.value) || 3); setQuickGuests(count); if (count >= 10) { updateDraftOrder({ guestCount: count, date: quickDate, servingTime: quickTime, estimatedGroceryBudget: quickBudget, mealOccasion: quickMealType }); navigateTo('/party-booking'); } }}
                  placeholder="Nhập số..."
                  className="w-full px-3 py-2.5 bg-surface-alt border border-border-soft rounded-xl text-xs sm:text-sm font-bold text-ink focus:ring-2 focus:ring-accent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">
                  người
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-detail" /> Ngày đầu bếp tới:
              </label>
              <input
                type="date"
                min={formatDateForInput(getNow())}
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                className={`w-full px-3 py-2.5 bg-surface-alt border rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-accent ${
                  !quickValidation.isValid ? 'border-accent bg-surface-alt/30' : 'border-border-soft'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-detail" /> Giờ dọn cơm ăn:
              </label>
              <input
                type="time"
                value={quickTime}
                onChange={(e) => setQuickTime(e.target.value)}
                className={`w-full px-3 py-2.5 bg-surface-alt border rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-accent ${
                  !quickValidation.isValid ? 'border-accent bg-surface-alt/30 text-accent' : 'border-border-soft'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Dịp bữa ăn:</label>
              <select
                value={quickMealType}
                onChange={(e) => setQuickMealType(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-alt border border-border-soft rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-accent"
              >
                <option value="Bữa cơm gia đình">Cơm gia đình hàng ngày</option>
                <option value="Mâm cơm cuối tuần">Mâm cơm cuối tuần</option>
                <option value="Tiệc sinh nhật">Tiệc sinh nhật tại nhà</option>
                <option value="Đám giỗ / Cúng gia tiên">Đám giỗ / Mâm cúng</option>
                <option value="Tiệc họp mặt bạn bè">Họp mặt bạn bè</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Ngân sách đi chợ:</label>
              <select
                value={quickBudget}
                onChange={(e) => setQuickBudget(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-surface-alt border border-border-soft rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-accent"
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
                className={`cta-primary w-full py-2.5 px-4 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 min-h-11 ${
                  !quickValidation.isValid
                    ? 'bg-surface-alt hover:bg-brand text-accent'
                    : 'bg-brand hover:bg-brand-hover text-on-brand'
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
            <h2 className="section-heading text-xl sm:text-2xl font-bold text-accent">Thực đơn gợi ý hoàn chỉnh</h2>
            <p className="text-xs sm:text-sm text-muted">Dành cho người bận rộn chưa biết chọn món gì. Giá nguyên liệu và tiền công được ghi rõ ràng dưới dạng minh họa.</p>
          </div>
          <span className="text-sm text-muted italic">* Toàn bộ giá hiển thị là ước tính mẫu</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {SUGGESTED_MENUS.map((menu) => (
            <div
              key={menu.id}
              className="interaction-card spacious-card bg-surface rounded-2xl border border-border-soft p-5 flex flex-col justify-between hover:shadow-lg transition-all hover:border-brand"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-accent bg-warm px-2.5 py-0.5 rounded-full">
                    {menu.guestCount}
                  </span>
                  <span className="text-muted">{menu.dishCount} món</span>
                </div>

                <h3 className="font-bold text-base text-accent">{menu.title}</h3>

                <p className="text-sm text-muted">{menu.description}</p>

                <div className="pt-2 border-t border-border-soft space-y-1.5">
                  <p className="text-xs font-semibold text-ink">Món ăn trong mâm:</p>
                  <ul className="text-sm text-muted space-y-1">
                    {menu.dishes.map((d, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-detail shrink-0" />
                        <span className="line-clamp-1">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border-soft space-y-2">
                <div className="text-sm space-y-3 text-muted">
                  <div className="flex flex-col gap-0.5">
                    <span>Tiền chợ ước tính:</span>
                    <span className="font-medium text-ink">{menu.estimatedGrocery}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span>Công nấu ước tính:</span>
                    <span className="font-medium text-accent">{menu.estimatedLabor}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectSuggestedMenu(menu)}
                  className="cta-primary w-full mt-2 py-2 bg-surface-alt hover:bg-brand text-on-brand hover:text-on-brand text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-1"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="section-heading text-xl sm:text-2xl font-bold text-accent">Đầu bếp tiêu biểu</h2>
            <p className="text-xs sm:text-sm text-muted">Được thẩm định tay nghề, vệ sinh an toàn thực phẩm và cam kết minh bạch chứng từ mua sắm</p>
          </div>
          <button
            onClick={() => navigateTo('/cooks')}
            className="text-xs sm:text-sm font-semibold text-accent hover:underline flex items-center gap-1"
          >
            Xem tất cả đầu bếp <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cooks.map((cook) => (
            <div
              key={cook.id}
              className="interaction-card spacious-card bg-surface rounded-2xl border border-border-soft p-5 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand shrink-0">
                    <ImageWithFallback
                      src={cook.avatar}
                      alt={cook.name}
                      fallbackType="cook"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1">
                      <h3 className="font-bold text-accent text-sm sm:text-base">{cook.name}</h3>
                      {cook.verified && (
                        <span title="Đã xác thực danh tính & chứng nhận VSATTP">
                          <CheckCircle2 className="w-3.5 h-3.5 text-detail" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted">{cook.title}</p>
                    <div className="flex items-center gap-1 text-xs text-accent font-semibold mt-0.5">
                      <Star className="w-3 h-3 fill-warm text-warm-shade" />
                      <span>{cook.rating}</span>
                      <span className="text-muted font-normal">({cook.reviewCount} đánh giá)</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted mb-3">{cook.bio}</p>

                <div className="space-y-1.5 text-sm text-muted py-2 border-t border-border-soft">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-detail shrink-0" />
                    <span className="line-clamp-1">Khu vực: {cook.serviceAreas.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-detail shrink-0" />
                    <span>Quy mô: Phục vụ tới {cook.maxGuests} khách</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ChefHat className="w-3.5 h-3.5 text-detail shrink-0" />
                    <span className="line-clamp-1">Sở trường: {cook.specialties.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border-soft flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <p className="text-xs text-muted">Công nấu khởi điểm:</p>
                  <p className="text-base font-semibold text-accent">{formatVND(cook.baseLaborFee)}</p>
                </div>
                <button
                  onClick={() => navigateTo(`/cooks/${cook.id}`)}
                  className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-on-brand text-xs font-semibold rounded-lg transition-colors"
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
        <div className="principles-frame brand-glass-frame bg-surface-alt rounded-3xl p-8 sm:p-12 border border-brand">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">Uy tín & Minh bạch</span>
            <h2 className="section-heading text-2xl sm:text-3xl font-extrabold text-accent mt-1">
              5 Nguyên tắc cốt lõi bảo vệ khách hàng
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-2">
              Đầu bếp nấu trực tiếp tại nhà, chi phí nguyên liệu và tiền công được trình bày rõ ràng
            </p>
          </div>

          <div className="principles-grid">
            <div className="principle-card bg-surface rounded-2xl p-5 border border-brand/60 shadow-xs">
              <div aria-hidden="true" className="w-10 h-10 rounded-xl bg-brand text-ink flex items-center justify-center font-bold text-sm mb-3">
                01
              </div>
              <h3 className="font-bold text-accent text-sm mb-1.5">Khách tự đặt ngân sách</h3>
              <p className="text-xs text-muted leading-relaxed">
                Bạn đặt trần ngân sách nguyên liệu. Đầu bếp mua trong giới hạn này, không được tự ý vượt mức.
              </p>
            </div>

            <div className="principle-card bg-surface rounded-2xl p-5 border border-brand/60 shadow-xs">
              <div aria-hidden="true" className="w-10 h-10 rounded-xl bg-brand text-ink flex items-center justify-center font-bold text-sm mb-3">
                02
              </div>
              <h3 className="font-bold text-accent text-sm mb-1.5">Ảnh hóa đơn mua sắm thật</h3>
              <p className="text-xs text-muted leading-relaxed">
                Đầu bếp chụp ảnh hóa đơn, phiếu cân, ảnh sạp chợ tươi sống để bạn kiểm tra từng ký thịt mớ rau.
              </p>
            </div>

            <div className="principle-card bg-surface rounded-2xl p-5 border border-brand/60 shadow-xs">
              <div aria-hidden="true" className="w-10 h-10 rounded-xl bg-brand text-ink flex items-center justify-center font-bold text-sm mb-3">
                03
              </div>
              <h3 className="font-bold text-accent text-sm mb-1.5">Tách bạch công nấu</h3>
              <p className="text-xs text-muted leading-relaxed">
                Tiền công tính theo số người và độ khó món ăn. Đầu bếp không hưởng chênh lệch giá nguyên liệu.
              </p>
            </div>

            <div className="principle-card bg-surface rounded-2xl p-5 border border-brand/60 shadow-xs">
              <div aria-hidden="true" className="w-10 h-10 rounded-xl bg-brand text-ink flex items-center justify-center font-bold text-sm mb-3">
                04
              </div>
              <h3 className="font-bold text-accent text-sm mb-1.5">Giá tăng phải xin phép</h3>
              <p className="text-xs text-muted leading-relaxed">
                Gặp ngày giáp tết hay rằm biển động giá tăng? Đầu bếp gửi ảnh xin duyệt, bạn đồng ý mới được mua.
              </p>
            </div>

            <div className="principle-card bg-surface rounded-2xl p-5 border border-brand/60 shadow-xs">
              <div aria-hidden="true" className="w-10 h-10 rounded-xl bg-brand text-ink flex items-center justify-center font-bold text-sm mb-3">
                05
              </div>
              <h3 className="font-bold text-accent text-sm mb-1.5">Thanh toán sau bữa ăn</h3>
              <p className="text-xs text-muted leading-relaxed">
                Món ăn dọn lên bàn đầy đủ, bạn kiểm tra đúng yêu cầu và hóa đơn minh bạch mới cần thanh toán.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Quy trình chuẩn</span>
          <h2 className="section-heading text-2xl sm:text-3xl font-extrabold text-accent mt-1">
            Cách HomeMeal đồng hành cùng bữa cơm nhà
          </h2>
        </div>

        <HomeProcessTimeline />

        {/* Bottom CTA Banner */}
        <div className="home-final-cta mt-12 text-center rounded-2xl text-ink">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Sẵn sàng trải nghiệm bữa cơm ấm cúng?</h3>
          <p className="text-xs sm:text-sm text-ink max-w-xl mx-auto mb-6">
            Không còn nỗi lo tan sở tất bật đi chợ hay ăn cơm hộp ngấy mỡ. Đầu bếp tâm huyết đã sẵn sàng phục vụ gia đình bạn.
          </p>
          <button
            onClick={() => navigateTo('/meal-planner')}
            className="cta-primary home-final-cta__button px-6 py-3 rounded-xl"
          >
            Lên kế hoạch bữa ăn ngay hôm nay
          </button>
        </div>
      </section>
    </div>
  );
};
