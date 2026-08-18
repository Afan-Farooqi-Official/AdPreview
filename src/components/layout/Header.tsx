import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User2, ChevronDown, Sparkles } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';

export function Header() {
  const { user, signOut } = useAuth();
  const { plan } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-[hsl(var(--color-text))] font-semibold'
      : 'text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[hsl(var(--color-surface))]/90 backdrop-blur-md border-b border-[hsl(var(--color-border-subtle))] h-[68px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-xl text-[hsl(var(--color-text))] tracking-tight shrink-0"
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-[hsl(var(--color-brand-dark))] to-[hsl(var(--color-brand))] rounded-xl flex items-center justify-center shadow-md shadow-[hsl(var(--color-brand))]/20">
            <span className="text-white font-black text-base">A</span>
          </div>
          <span className="text-lg font-extrabold text-[hsl(var(--color-text))]">AdPreview</span>
        </Link>

        {/* Marketing Navigation Links */}
        {!user ? (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[hsl(var(--color-text-muted))]">
            <a href="#how-it-works" className="hover:text-[hsl(var(--color-text))] transition-colors">
              How it works
            </a>
            <a href="#examples" className="hover:text-[hsl(var(--color-text))] transition-colors">
              Examples
            </a>
            <a href="#surfaces" className="hover:text-[hsl(var(--color-text))] transition-colors">
              Surfaces
            </a>
            <Link to="/pricing" className="hover:text-[hsl(var(--color-text))] transition-colors">
              Pricing
            </Link>
            <Link to="/editor?sample=true" className="hover:text-[hsl(var(--color-text))] transition-colors">
              Editor
            </Link>
          </nav>
        ) : (
          <nav className="hidden sm:flex items-center gap-2">
            <Link to="/editor" className={`px-3.5 py-2 rounded-lg text-sm transition-colors ${isActive('/editor')}`}>
              Editor
            </Link>
            <Link to="/projects" className={`px-3.5 py-2 rounded-lg text-sm transition-colors ${isActive('/projects')}`}>
              My Projects
            </Link>
            <Link to="/pricing" className={`px-3.5 py-2 rounded-lg text-sm transition-colors ${isActive('/pricing')}`}>
              Pricing
            </Link>
          </nav>
        )}

        {/* Right side Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {user ? (
            <>
              <Badge variant={plan}>{plan === 'pro' ? '⚡ Pro' : 'Free'}</Badge>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    id="account-menu-trigger"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--color-surface-alt2))] transition-colors text-sm text-[hsl(var(--color-text))]"
                  >
                    <User2 size={16} className="text-[hsl(var(--color-brand))]" />
                    <span className="hidden sm:inline font-medium max-w-[120px] truncate">{user.email.split('@')[0]}</span>
                    <ChevronDown size={14} className="text-[hsl(var(--color-text-muted))]" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="card z-50 min-w-[200px] p-1.5 shadow-xl border border-[hsl(var(--color-border))]"
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/account"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[hsl(var(--color-surface-alt))] cursor-pointer font-medium"
                      >
                        <User2 size={14} />
                        Account Settings
                      </Link>
                    </DropdownMenu.Item>
                    {plan === 'free' && (
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/pricing"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[hsl(var(--color-brand-light))] cursor-pointer text-[hsl(var(--color-brand))] font-semibold"
                        >
                          <Sparkles size={14} />
                          Upgrade to Pro
                        </Link>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Separator className="my-1.5 h-px bg-[hsl(var(--color-border))]" />
                    <DropdownMenu.Item asChild>
                      <button
                        id="sign-out-btn"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-red-50 cursor-pointer text-[hsl(var(--color-error))] font-medium"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/signup')}
                className="text-sm font-semibold text-[hsl(var(--color-text))] hover:text-[hsl(var(--color-brand))] transition-colors px-2"
                id="header-login-btn"
              >
                Log in
              </button>
              <Button
                size="md"
                onClick={() => navigate('/signup')}
                id="header-signup-btn"
                className="font-semibold shadow-md shadow-[hsl(var(--color-brand))]/25 rounded-xl px-5"
              >
                Get Started – It's Free
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
