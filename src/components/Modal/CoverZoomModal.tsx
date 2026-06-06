import { Modal } from "./Modal";

interface CoverZoomModalProps {
  src: string;
  title: string;
  /** Flou (px) à appliquer à l'image agrandie ; 0 ou absent = nette (révélée). */
  blurPx?: number;
  onClose: () => void;
}

// Fenêtre XP affichant une pochette en grand. Utilisée par le LCD (visible ou
// floutée en cours de partie, nette une fois révélée) et par la carte de
// révélation. En cours de partie le flou est conservé (mis à l'échelle par
// l'appelant) et le titre reste générique pour ne pas trahir la réponse.
export function CoverZoomModal({ src, title, blurPx, onClose }: CoverZoomModalProps) {
  const blurred = !!blurPx && blurPx > 0;
  return (
    <Modal onClose={onClose} ariaLabel={`Pochette agrandie : ${title}`} className="max-w-[95vw]">
      <div className="xp-window inline-block overflow-hidden">
        <div className="xp-titlebar flex items-center justify-between gap-3 px-2 py-1 text-white">
          <span className="truncate font-trebuchet text-[13px] font-bold [text-shadow:1px_1px_1px_rgba(0,0,0,.4)]">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="xp-caption-btn is-close text-[10px]"
          >
            ✕
          </button>
        </div>
        <div className="bg-black p-2">
          <img
            src={src}
            alt={blurred ? "" : `Pochette de ${title}`}
            aria-hidden={blurred || undefined}
            className={
              blurred
                ? "mx-auto block h-[420px] w-[420px] max-w-full object-cover"
                : "mx-auto block max-h-[70vh] w-auto max-w-full"
            }
            style={blurred ? { filter: `blur(${blurPx}px)` } : undefined}
            draggable={false}
          />
        </div>
      </div>
    </Modal>
  );
}
