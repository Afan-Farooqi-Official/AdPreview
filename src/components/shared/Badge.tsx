import { clsx } from 'clsx';

type BadgeVariant = 'free' | 'pro' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  free: 'bg-[hsl(var(--color-surface-alt2))] text-[hsl(var(--color-text-muted))] border border-[hsl(var(--color-border))]',
  pro: 'bg-[hsl(var(--color-pro))]/10 text-[hsl(var(--color-pro))] border border-[hsl(var(--color-pro))]/20 font-semibold',
  default: 'bg-[hsl(var(--color-surface-alt2))] text-[hsl(var(--color-text-muted))]',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
