import React from 'react';
import coinImg from '../assets/images/euchre_gold_coin_1787803542988.jpg';

interface EuchreCoinProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  alt?: string;
}

const SIZE_CLASSES = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
  custom: '',
};

export const EuchreCoin: React.FC<EuchreCoinProps> = ({
  className = '',
  size = 'md',
  alt = 'Euchre Gold Coin',
}) => {
  const sizeClass = size !== 'custom' ? SIZE_CLASSES[size] : '';

  return (
    <img
      src={coinImg}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`inline-block rounded-full object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(217,119,6,0.5)] select-none pointer-events-none ${sizeClass} ${className}`}
    />
  );
};
