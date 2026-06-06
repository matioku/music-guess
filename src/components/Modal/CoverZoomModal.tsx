import { Modal } from "./Modal";

interface CoverZoomModalProps {
  src: string;
  title: string;
  onClose: () => void;
}

// Fenêtre XP affichant une pochette en grand. Utilisée par le LCD (une fois
// la ressource révélée) et par la carte de révélation.
export function CoverZoomModal({ src, title, onClose }: CoverZoomModalProps) {
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
            alt={`Pochette de ${title}`}
            className="mx-auto block max-h-[70vh] w-auto max-w-full"
            draggable={false}
          />
        </div>
      </div>
    </Modal>
  );
}
