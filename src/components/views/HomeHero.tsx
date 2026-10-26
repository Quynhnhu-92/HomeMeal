import React from 'react';
import { ArrowRight } from 'lucide-react';
import { HomeCampaignMedia } from '../common/HomeCampaignMedia';
import { useApp } from '../../context/AppContext';

export const HomeHero: React.FC = () => {
  const { navigateTo } = useApp();

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
      <HomeCampaignMedia label="Ảnh gia đình quây quần bên bữa cơm — chờ bổ sung" priority />
      <div className="home-hero__frame">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">BỮA CƠM NHÀ, TRỌN VẸN MỖI NGÀY</p>
          <h1 id="home-hero-title">Bữa cơm chân tình<br />cho người bận rộn.</h1>
          <p className="home-hero__description">
            Từ đi chợ minh bạch đến bữa cơm nóng hổi tại nhà, HomeMeal giúp bạn chăm sóc
            gia đình mà không phải loay hoay với chuyện bếp núc.
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
            <li>Đi chợ minh bạch</li>
            <li>Không phí ẩn</li>
            <li>Thanh toán sau bữa ăn</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
