export default function Robot({ size = 120, className = '' }) {
  return (
    <svg className={'robot ' + className} width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <line x1="60" y1="9" x2="60" y2="22" stroke="var(--acc)" strokeWidth="3" />
      <circle className="ant" cx="60" cy="8" r="5" fill="var(--lime)" />
      <rect x="22" y="22" width="76" height="62" rx="14" fill="var(--panel-solid)" stroke="var(--acc)" strokeWidth="3" />
      <rect x="32" y="37" width="56" height="28" rx="8" fill="var(--bg)" stroke="var(--line)" strokeWidth="2" />
      <g className="eyes"><rect x="40" y="45" width="12" height="12" rx="3" fill="var(--acc)" /><rect x="68" y="45" width="12" height="12" rx="3" fill="var(--acc)" /></g>
      <path d="M46 73h28" stroke="var(--lime)" strokeWidth="3" strokeLinecap="round" />
      <rect x="11" y="44" width="8" height="22" rx="3" fill="var(--acc)" />
      <rect x="101" y="44" width="8" height="22" rx="3" fill="var(--acc)" />
      <rect x="40" y="88" width="40" height="22" rx="6" fill="var(--panel-solid)" stroke="var(--acc)" strokeWidth="3" />
      <circle className="ant" cx="60" cy="99" r="4" fill="var(--lime)" />
    </svg>
  );
}
