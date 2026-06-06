import { Modal } from "../Modal/Modal";
import { Dialog } from "../Dialog/Dialog";
import { useSettings } from "../../hooks/useSettings";
import { MODE_LABELS, DIFFICULTY_LABELS, DIFFICULTY_ORDER } from "../../utils/display";
import type { ResourceMode, Difficulty } from "../../types";

const MODES: ResourceMode[] = ["release", "artist"];
const BLUR_OPTIONS = [
  { value: 2, label: "Léger" },
  { value: 4, label: "Normal" },
  { value: 6, label: "Fort" },
];

export function OptionsModal({ onClose }: { onClose: () => void }) {
  const { settings, setSetting } = useSettings();

  return (
    <Modal onClose={onClose} labelledBy="options-title">
      <Dialog
        title="Préférences"
        titleId="options-title"
        accent="blue"
        icon="⚙"
        actions={
          <button type="button" className="xp-button px-4 py-1.5" onClick={onClose}>
            Fermer
          </button>
        }
      >
        <form className="flex flex-col gap-4 text-[12px]">
          <div>
            <label htmlFor="opt-mode" className="mb-1 block font-semibold">
              Mode par défaut
            </label>
            <select
              id="opt-mode"
              className="xp-inset px-2 py-1"
              value={settings.defaultMode}
              onChange={(e) => setSetting("defaultMode", e.target.value as ResourceMode)}
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {MODE_LABELS[m]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="opt-diff" className="mb-1 block font-semibold">
              Difficulté par défaut
            </label>
            <select
              id="opt-diff"
              className="xp-inset px-2 py-1"
              value={settings.defaultDifficulty}
              onChange={(e) => setSetting("defaultDifficulty", e.target.value as Difficulty)}
            >
              {DIFFICULTY_ORDER.map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_LABELS[d]}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-1 font-semibold">Intensité du flou de la pochette</legend>
            <div className="flex gap-4">
              {BLUR_OPTIONS.map((b) => (
                <label key={b.value} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="blur"
                    value={b.value}
                    checked={settings.blurFactor === b.value}
                    onChange={() => setSetting("blurFactor", b.value)}
                  />
                  {b.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => setSetting("reducedMotion", e.target.checked)}
            />
            <span className="font-semibold">Réduire les animations</span>
          </label>

          <p className="m-0 text-[11px] text-[#5a5749]">
            Le mode et la difficulté par défaut s'appliquent au prochain lancement de l'application.
          </p>
        </form>
      </Dialog>
    </Modal>
  );
}
