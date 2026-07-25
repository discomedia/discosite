type BrandMarkProps = {
  compact?: boolean;
  invert?: boolean;
};

export function BrandMark({ compact = false, invert = false }: BrandMarkProps) {
  const textColor = invert ? "text-white" : "text-slate-950";
  const orbitId = invert ? "dm-brand-orbit-invert" : "dm-brand-orbit";
  const shadeId = invert ? "dm-brand-shade-invert" : "dm-brand-shade";
  const clipId = invert ? "dm-brand-globe-clip-invert" : "dm-brand-globe-clip";

  return (
    <span className="inline-flex items-center gap-3">
      <svg
        className={compact ? "h-9 w-9" : "h-11 w-11"}
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={shadeId} cx="35%" cy="25%" r="75%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.42" stopColor="#dbeafe" />
            <stop offset="0.78" stopColor="#64748b" />
            <stop offset="1" stopColor="#0f172a" />
          </radialGradient>
          <linearGradient id={orbitId} x1="6" y1="48" x2="59" y2="13">
            <stop offset="0" stopColor="#f59e0b" />
            <stop offset="0.48" stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
          <clipPath id={clipId}>
            <circle cx="29" cy="32" r="18" />
          </clipPath>
        </defs>
        <ellipse
          cx="31"
          cy="31"
          rx="30"
          ry="8"
          fill="none"
          opacity=".28"
          stroke={`url(#${orbitId})`}
          strokeLinecap="round"
          strokeWidth="2"
          transform="rotate(-24 31 31)"
        />
        <circle cx="29" cy="32" r="18" fill={`url(#${shadeId})`} stroke="#0f172a" strokeWidth="1.8" />
        <g clipPath={`url(#${clipId})`}>
          <g opacity=".34" stroke="#0f172a" strokeWidth=".8">
            <path d="M11 32h36M14 24h30M16 40h26M29 14v36M21 17c-6 10-6 20 0 30M37 17c6 10 6 20 0 30" />
          </g>
          <g opacity=".88">
            <rect x="22" y="18" width="6" height="6" fill="#f8fafc" />
            <rect x="29" y="18" width="6" height="6" fill="#bfdbfe" />
            <rect x="36" y="18" width="6" height="6" fill="#111827" />
            <rect x="16" y="25" width="6" height="6" fill="#e0f2fe" />
            <rect x="23" y="25" width="6" height="6" fill="#64748b" />
            <rect x="30" y="25" width="6" height="6" fill="#f8fafc" />
            <rect x="37" y="25" width="6" height="6" fill="#1f2937" />
            <rect x="17" y="32" width="6" height="6" fill="#f8fafc" />
            <rect x="24" y="32" width="6" height="6" fill="#111827" />
            <rect x="31" y="32" width="6" height="6" fill="#2563eb" />
            <rect x="38" y="32" width="6" height="6" fill="#cbd5e1" />
            <rect x="23" y="39" width="6" height="6" fill="#94a3b8" />
            <rect x="30" y="39" width="6" height="6" fill="#f8fafc" />
          </g>
          <path d="M17 22c5-4 12-6 20-6" fill="none" opacity=".58" stroke="#ffffff" strokeLinecap="round" strokeWidth="4" />
        </g>
        <path
          d="M8 44c4-4 9-7 14-10"
          fill="none"
          stroke={`url(#${orbitId})`}
          strokeLinecap="round"
          strokeWidth="2.8"
        />
        <path
          d="M43 23c5-2 10-3 14-3"
          fill="none"
          stroke={`url(#${orbitId})`}
          strokeLinecap="round"
          strokeWidth="2.8"
        />
        <g transform="translate(50 18) rotate(-22) scale(.27)">
          <path d="M-31-5h54L47 0 23 5h-54l-13 15h-11l14-20-14-20h11z" fill="#0f172a" />
          <path d="M-5-5 20-28h14L18 5z" fill="#1d4ed8" />
          <path d="M-5 5 20 28h14L18-5z" fill="#2563eb" />
          <path d="M-27-5-44-17h10l21 12zM-27 5-44 17h10l21-12z" fill="#0f172a" />
        </g>
      </svg>
      {!compact && (
        <span className={`text-xl font-black tracking-normal md:text-2xl ${textColor}`}>
          Disco Media
        </span>
      )}
    </span>
  );
}
