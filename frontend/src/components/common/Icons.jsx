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
      <img
        src="/careercraft_logo.jpg"
        alt="CareerCraft"
        className="rounded-full object-cover flex-shrink-0 ring-1 ring-[#F5BF45]/40 shadow-[0_0_12px_rgba(245,191,69,0.25)]"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className="font-extrabold tracking-wider text-white text-base md:text-lg flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
          <span>CAREER</span>
          <span className="text-[#F5BF45]">CRAFT</span>
        </span>
      )}
    </div>
  );
}


