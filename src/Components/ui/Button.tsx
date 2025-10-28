import React from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs sm:text-sm',
  md: 'px-4 sm:px-5 py-2.5 text-sm',
  lg: 'px-5 sm:px-6 py-3 text-base',
};

const Button: React.FC<Props> = ({ variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indigo-400/60 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none touch-manipulation';
  const variants: Record<ButtonVariant, string> = {
    primary:
      'text-white shadow-[0_0_24px_rgba(99,102,241,0.25)] hover:scale-[1.02] bg-[linear-gradient(135deg,#6366F1, #22D3EE)]',
    outline:
      'text-white border border-white/15 hover:bg-white/5',
    ghost:
      'text-zinc-200 hover:bg-white/5',
  };
  return <button className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`} {...props} />;
};

export default Button;


