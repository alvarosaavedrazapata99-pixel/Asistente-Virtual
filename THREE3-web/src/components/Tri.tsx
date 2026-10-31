type Props = { size?: number; className?: string; variant?: "render" | "boceto" };

/** Tri, el robot-árbol de THREE3. La antena SIEMPRE lleva tres bolitas. */
export function Tri({ size = 160, className, variant = "render" }: Props) {
  const boceto = variant === "boceto";
  const fill = (c: string) => (boceto ? "none" : c);
  const line = boceto ? "#f1e8dc" : "#071022";
  const sw = boceto ? 2 : 3;
  return (
    <svg
      viewBox="0 0 200 240"
      width={size}
      height={size * 1.2}
      className={className}
      role="img"
      aria-label="Tri, mascota de THREE3, con antena de tres bolitas"
    >
      {!boceto && (
        <defs>
          <linearGradient id="tri-body" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#2a8bff" />
            <stop offset="1" stopColor="#1a6bff" />
          </linearGradient>
          <radialGradient id="tri-glow" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#22d3ee" stopOpacity=".9" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      {/* antena: tallo + tres bolitas */}
      <g stroke={boceto ? "#f1e8dc" : "#22d3ee"} strokeWidth={sw} fill="none" strokeLinecap="round">
        <path d="M100 62 V30" />
        <path d="M100 44 L72 34" />
        <path d="M100 44 L128 34" />
      </g>
      {[
        [100, 22],
        [68, 31],
        [132, 31],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="8"
          fill={fill("#ff7a3d")}
          stroke={boceto ? "#f1e8dc" : "#071022"}
          strokeWidth={sw}
        />
      ))}
      {/* cabeza */}
      <rect x="40" y="62" width="120" height="96" rx="28" fill={boceto ? "none" : "url(#tri-body)"} stroke={line} strokeWidth={sw} />
      <rect x="56" y="82" width="88" height="54" rx="18" fill={fill("#071022")} stroke={boceto ? "#f1e8dc" : "none"} strokeWidth={sw} />
      <circle cx="82" cy="108" r="9" fill={fill("#22d3ee")} stroke={boceto ? "#f1e8dc" : "none"} strokeWidth={sw} />
      <circle cx="118" cy="108" r="9" fill={fill("#22d3ee")} stroke={boceto ? "#f1e8dc" : "none"} strokeWidth={sw} />
      {!boceto && <ellipse cx="100" cy="108" rx="70" ry="30" fill="url(#tri-glow)" opacity=".25" />}
      <path d="M88 126 Q100 134 112 126" fill="none" stroke={boceto ? "#f1e8dc" : "#22d3ee"} strokeWidth={sw} strokeLinecap="round" />
      {/* cuerpo */}
      <rect x="62" y="162" width="76" height="52" rx="18" fill={boceto ? "none" : "#f1e8dc"} stroke={line} strokeWidth={sw} />
      <path d="M100 172 V204 M100 186 L84 178 M100 194 L116 186" stroke={boceto ? "#f1e8dc" : "#1a6bff"} strokeWidth={sw} fill="none" strokeLinecap="round" />
      <circle cx="84" cy="178" r="3.5" fill={fill("#ff7a3d")} />
      <circle cx="116" cy="186" r="3.5" fill={fill("#ff7a3d")} />
      {/* brazos y pies */}
      <rect x="36" y="170" width="22" height="34" rx="11" fill={fill("#1a6bff")} stroke={line} strokeWidth={sw} />
      <rect x="142" y="170" width="22" height="34" rx="11" fill={fill("#1a6bff")} stroke={line} strokeWidth={sw} />
      <rect x="66" y="214" width="26" height="14" rx="7" fill={fill("#ff7a3d")} stroke={line} strokeWidth={sw} />
      <rect x="108" y="214" width="26" height="14" rx="7" fill={fill("#ff7a3d")} stroke={line} strokeWidth={sw} />
    </svg>
  );
}
