export function HeroVisual() {
  const tileRows = [
    { y: 158, x: 324, colors: ["#f8fafc", "#cbd5e1", "#e2e8f0", "#111827"] },
    { y: 198, x: 292, colors: ["#e0f2fe", "#64748b", "#f8fafc", "#1f2937", "#bfdbfe"] },
    { y: 238, x: 292, colors: ["#f8fafc", "#1f2937", "#2563eb", "#64748b", "#e2e8f0"] },
    { y: 278, x: 324, colors: ["#cbd5e1", "#111827", "#f8fafc", "#93c5fd"] },
  ];

  return (
    <div className="relative min-h-[360px] overflow-hidden bg-[radial-gradient(circle_at_60%_45%,#eff6ff_0,#ffffff_48%,#f8fafc_100%)]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 760 520" aria-hidden="true">
        <defs>
          <radialGradient id="globeShade" cx="34%" cy="24%" r="76%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.34" stopColor="#edf6ff" />
            <stop offset="0.67" stopColor="#8ea2b8" />
            <stop offset="1" stopColor="#0f172a" />
          </radialGradient>
          <linearGradient id="orbitStroke" x1="92" y1="402" x2="690" y2="122">
            <stop offset="0" stopColor="#f59e0b" />
            <stop offset="0.42" stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
          <clipPath id="heroGlobeClip">
            <circle cx="414" cy="260" r="152" />
          </clipPath>
        </defs>
        <ellipse
          cx="414"
          cy="260"
          rx="333"
          ry="87"
          fill="none"
          stroke="#dbeafe"
          strokeDasharray="2 12"
          strokeLinecap="round"
          strokeWidth="7"
          transform="rotate(-22 414 260)"
        />
        <ellipse
          cx="414"
          cy="260"
          rx="318"
          ry="78"
          fill="none"
          opacity=".36"
          stroke="url(#orbitStroke)"
          strokeLinecap="round"
          strokeWidth="3"
          transform="rotate(-22 414 260)"
        />
        <circle cx="414" cy="260" r="152" fill="url(#globeShade)" />
        <g clipPath="url(#heroGlobeClip)">
          <path d="M268 260h292M278 222h272M286 299h256" opacity=".28" stroke="#0f172a" strokeWidth="1" />
          <g opacity=".28" stroke="#0f172a" strokeWidth="1">
            {Array.from({ length: 7 }).map((_, i) => (
              <ellipse key={`lat-${i}`} cx="414" cy="260" rx="152" ry={30 + i * 17} fill="none" />
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <ellipse key={`lng-${i}`} cx="414" cy="260" rx={20 + i * 15} ry="152" fill="none" />
            ))}
          </g>
          <g opacity=".86">
            {tileRows.map((row) =>
              row.colors.map((fill, index) => (
                <rect
                  key={`${row.y}-${index}`}
                  x={row.x + index * 41}
                  y={row.y}
                  width="36"
                  height="36"
                  fill={fill}
                  opacity={fill === "#111827" || fill === "#1f2937" ? ".9" : ".82"}
                />
              )),
            )}
          </g>
          <path d="M303 190c28-22 68-35 111-35 74 0 135 48 151 113" fill="none" opacity=".42" stroke="#ffffff" strokeLinecap="round" strokeWidth="18" />
        </g>
        <circle cx="414" cy="260" r="152" fill="none" opacity=".34" stroke="#0f172a" strokeWidth="2" />
        <g opacity=".22" stroke="#ffffff" strokeWidth="1.4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse
              key={`glint-lat-${i}`}
              cx="414"
              cy="260"
              rx="152"
              ry={20 + i * 17}
              fill="none"
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse
              key={`glint-lng-${i}`}
              cx="414"
              cy="260"
              rx={18 + i * 16}
              ry="152"
              fill="none"
            />
          ))}
        </g>
        <path
          d="M101 390c45-34 90-63 136-87"
          fill="none"
          stroke="url(#orbitStroke)"
          strokeLinecap="round"
          strokeWidth="4.5"
        />
        <path
          d="M560 205c39-22 78-42 118-60"
          fill="none"
          stroke="url(#orbitStroke)"
          strokeLinecap="round"
          strokeWidth="4.5"
        />
        <g transform="translate(649 132) rotate(-22)">
          <path d="M-31-5h54L47 0 23 5h-54l-13 15h-11l14-20-14-20h11z" fill="#0f172a" />
          <path d="M-5-5 20-28h14L18 5z" fill="#1d4ed8" opacity=".95" />
          <path d="M-5 5 20 28h14L18-5z" fill="#1d4ed8" opacity=".82" />
          <path d="M-27-5-44-17h10l21 12zM-27 5-44 17h10l21-12z" fill="#0f172a" />
          <path d="M23-2h15" stroke="#ffffff" strokeLinecap="round" strokeWidth="2" opacity=".72" />
        </g>
      </svg>
    </div>
  );
}
