import { Link } from 'react-router-dom';
import { Upload, Sliders, ReceiptText, PackageCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  {
    icon: Upload,
    title: 'Upload your document',
    text: 'Send your PDF, Word file or photo straight from your phone — no need to leave your room.',
  },
  {
    icon: Sliders,
    title: 'Choose printing options',
    text: 'Pick black & white or color, single or double-sided, and how many copies you need.',
  },
  {
    icon: ReceiptText,
    title: 'Review the price and confirm',
    text: 'See exactly how your total was calculated before you confirm — no surprises.',
  },
  {
    icon: PackageCheck,
    title: 'Collect your printed documents',
    text: "We'll update your order status the moment it's ready to pick up.",
  },
];

function HeroIllustration() {
  return (
    <div className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80">
      <div className="absolute inset-0 rounded-full bg-blush-100" />
      <div className="absolute -left-4 top-6 h-16 w-16 rounded-3xl bg-lavender-200 animate-floaty" />
      <div
        className="absolute -right-2 bottom-10 h-12 w-12 rounded-full bg-mint-100 animate-floaty"
        style={{ animationDelay: '1.2s' }}
      />
      <svg
        viewBox="0 0 220 220"
        className="absolute inset-6 drop-shadow-[0_18px_30px_rgba(217,61,118,0.25)]"
        aria-hidden="true"
      >
        {/* paper stack behind the printer */}
        <rect x="55" y="18" width="70" height="88" rx="8" fill="#FFFFFF" stroke="#FFD0E2" strokeWidth="3" />
        <rect x="65" y="34" width="50" height="6" rx="3" fill="#FFD0E2" />
        <rect x="65" y="48" width="50" height="6" rx="3" fill="#FFE3EE" />
        <rect x="65" y="62" width="34" height="6" rx="3" fill="#FFE3EE" />

        {/* printer body */}
        <rect x="30" y="98" width="160" height="70" rx="18" fill="#F0518C" />
        <rect x="30" y="98" width="160" height="70" rx="18" fill="url(#printerShine)" />
        <rect x="52" y="112" width="116" height="18" rx="6" fill="#FFB3D0" />
        <circle cx="166" cy="121" r="4" fill="#FFF3F7" />

        {/* printed sheet coming out */}
        <rect x="66" y="150" width="88" height="52" rx="6" fill="#FFFFFF" stroke="#FFD0E2" strokeWidth="3" />
        <rect x="78" y="164" width="64" height="5" rx="2.5" fill="#DCD0F5" />
        <rect x="78" y="176" width="50" height="5" rx="2.5" fill="#FFE3EE" />
        <rect x="78" y="188" width="40" height="5" rx="2.5" fill="#FFE3EE" />

        {/* stand feet */}
        <rect x="46" y="168" width="10" height="14" rx="3" fill="#B62E60" />
        <rect x="164" y="168" width="10" height="14" rx="3" fill="#B62E60" />

        <defs>
          <linearGradient id="printerShine" x1="30" y1="98" x2="190" y2="168" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute -top-2 right-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-blush animate-floaty">
        <Sparkles size={18} />
      </span>
    </div>
  );
}

export function Landing() {
  const { user } = useAuth();
  const startHref = user ? '/dashboard/new-order' : '/register';

  return (
    <div>
      <section className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 px-5 pb-16 pt-10 md:flex-row md:pb-24 md:pt-16">
        <div className="max-w-xl text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lavender-100 px-4 py-1.5 text-xs font-extrabold text-lavender-500">
            For the girls at the residence
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink-700 sm:text-5xl">
            Print your documents easily from your residence
          </h1>
          <p className="mt-4 text-base font-semibold leading-relaxed text-ink-500 sm:text-lg">
            Upload your files, choose your printing options, see the price instantly, and collect
            your order when it's ready.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              to={startHref}
              className="inline-flex items-center justify-center rounded-full bg-rose-500 px-7 py-3.5 text-sm font-bold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-rose-600"
            >
              Start Printing
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center rounded-full border-2 border-blush-200 bg-white px-7 py-3.5 text-sm font-bold text-ink-600 transition hover:border-rose-300 hover:text-rose-600"
            >
              View Prices
            </Link>
          </div>
        </div>
        <HeroIllustration />
      </section>

      <section id="how-it-works" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold">How it works</h2>
            <p className="mt-2 text-sm font-semibold text-ink-400">
              Four simple steps between your room and your printed pages.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-3xl border border-blush-100 bg-cream p-6 transition hover:-translate-y-1 hover:shadow-soft"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500 text-white">
                  <step.icon size={20} />
                </span>
                <p className="font-display text-sm font-semibold text-rose-500">Step {i + 1}</p>
                <h3 className="mt-1 font-display text-base font-semibold text-ink-700">{step.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-ink-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 text-center">
        <div className="rounded-4xl bg-lavender-100 px-6 py-12 sm:px-14">
          <h2 className="text-2xl font-semibold sm:text-3xl">Ready for your first order?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-ink-500">
            It takes less than a minute to upload, calculate your price, and confirm.
          </p>
          <Link
            to={startHref}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-500 px-8 py-3.5 text-sm font-bold text-white shadow-blush transition hover:-translate-y-0.5 hover:bg-rose-600"
          >
            Start Printing
          </Link>
        </div>
      </section>
    </div>
  );
}
