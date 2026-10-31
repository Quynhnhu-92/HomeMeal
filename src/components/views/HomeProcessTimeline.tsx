import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  {
    "title": "Chọn món & Đặt ngân sách",
    "description": "Chọn món yêu thích từ thực đơn hoặc mâm gợi ý, ghi chú kiêng dị ứng và đặt định mức tiền chợ."
  },
  {
    "title": "Đầu bếp đi chợ & Gửi ảnh",
    "description": "Đầu bếp chọn nguyên liệu tươi sạch sớm tại chợ hoặc siêu thị, chụp ảnh hóa đơn gửi lên app."
  },
  {
    "title": "Đến nhà nấu & Dọn dẹp sạch",
    "description": "Đầu bếp mang nguyên liệu tươi đến tận nhà bạn, nấu nướng nóng hổi tại gian bếp, dọn mâm lên bàn và lau dọn sạch sẽ sau bữa ăn."
  },
  {
    "title": "Kiểm tra & Thanh toán",
    "description": "Xem lại bảng chi tiết từng món nguyên liệu thực chi + tiền công. Hài lòng mới xác nhận trả tiền."
  }
];

export const HomeProcessTimeline: React.FC = () => {
  const listRef = useRef<HTMLOListElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntered(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setEntered(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={listRef} className="process-timeline" data-entered={entered}>
      {STEPS.map((step, index) => (
        <li key={step.title} className="process-step" style={{ '--step-index': index } as React.CSSProperties}>
          <div className="process-step__marker" aria-hidden="true">
            <span className="process-step__number">{String(index + 1).padStart(2, '0')}</span>
            <span className="process-step__connector"><ArrowRight size={16} /></span>
          </div>
          <div className="process-step__copy">
            <h3><span className="sr-only">BƯỚC {index + 1} — </span>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};
