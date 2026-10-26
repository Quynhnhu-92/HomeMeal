import React, { useState } from 'react';
import { ArrowRight, CookingPot } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Fixed Unsplash photo, never a random-image endpoint.
const HERO_PHOTO = 'https://images.unsplash.com/photo-1556911220-bff31c812dba';

export const HomeHero: React.FC = () => {
  const { navigateTo } = useApp();
  const [imageFailed, setImageFailed] = useState(false);

  const exploreProcess = () => {
    const section = document.getElementById('how-it-works');
    if (!section) return;
    const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 65;
    window.scrollTo({
      top: window.scrollY + section.getBoundingClientRect().top - headerHeight - 20,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__visual">
        {imageFailed ? (
          <div className="home-hero__fallback" role="img" aria-label="Ảnh nấu ăn tại nhà hiện chưa tải được">
            <CookingPot aria-hidden="true" size={56} strokeWidth={1.25} />
            <span>Bữa cơm nhà, ấm áp mỗi ngày</span>
          </div>
        ) : (
          <img
            src={`${HERO_PHOTO}?auto=format&fit=crop&w=1200&q=85`}
            srcSet={[640, 960, 1200, 1600].map(width =>
              `${HERO_PHOTO}?auto=format&fit=crop&w=${width}&q=85 ${width}w`
            ).join(', ')}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Chuẩn bị nguyên liệu và nấu bữa ăn trong căn bếp gia đình"
            width={1200}
            height={1200}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="home-hero__panel">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">ĐẦU BẾP TẠI NHÀ · ĐI CHỢ MINH BẠCH</p>
          <h1 id="home-hero-title">Bữa cơm chân tình<br />cho người bận rộn</h1>
          <p className="home-hero__description">
            Bạn chọn món yêu thích, đặt ngân sách đi chợ tùy ý. HomeMeal mang nguyên liệu tươi
            đến căn bếp nhà bạn, nấu bữa cơm nóng hổi và dọn dẹp sạch sẽ sau bữa ăn.
          </p>

          <div className="home-hero__actions">
            <button
              onClick={() => navigateTo('/meal-planner')}
              className="home-hero__primary"
            >
              Đặt đầu bếp ngay <ArrowRight aria-hidden="true" size={18} />
            </button>
            <button
              onClick={exploreProcess}
              className="home-hero__secondary"
            >
              Khám phá cách hoạt động
            </button>
          </div>

          <ul className="home-hero__trust" aria-label="Cam kết dịch vụ">
            <li>Hóa đơn đi chợ thực tế</li>
            <li>Không phí ẩn</li>
            <li>Thanh toán sau bữa ăn</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
