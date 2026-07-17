const ACCENTS = [
  { from: "#f6060a", to: "#7a0305", glow: "#f6060a" },
  { from: "#ff8a3d", to: "#b8460a", glow: "#ff8a3d" },
  { from: "#3ddc97", to: "#0d7a52", glow: "#3ddc97" },
  { from: "#4fa3ff", to: "#0d4fa8", glow: "#4fa3ff" },
  { from: "#ffd23f", to: "#b8860a", glow: "#ffd23f" },
];

interface CarIllustrationProps {
  accent?: number;
  className?: string;
  label?: string;
}

export default function CarIllustration({
  accent = 0,
  className = "",
  label,
}: CarIllustrationProps) {
  const palette = ACCENTS[accent % ACCENTS.length];
  const gradId = `carGrad-${accent}-${label?.replace(/\s+/g, "") ?? "x"}`;
  const glowId = `carGlow-${accent}-${label?.replace(/\s+/g, "") ?? "x"}`;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-turbo-black-soft bg-grid ${className}`}
    >
      <div
        className="absolute h-40 w-40 rounded-full blur-3xl opacity-30"
        style={{ background: palette.glow }}
      />
      <svg viewBox="0 0 240 120" className="relative z-10 h-full w-full p-6">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.from} />
            <stop offset="100%" stopColor={palette.to} />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.5" />
            <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* speed lines */}
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={2}
            y1={30 + i * 10}
            x2={40 - i * 6}
            y2={30 + i * 10}
            stroke="white"
            strokeOpacity={0.15}
            strokeWidth={2}
          />
        ))}

        {/* ground shadow */}
        <ellipse cx="130" cy="98" rx="80" ry="8" fill="black" opacity="0.35" />

        {/* car body */}
        <path
          d="M35 90
             L45 68
             Q55 52 78 50
             L108 48
             Q118 36 138 36
             L160 36
             Q176 36 184 50
             L200 58
             Q214 62 214 76
             L214 90
             Z"
          fill={`url(#${gradId})`}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="1.5"
        />
        {/* cabin glass */}
        <path
          d="M112 49
             Q120 39 137 39
             L157 39
             Q170 39 178 49
             L178 51
             L112 51
             Z"
          fill="#0e1112"
          opacity="0.85"
        />
        {/* window split */}
        <line x1="146" y1="39" x2="146" y2="51" stroke="#332" strokeOpacity="0.4" />

        {/* wheels */}
        <circle cx="76" cy="92" r="14" fill="#0c0a0a" />
        <circle cx="76" cy="92" r="6.5" fill="#b9b3b0" />
        <circle cx="182" cy="92" r="14" fill="#0c0a0a" />
        <circle cx="182" cy="92" r="6.5" fill="#b9b3b0" />

        {/* headlight */}
        <circle cx="211" cy="70" r="3.5" fill="white" opacity="0.9" />
        <path d="M214 66 L232 60" stroke="white" strokeOpacity="0.25" strokeWidth="2" />

        {/* accent stripe */}
        <path
          d="M50 78 L200 78"
          stroke="white"
          strokeOpacity="0.18"
          strokeWidth="3"
        />
      </svg>

      {label && (
        <span className="absolute bottom-2 right-3 font-display text-[10px] uppercase tracking-widest text-white/25">
          TURBO
        </span>
      )}
    </div>
  );
}
