export function LinkedInIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function CareerCraftLogo({ size = 28, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="goldHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE58F" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="goldInnerGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        {/* Outer stylized diamond/hexagon facets */}
        <path
          d="M16 2L28 8.5V23.5L16 30L4 23.5V8.5L16 2Z"
          stroke="url(#goldHexGrad)"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="rgba(245, 158, 11, 0.08)"
        />
        <path
          d="M16 6L24 10.8V21.2L16 26L8 21.2V10.8L16 6Z"
          fill="url(#goldHexGrad)"
          fillOpacity="0.85"
        />
        <path
          d="M16 11L20 13.5V18.5L16 21L12 18.5V13.5L16 11Z"
          fill="#05070B"
        />
        <circle cx="16" cy="16" r="2" fill="url(#goldHexGrad)" />
      </svg>
      {showText && (
        <span className="font-extrabold tracking-wider text-white text-base md:text-lg flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
          <span>CAREER</span>
          <span className="text-[#F59E0B]">CRAFT</span>
        </span>
      )}
    </div>
  );
}

