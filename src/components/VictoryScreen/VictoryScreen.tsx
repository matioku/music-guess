import type { Resource } from "../../types";
import { Dialog } from "../Dialog/Dialog";
import { ResourceCard } from "../ResourceCard/ResourceCard";

interface VictoryScreenProps {
  resource: Resource;
  guessCount: number;
  isDaily: boolean;
  onDaily: () => void;
  onNewRandom: () => void;
}

export function VictoryScreen({
  resource,
  guessCount,
  isDaily,
  onDaily,
  onNewRandom,
}: VictoryScreenProps) {
  return (
    <Dialog
      title="Bravo !"
      accent="green"
      icon="🏆"
      actions={
        <>
          {!isDaily && (
            <button type="button" className="xp-button px-4 py-1.5" onClick={onDaily}>
              Partie du jour
            </button>
          )}
          <button
            type="button"
            className="xp-button px-4 py-1.5"
            onClick={onNewRandom}
          >
            Nouvelle partie aléatoire
          </button>
        </>
      }
    >
      <p className="m-0 mb-3 text-[13px]">
        Trouvé en <strong>{guessCount}</strong> essai{guessCount > 1 ? "s" : ""}.
      </p>
      <ResourceCard resource={resource} />
    </Dialog>
  );
}
