import { create } from "zustand";

type GlyphStore = {
  glyphs: Record<string, string[]>;
};

export const useGlyphStore = create<GlyphStore>((set) => ({
  glyphs: {},
  addGlyph: (glyph: never[]) =>
    set((state) => ({
      glyphs: { ...state.glyphs, glyph },
    })),
}));
