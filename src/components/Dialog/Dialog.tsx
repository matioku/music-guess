interface DialogProps {
  title: string;
  /** id du titre, pour aria-labelledby quand utilisé dans un Modal. */
  titleId?: string;
  accent: "blue" | "red" | "green";
  icon?: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}

const TITLEBAR: Record<DialogProps["accent"], string> = {
  blue: "xp-titlebar",
  green: "bg-gradient-to-b from-[#7bd06f] via-[#3c9a3c] to-[#2c7a2c]",
  red: "bg-gradient-to-b from-[#e98b7e] via-[#d44a32] to-[#b22a14]",
};

// XP-style window frame (raised window + caption bar). Purely presentational:
// used inline (victory/defeat banners) and inside the Modal overlay (pages).
export function Dialog({ title, titleId, accent, icon, children, actions }: DialogProps) {
  return (
    <div className="xp-window mt-2 overflow-hidden">
      <div
        className={`flex items-center gap-2 rounded-t-[7px] px-2 py-1 text-white [text-shadow:1px_1px_1px_rgba(0,0,0,.4)] ${TITLEBAR[accent]}`}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        <h3 id={titleId} className="m-0 font-trebuchet text-[13px] font-bold">
          {title}
        </h3>
      </div>
      <div className="bg-xp-beige p-4">
        {children}
        <div className="mt-4 flex flex-wrap justify-end gap-2">{actions}</div>
      </div>
    </div>
  );
}
