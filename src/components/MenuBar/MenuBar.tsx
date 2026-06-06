import { useState } from "react";
import { MODE_LABELS, DIFFICULTY_LABELS, DIFFICULTY_ORDER } from "../../utils/display";
import { useSettings } from "../../hooks/useSettings";
import { Menu } from "../Menu/Menu";
import type { MenuItem } from "../Menu/Menu";
import type { ResourceMode, Difficulty } from "../../types";

const MODES: ResourceMode[] = ["release", "artist"];

interface MenuBarProps {
  date: string;
  mode: ResourceMode;
  difficulty: Difficulty;
  isDaily: boolean;
  onModeChange: (m: ResourceMode) => void;
  onDifficultyChange: (d: Difficulty) => void;
  onDaily: () => void;
  onNewRandom: () => void;
  onReplay: () => void;
  onOpenRules: () => void;
  onOpenAbout: () => void;
  onOpenOptions: () => void;
}

// XP menubar: real dropdown menus driving the game actions and opening the
// help/options pages; session info sits on the right.
export function MenuBar({
  date,
  mode,
  difficulty,
  isDaily,
  onModeChange,
  onDifficultyChange,
  onDaily,
  onNewRandom,
  onReplay,
  onOpenRules,
  onOpenAbout,
  onOpenOptions,
}: MenuBarProps) {
  const { settings, setSetting } = useSettings();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menus: { label: string; items: MenuItem[] }[] = [
    {
      label: "Fichier",
      items: [
        { kind: "action", label: "Partie du jour", onSelect: onDaily },
        { kind: "action", label: "Nouvelle partie aléatoire", onSelect: onNewRandom },
        { kind: "separator" },
        { kind: "action", label: "Fermer", onSelect: () => {}, disabled: true },
      ],
    },
    {
      label: "Jeu",
      items: [
        { kind: "header", label: "Ressource" },
        ...MODES.map(
          (m): MenuItem => ({
            kind: "radio",
            label: MODE_LABELS[m],
            checked: mode === m,
            onSelect: () => onModeChange(m),
          })
        ),
        { kind: "separator" },
        { kind: "header", label: "Difficulté" },
        ...DIFFICULTY_ORDER.map(
          (d): MenuItem => ({
            kind: "radio",
            label: DIFFICULTY_LABELS[d],
            checked: difficulty === d,
            onSelect: () => onDifficultyChange(d),
          })
        ),
        { kind: "separator" },
        { kind: "action", label: "Rejouer", onSelect: onReplay },
      ],
    },
    {
      label: "Options",
      items: [{ kind: "action", label: "Préférences…", onSelect: onOpenOptions }],
    },
    {
      label: "Affichage",
      items: [
        {
          kind: "toggle",
          label: "Réduire les animations",
          checked: settings.reducedMotion,
          onSelect: () => setSetting("reducedMotion", !settings.reducedMotion),
        },
        { kind: "separator" },
        { kind: "action", label: "Préférences…", onSelect: onOpenOptions },
      ],
    },
    {
      label: "?",
      items: [
        { kind: "action", label: "Règles du jeu", onSelect: onOpenRules },
        { kind: "separator" },
        { kind: "action", label: "À propos", onSelect: onOpenAbout },
      ],
    },
  ];

  return (
    <div className="xp-panel flex items-center justify-between px-1 text-[12px]">
      <nav aria-label="Menu principal" className="flex">
        {menus.map((m) => (
          <Menu
            key={m.label}
            label={m.label}
            items={m.items}
            isOpen={openMenu === m.label}
            anyOpen={openMenu !== null}
            onOpen={() => setOpenMenu(m.label)}
            onClose={() => setOpenMenu(null)}
          />
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
