/**
 * ClientFlow logo mark — a stacked-document / ledger icon.
 * Visually distinct from RoomPulse's energy/pulse style.
 */
export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-primary text-primary-foreground select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Back document */}
        <rect x="6" y="3" width="14" height="18" rx="2" opacity="0.4" />
        {/* Front document */}
        <rect x="4" y="5" width="14" height="18" rx="2" fill="currentColor" stroke="none" opacity="0.15" />
        <rect x="4" y="5" width="14" height="18" rx="2" />
        {/* Ledger lines */}
        <line x1="8" y1="11" x2="14" y2="11" />
        <line x1="8" y1="15" x2="14" y2="15" />
        <line x1="8" y1="19" x2="11" y2="19" />
      </svg>
    </div>
  );
}
