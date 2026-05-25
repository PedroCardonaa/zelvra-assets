// Animated radar disc used in empty states and the landing page.
// All animation is CSS — pure server component.

type Props = {
  size?: number;
  className?: string;
};

export function RadarIllustration({ size = 240, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      role="img"
      aria-label="Radar illustration"
      className={className}
    >
      <defs>
        <radialGradient id="zelvra-radar-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(74,222,128,0.18)" />
          <stop offset="60%" stopColor="rgba(74,222,128,0.05)" />
          <stop offset="100%" stopColor="rgba(74,222,128,0)" />
        </radialGradient>
        <linearGradient id="zelvra-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(74,222,128,0)" />
          <stop offset="100%" stopColor="rgba(74,222,128,0.55)" />
        </linearGradient>
      </defs>

      {/* Glow background */}
      <circle cx="120" cy="120" r="110" fill="url(#zelvra-radar-glow)" />

      {/* Concentric rings */}
      {[40, 70, 100].map((r) => (
        <circle
          key={r}
          cx="120"
          cy="120"
          r={r}
          fill="none"
          stroke="rgba(74,222,128,0.22)"
          strokeWidth="0.75"
        />
      ))}

      {/* Crosshair */}
      <line x1="120" y1="10" x2="120" y2="230" stroke="rgba(74,222,128,0.18)" strokeWidth="0.5" />
      <line x1="10" y1="120" x2="230" y2="120" stroke="rgba(74,222,128,0.18)" strokeWidth="0.5" />

      {/* Sweep arm — rotates */}
      <g style={{ transformOrigin: "120px 120px", animation: "radar-sweep-arm 5s linear infinite" }}>
        <path
          d="M 120 120 L 120 20 A 100 100 0 0 1 213 78 Z"
          fill="url(#zelvra-sweep)"
          opacity="0.6"
        />
        <line x1="120" y1="120" x2="120" y2="20" stroke="#4ade80" strokeWidth="1.2" />
      </g>

      {/* Pings (sample contacts) */}
      <circle cx="155" cy="80" r="3" fill="#4ade80" />
      <circle cx="155" cy="80" r="3" fill="rgba(74,222,128,0.5)" className="radar-ping" />
      <circle cx="78" cy="142" r="2.5" fill="#4ade80" />
      <circle cx="172" cy="160" r="2" fill="#4ade80" opacity="0.7" />

      {/* Outer ring */}
      <circle
        cx="120"
        cy="120"
        r="115"
        fill="none"
        stroke="rgba(74,222,128,0.3)"
        strokeWidth="1"
        strokeDasharray="2 6"
      />

      <style>{`
        @keyframes radar-sweep-arm {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}
