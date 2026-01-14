'use client';

import { ButtonHTMLAttributes, ReactNode, useState } from 'react';
import { playSfx } from '@/hooks/use-sfx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'gold' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
  isActive?: boolean;
  enableSound?: boolean;
  soundType?: 'click' | 'submit' | 'toggle' | 'navigate';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  isActive = false,
  enableSound = true,
  soundType = 'click',
  className = '',
  disabled,
  onClick,
  onMouseEnter,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    gold: 'btn-gold',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enableSound && !disabled && !isLoading) {
      playSfx(soundType);
    }
    onClick?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    if (enableSound && !disabled) {
      playSfx('hover');
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <button
      className={`btn-3d ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } ${isActive ? 'active' : ''}`}
      disabled={disabled || isLoading}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-active={isActive}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
