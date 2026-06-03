// WMP-style equalizer bars. Purely decorative animation; hidden from
// assistive tech. Staggered delays give the bouncing-VU-meter feel.
const BARS = [0, 0.12, 0.24, 0.36, 0.18, 0.06, 0.3, 0.42, 0.15, 0.27, 0.09, 0.33];

export function Equalizer({ tall = false }: { tall?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-end gap-[3px] ${tall ? "h-10" : "h-5"}`}
    >
      {BARS.map((delay, i) => (
        <span
          key={i}
          className="eq-bar h-full animate-eq"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );
}
