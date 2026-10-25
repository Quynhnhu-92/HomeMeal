import React from 'react';
import { getStatusMeta } from '../../utils/pricing';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 font-medium rounded-full ${meta.bg} ${meta.text} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm'
      }`}
    >
      <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
      <span className="min-w-0 whitespace-normal break-words">{meta.label}</span>
    </span>
  );
};
