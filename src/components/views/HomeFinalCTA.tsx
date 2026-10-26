import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HomeCampaignMedia } from '../common/HomeCampaignMedia';

export const HomeFinalCTA: React.FC = () => {
  const { navigateTo } = useApp();
  const bannerRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={bannerRef} className="home-final-cta" aria-labelledby="home-final-cta-title"
      data-revealed={revealed} onFocus={() => setRevealed(true)}>
      <HomeCampaignMedia label="Ảnh mâm cơm Việt và bàn tay sẻ chia — chờ bổ sung" />
      <div className="home-final-cta__content">
        <div>
          <h3 id="home-final-cta-title">Sẵn sàng cho một bữa cơm trọn vẹn?</h3>
          <p>Để HomeMeal lo chuyện bếp núc, bạn dành thời gian cho những điều quan trọng hơn.</p>
        </div>
        <button className="home-hero__primary" onClick={() => navigateTo('/meal-planner')}>
          Lên kế hoạch bữa ăn <ArrowRight aria-hidden="true" size={18} />
        </button>
      </div>
    </section>
  );
};
