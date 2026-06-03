import { useState } from "react";
import type { ResourceMode, Difficulty } from "./types";
import { TitleBar } from "./components/TitleBar/TitleBar";
import { MenuBar } from "./components/MenuBar/MenuBar";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { GameBoard } from "./components/GameBoard/GameBoard";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const date = today();
  const [mode, setMode] = useState<ResourceMode>("release");
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [isDaily, setIsDaily] = useState(true);
  // Bumped to force a fresh GameBoard mount (new random draw / replay).
  const [sessionNonce, setSessionNonce] = useState(0);

  const startRandom = () => {
    setIsDaily(false);
    setSessionNonce((n) => n + 1);
  };
  const startDaily = () => {
    setIsDaily(true);
    setSessionNonce((n) => n + 1);
  };

  const boardKey = `${mode}-${difficulty}-${isDaily ? "d" : "r"}-${sessionNonce}`;

  return (
    <div className="min-h-full w-full px-2 py-3 sm:px-6 sm:py-6">
      <main className="xp-window mx-auto flex max-w-5xl flex-col overflow-hidden font-tahoma">
        <TitleBar />
        <MenuBar date={date} mode={mode} isDaily={isDaily} />
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
        />
      </main>
    </div>
  );
}

export default App;
