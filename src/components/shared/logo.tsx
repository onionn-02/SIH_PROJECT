/** The Fasal Flow mark — a smiling sprout mascot cradled by two leaves. */
export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Fasal Flow"
    >
      <defs>
        <linearGradient id="fasal-flow-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FCB7E" />
          <stop offset="1" stopColor="#1F5C3F" />
        </linearGradient>
        <linearGradient id="fasal-flow-leaf-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6FAE5E" />
          <stop offset="1" stopColor="#1B4D3E" />
        </linearGradient>
        <linearGradient id="fasal-flow-leaf-r" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6FAE5E" />
          <stop offset="1" stopColor="#1B4D3E" />
        </linearGradient>
      </defs>

      <rect x="3" y="3" width="94" height="94" rx="26" fill="#F5F1E8" />

      {/* sparkle accents */}
      <g fill="#EFB94B">
        <path d="M20 27 L22.3 32.2 L27.5 34.5 L22.3 36.8 L20 42 L17.7 36.8 L12.5 34.5 L17.7 32.2 Z" />
        <path d="M80 22 L81.6 25.6 L85.2 27.2 L81.6 28.8 L80 32.4 L78.4 28.8 L74.8 27.2 L78.4 25.6 Z" />
      </g>

      {/* base leaves (arms) */}
      <path
        d="M50 64 C 36 62 20 68 14 84 C 30 88 46 82 50 64 Z"
        fill="url(#fasal-flow-leaf-l)"
      />
      <path d="M22 80 C 32 76 42 72 49 65" stroke="#8FCB7E" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
      <path
        d="M50 64 C 64 62 80 68 86 84 C 70 88 54 82 50 64 Z"
        fill="url(#fasal-flow-leaf-r)"
      />
      <path d="M78 80 C 68 76 58 72 51 65" stroke="#8FCB7E" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* head / sprout */}
      <path
        d="M50 10 C 63 22 76 32 76 47 C 76 60.5 64.5 69 50 69 C 35.5 69 24 60.5 24 47 C 24 32 37 22 50 10 Z"
        fill="url(#fasal-flow-leaf)"
      />
      <path
        d="M50 10 C 55 20 57.5 33 57.5 47 C 57.5 56 54.5 63.5 50 69"
        stroke="#1B4D3E"
        strokeWidth="1.3"
        fill="none"
        opacity="0.35"
      />

      {/* face */}
      <circle cx="50" cy="47" r="17" fill="#F9F5EC" />
      <g stroke="#2A5C42" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M42.5 44.5 Q45 47.5 47.5 44.5" />
        <path d="M52.5 44.5 Q55 47.5 57.5 44.5" />
        <path d="M44.5 52 Q50 57 55.5 52" />
      </g>
      <g fill="#F0A868" opacity="0.55">
        <ellipse cx="38.5" cy="50" rx="3.2" ry="2" />
        <ellipse cx="61.5" cy="50" rx="3.2" ry="2" />
      </g>
    </svg>
  );
}
