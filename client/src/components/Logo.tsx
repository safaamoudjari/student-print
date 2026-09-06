export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500 shadow-blush">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="3" width="14" height="7" rx="2" fill="#FFF3F7" />
          <rect x="3" y="9" width="18" height="9" rx="2.5" fill="#FFF3F7" />
          <rect x="7" y="15" width="10" height="6" rx="1.5" fill="#F0518C" />
          <circle cx="17" cy="12.2" r="1.1" fill="#F0518C" />
        </svg>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-lavender-300" />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-ink-700">
        Print<span className="text-rose-500">Pop</span>
      </span>
    </span>
  );
}
