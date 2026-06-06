import { Modal } from "../Modal/Modal";
import { Dialog } from "../Dialog/Dialog";
import { FEEDBACK_META } from "../../utils/display";
import type { FieldFeedback } from "../../types";

const LEGEND: FieldFeedback[] = ["correct", "partial", "wrong", "higher", "lower"];

export function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose} labelledBy="rules-title">
      <Dialog
        title="Règles du jeu"
        titleId="rules-title"
        accent="blue"
        icon="❔"
        actions={
          <button type="button" className="xp-button px-4 py-1.5" onClick={onClose}>
            Fermer
          </button>
        }
      >
        <div className="flex flex-col gap-3 text-[12px] leading-relaxed">
          <p className="m-0">
            Devinez la ressource mystère (album ou artiste) en proposant des
            candidats. Chaque proposition compare ses métadonnées à la cible,
            champ par champ.
          </p>
          <div>
            <h4 className="m-0 mb-1 font-semibold">Couleurs de feedback</h4>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {LEGEND.map((f) => {
                const meta = FEEDBACK_META[f];
                return (
                  <li key={f} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`grid h-5 w-5 place-items-center rounded-sm text-[11px] font-bold ${meta.cell}`}
                    >
                      {meta.icon}
                    </span>
                    <span>{meta.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="m-0">
            Modes : <strong>Release</strong> (album) et <strong>Artiste</strong>.
            Difficultés : Facile (illimité, pochette visible) à Expert (4 essais,
            pochette cachée). Le menu <strong>Jeu</strong> ou la barre d'outils
            permettent de les changer.
          </p>
        </div>
      </Dialog>
    </Modal>
  );
}
