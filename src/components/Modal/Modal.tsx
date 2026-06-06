import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface ModalProps {
  onClose: () => void;
  /** id d'un titre interne pour aria-labelledby. */
  labelledBy?: string;
  /** Libellé direct si aucun titre interne. */
  ariaLabel?: string;
  /** Classe du conteneur interne (largeur). Défaut : carte moyenne. */
  className?: string;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Overlay modal réutilisable : backdrop, centrage, focus trap, Esc, et
// restauration du focus au déclencheur. Rendu via un portail sur <body> pour
// ne pas s'imbriquer dans le sous-arbre DOM du parent (masquage aria-modal,
// z-index). Le contenu (cadre XP) est fourni par les enfants.
export function Modal({ onClose, labelledBy, ariaLabel, className, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // Dernière valeur de onClose, sans relancer l'effet de montage à chaque rendu.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      const prev = previouslyFocused.current;
      if (prev?.isConnected) prev.focus();
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`max-h-full overflow-auto outline-none ${className ?? "w-full max-w-md"}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
