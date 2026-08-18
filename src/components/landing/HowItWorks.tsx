import { Upload, LayoutGrid, Download } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your Ad',
    desc: 'Drop in any JPG, PNG, or WebP advertisement image — up to 10MB.',
  },
  {
    icon: LayoutGrid,
    step: '02',
    title: 'Choose a Billboard Scene',
    desc: 'Pick from our library of realistic highway, city, and transit billboard scenes.',
  },
  {
    icon: Download,
    step: '03',
    title: 'Position & Download',
    desc: 'Drag, resize, and rotate your ad into place, then download the final composite image.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-24 bg-[hsl(var(--color-surface-alt))] border-y border-[hsl(var(--color-border))]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--color-text))] mb-3">
            How it works
          </h2>
          <p className="text-[hsl(var(--color-text-muted))] max-w-md mx-auto">
            From upload to download in under 60 seconds — no design skills required.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 relative">
          {/* Connector line */}
          <div className="absolute hidden sm:block top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-[hsl(var(--color-border))] z-0" />

          {steps.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="relative flex flex-col items-center text-center z-10">
              <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] shadow-sm flex items-center justify-center mb-5 relative">
                <Icon size={28} className="text-[hsl(var(--color-brand))]" />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[hsl(var(--color-brand))] rounded-full text-white text-xs font-bold flex items-center justify-center">
                  {step.replace('0', '')}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[hsl(var(--color-text))] mb-2">{title}</h3>
              <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
