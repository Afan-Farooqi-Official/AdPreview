import { useState } from 'react';
import { MessageSquare, ChevronDown, CheckCircle2, Send } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { useToast } from '../components/shared/Toast';
import { useAuth } from '../hooks/useAuth';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: '1',
    question: 'How do I stretch and adjust perspective for my ad?',
    answer:
      'Select your placed ad on the canvas to reveal the 8 transform handles. You can drag any corner or side handle to stretch the image in any direction, or use the Stretch & Tilt sliders in the right panel.',
  },
  {
    id: '2',
    question: 'How do I add custom titles and text overlays?',
    answer:
      'Click the "Titles & Text" tab in the right sidebar. Use the quick buttons (+ Headline, + Subtitle, + CTA) to add draggable text layers, customize font size, style, and colors.',
  },
  {
    id: '3',
    question: 'What is the difference between Free and Pro exports?',
    answer:
      'Free plan exports are rendered in standard 1280px resolution with a watermark. Pro plan subscribers get full resolution HD exports without watermarks and unlimited saved projects.',
  },
  {
    id: '4',
    question: 'Can I cancel my Pro subscription at any time?',
    answer:
      'Yes, you can cancel your subscription at any time with 1 click from your Account settings. You will keep your Pro access until the end of your billing cycle.',
  },
];

export function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [openFaqId, setOpenFaqId] = useState<string | null>('1');

  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      toast('error', 'Please fill in your email and message.');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    const ticketId = `TICK-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedTicket(ticketId);
    setSubmitting(false);
    toast('success', 'Your message has been sent!');
    setMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--color-bg))]">
      <Header />

      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-12">
          {/* Header Title */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--color-text))] mb-2">
              Help &amp; Support
            </h1>
            <p className="text-sm sm:text-base text-[hsl(var(--color-text-muted))]">
              Find quick answers or send our team a message below.
            </p>
          </div>

          {/* FAQs on top */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[hsl(var(--color-text))] text-left">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2.5">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="card border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all shadow-sm"
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[hsl(var(--color-text))] hover:text-[hsl(var(--color-brand))] transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-[hsl(var(--color-brand))]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Send us a message card */}
          <div className="card p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2.5 mb-1.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-brand-light))] text-[hsl(var(--color-brand))] flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              <h2 className="text-lg font-bold text-[hsl(var(--color-text))]">
                Send us a message
              </h2>
            </div>
            <p className="text-xs text-[hsl(var(--color-text-muted))] mb-6 text-left">
              Have a specific question, feature request, or custom requirement? Drop us a note.
            </p>

            {submittedTicket ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your Ticket ID is{' '}
                    <strong className="font-mono">{submittedTicket}</strong>. We'll reply to{' '}
                    <strong className="font-medium">{email}</strong> shortly.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmittedTicket(null)}
                  className="border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                <div>
                  <Input
                    label="Your Name (Optional)"
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Your Email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold text-slate-700">
                    Topic / Category
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-brand))] focus:border-transparent"
                  >
                    <option value="general">General Inquiry / Feedback</option>
                    <option value="editor">Editor &amp; Transform Assistance</option>
                    <option value="billing">Billing &amp; Pro Subscription</option>
                    <option value="scenes">Custom Billboard Scene Request</option>
                    <option value="bug">Report a Bug / Glitch</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold text-slate-700">
                    How can we help?
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your question or issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-brand))] focus:border-transparent resize-none leading-relaxed"
                  />
                </div>

                <Button
                  type="submit"
                  loading={submitting}
                  size="md"
                  className="w-full font-semibold shadow-md shadow-[hsl(var(--color-brand))]/20 mt-2"
                >
                  <Send size={14} />
                  Submit Support Ticket
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
