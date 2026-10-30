import React, { useState } from 'react';

interface UbLogoProps {
  className?: string;
  size?: number | string;
  alt?: string;
}

export const UB_LOGO_IMAGE_URL = '/assets/logo-ub.png';
export const UB_LOGO_SVG_URL = '/assets/logo-ub.svg';

/**
 * Official Logo / Emblem of Universitas Brawijaya (UB)
 * Loaded from the official high-resolution picture asset of Universitas Brawijaya.
 */
export const UbLogo: React.FC<UbLogoProps> = ({
  className = 'w-full h-full object-contain',
  size,
  alt = 'Logo Universitas Brawijaya'
}) => {
  const [srcIndex, setSrcIndex] = useState(0);

  const sources = [
    '/assets/logo-ub.png',
    '/assets/logo-ub.svg',
    'https://upload.wikimedia.org/wikipedia/commons/b/bb/Logo_Universitas_Brawijaya.svg'
  ];

  const handleImgError = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex((prev) => prev + 1);
    }
  };

  return (
    <img
      src={sources[srcIndex]}
      alt={alt}
      className={`object-contain ${className}`}
      style={size ? { width: size, height: size } : undefined}
      onError={handleImgError}
      loading="eager"
      decoding="async"
    />
  );
};
