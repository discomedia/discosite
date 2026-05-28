export function HeroVisual() {
  return (
    <div className="relative min-h-[360px] overflow-hidden bg-[radial-gradient(circle_at_60%_45%,#eff6ff_0,#ffffff_48%,#f8fafc_100%)]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 760 520" aria-hidden="true">
        <defs>
          <radialGradient id="globeShade" cx="36%" cy="28%" r="72%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.42" stopColor="#d9e2ec" />
            <stop offset="0.76" stopColor="#64748b" />
            <stop offset="1" stopColor="#0f172a" />
          </radialGradient>
          <linearGradient id="orbitStroke" x1="105" y1="385" x2="690" y2="130">
            <stop offset="0" stopColor="#f59e0b" />
            <stop offset="0.45" stopColor="#06b6d4" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <path
          d="M84 148c185-68 402-75 600-20"
          fill="none"
          stroke="#dbeafe"
          strokeDasharray="2 10"
          strokeLinecap="round"
          strokeWidth="6"
        />
        <circle cx="414" cy="260" r="152" fill="url(#globeShade)" />
        <g opacity=".42" stroke="#0f172a" strokeWidth="1">
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse
              key={`lat-${i}`}
              cx="414"
              cy="260"
              rx="152"
              ry={20 + i * 17}
              fill="none"
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse
              key={`lng-${i}`}
              cx="414"
              cy="260"
              rx={18 + i * 16}
              ry="152"
              fill="none"
            />
          ))}
        </g>
        <g opacity=".8">
          <rect x="325" y="158" width="34" height="34" fill="#f8fafc" />
          <rect x="364" y="158" width="34" height="34" fill="#94a3b8" />
          <rect x="403" y="158" width="34" height="34" fill="#e2e8f0" />
          <rect x="442" y="158" width="34" height="34" fill="#0f172a" />
          <rect x="301" y="199" width="34" height="34" fill="#cbd5e1" />
          <rect x="340" y="199" width="34" height="34" fill="#475569" />
          <rect x="379" y="199" width="34" height="34" fill="#f8fafc" />
          <rect x="418" y="199" width="34" height="34" fill="#0f172a" />
          <rect x="457" y="199" width="34" height="34" fill="#94a3b8" />
          <rect x="300" y="240" width="34" height="34" fill="#f8fafc" />
          <rect x="339" y="240" width="34" height="34" fill="#0f172a" />
          <rect x="378" y="240" width="34" height="34" fill="#1d4ed8" />
          <rect x="417" y="240" width="34" height="34" fill="#475569" />
          <rect x="456" y="240" width="34" height="34" fill="#e2e8f0" />
          <rect x="323" y="281" width="34" height="34" fill="#cbd5e1" />
          <rect x="362" y="281" width="34" height="34" fill="#0f172a" />
          <rect x="401" y="281" width="34" height="34" fill="#f8fafc" />
          <rect x="440" y="281" width="34" height="34" fill="#94a3b8" />
        </g>
        <path
          d="M108 386c169-131 355-214 566-244"
          fill="none"
          stroke="url(#orbitStroke)"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path d="M638 126l52-24-23 52-10-23-29 24-9-9 29-24-10-10z" fill="#0f172a" />
      </svg>
    </div>
  );
}
