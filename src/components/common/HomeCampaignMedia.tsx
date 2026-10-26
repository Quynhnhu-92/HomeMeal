import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface HomeCampaignMediaProps {
  label: string;
  src?: string;
  srcSet?: string;
  priority?: boolean;
}

// Supply only a verified Unsplash/Pexels asset, recording its page and credit here.
// No suitable photograph could be verified in this environment; retain labeled slots.
export const HomeCampaignMedia: React.FC<HomeCampaignMediaProps> = ({ label, src, srcSet, priority = false }) => {
  const [failedSource, setFailedSource] = useState<string>();
  return (
    <div className="home-campaign__media">
      {src && failedSource !== src ? (
        <img src={src} srcSet={srcSet} sizes="100vw" alt="" width={1920} height={1080}
          loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'}
          decoding="async" onError={() => setFailedSource(src)} />
      ) : (
        <div className="home-campaign__placeholder" role="img" aria-label={label}>
          <span aria-hidden="true"><ImageIcon size={22} strokeWidth={1.25} />{label}</span>
        </div>
      )}
    </div>
  );
};
