type BrandMarkProps = {
  compact?: boolean;
  invert?: boolean;
};

export function BrandMark({ compact = false, invert = false }: BrandMarkProps) {
  const textColor = invert ? "text-white" : "text-slate-950";

  return (
    <span className="inline-flex items-center gap-3">
      <svg
        className={compact ? "h-9 w-9" : "h-11 w-11"}
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="dm-brand-orbit" x1="8" y1="48" x2="58" y2="15">
            <stop offset="0" stopColor="#f59e0b" />
            <stop offset="0.55" stopColor="#06b6d4" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <circle cx="29" cy="32" r="18" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
        <path
          d="M10 42c14-14 31-23 47-24"
          fill="none"
          stroke="url(#dm-brand-orbit)"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path d="M47 13l11-5-5 11-2-5-6 5-2-2 6-5-2-2z" fill="#0f172a" />
        <g stroke="#0f172a" strokeWidth="1" opacity=".72">
          <path d="M12 32h34M15 24h28M17 40h24M29 14v36M21 17c-6 10-6 20 0 30M37 17c6 10 6 20 0 30" />
        </g>
        <g fill="#dbeafe" stroke="#0f172a" strokeWidth=".5">
          <rect x="23" y="18" width="6" height="6" />
          <rect x="30" y="18" width="6" height="6" fill="#e2e8f0" />
          <rect x="17" y="25" width="6" height="6" fill="#f8fafc" />
          <rect x="24" y="25" width="6" height="6" fill="#94a3b8" />
          <rect x="31" y="25" width="6" height="6" fill="#0f172a" />
          <rect x="38" y="25" width="6" height="6" fill="#cbd5e1" />
          <rect x="18" y="32" width="6" height="6" fill="#e2e8f0" />
          <rect x="25" y="32" width="6" height="6" fill="#0f172a" />
          <rect x="32" y="32" width="6" height="6" fill="#475569" />
          <rect x="23" y="39" width="6" height="6" fill="#f8fafc" />
          <rect x="30" y="39" width="6" height="6" fill="#94a3b8" />
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
