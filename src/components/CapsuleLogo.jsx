export default function CapsuleLogo({ size = 40, className = '' }) {
  const w = size;
  const h = size * 0.55;
  const rx = h / 2;
  return (
    <svg width={w} height={h} viewBox="0 0 72 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="capsule-grad" x1="0" y1="0" x2="72" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="capsule-half" x1="36" y1="0" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
      </defs>
      {/* capsule body */}
      <rect x="1" y="1" width="70" height="38" rx="19" fill="url(#capsule-grad)" />
      {/* lighter right half */}
      <clipPath id="right-half">
        <rect x="36" y="0" width="37" height="40" />
      </clipPath>
      <rect x="1" y="1" width="70" height="38" rx="19" fill="url(#capsule-half)" clipPath="url(#right-half)" />
      {/* dividing line */}
      <line x1="36" y1="5" x2="36" y2="35" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
      {/* medical cross */}
      <path d="M31 14v12M25 20h12" stroke="white" strokeWidth="3" strokeLinecap="round" />
      {/* subtle inner shadow */}
      <rect x="1" y="1" width="70" height="38" rx="19" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
    </svg>
  );
}
