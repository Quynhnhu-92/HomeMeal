import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'dish' | 'cook' | 'receipt';
  label?: string;
}

// Photography is intentionally reserved for supplied assets. Evidence remains viewable.
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src, alt, className = '', fallbackType = 'dish', label, ...props
}) => {
  const [failedSrc, setFailedSrc] = useState<string>();
  const isEvidence = fallbackType === 'receipt' && src && !src.includes('images.unsplash.com');

  if (!isEvidence || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={label || `Vị trí ảnh: ${alt || (fallbackType === 'cook' ? 'đầu bếp' : 'món ăn')}`}
        className={`image-placeholder bg-surface-alt text-detail flex items-center justify-center overflow-hidden ${className}`}
      >
        <ImageIcon aria-hidden="true" className="h-7 w-7 shrink-0 opacity-60" strokeWidth={1.25} />
      </div>
    );
  }

  return <img src={src} alt={alt || 'Chứng từ mua sắm'} className={className}
    referrerPolicy="no-referrer" {...props} onError={() => setFailedSrc(src)} />;
};
