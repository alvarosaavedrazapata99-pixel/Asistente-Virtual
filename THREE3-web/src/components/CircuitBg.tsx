/** Red de circuitos de fondo, común a toda la web. */
export function CircuitBg({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 800 450"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#22d3ee" strokeOpacity=".06" />
        </pattern>
      </defs>
      <rect width="800" height="450" fill="url(#grid)" />
      <g fill="none" stroke="#22d3ee" strokeOpacity=".35" strokeWidth="1.5">
        <path d="M0 90H160L200 130H360" />
        <path d="M800 60H640L600 100H520" />
        <path d="M0 340H120L160 300H300" />
        <path d="M800 380H680L640 340H560" />
        <path d="M400 0V60L440 100V160" />
      </g>
      <g fill="#22d3ee" fillOpacity=".7">
        {[
          [360, 130],
          [520, 100],
          [300, 300],
          [560, 340],
          [440, 160],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" />
        ))}
      </g>
    </svg>
  );
}
