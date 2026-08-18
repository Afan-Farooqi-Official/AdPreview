import { X, Zap, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../shared/Button';
import { useState } from 'react';
import { billingService } from '../../services/billing';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../shared/Toast';
import { PRO_PRICE_MONTHLY } from '../../types';

const proFeatures = [
  'Full scene library (10+ billboard scenes)',
  'HD / full-resolution export',
  'Watermark-free downloads',
  'Unlimited saved projects',
];

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  trigger?: string;
}

export function UpgradeModal({ open, onClose, trigger }: UpgradeModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const triggerLabels: Record<string, string> = {
    hd_export: 'HD export requires Pro.',
    scene_locked: 'This scene is only available on Pro.',
    project_limit: "You've reached the free project limit.",
    default: 'Unlock more with Pro.',
  };

  const subtitle = triggerLabels[trigger ?? 'default'] ?? triggerLabels.default;

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await billingService.createCheckoutSession(user.id, user.email);
    setLoading(false);
    if (error) toast('error', error);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm card p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-80 data-[state=open]:zoom-in-95"
          aria-describedby="upgrade-modal-description"
        >
          <Dialog.Close asChild>
            <button className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-[hsl(var(--color-surface-alt2))] transition-colors">
              <X size={16} className="text-[hsl(var(--color-text-muted))]" />
            </button>
          </Dialog.Close>

          <div className="flex flex-col items-center text-center gap-1 mb-5">
            <div className="w-12 h-12 bg-[hsl(var(--color-pro))]/10 rounded-2xl flex items-center justify-center mb-2">
              <Zap size={22} className="text-[hsl(var(--color-pro))]" />
            </div>
            <Dialog.Title className="text-xl font-bold text-[hsl(var(--color-text))]">
              Upgrade to Pro
            </Dialog.Title>
            <p id="upgrade-modal-description" className="text-sm text-[hsl(var(--color-text-muted))]">
              {subtitle}
            </p>
          </div>

          <ul className="space-y-2.5 mb-6">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <Check size={15} className="text-[hsl(var(--color-success))] shrink-0" />
                <span className="text-[hsl(var(--color-text-muted))]">{f}</span>
              </li>
            ))}
          </ul>

          <Button
            id="upgrade-modal-cta"
            className="w-full"
            size="lg"
            loading={loading}
            onClick={handleUpgrade}
          >
            <Zap size={16} />
            Upgrade — {PRO_PRICE_MONTHLY}/month
          </Button>
          <p className="text-xs text-center text-[hsl(var(--color-text-subtle))] mt-2">
            Cancel anytime · No hidden fees
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
