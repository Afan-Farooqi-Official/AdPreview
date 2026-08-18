import { Check, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../shared/Button';
import { billingService } from '../../services/billing';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../shared/Toast';
import { PRO_PRICE_MONTHLY } from '../../types';

const features: { label: string; free: boolean | string; pro: boolean | string }[] = [
  { label: 'Try with sample ad',    free: true,                pro: true },
  { label: 'Billboard scenes',      free: 'Limited (5)',        pro: 'Full library (10+)' },
  { label: 'Drag / resize / rotate', free: true,               pro: true },
  { label: 'Export quality',        free: 'Standard (≤1280px)', pro: 'HD (full resolution)' },
  { label: 'Watermark-free export', free: false,               pro: true },
  { label: 'Saved projects',        free: 'Up to 3',            pro: 'Unlimited' },
  { label: 'Priority support',      free: false,               pro: true },
];

/** Icon cell for the desktop comparison table */
function TableCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check size={17} className="text-emerald-500 mx-auto" />
    ) : (
      <X size={15} className="text-slate-300 mx-auto" />
    );
  }
  return <span className="text-sm text-slate-500">{value}</span>;
}

/** Row item for mobile stacked cards */
function FeatureRow({ label, value }: { label: string; value: boolean | string }) {
  const isAvailable = value !== false;
  const qualifier = typeof value === 'string' ? value : null;

  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center">
        {isAvailable ? (
          <Check size={16} className="text-emerald-500" />
        ) : (
          <X size={14} className="text-slate-300" />
        )}
      </span>
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

export function PricingTable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/signup?redirectTo=/pricing';
      return;
    }
    setLoading(true);
    const { error } = await billingService.createCheckoutSession(user.id, user.email);
    setLoading(false);
    if (error) toast('error', error);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── Mobile: stacked cards ── */}
      <div className="block sm:hidden space-y-4">
        {/* Free card */}
        <div className="card p-6">
          <div className="mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Free
            </span>
            <div className="text-4xl font-black text-[hsl(var(--color-text))] mt-1 tracking-tight">
              $0
            </div>
            <p className="text-sm text-slate-400 mt-1">Forever free, no credit card</p>
          </div>
          <Button variant="outline" className="w-full mb-5" onClick={() => (window.location.href = '/editor')}>
            Continue with Free
          </Button>
          <ul className="divide-y-0">
            {features.map((f) => (
              <FeatureRow key={f.label} label={f.label} value={f.free} />
            ))}
          </ul>
        </div>

        {/* Pro card */}
        <div className="card p-6 relative overflow-hidden ring-2 ring-[hsl(var(--color-brand))]/25">
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
          <Button className="w-full mb-5" loading={loading} onClick={handleUpgrade} id="pricing-upgrade-btn">
            <Zap size={15} /> Upgrade to Pro
          </Button>
          <ul className="divide-y-0">
            {features.map((f) => (
              <FeatureRow key={f.label} label={f.label} value={f.pro} />
            ))}
          </ul>
        </div>
      </div>

      {/* ── Desktop: comparison table ── */}
      <div className="hidden sm:block overflow-hidden card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--color-border))]">
              <th className="text-left p-6 text-sm font-medium text-[hsl(var(--color-text-muted))] w-1/2">
                Feature
              </th>
              <th className="p-6 text-center w-1/4">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Free
                </div>
                <div className="text-2xl font-black text-[hsl(var(--color-text))]">$0</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => (window.location.href = '/editor')}
                  id="pricing-free-cta"
                >
                  Continue Free
                </Button>
              </th>
              <th className="p-6 text-center w-1/4 bg-[hsl(var(--color-brand))]/[0.04]">
                <div className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-brand))] mb-1">
                  Pro
                </div>
                <div className="text-2xl font-black text-[hsl(var(--color-text))]">
                  {PRO_PRICE_MONTHLY}
                  <span className="text-sm font-normal text-slate-400">/mo</span>
                </div>
                <Button
                  size="sm"
                  className="mt-3 w-full"
                  loading={loading}
                  onClick={handleUpgrade}
                  id="pricing-upgrade-btn-desktop"
                >
                  <Zap size={13} /> Upgrade
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr
                key={f.label}
                className={`border-b border-[hsl(var(--color-border))] last:border-0 ${
                  i % 2 === 0 ? '' : 'bg-slate-50/60'
                }`}
              >
                <td className="px-6 py-4 text-sm text-[hsl(var(--color-text))] font-medium">
                  {f.label}
                </td>
                <td className="px-6 py-4 text-center">
                  <TableCell value={f.free} />
                </td>
                <td className="px-6 py-4 text-center bg-[hsl(var(--color-brand))]/[0.02]">
                  <TableCell value={f.pro} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
