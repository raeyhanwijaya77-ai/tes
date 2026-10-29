export default function Cyborg({ className = '' }) {
  return (
    <svg className={'cyborg ' + className} viewBox="0 0 320 340" fill="none" aria-hidden="true">
      <g className="cy-ring">
        <circle cx="160" cy="165" r="150" stroke="var(--acc)" strokeOpacity=".35" strokeDasharray="4 10" />
        <circle cx="160" cy="165" r="128" stroke="var(--lime)" strokeOpacity=".3" strokeDasharray="30 14" />
      </g>
      <path d="M40 330c0-52 38-84 120-84s120 32 120 84z" fill="var(--panel-solid)" stroke="var(--acc)" strokeWidth="3" />
      <path d="M92 330v-60M228 330v-60M120 262l40 22 40-22" stroke="var(--line)" strokeWidth="2" />
      <circle className="cy-core" cx="160" cy="304" r="13" fill="var(--lime)" />
      <circle cx="160" cy="304" r="21" stroke="var(--lime)" strokeOpacity=".5" strokeWidth="2" />
      <rect x="140" y="214" width="40" height="34" rx="6" fill="var(--panel-solid)" stroke="var(--acc)" strokeWidth="2.5" />
      <path d="M148 222v22M160 222v22M172 222v22" stroke="var(--line)" strokeWidth="2" />
      <line x1="160" y1="24" x2="160" y2="52" stroke="var(--acc)" strokeWidth="3" />
      <circle className="ant" cx="160" cy="18" r="7" fill="var(--lime)" />
      <rect x="86" y="50" width="148" height="170" rx="30" fill="var(--panel-solid)" stroke="var(--acc)" strokeWidth="4" />
      <rect x="70" y="104" width="16" height="56" rx="6" fill="var(--acc)" />
      <rect x="234" y="104" width="16" height="56" rx="6" fill="var(--acc)" />
      <path d="M110 74h30l10-10h20l10 10h30" stroke="var(--lime)" strokeOpacity=".75" strokeWidth="2" />
      <circle cx="110" cy="74" r="3" fill="var(--lime)" /><circle cx="210" cy="74" r="3" fill="var(--lime)" />
      <rect x="104" y="92" width="112" height="56" rx="16" fill="var(--bg)" stroke="var(--line)" strokeWidth="2" />
      <g className="eyes2"><rect x="120" y="108" width="28" height="24" rx="6" fill="var(--acc)" /><rect x="172" y="108" width="28" height="24" rx="6" fill="var(--acc)" /></g>
      <rect className="cy-scan" x="104" y="92" width="14" height="56" rx="7" fill="var(--lime)" opacity=".45" />
      <path d="M124 176h72M132 190h56M142 204h36" stroke="var(--acc)" strokeWidth="3" strokeLinecap="round" opacity=".85" />
      <path d="M96 196l16 12M224 196l-16 12" stroke="var(--lime)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
