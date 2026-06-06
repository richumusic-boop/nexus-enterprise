import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for class merging (even in vanilla CSS context, useful for conditional styles)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  isLoading?: boolean;
}

export const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  isLoading, 
  ...props 
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'btn-primary', // base class from index.css
        variant === 'secondary' && 'bg-slate-700 hover:bg-slate-600',
        variant === 'ghost' && 'bg-transparent hover:bg-white/5',
        variant === 'outline' && 'bg-transparent border border-white/20 hover:border-white/40',
        isLoading && 'opacity-70 cursor-not-allowed',
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-slate-400 select-none">{label}</label>}
      <input
        className={cn(
          "w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all",
          error && "border-red-500 focus:ring-red-500/50",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
