import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[hsl(var(--color-text))]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'h-11 w-full rounded-[var(--radius)] border px-3.5 text-sm transition-colors',
            'bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text))]',
            'placeholder:text-[hsl(var(--color-text-subtle))]',
            'focus:outline-none focus:border-[hsl(var(--color-brand))] focus:ring-2 focus:ring-[hsl(var(--color-brand))]/20',
            error
              ? 'border-[hsl(var(--color-error))]'
              : 'border-[hsl(var(--color-border))]',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-[hsl(var(--color-error))] flex items-center gap-1">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-[hsl(var(--color-text-subtle))]">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
