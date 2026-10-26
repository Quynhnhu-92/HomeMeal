import React from 'react';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
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
      <div className="home-hero__visual">
        {/* Keep this reserved area until a suitable cooking photograph is verified. */}
        <div className="home-hero__fallback" role="img" aria-label="Vị trí dành cho ảnh gia đình cùng nấu ăn tại nhà">
          <ImageIcon aria-hidden="true" size={48} strokeWidth={1.25} />
          <span>Ảnh gia đình cùng nấu ăn</span>
        </div>
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
