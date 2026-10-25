import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/pricing';
import { 
  Star, 
  MapPin, 
  Users, 
  ChefHat, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  ArrowLeft,
  Utensils,
  Award
} from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface CookDetailPageProps {
  cookId: string;
}

export const CookDetailPage: React.FC<CookDetailPageProps> = ({ cookId }) => {
  const { cooks, dishes, navigateTo, updateDraftOrder } = useApp();
  const cook = cooks.find((c) => c.id === cookId) || cooks[0];

  const sampleDishes = dishes.filter((d) => cook.sampleDishIds.includes(d.id));

  const handleBook = () => {
    updateDraftOrder({ cookId: cook.id });
    navigateTo('/meal-planner');
  };

  const handlePartyBook = () => {
    updateDraftOrder({ cookId: cook.id });
    navigateTo('/party-booking');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigateTo('/cooks')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách đầu bếp</span>
      </button>

      {/* Main Profile Card */}
      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-brand shrink-0 bg-surface-alt">
            <ImageWithFallback
              src={cook.avatar}
              alt={cook.name}
              fallbackType="cook"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-accent">{cook.name}</h1>
              {cook.verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-alt text-accent text-xs font-bold border border-border-soft">
                  <CheckCircle2 className="w-3.5 h-3.5 text-detail" /> Đã xác thực danh tính & VSATTP
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-accent">{cook.title}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
              <div className="flex items-center gap-1 text-accent font-bold">
                <Star className="w-4 h-4 fill-detail text-detail" />
                <span className="text-sm">{cook.rating}</span>
                <span className="font-normal">({cook.reviewCount} đánh giá khách hàng)</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-detail" />
                <span>{cook.experienceYears} năm kinh nghiệm nấu bếp</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted leading-relaxed pt-2 border-t border-border-soft">
              {cook.bio}
            </p>
          </div>
        </div>

        {/* Highlights Strip */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border-soft">
          <div className="bg-surface-alt p-4 rounded-2xl border border-border-soft space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-accent">
              <MapPin className="w-4 h-4" /> Khu vực phục vụ
            </div>
            <p className="text-xs text-ink font-semibold">{cook.serviceAreas.join(', ')}</p>
          </div>

          <div className="bg-surface-alt p-4 rounded-2xl border border-border-soft space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-accent">
              <Users className="w-4 h-4" /> Khả năng phục vụ
            </div>
            <p className="text-xs text-ink font-semibold">Tối đa {cook.maxGuests} khách (có đội phụ bếp)</p>
          </div>

          <div className="bg-surface-alt p-4 rounded-2xl border border-border-soft space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-accent">
              <ShieldCheck className="w-4 h-4" /> Cam kết minh bạch
            </div>
            <p className="text-xs text-ink font-semibold">Chụp hóa đơn đi chợ thật 100%</p>
          </div>
        </div>
      </div>

      {/* Specialties & Sample Dishes */}
      <div className="bg-surface rounded-3xl border border-border-soft p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-accent">Món tủ & Sở trường nổi bật</h2>
          <p className="text-xs text-muted mt-1">Các món ăn được khách hàng khen ngợi nhiều nhất của đầu bếp {cook.name}.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sampleDishes.map((dish) => (
            <div key={dish.id} className="p-4 rounded-2xl border border-border-soft bg-surface-alt flex gap-3 items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-alt">
                <ImageWithFallback
                  src={dish.imageUrl}
                  alt={dish.name}
                  fallbackType="dish"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-accent truncate">{dish.name}</h4>
                <p className="text-[11px] text-muted line-clamp-1">{dish.suggestedPortion}</p>
                <p className="text-xs font-bold text-accent mt-1">{formatVND(dish.estimatedCost)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating or Bottom Booking Bar */}
      <div className="bg-surface-alt rounded-2xl p-6 border border-brand flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted">Công nấu khởi điểm cho bữa gia đình:</span>
          <p className="text-2xl font-extrabold text-accent">{formatVND(cook.baseLaborFee)}</p>
          <p className="text-[11px] text-muted mt-0.5">Tiền chợ thanh toán riêng theo hóa đơn thực tế</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleBook}
            className="flex-1 sm:flex-none px-6 py-3 bg-brand text-on-brand font-bold text-xs sm:text-sm rounded-xl hover:bg-brand-hover shadow-md transition-all text-center"
          >
            Đặt đầu bếp nấu tại nhà
          </button>
          <button
            onClick={handlePartyBook}
            className="flex-1 sm:flex-none px-6 py-3 bg-surface border border-brand text-accent font-bold text-xs sm:text-sm rounded-xl hover:bg-surface-alt transition-all text-center"
          >
            Yêu cầu báo giá tiệc & cỗ
          </button>
        </div>
      </div>
    </div>
  );
};
