import { useEffect, useRef, useState } from "react";

export type MenuItem =
  | { kind: "action"; label: string; onSelect: () => void; disabled?: boolean }
  | { kind: "radio"; label: string; checked: boolean; onSelect: () => void }
  | { kind: "toggle"; label: string; checked: boolean; onSelect: () => void }
  | { kind: "separator" }
  | { kind: "header"; label: string };

interface MenuProps {
  label: string;
  items: MenuItem[];
  isOpen: boolean;
  /** Vrai si un menu (n'importe lequel) de la barre est ouvert. */
  anyOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function isSelectable(item: MenuItem): boolean {
  if (item.kind === "separator" || item.kind === "header") return false;
  if (item.kind === "action" && item.disabled) return false;
  return true;
}

// Un dropdown XP accessible (WAI-ARIA menu button). Ouverture au clic, un seul
// ouvert à la fois (géré par le parent via isOpen/onOpen/onClose), navigation
// clavier, fermeture Esc / clic extérieur.
export function Menu({ label, items, isOpen, anyOpen, onOpen, onClose }: MenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const order = items
    .map((it, i) => ({ it, i }))
    .filter(({ it }) => isSelectable(it))
    .map(({ i }) => i);

  useEffect(() => {
    if (!isOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      if (
        !listRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [isOpen, onClose]);

  // On open, focus the first selectable item. `order` is intentionally excluded
  // from deps: it changes reference on every parent render (radio `checked`
  // flips during play), and re-running would reset the active item mid-navigation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setActiveIndex(order[0] ?? -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function move(dir: 1 | -1) {
    const pos = order.indexOf(activeIndex);
    const next = order[(pos + dir + order.length) % order.length];
    setActiveIndex(next ?? -1);
  }

  function select(item: MenuItem) {
    if (!isSelectable(item) || !("onSelect" in item)) return;
    item.onSelect();
    onClose();
    triggerRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); move(1); break;
      case "ArrowUp": e.preventDefault(); move(-1); break;
      case "Home": e.preventDefault(); setActiveIndex(order[0] ?? -1); break;
      case "End": e.preventDefault(); setActiveIndex(order[order.length - 1] ?? -1); break;
      case "Escape": e.preventDefault(); onClose(); triggerRef.current?.focus(); break;
      case "Enter":
      case " ": {
        e.preventDefault();
        const item = items[activeIndex];
        if (item) select(item);
        break;
      }
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`rounded-sm px-2 py-0.5 hover:bg-[#c2d4ee] focus-visible:bg-[#c2d4ee] focus-visible:outline-none ${isOpen ? "bg-[#c2d4ee]" : ""}`}
        onClick={() => (isOpen ? onClose() : onOpen())}
        onMouseEnter={() => {
          if (anyOpen && !isOpen) onOpen();
        }}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onOpen();
          }
        }}
      >
        {label}
      </button>
      {isOpen && (
        <div
          ref={listRef}
          role="menu"
          aria-label={label}
          className="absolute left-0 top-full z-40 mt-0.5 min-w-[210px] border border-[#8e8b73] bg-[#f1efe2] py-1 shadow-[2px_2px_4px_rgba(0,0,0,.35)]"
          onKeyDown={handleKeyDown}
        >
          {items.map((item, i) => {
            if (item.kind === "separator")
              return <div key={i} role="separator" className="my-1 h-px bg-[#aca899]" />;
            if (item.kind === "header")
              return (
                <div
                  key={i}
                  role="presentation"
                  className="px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8e8b73]"
                >
                  {item.label}
                </div>
              );
            const isActive = i === activeIndex;
            const disabled = item.kind === "action" && item.disabled === true;
            const role =
              item.kind === "radio"
                ? "menuitemradio"
                : item.kind === "toggle"
                  ? "menuitemcheckbox"
                  : "menuitem";
            const checked =
              item.kind === "radio" || item.kind === "toggle" ? item.checked : undefined;
            return (
              <button
                key={i}
                type="button"
                role={role}
                aria-checked={checked}
                tabIndex={-1}
                disabled={disabled}
                ref={isActive ? (el) => el?.focus() : undefined}
                className={`flex w-full items-center gap-2 px-3 py-1 text-left text-[12px] disabled:text-[#9b988a] ${isActive ? "bg-[#316ac5] text-white" : "text-[#1a1a1a]"}`}
                onClick={() => select(item)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span aria-hidden className="w-3 text-center">
                  {checked ? "✓" : ""}
                </span>
                <span className="flex-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
