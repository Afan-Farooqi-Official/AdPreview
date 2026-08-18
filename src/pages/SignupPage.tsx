import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmailStep } from '../components/auth/EmailStep';
import { OtpStep } from '../components/auth/OtpStep';
import { authService } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

type AuthStep = 'email' | 'otp';

export function SignupPage() {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  const redirectTo = searchParams.get('redirectTo') ?? '/editor';

  const handleSendOtp = async (emailAddress: string) => {
    return authService.sendOtp(emailAddress);
  };

  const handleCodeSent = (emailAddress: string) => {
    setEmail(emailAddress);
    setStep('otp');
  };

  const handleVerify = async (code: string) => {
    const { error } = await authService.verifyOtp(email, code);
    if (!error) {
      await refreshUser();
      navigate(redirectTo, { replace: true });
    }
    return { error };
  };

  const handleResend = async () => {
    return authService.sendOtp(email);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-[hsl(var(--color-border))] h-[60px] flex items-center px-6">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-[hsl(var(--color-text))] tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-tr from-[hsl(var(--color-brand-dark))] to-[hsl(var(--color-brand))] rounded-xl flex items-center justify-center shadow-md shadow-[hsl(var(--color-brand))]/20">
            <span className="text-white font-black text-base">A</span>
          </div>
          <span className="text-lg font-extrabold text-[hsl(var(--color-text))]">AdPreview</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="card p-8">
            {step === 'email' ? (
              <EmailStep onCodeSent={handleCodeSent} onSendOtp={handleSendOtp} />
            ) : (
              <OtpStep
                email={email}
                onVerify={handleVerify}
                onResend={handleResend}
                onBack={() => setStep('email')}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
