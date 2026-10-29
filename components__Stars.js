export default function Stars({ n = 0 }) {
  const k = Math.max(0, Math.min(5, Math.round(n)));
  return <span className="stars" aria-label={k + ' dari 5 bintang'}>{'★'.repeat(k)}<i>{'★'.repeat(5 - k)}</i></span>;
}
