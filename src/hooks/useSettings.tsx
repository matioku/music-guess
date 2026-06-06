import { createContext, useContext, useCallback } from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { ResourceMode, Difficulty } from "../types";

export interface Settings {
  defaultMode: ResourceMode;
  defaultDifficulty: Difficulty;
  /** Pixels de flou par niveau de blur : 2 léger, 4 normal, 6 fort. */
  blurFactor: number;
  reducedMotion: boolean;
}

function systemReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

const DEFAULT_SETTINGS: Settings = {
  defaultMode: "release",
  defaultDifficulty: "hard",
  blurFactor: 4,
  reducedMotion: false,
};

interface SettingsContextValue {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>("uujr_settings", {
    ...DEFAULT_SETTINGS,
    reducedMotion: systemReducedMotion(),
  });

  const setSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [setSettings]
  );

  return (
    <SettingsContext.Provider value={{ settings, setSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
