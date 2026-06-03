import { MODE_LABELS } from "../../utils/display";
import type { ResourceMode } from "../../types";

const MENUS = ["Fichier", "Jeu", "Options", "Affichage", "?"];

interface MenuBarProps {
  date: string;
  mode: ResourceMode;
  isDaily: boolean;
}

// XP menubar. Menus are decorative (no dropdowns) but kept as buttons so they
// read as an interactive menu strip; session info sits on the right.
export function MenuBar({ date, mode, isDaily }: MenuBarProps) {
  return (
    <div className="xp-panel flex items-center justify-between px-1 text-[12px]">
      <nav aria-label="Menu principal" className="flex">
        {MENUS.map((label) => (
          <button
            key={label}
            type="button"
            className="rounded-sm px-2 py-0.5 hover:bg-[#c2d4ee] focus-visible:bg-[#c2d4ee] focus-visible:outline-none"
          >
            {label}
          </button>
        ))}
      </nav>
      <p className="m-0 px-2 text-[11px] text-[#5a5749]">
        <span className="font-semibold">Seed :</span> {isDaily ? date : "aléatoire"}
        <span className="px-1 text-[#aca899]">·</span>
        {MODE_LABELS[mode]}
      </p>
    </div>
  );
}
