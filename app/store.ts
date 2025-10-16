import { create } from "zustand";

type GlyphStore = {
  glyphs: Record<string, string[]>;
  // paths: string[];
  activeGlyph: string;
  addPathToGlyph: (glyphId: string, path: string) => void;
  setActiveGlyph: (glyphId: string) => void;
  clearGlyph: () => void;
};

export const useGlyphStore = create<GlyphStore>((set) => ({
  glyphs: {},
  activeGlyph: "A",
  setActiveGlyph: (glyphId) => set({ activeGlyph: glyphId }),

  addPathToGlyph: (glyphId, path) => {
    set((state) => {
      const prevPaths = state.glyphs[glyphId] || [];
      return { glyphs: { ...state.glyphs, [glyphId]: [...prevPaths, path] } };
    });
  },

  clearGlyph: () => {
    set((state) => ({ glyphs: { ...state.glyphs, [state.activeGlyph]: [] } }));
  },
}));
