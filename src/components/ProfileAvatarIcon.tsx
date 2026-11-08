import React from 'react';

interface ProfileAvatarIconProps {
  className?: string;
  size?: number | string;
}

/**
 * Clean, modern, generic User Profile Avatar Icon
 * Universal silhouette with subtle gradient depth and crisp geometry.
 */
export const ProfileAvatarIcon: React.FC<ProfileAvatarIconProps> = ({
  className = 'w-full h-full',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-full shrink-0 select-none ${className}`}
    >
      <defs>
        {/* Deep modern background gradient */}
        <radialGradient id="genericProfileBg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="60%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>

        {/* Head gradient with subtle soft lighting */}
        <linearGradient id="genericHeadGrad" x1="50" y1="20" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Shoulders / Body gradient */}
        <linearGradient id="genericBodyGrad" x1="50" y1="58" x2="50" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Subtle rim border gradient */}
        <linearGradient id="genericRimGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* Background Circle */}
      <circle cx="50" cy="50" r="49" fill="url(#genericProfileBg)" />

      {/* Subtle outer border ring */}
      <circle cx="50" cy="50" r="48" stroke="url(#genericRimGrad)" strokeWidth="2" />

      {/* Generic Head Circle */}
      <circle cx="50" cy="36" r="16" fill="url(#genericHeadGrad)" />

      {/* Generic Shoulders / Upper Torso Arc */}
      <path
        d="M20 86C20 68 33 58 50 58C67 58 80 68 80 86C80 91 75 95 50 95C25 95 20 91 20 86Z"
        fill="url(#genericBodyGrad)"
      />
    </svg>
  );
};

