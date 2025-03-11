import { HTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated';
  padding?: 'none' | 'normal' | 'large';
}

export function Card({
  children,
  variant = 'default',
  padding = 'normal',
  className,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-lg bg-white';
  
  const variants = {
    default: 'border border-gray-200',
    elevated: 'shadow-lg'
  };

  const paddings = {
    none: '',
    normal: 'p-4',
    large: 'p-6'
  };

  return (
    <div
      className={twMerge(baseStyles, variants[variant], paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}
