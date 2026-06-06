import type { CoverMode, Difficulty } from "../../types";
import { useSettings } from "../../hooks/useSettings";
import { DifficultyBadge } from "../DifficultyBadge/DifficultyBadge";
import { Equalizer } from "./Equalizer";

interface LcdStripProps {
  coverUrl: string | null;
  coverMode: CoverMode;
  blurLevel: number;
  isLoading: boolean;
  /** True once the round is over (win, or defeat reveal). */
  revealed: boolean;
  /** Revealed only when `revealed` — never rendered mid-game. */
  title: string | null;
  subtitle: string | null;
  difficulty: Difficulty;
  guessCount: number;
  /** Ouvre le zoom de la pochette (uniquement actif une fois révélée). */
  onZoom?: () => void;
}

function CoverArt({
  coverUrl,
  coverMode,
  blurLevel,
  revealed,
  onZoom,
}: Pick<LcdStripProps, "coverUrl" | "coverMode" | "blurLevel" | "revealed" | "onZoom">) {
  const { settings } = useSettings();
  const hidden = coverMode === "hidden" && !revealed;
  const showImage = coverUrl && !hidden;
  // 0 once revealed; otherwise scaled by the user's blur factor.
  const blurPx = revealed ? 0 : blurLevel * settings.blurFactor;

  const frame =
    "lcd-screen relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-sm sm:h-[140px] sm:w-[140px]";

  if (!showImage) {
    return (
      <div className={frame}>
        <div className="grid h-full w-full place-items-center">
          <span className="lcd-glow font-trebuchet text-5xl font-bold">?</span>
        </div>
      </div>
    );
  }

  const img = (
    <img
      src={coverUrl}
      alt={revealed ? "Pochette de la ressource" : ""}
      aria-hidden={!revealed}
      className="h-full w-full object-cover transition-[filter] duration-500"
      style={{ filter: blurPx ? `blur(${blurPx}px)` : undefined }}
      draggable={false}
    />
  );

  // Cliquable seulement une fois révélée : en jeu, zoomer trahirait la réponse.
  if (revealed && onZoom) {
    return (
      <button
        type="button"
        onClick={onZoom}
        aria-label="Agrandir la pochette"
        className={`${frame} cursor-zoom-in`}
      >
        {img}
      </button>
    );
  }

  return <div className={frame}>{img}</div>;
}

// The Windows Media Player "now playing" zone. Shows the (obscured) cover, a
// scrolling title and the attempt counter; during target load it collapses to
// an equalizer + LOADING readout. The real title/subtitle are passed in only
// once `revealed`, so the answer never reaches the DOM mid-game.
export function LcdStrip({
  coverUrl,
  coverMode,
  blurLevel,
  isLoading,
  revealed,
  title,
  subtitle,
  difficulty,
  guessCount,
  onZoom,
}: LcdStripProps) {
  return (
    <section
      aria-label="Lecteur"
      className="lcd-strip lcd-scanlines relative flex items-center gap-3 rounded-sm p-3"
    >
      {isLoading ? (
        <>
          <div className="lcd-screen grid h-[120px] w-[120px] shrink-0 place-items-center rounded-sm sm:h-[140px] sm:w-[140px]">
            <Equalizer />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <span className="lcd-glow font-pixel text-[14px] tracking-[0.3em]">
              LOADING...
            </span>
            <Equalizer />
          </div>
        </>
      ) : (
        <>
          <CoverArt
            coverUrl={coverUrl}
            coverMode={coverMode}
            blurLevel={blurLevel}
            revealed={revealed}
            onZoom={onZoom}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h2 className="sr-only">Ressource mystère</h2>
            <div className="lcd-screen overflow-hidden whitespace-nowrap rounded-sm px-3 py-2">
              {revealed && title ? (
                <span className="lcd-glow inline-block font-trebuchet text-[15px] font-bold">
                  ♪ {title}
                  {subtitle ? ` — ${subtitle}` : ""} ♪
                </span>
              ) : (
                <span
                  className="lcd-glow inline-block animate-marquee font-trebuchet text-[15px] font-bold"
                  aria-label="Ressource mystère, à vous de deviner"
                >
                  ♪ RESSOURCE MYSTÈRE — À VOUS DE DEVINER ♪
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <Equalizer />
              <DifficultyBadge difficulty={difficulty} guessCount={guessCount} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
