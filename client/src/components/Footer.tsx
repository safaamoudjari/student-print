import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-blush-100 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-8 text-center md:flex-row md:justify-between md:text-left">
        <Logo />
        <p className="text-sm font-semibold text-ink-400">
          Made for the girls in the residence, one print at a time 🎀
        </p>
      </div>
    </footer>
  );
}
