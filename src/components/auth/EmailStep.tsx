import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';

interface EmailStepProps {
  onCodeSent: (email: string) => void;
  onSendOtp: (email: string) => Promise<{ error: string | null }>;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EmailStep({ onCodeSent, onSendOtp }: EmailStepProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div className="w-12 h-12 bg-[hsl(var(--color-brand-light))] rounded-xl flex items-center justify-center mb-2">
          <Mail size={22} className="text-[hsl(var(--color-brand))]" />
        </div>
        <h1 className="text-2xl font-bold text-[hsl(var(--color-text))]">Sign in to AdPreview</h1>
        <p className="text-sm text-[hsl(var(--color-text-muted))]">
          Enter your email — we'll send you a one-time verification code.
        </p>
      </div>

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
        Send verification code
      </Button>

      <p className="text-xs text-center text-[hsl(var(--color-text-subtle))]">
        By continuing, you agree to our Terms of Service and Privacy Policy.
        <br />
        No password required — no credit card needed.
      </p>
    </form>
  );
}
