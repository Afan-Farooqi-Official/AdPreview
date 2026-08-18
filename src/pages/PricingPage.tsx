import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { PricingTable } from '../components/pricing/PricingTable';

export function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 sm:py-20 px-4 sm:px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black text-[hsl(var(--color-text))] mb-4">
            Simple pricing.
          </h1>
          <p className="text-lg text-[hsl(var(--color-text-muted))]">
            Start free. Upgrade to Pro for HD exports, the full scene library, and unlimited projects.
            Cancel anytime.
          </p>
        </div>
        <PricingTable />
        <p className="text-center text-sm text-[hsl(var(--color-text-subtle))] mt-8">
          Questions? Email us at{' '}
          <a
            href="mailto:support@example.com"
            className="text-[hsl(var(--color-brand))] hover:underline"
          >
            support@example.com
          </a>
        </p>
      </main>
      <Footer />
    </div>
  );
}
