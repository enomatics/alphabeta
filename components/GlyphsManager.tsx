"use client";

import { createFontFromGlyphs, downloadFont } from "@/utils/fontUtils";
import { useState } from "react";
import GlyphEditor from "./GlyphEditor";

const GlyphsManager = () => {
  const [glyphs, setGlyphs] = useState<Record<string, string[]>>({
    a: [],
    b: [],
  });
  const [activeGlyph, setActiveGlyph] = useState("a");

  const addPathToGlyph = (path: string) => {
    setGlyphs((prev) => ({
      ...prev,
      [activeGlyph]: [...(prev[activeGlyph] || []), path],
    }));

    console.log(glyphs);
  };

  const saveGlyph = () => {};

  const handleExportFont = () => {
    const font = createFontFromGlyphs(glyphs, "myHandwrittenFont");
    downloadFont(font, "myhandwrittenfont.ttf");
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-semibold">Glyph Manager</h1>

      <div className="flex gap-2">
        {Object.keys(glyphs).map((g) => (
          <button
            key={g}
            className={`rounded px-3 py-1 ${
              activeGlyph === g ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveGlyph(g)}
          >
            {g.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex size-[500px] items-center justify-center border bg-white p-2">
        <GlyphEditor canvasSize={500} strokeSize={16} />
      </div>

      <button onClick={() => addPathToGlyph(activeGlyph)}>Save Glyph</button>

      <button onClick={handleExportFont}>Export Font</button>
    </div>
  );
};

export default GlyphsManager;
