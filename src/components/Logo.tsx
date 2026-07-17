interface LogoProps {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
  size?: number;
}

export function LogoMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="turboMarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--turbo-red-light)" />
          <stop offset="100%" stopColor="var(--turbo-red)" />
        </linearGradient>
      </defs>
      <path
        d="M6 18 L52 34 Q72 41 72 52 Q72 61 58 66 L94 78 L58 70 L34 96 L48 62 Q20 52 20 40 Z"
        fill="url(#turboMarkGradient)"
      />
    </svg>
  );
}

export default function Logo({
  className = "",
  markClassName,
  wordmark = true,
  size = 32,
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} className={markClassName} />
      {wordmark && (
        <span
          className="font-display tracking-wide text-white leading-none"
          style={{ fontSize: size * 0.62 }}
        >
          TURBO
        </span>
      )}
    </span>
  );
}
