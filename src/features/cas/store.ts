import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CASParseResult } from "./types";

interface CASState {
  lastImport: CASParseResult | null;
  setLastImport: (r: CASParseResult | null) => void;
  clear: () => void;
}

export const useCASStore = create<CASState>()(
  persist(
    (set) => ({
      lastImport: null,
      setLastImport: (r) => set({ lastImport: r }),
      clear: () => set({ lastImport: null }),
    }),
    { name: "cas-import" },
  ),
);
