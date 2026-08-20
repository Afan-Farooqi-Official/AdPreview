import { useState } from 'react';
import { Mail, Sparkles, Zap } from 'lucide-react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';

interface EmailStepProps {
  onCodeSent: (email: string) => void;
  onSendOtp: (email: string) => Promise<{ error: string | null }>;
  onInstantLogin?: (email: string) => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EmailStep({ onCodeSent, onSendOtp, onInstantLogin }: EmailStepProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const { error: sendError } = await onSendOtp(email.trim().toLowerCase());
    setLoading(false);

    if (sendError) {
      setError(sendError);
    } else {
      onCodeSent(email.trim().toLowerCase());
    }
  };

  const handleInstantDemo = async () => {
    setDemoLoading(true);
    const targetEmail = email.trim() && isValidEmail(email.trim()) ? email.trim().toLowerCase() : 'creator@example.com';
    if (onInstantLogin) {
      await onInstantLogin(targetEmail);
    }
    setDemoLoading(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div className="w-12 h-12 bg-[hsl(var(--color-brand-light))] rounded-xl flex items-center justify-center mb-2">
          <Mail size={22} className="text-[hsl(var(--color-brand))]" />
        </div>
        <h1 className="text-2xl font-bold text-[hsl(var(--color-text))]">Sign Up to AdPreview</h1>
        <p className="text-sm text-[hsl(var(--color-text-muted))]">
          Create your account to unlock full billboard editor access.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email-input"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          autoFocus
          autoComplete="email"
          inputMode="email"
        />

        <Button
          type="submit"
          loading={loading}
          disabled={!email}
          id="send-code-btn"
          size="lg"
          className="w-full"
        >
          Continue with Email OTP →
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
          or
        </span>
      </div>

      {/* Instant 1-Click Access for Evaluation & Demo */}
      {onInstantLogin && (
        <Button
          type="button"
          variant="outline"
          size="md"
          loading={demoLoading}
          onClick={handleInstantDemo}
          className="w-full border-indigo-200 text-[hsl(var(--color-brand))] hover:bg-indigo-50/70 font-semibold"
        >
          <Zap size={15} /> Instant 1-Click Access
        </Button>
      )}

      <p className="text-xs text-center text-[hsl(var(--color-text-subtle))] leading-relaxed">
        By continuing, you agree to our Terms of Service &amp; Privacy Policy.
        <br />
        <span className="inline-flex items-center gap-1 text-slate-400 mt-1">
          <Sparkles size={11} className="text-[hsl(var(--color-brand))]" /> No password required • Free forever
        </span>
      </p>
    </div>
  );
}
