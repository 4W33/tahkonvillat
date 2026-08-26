"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UndoState = {
  label: string;
  onUndo?: () => void;
};

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Toast that confirms an instant save and offers a one-tap undo.
 * Replaces "are you sure" dialogs: act first, allow reversal.
 */
export function useUndoToast(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const [state, setState] = useState<UndoState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearUndo = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setState(null);
  }, []);

  const showUndo = useCallback(
    (label: string, onUndo?: () => void) => {
      if (timer.current) clearTimeout(timer.current);
      setState({ label, onUndo });
      timer.current = setTimeout(() => setState(null), timeoutMs);
    },
    [timeoutMs],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const toast = state ? (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900 py-2.5 pl-5 pr-2.5 text-sm text-white shadow-lg"
    >
      <span>{state.label}</span>
      {state.onUndo ? (
        <button
          type="button"
          onClick={() => {
            state.onUndo?.();
            clearUndo();
          }}
          className="rounded-full bg-white/15 px-4 py-1.5 font-semibold hover:bg-white/25"
        >
          Kumoa
        </button>
      ) : (
        <button
          type="button"
          onClick={clearUndo}
          aria-label="Sulje ilmoitus"
          className="rounded-full px-3 py-1.5 text-white/70 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  ) : null;

  return { toast, showUndo, clearUndo };
}
