export function LogoMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-opacity duration-300 hover:opacity-80 ${className}`}
    >
      {/* Rounded square background */}
      <rect x="1" y="1" width="26" height="26" rx="7" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.1" strokeWidth="1"/>

      {/* > chevron */}
      <path
        d="M8 10l5 4-5 4"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* _ underscore cursor */}
      <line
        x1="15"
        y1="18"
        x2="20"
        y2="18"
        stroke="rgb(34,211,238)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoFull({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={24} />
      <span className="text-sm font-semibold tracking-tight">DevPitch Pro</span>
    </div>
  );
}
