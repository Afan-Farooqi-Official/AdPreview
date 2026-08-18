import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CreditCard, Zap, Mail } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { useToast } from '../components/shared/Toast';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { billingService } from '../services/billing';

export function AccountPage() {
  const { user, signOut } = useAuth();
  const { plan, isPro } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [portalLoading, setPortalLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!user) return;
    setPortalLoading(true);
    const { error } = await billingService.createPortalSession(user.id);
    setPortalLoading(false);
    if (error) toast('error', error);
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setUpgradeLoading(true);
    const { error } = await billingService.createCheckoutSession(user.id, user.email);
    setUpgradeLoading(false);
    if (error) toast('error', error);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--color-text))] mb-8">
          Account Settings
        </h1>

        {/* Profile card */}
        <div className="card p-6 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-[hsl(var(--color-brand-light))] rounded-full flex items-center justify-center shrink-0">
              <Mail size={18} className="text-[hsl(var(--color-brand))]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[hsl(var(--color-text-muted))] mb-0.5">Email</p>
              <p className="text-sm font-medium text-[hsl(var(--color-text))] truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[hsl(var(--color-border))] pt-4">
            <div>
              <p className="text-xs text-[hsl(var(--color-text-muted))] mb-1">Current Plan</p>
              <Badge variant={plan}>{isPro ? '⚡ Pro' : 'Free'}</Badge>
            </div>
            {isPro ? (
              <Button
                variant="outline"
                size="sm"
                id="manage-subscription-btn"
                loading={portalLoading}
                onClick={handleManageSubscription}
              >
                <CreditCard size={14} />
                Manage Subscription
              </Button>
            ) : (
              <Button
                size="sm"
                id="upgrade-account-btn"
                loading={upgradeLoading}
                onClick={handleUpgrade}
              >
                <Zap size={14} />
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-[hsl(var(--color-text))] mb-3">Session</h2>
          <Button
            variant="ghost"
            size="md"
            id="sign-out-account-btn"
            onClick={handleSignOut}
            className="text-[hsl(var(--color-error))] hover:bg-red-50 w-full justify-start"
          >
            <LogOut size={15} />
            Sign out
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
