import { useState, useEffect } from "react";
import type { ResourceMode, Difficulty } from "./types";
import { useSettings } from "./hooks/useSettings";
import { TitleBar } from "./components/TitleBar/TitleBar";
import { MenuBar } from "./components/MenuBar/MenuBar";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { GameBoard } from "./components/GameBoard/GameBoard";
import { OptionsModal } from "./components/Options/OptionsModal";
import { RulesModal } from "./components/Help/RulesModal";
import { AboutModal } from "./components/Help/AboutModal";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const date = today();
  const { settings } = useSettings();
  const [mode, setMode] = useState<ResourceMode>(settings.defaultMode);
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.defaultDifficulty);
  const [isDaily, setIsDaily] = useState(true);
  // Bumped to force a fresh GameBoard mount (new random draw / replay).
  const [sessionNonce, setSessionNonce] = useState(0);
  const [activeModal, setActiveModal] = useState<null | "rules" | "about" | "options">(null);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", settings.reducedMotion);
  }, [settings.reducedMotion]);

  const startRandom = () => {
    setIsDaily(false);
    setSessionNonce((n) => n + 1);
  };
  const startDaily = () => {
    setIsDaily(true);
    setSessionNonce((n) => n + 1);
  };
  const replay = () => (isDaily ? startDaily() : startRandom());

  const boardKey = `${mode}-${difficulty}-${isDaily ? "d" : "r"}-${sessionNonce}`;

  return (
    <div className="min-h-full w-full px-2 py-3 sm:px-6 sm:py-6">
      <main className="xp-window mx-auto flex max-w-5xl flex-col font-tahoma">
        <TitleBar />
        <MenuBar
          date={date}
          mode={mode}
          difficulty={difficulty}
          isDaily={isDaily}
          onModeChange={setMode}
          onDifficultyChange={setDifficulty}
          onDaily={startDaily}
          onNewRandom={startRandom}
          onReplay={replay}
          onOpenRules={() => setActiveModal("rules")}
          onOpenAbout={() => setActiveModal("about")}
          onOpenOptions={() => setActiveModal("options")}
        />
        <Toolbar
          mode={mode}
          difficulty={difficulty}
          isDaily={isDaily}
          onModeChange={setMode}
          onDifficultyChange={setDifficulty}
          onNewRandom={startRandom}
          onDaily={startDaily}
        />
        <GameBoard
          key={boardKey}
          mode={mode}
          difficulty={difficulty}
          isDaily={isDaily}
          date={date}
          onNewRandom={startRandom}
          onDaily={startDaily}
        />
        {activeModal === "rules" && <RulesModal onClose={() => setActiveModal(null)} />}
        {activeModal === "about" && <AboutModal onClose={() => setActiveModal(null)} />}
        {activeModal === "options" && <OptionsModal onClose={() => setActiveModal(null)} />}
      </main>
    </div>
  );
}

export default App;
