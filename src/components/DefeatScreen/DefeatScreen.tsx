import type { Resource } from "../../types";
import { Dialog } from "../Dialog/Dialog";
import { ResourceCard } from "../ResourceCard/ResourceCard";

interface DefeatScreenProps {
  resource: Resource;
  isDaily: boolean;
  onDaily: () => void;
  onNewRandom: () => void;
}

export function DefeatScreen({
  resource,
  isDaily,
  onDaily,
  onNewRandom,
}: DefeatScreenProps) {
  return (
    <Dialog
      title="Perdu"
      accent="red"
      icon="✖"
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
        Tentatives épuisées. La réponse était :
      </p>
      <ResourceCard resource={resource} />
    </Dialog>
  );
}
