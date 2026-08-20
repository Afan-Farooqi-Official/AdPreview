import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-alt))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[hsl(var(--color-text))] font-bold">
          <div className="w-7 h-7 bg-gradient-to-tr from-[hsl(var(--color-brand-dark))] to-[hsl(var(--color-brand))] rounded-lg flex items-center justify-center text-white text-xs font-black">
            A
          </div>
          <span>AdPreview</span>
        </div>
        <nav className="flex flex-wrap items-center gap-5 text-sm text-[hsl(var(--color-text-muted))]">
          <Link to="/pricing" className="hover:text-[hsl(var(--color-text))] transition-colors">Pricing</Link>
          <Link to="/editor" className="hover:text-[hsl(var(--color-text))] transition-colors">Editor</Link>
          <Link to="/support" className="hover:text-[hsl(var(--color-text))] transition-colors">Support &amp; FAQ</Link>
        </nav>
        <p className="text-xs text-[hsl(var(--color-text-subtle))]">
          © {year} AdPreview. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
