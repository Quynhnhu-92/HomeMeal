import React, { useState } from 'react';
import { Utensils, ChefHat, Receipt } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'dish' | 'cook' | 'receipt';
  label?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackType = 'dish',
  label,
  ...props
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-surface-alt to-surface-alt text-accent border border-border-soft select-none p-3 ${className}`}
      >
        {fallbackType === 'dish' && <Utensils className="w-8 h-8 opacity-70 mb-1" />}
        {fallbackType === 'cook' && <ChefHat className="w-8 h-8 opacity-70 mb-1" />}
        {fallbackType === 'receipt' && <Receipt className="w-8 h-8 opacity-70 mb-1" />}
        <span className="text-xs font-medium text-center line-clamp-1 opacity-80">
          {label || alt || 'HomeMeal'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'HomeMeal'}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={className}
      {...props}
    />
  );
};
