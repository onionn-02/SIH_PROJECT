/** The Fasal Flow badge mark — a farmer silhouette on a two-tone green circle. */
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
        <linearGradient id="fasal-flow-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7CB86B" />
          <stop offset="1" stopColor="#1B4D3E" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#fasal-flow-badge)" />
      {/* wheat sprig accent */}
      <g stroke="#E8C878" strokeWidth="2.5" strokeLinecap="round">
        <line x1="76" y1="70" x2="82" y2="60" />
        <ellipse cx="79.5" cy="63" rx="2.6" ry="4" fill="#E8C878" stroke="none" />
        <ellipse cx="82.5" cy="58" rx="2.6" ry="4" fill="#E8C878" stroke="none" />
        <ellipse cx="76.5" cy="59" rx="2.6" ry="4" fill="#E8C878" stroke="none" />
      </g>
      {/* farmer silhouette */}
      <path
        d="M27 80 Q27 54 50 54 Q73 54 73 80 Z"
        fill="#F5F1E8"
      />
      <circle cx="50" cy="41" r="13" fill="#F5F1E8" />
      <path d="M33 33 Q33 17 50 17 Q67 17 67 33 Q59 28 50 28 Q41 28 33 33 Z" fill="#F5F1E8" />
      <ellipse cx="50" cy="33" rx="19" ry="4.5" fill="#F5F1E8" />
    </svg>
  );
}
