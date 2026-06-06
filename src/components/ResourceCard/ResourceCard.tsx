import { useState } from "react";
import type { Resource } from "../../types";
import { CoverZoomModal } from "../Modal/CoverZoomModal";

interface ResourceCardProps {
  resource: Resource;
}

function rowsFor(resource: Resource): { label: string; value: string }[] {
  const fmt = (v: string | number | null | undefined) =>
    v === null || v === undefined || v === "" ? "—" : String(v);

  if (resource.kind === "release") {
    const type = [resource.primaryType, ...resource.secondaryTypes]
      .filter(Boolean)
      .join(" · ");
    return [
      { label: "Artiste", value: fmt(resource.artist) },
      { label: "Année", value: fmt(resource.year) },
      { label: "Type", value: fmt(type) },
      { label: "Pays", value: fmt(resource.country) },
      { label: "Label", value: fmt(resource.label) },
      { label: "Genres", value: fmt(resource.tags.join(", ")) },
    ];
  }
  return [
    { label: "Pays / origine", value: fmt(resource.country ?? resource.area) },
    { label: "Type", value: fmt(resource.type) },
    { label: "Début", value: fmt(resource.careerStart) },
    { label: "Fin", value: fmt(resource.careerEnd) },
    { label: "Genres", value: fmt(resource.tags.join(", ")) },
  ];
}

// Final reveal card: cover/photo + the full metadata of the resource. The
// visual is large and clickable to open a zoomed view.
export function ResourceCard({ resource }: ResourceCardProps) {
  const [zoom, setZoom] = useState(false);
  const title = resource.kind === "release" ? resource.title : resource.name;
  const image = resource.kind === "release" ? resource.coverArtUrl : resource.imageUrl;
  const rows = rowsFor(resource);

  const frame =
    "lcd-screen mx-auto h-40 w-40 shrink-0 overflow-hidden rounded-sm";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {image ? (
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label={`Agrandir le visuel de ${title}`}
          className={`${frame} cursor-zoom-in`}
        >
          <img
            src={image}
            alt={`Visuel de ${title}`}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </button>
      ) : (
        <div className={frame}>
          <div className="grid h-full w-full place-items-center">
            <span className="lcd-glow font-trebuchet text-5xl font-bold">♪</span>
          </div>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h4 className="m-0 mb-1 font-trebuchet text-[15px] font-bold text-[#1a1a1a]">
          {title}
        </h4>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[12px]">
          {rows.map(({ label, value }) => (
            <div key={label} className="contents">
              <dt className="font-semibold text-[#5a5749]">{label}</dt>
              <dd className="m-0 break-words text-[#1a1a1a]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      {zoom && image && (
        <CoverZoomModal src={image} title={title} onClose={() => setZoom(false)} />
      )}
    </div>
  );
}
