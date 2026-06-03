// Windows XP (Luna) titlebar. The min/max/close buttons are purely
// decorative, so they are aria-hidden and not focusable.

export function TitleBar() {
  return (
    <div className="xp-titlebar flex items-center gap-2 px-1.5 py-1 text-white">
      <span
        aria-hidden="true"
        className="grid h-[18px] w-[18px] place-items-center rounded-sm bg-white/90 text-[11px] font-bold text-xp-blue-deep shadow-inner"
      >
        ♪
      </span>
      <h1 className="m-0 flex-1 truncate font-trebuchet text-[13px] font-bold tracking-wide [text-shadow:1px_1px_1px_rgba(0,0,0,.45)]">
        MusicGuess — Un Jour, Une Ressource
      </h1>
      <div aria-hidden="true" className="flex items-center gap-1 pr-0.5">
        <span className="xp-caption-btn is-plain text-[10px]">_</span>
        <span className="xp-caption-btn is-plain text-[9px]">▢</span>
        <span className="xp-caption-btn is-close text-[10px]">✕</span>
      </div>
    </div>
  );
}
