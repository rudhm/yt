function AnimatedLogo() {
  return (
    <svg
      className="brand-logo"
      viewBox="0 0 96 96"
      role="img"
      aria-label="lapop logo"
    >
      <defs>
        <linearGradient id="lapopLogoGradient" x1="16" y1="16" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="100%" stopColor="#ff9a3d" />
        </linearGradient>
      </defs>

      <circle className="logo-orbit-base" cx="48" cy="48" r="30" />
      <path className="logo-orbit-accent" d="M48 18 A30 30 0 1 1 22 63" />
      <path className="logo-play-core" d="M41 34 L64 48 L41 62 Z" />
      <circle className="logo-dot" cx="24" cy="48" r="4" />
      <path className="logo-wave" d="M23 64 C35 73, 61 73, 73 64" />
    </svg>
  );
}

export default AnimatedLogo;
