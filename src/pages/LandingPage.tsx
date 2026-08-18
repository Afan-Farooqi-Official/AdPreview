import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { PricingPreview } from '../components/landing/PricingPreview';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <PricingPreview />
      </main>
      <Footer />
    </div>
  );
}
