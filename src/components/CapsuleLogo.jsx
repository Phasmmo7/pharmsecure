export default function CapsuleLogo({ size = 40, className = '' }) {
  const w = size;
  const h = size * 0.55;
  return (
    <svg width={w} height={h} viewBox="0 0 72 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="capsule-grad" x1="0" y1="0" x2="72" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a634a" />
          <stop offset="50%" stopColor="#98d3b4" />
          <stop offset="100%" stopColor="#98d3b4" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="70" height="38" rx="19" fill="url(#capsule-grad)" />
      <line x1="36" y1="5" x2="36" y2="35" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
      <path d="M31 14v12M25 20h12" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <rect x="1" y="1" width="70" height="38" rx="19" stroke="rgba(152,211,180,0.4)" strokeWidth="1" fill="none" />
    </svg>
  );
}
