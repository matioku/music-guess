import { Modal } from "../Modal/Modal";
import { Dialog } from "../Dialog/Dialog";

export function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose} labelledBy="about-title">
      <Dialog
        title="À propos"
        titleId="about-title"
        accent="blue"
        icon="♪"
        actions={
          <button type="button" className="xp-button px-4 py-1.5" onClick={onClose}>
            OK
          </button>
        }
      >
        <div className="flex flex-col gap-2 text-[12px] leading-relaxed">
          <p className="m-0 font-trebuchet text-[15px] font-bold">
            MusicGuess — Un Jour, Une Ressource
          </p>
          <p className="m-0">Version 1.0</p>
          <p className="m-0">
            Jeu de devinette musicale quotidien, inspiré de « Un Jour Un Film »
            et habillé façon Windows XP / Windows Media Player 9.
          </p>
          <p className="m-0 text-[#5a5749]">
            Données : MusicBrainz · Cover Art Archive · Discogs (repli images).
          </p>
          <p className="m-0 text-[#5a5749]">
            Repo GitHub: <a href={'https://github.com/matioku/music-guess'} className="underline text-blue-600">https://github.com/matioku/music-guess</a>
          </p>
        </div>
      </Dialog>
    </Modal>
  );
}
