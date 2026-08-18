import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Button } from '../components/shared/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-8xl font-black text-[hsl(var(--color-surface-alt2))] mb-4">404</div>
        <h1 className="text-2xl font-bold text-[hsl(var(--color-text))] mb-2">Page not found</h1>
        <p className="text-[hsl(var(--color-text-muted))] mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild id="not-found-home-btn">
          <Link to="/">Back to Home</Link>
        </Button>
      </main>
    </div>
  );
}
