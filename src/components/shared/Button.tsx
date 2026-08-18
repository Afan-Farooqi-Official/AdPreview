import { forwardRef } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { Spinner } from './Spinner';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[hsl(var(--color-brand))] text-white hover:bg-[hsl(var(--color-brand-dark))] active:scale-[0.98] shadow-sm',
  secondary:
    'bg-[hsl(var(--color-surface-alt2))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))] active:scale-[0.98]',
  outline:
    'border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-surface-alt))] active:scale-[0.98]',
  ghost:
    'text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-surface-alt))] hover:text-[hsl(var(--color-text))]',
  danger:
    'bg-[hsl(var(--color-error))] text-white hover:opacity-90 active:scale-[0.98] shadow-sm',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-[var(--radius)]',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-[var(--radius)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, asChild, className, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        <Slottable>{children}</Slottable>
      </Comp>
    );
  }
);
Button.displayName = 'Button';
