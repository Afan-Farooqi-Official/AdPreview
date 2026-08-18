import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { Button } from '../shared/Button';

interface OtpStepProps {
  email: string;
  onVerify: (code: string) => Promise<{ error: string | null }>;
  onResend: () => Promise<{ error: string | null }>;
  onBack: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_S = 30;

export function OtpStep({ email, onVerify, onResend, onBack }: OtpStepProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const code = digits.join('');

  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError('');
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setDigits(pasted.split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH) return;
    setLoading(true);
    setError('');
    const { error: verifyError } = await onVerify(code);
    setLoading(false);
    if (verifyError) {
      setError(verifyError);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    const { error: resendError } = await onResend();
    setResendLoading(false);
    if (resendError) {
      setError(resendError);
    } else {
      setCooldown(RESEND_COOLDOWN_S);
      setDigits(Array(OTP_LENGTH).fill(''));
      setError('');
    }
  };

  // Auto-verify when all digits filled
  useEffect(() => {
    if (code.length === OTP_LENGTH && !loading) {
      handleVerify();
    }
  }, [code]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div className="w-12 h-12 bg-[hsl(var(--color-brand-light))] rounded-xl flex items-center justify-center mb-2">
          <ShieldCheck size={22} className="text-[hsl(var(--color-brand))]" />
        </div>
        <h1 className="text-2xl font-bold text-[hsl(var(--color-text))]">Check your email</h1>
        <p className="text-sm text-[hsl(var(--color-text-muted))]">
          We sent a 6-digit code to <strong className="text-[hsl(var(--color-text))]">{email}</strong>.
          Enter it below to sign in.
        </p>
      </div>

      {/* OTP digit inputs */}
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            id={`otp-digit-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-xl font-bold rounded-[var(--radius)] border transition-colors
              ${error ? 'border-[hsl(var(--color-error))]' : 'border-[hsl(var(--color-border))]'}
              focus:outline-none focus:border-[hsl(var(--color-brand))] focus:ring-2 focus:ring-[hsl(var(--color-brand))]/20
              bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text))]`}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-[hsl(var(--color-error))] text-center">{error}</p>
      )}

      <Button
        onClick={handleVerify}
        loading={loading}
        disabled={code.length !== OTP_LENGTH || loading}
        id="verify-code-btn"
        size="lg"
        className="w-full"
      >
        Verify code
      </Button>

      {/* Resend + back */}
      <div className="flex items-center justify-between text-sm">
        <button
          onClick={onBack}
          className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
        >
          ← Change email
        </button>
        <button
          id="resend-code-btn"
          onClick={handleResend}
          disabled={cooldown > 0 || resendLoading}
          className="flex items-center gap-1.5 text-[hsl(var(--color-brand))] disabled:text-[hsl(var(--color-text-subtle))] disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw size={13} />
          {cooldown > 0 ? `Resend in ${cooldown}s` : resendLoading ? 'Sending…' : 'Resend code'}
        </button>
      </div>

      <p className="text-xs text-center text-[hsl(var(--color-text-subtle))]">
        In mock mode, use code <strong>123456</strong> with any email.
      </p>
    </div>
  );
}
