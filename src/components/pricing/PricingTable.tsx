import { Check, Zap, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../shared/Button';
import { billingService } from '../../services/billing';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../shared/Toast';
import { PRO_PRICE_MONTHLY } from '../../types';

const freeFeatures = [
  'Limited billboard scenes (5 scenes)',
  'Drag, resize & rotate freely',
  'Standard export quality (1280px)',
  'Exports with watermark',
  'Limited saved projects (up to 3)',
];

const proFeatures: { text: string; highlight?: boolean }[] = [
  { text: 'Everything in Free, and:', highlight: true },
  { text: 'Full scene library (10+ billboards)' },
  { text: 'HD export (full original resolution)' },
  { text: 'Watermark-free downloads' },
  { text: 'Unlimited saved projects' },
  { text: 'Priority support' },
];

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
    <div className="max-w-3xl mx-auto">
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 items-start">

        {/* ── Free card ── */}
        <div className="card p-6 flex flex-col">
          <div className="mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Free</span>
            <div className="text-4xl font-black text-[hsl(var(--color-text))] mt-1 tracking-tight">$0</div>
            <p className="text-sm text-slate-400 mt-1">Forever free, no credit card</p>
          </div>
          <Button
            variant="outline"
            className="w-full mb-5"
            onClick={() => {
              if (!user) {
                window.location.href = '/signup?redirectTo=/editor';
              } else {
                window.location.href = '/editor';
              }
            }}
            id="pricing-free-cta"
          >
            Continue with Free
          </Button>
          <ul>
            {freeFeatures.map((text, i) => (
              <li
                key={text}
                className={`flex items-center gap-3 py-3 text-sm text-slate-700 ${
                  i !== freeFeatures.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <span className="w-5 flex-shrink-0 flex justify-center">
                  <Check size={16} className="text-emerald-500" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Pro card ── */}
        <div className="card p-6 flex flex-col relative overflow-hidden ring-2 ring-[hsl(var(--color-brand))]/25">
          <div className="absolute top-3.5 right-3.5 bg-[hsl(var(--color-brand))] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Popular
          </div>
          <div className="mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-brand))]">Pro</span>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-4xl font-black text-[hsl(var(--color-text))] tracking-tight">
                {PRO_PRICE_MONTHLY}
              </span>
              <span className="text-base font-medium text-slate-400 mb-1">/mo</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">Cancel anytime</p>
          </div>
          <Button
            className="w-full mb-5"
            loading={loading}
            onClick={handleUpgrade}
            id="pricing-upgrade-btn"
          >
            <Zap size={14} /> Upgrade to Pro
          </Button>
          <ul>
            {proFeatures.map((f, i) => (
              <li
                key={f.text}
                className={`flex items-center gap-3 py-3 text-sm ${
                  i !== proFeatures.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <span className="w-5 flex-shrink-0 flex justify-center">
                  {f.highlight ? (
                    <Sparkles size={15} className="text-[hsl(var(--color-brand))]" />
                  ) : (
                    <Check size={16} className="text-emerald-500" />
                  )}
                </span>
                <span
                  className={
                    f.highlight
                      ? 'font-semibold text-[hsl(var(--color-brand))]'
                      : 'text-slate-700'
                  }
                >
                  {f.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
