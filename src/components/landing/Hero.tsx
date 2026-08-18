import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  ChevronRight,
  Sparkles,
  Zap,
  Download,
  ShieldCheck,
  Monitor,
  Package,
  Car,
  Store,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { projectsService } from '../../services/projects';
import { useToast } from '../shared/Toast';

const sampleAds = [
  {
    id: 'sample-juice',
    title: 'Refresh Your Day',
    category: 'Beverage',
    bg: 'from-emerald-800 to-teal-900',
    accent: 'bg-emerald-400',
    tag: '100% ORGANIC',
    url: '/mock/ads/sample-juice.png',
  },
  {
    id: 'sample-sneaker',
    title: 'Run Beyond Limits',
    category: 'Footwear',
    bg: 'from-zinc-800 to-zinc-950',
    accent: 'bg-amber-400',
    tag: 'NEW 2026',
    url: '/mock/ads/sample-sneaker.png',
  },
  {
    id: 'sample-burger',
    title: 'Big Burger',
    category: 'Food',
    bg: 'from-amber-900 to-yellow-950',
    accent: 'bg-yellow-400',
    tag: '100% BEEF',
    url: '/mock/ads/sample-burger.png',
  },
  {
    id: 'sample-glow',
    title: 'Glow Naturally',
    category: 'Beauty',
    bg: 'from-pink-900 to-rose-950',
    accent: 'bg-rose-400',
    tag: 'ORGANIC',
    url: '/mock/ads/sample-glow.png',
  },
];

const surfaces = [
  {
    id: 'billboards',
    title: 'Billboards',
    desc: 'Highway, City, Building & more',
    icon: Monitor,
    popular: true,
    image: '/mock/scenes/highway-day-full.jpg',
  },
  {
    id: 'products',
    title: 'Products',
    desc: 'Bottles, Cans, Boxes & more',
    icon: Package,
    popular: false,
    image: '/mock/scenes/shopping-full.jpg',
  },
  {
    id: 'vehicles',
    title: 'Vehicles',
    desc: 'Cars, Vans, Buses & more',
    icon: Car,
    popular: false,
    image: '/mock/scenes/city-day-full.jpg',
  },
  {
    id: 'storefronts',
    title: 'Storefronts',
    desc: 'Shops, Windows, Signs & more',
    icon: Store,
    popular: false,
    image: '/mock/scenes/building-full.jpg',
  },
  {
    id: 'packaging',
    title: 'Packaging',
    desc: 'Bags, Boxes, Labels & more',
    icon: ShoppingBag,
    popular: false,
    image: '/mock/scenes/city-night-full.jpg',
  },
];

const featurePills = [
  {
    icon: Sparkles,
    title: 'Make it Realistic',
    desc: 'Perspective, clean scale, and realistic surfaces.',
  },
  {
    icon: Zap,
    title: 'Super Fast',
    desc: 'Preview your ad in seconds, not hours.',
  },
  {
    icon: Download,
    title: 'High Quality Export',
    desc: 'Download high resolution images instantly.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Secure',
    desc: 'Your files and data are always protected.',
  },
];

