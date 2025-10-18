import { create } from "zustand";

type GlyphStore = {
  glyphs: Record<string, string[]>;
  // paths: string[];
  activeGlyph: string;
  addPathToGlyph: (glyphId: string, path: string) => void;
  setActiveGlyph: (glyphId: string) => void;
  clearGlyph: () => void;
};

type CanvasStore = {
  canvasSize: number;
  baseline: number;
  ascender: number;
  descender: number;
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

export const useCanvasStore = create<CanvasStore>(() => {
  const canvasSize = 500;
  const baseline = canvasSize * 0.7;
  const ascender = baseline - canvasSize * 0.65;
  const descender = baseline + canvasSize * 0.27;

  return {
    canvasSize,
    baseline,
    ascender,
    descender,
  };
});
