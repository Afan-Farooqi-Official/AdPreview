import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { Button } from '../shared/Button';
import { PRO_PRICE_MONTHLY } from '../../types';

const features: { label: string; free: boolean | string; pro: boolean | string }[] = [
  { label: 'Billboard scenes',      free: 'Limited (5)',       pro: 'Full library (10+)' },
  { label: 'Drag / resize / rotate', free: true,              pro: true },
  { label: 'Export quality',        free: 'Standard (1280px)', pro: 'HD (full resolution)' },
  { label: 'Watermark-free export', free: false,              pro: true },
  { label: 'Saved projects',        free: 'Up to 3',          pro: 'Unlimited' },
  { label: 'Try with sample ad',    free: true,               pro: true },
];

function FeatureRow({
  label,
  value,
}: {
  label: string;
  value: boolean | string;
}) {
  const isAvailable = value !== false;
  const qualifier = typeof value === 'string' ? value : null;

  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      {/* Icon column — always fixed width */}
      <span className="mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center">
        {isAvailable ? (
          <Check size={16} className="text-emerald-500" />
        ) : (
          <X size={14} className="text-slate-300" />
        )}
      </span>

      {/* Text column */}
      <span className="flex flex-col min-w-0">
        <span
          className={`text-sm font-medium leading-snug ${
            isAvailable ? 'text-slate-800' : 'text-slate-400 line-through decoration-slate-300'
          }`}
        >
          {label}
        </span>
        {qualifier && (
          <span className="text-[11px] text-slate-400 font-normal mt-0.5 leading-tight">
            {qualifier}
          </span>
        )}
      </span>
    </li>
  );
}

export function PricingPreview() {
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--color-text))] mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-[hsl(var(--color-text-muted))]">
            Start free, upgrade when you need more.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 items-start">
          {/* Free plan */}
          <div className="card p-6 flex flex-col">
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Free
              </span>
              <div className="text-4xl font-black text-[hsl(var(--color-text))] mt-1 tracking-tight">
                $0
              </div>
              <p className="text-sm text-slate-400 mt-1">Forever free, no credit card</p>
            </div>
            <Button variant="outline" size="md" asChild className="mb-5">
              <Link to="/signup">Get started free</Link>
            </Button>
            <ul className="divide-y-0">
              {features.map((f) => (
                <FeatureRow key={f.label} label={f.label} value={f.free} />
              ))}
            </ul>
          </div>

          {/* Pro plan */}
          <div className="card p-6 flex flex-col relative overflow-hidden ring-2 ring-[hsl(var(--color-brand))]/25">
            <div className="absolute top-3.5 right-3.5 bg-[hsl(var(--color-brand))] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Popular
            </div>
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-brand))]">
                Pro
              </span>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-4xl font-black text-[hsl(var(--color-text))] tracking-tight">
                  {PRO_PRICE_MONTHLY}
                </span>
                <span className="text-base font-medium text-slate-400 mb-1">/mo</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">Cancel anytime</p>
            </div>
            <Button size="md" asChild className="mb-5">
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
            <ul className="divide-y-0">
              {features.map((f) => (
                <FeatureRow key={f.label} label={f.label} value={f.pro} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
