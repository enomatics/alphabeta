"use client";

import GlyphEditor from "@/components/GlyphEditor";
import GlyphsList from "@/components/GlyphsList";
import { createFontFromGlyphs, downloadFont } from "@/utils/fontUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useCanvasStore, useGlyphStore } from "../../store";

const HomePage = () => {
  const [inputValue, setInputValue] = useState("Handwritten Font Name");
  const { glyphs, clearGlyph } = useGlyphStore();
  const { canvasSize } = useCanvasStore();

  const alphabets = Array.from(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  );
  const numbers = Array.from("1234567890");
  const basicPunctuation = Array.from(
    `. , ; : ? ! ' " ( ) [ ] { } - – — /`.split(" ").join(""),
  );

  const handleExportFont = () => {
    const font = createFontFromGlyphs(glyphs, inputValue);
    downloadFont(font, `${inputValue}.otf`);
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex w-full items-center justify-between border-b border-zinc-400 bg-gray-100 px-6 py-3 text-black shadow-2xl">
        <div className="profile rounded-full border border-zinc-900 bg-gray-400 p-3"></div>
        <input
          className="font-name rounded-lg border border-zinc-900 px-3 py-1 text-center"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <div className="group relative">
          <button className="rounded border border-zinc-900 bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            Export as &darr;
          </button>
          <div className="invisible absolute right-0 mt-2 w-32 rounded border bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
            <button
              onClick={() => handleExportFont()}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              TTF
            </button>
            <button
              // onClick={() => handleExportFont("otf")}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              OTF
            </button>
            <button
              // onClick={() => handleExportFont("woff")}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              WOFF
            </button>
          </div>
        </div>
      </header>

      <main className="grid max-h-full w-full flex-1 grid-cols-[350px_1fr_450px] items-center overflow-hidden text-black">
        <div className="sidebar shadow-2x h-full overflow-y-auto border-r border-zinc-400 bg-gray-200">
          <div className="flex !max-h-[100%] w-full flex-col overflow-auto pb-12">
            <GlyphsList
              listName="Alphabets (A-Z)"
              characters={alphabets}
              isOpen
            />
            <GlyphsList listName="Numbers (9-0)" characters={numbers} isOpen />
            <GlyphsList
              listName="Basic Punctuation"
              characters={basicPunctuation}
              isOpen
            />
          </div>
        </div>
        <div className="relative flex h-full items-center justify-around bg-amber-100">
          <button className="rounded-full border border-blue-600 bg-blue-400 p-4">
            <ChevronLeft />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-2 self-start">
              <button
                className="cursor-pointer rounded border bg-red-500 px-4 py-2"
                onClick={clearGlyph}
              >
                Clear canvas
              </button>
              {/* <button className="cursor-pointer rounded border bg-blue-500 px-4 py-2">
                Save glyph
              </button> */}
            </div>
            <GlyphEditor strokeSize={32} canvasSize={canvasSize} />
          </div>
          <button className="rounded-full border border-blue-600 bg-blue-400 p-4">
            <ChevronRight />
          </button>
        </div>
        <div className="flex h-full w-full flex-col items-center border-l border-zinc-400 bg-gray-200 p-4">
          <div className="glyph-preview size-[150px] rounded-sm border border-red-400 bg-gray-900"></div>
          <div></div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
