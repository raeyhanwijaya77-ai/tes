export default function Avatar({ src, name = '?', size = 38 }) {
  const s = { width: size, height: size, fontSize: Math.round(size * 0.42) };
  return <span className="av" style={s}>{src ? <img src={src} alt="" /> : String(name || '?')[0].toUpperCase()}</span>;
}