export function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!user) {
        // Redirect to signup
        navigate('/signup?redirectTo=/editor');
        return;
      }
      try {
        const { url, error } = await projectsService.uploadAdImage(user.id, file);
        if (error) throw new Error(error);
        navigate(`/editor?ad=${encodeURIComponent(url ?? '')}`);
      } catch {
        toast('error', 'Upload failed. Please try again.');
      }
    },
    [user, navigate, toast]
  );

  const handleSampleClick = (sampleUrl: string) => {
    navigate(`/editor?sample=true&adUrl=${encodeURIComponent(sampleUrl)}`);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[hsl(var(--color-brand))]/10 via-[hsl(var(--color-brand-light))] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
          <Sparkles size={14} className="text-[hsl(var(--color-brand))]" />
          <span>See your ad in the real world, in seconds.</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[hsl(var(--color-text))] tracking-tight leading-[1.08] mb-4">
          Put your ad anywhere.
          <br />
          <span className="text-[hsl(var(--color-brand))]">See it. Love it. Use it.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[hsl(var(--color-text-muted))] max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          Drag, drop, and instantly see your advertisement on billboards, products, vehicles and more.
        </p>

        {/* Big Upload Dropzone Card */}
        <div className="max-w-2xl mx-auto mb-5">
          <label
            htmlFor="hero-ad-input"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFileUpload(file);
            }}
            className={`flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer bg-white shadow-sm hover:shadow-md ${
              isDragging
                ? 'border-[hsl(var(--color-brand))] bg-[hsl(var(--color-brand-light))]'
                : 'border-[hsl(var(--color-brand))]/35 hover:border-[hsl(var(--color-brand))] hover:bg-[hsl(var(--color-brand-light))]/40'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-brand-light))] text-[hsl(var(--color-brand))] flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud size={28} />
            </div>
            <h3 className="text-lg font-bold text-[hsl(var(--color-text))] mb-1">
              Upload your ad design
            </h3>
            <p className="text-sm text-[hsl(var(--color-text-muted))] mb-1">
              Drag &amp; drop your file here or <span className="text-[hsl(var(--color-brand))] font-semibold underline underline-offset-2">click to browse</span>
            </p>
            <p className="text-xs text-[hsl(var(--color-text-subtle))]">
              JPG, PNG or WebP up to 25MB
            </p>
            <input
              id="hero-ad-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </label>
        </div>

        {/* No credit card / Try with a sample arrow */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-xs text-[hsl(var(--color-text-subtle))] font-medium mb-1.5">
            No credit card required
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--color-text-muted))] font-medium">
            <span>or</span>
            <span className="text-[hsl(var(--color-text))] font-bold">try with a sample</span>
            <span className="text-base text-[hsl(var(--color-brand))]">↴</span>
          </div>
        </div>

        {/* 4 Interactive Sample Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-16">
          {sampleAds.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample.url)}
              className="group relative rounded-xl overflow-hidden p-3 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border border-[hsl(var(--color-border))] bg-gradient-to-br"
              style={{ minHeight: '90px' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${sample.bg} opacity-95 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10 flex flex-col justify-between h-full text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold tracking-wider uppercase opacity-80">
                    {sample.category}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${sample.accent}`} />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">{sample.title}</p>
                  <span className="text-[9px] opacity-75 font-medium">{sample.tag}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Surfaces Gallery Grid */}
        <div id="surfaces" className="mb-16">
          <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto px-2">
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--color-text))]">
                Explore Realistic Billboard &amp; Display Surfaces
              </h2>
              <p className="text-xs sm:text-sm text-[hsl(var(--color-text-muted))]">
                Choose from modern urban, highway, transit, and retail placements.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {surfaces.map((surf) => {
              const Icon = surf.icon;
              return (
                <div
                  key={surf.id}
                  onClick={() => navigate('/editor?sample=true')}
                  className="card group cursor-pointer overflow-hidden border border-[hsl(var(--color-border))] rounded-2xl bg-white hover:border-[hsl(var(--color-brand))]/60 transition-all duration-200"
                >
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <img
                      src={surf.image}
                      alt={surf.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/mock/scenes/highway-day-full.jpg';
                      }}
                    />
                    {surf.popular && (
                      <div className="absolute top-2 left-2 bg-[hsl(var(--color-brand))] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-sm">
                        <span>★ Most Popular</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-left">
                      <div className="w-7 h-7 rounded-lg bg-[hsl(var(--color-surface-alt2))] flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-[hsl(var(--color-text))]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[hsl(var(--color-text))]">
                          {surf.title}
                        </h4>
                        <p className="text-[10px] text-[hsl(var(--color-text-muted))] truncate max-w-[120px]">
                          {surf.desc}
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[hsl(var(--color-surface-alt))] flex items-center justify-center group-hover:bg-[hsl(var(--color-brand))] group-hover:text-white transition-colors">
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom 4 Feature Pills Banner */}
        <div className="card max-w-5xl mx-auto p-6 bg-white/80 backdrop-blur-sm border border-[hsl(var(--color-border))] rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {featurePills.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-brand-light))] flex items-center justify-center shrink-0 text-[hsl(var(--color-brand))] shadow-sm">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[hsl(var(--color-text))] mb-0.5">
                      {feat.title}
                    </h4>
                    <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
