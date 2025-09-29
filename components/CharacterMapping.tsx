import { GlyphData } from "@/types/font";
import React, { useState } from "react";

interface CharacterMappingProps {
  glyphs: GlyphData[];
  onAddGlyph: (char: string, unicode: number) => void;
  onSelectGlyph: (glyph: GlyphData) => void;
  selectedGlyph: GlyphData | null;
}

const CharacterMapping: React.FC<CharacterMappingProps> = ({
  glyphs,
  onAddGlyph,
  onSelectGlyph,
  selectedGlyph,
}) => {
  const [newChar, setNewChar] = useState("");
  const [newUnicode, setNewUnicode] = useState("");

  const handleAddGlyph = () => {
    if (newChar && newUnicode) {
      const unicodeValue = parseInt(newUnicode.toString(), 16);
      onAddGlyph(newChar, unicodeValue);
      setNewChar("");
      setNewUnicode("");
    }
  };

  return (
    <div className="character-mapping p-4">
      <h2 className="mb-4 text-lg font-bold">Character Mapping</h2>

      {/* Add new character */}
      <div className="add-character mb-2 rounded border p-2">
        <h3 className="mb-2 font-semibold">Add New Character</h3>
        <div className="mb-2 flex">
          <input
            type="text"
            value={newChar}
            onChange={(e) => setNewChar(e.target.value)}
            placeholder="Character"
            maxLength={1}
            className="w-16 rounded border px-2 py-1"
          />
          <input
            type="text"
            value={newUnicode}
            onChange={(e) => setNewUnicode(e.target.value)}
            placeholder="Unicode (hex)"
            className="w-24 rounded border px-2 py-1"
          />
          <button
            onClick={handleAddGlyph}
            className="rounded bg-blue-500 px-4 py-1 text-white hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      {/* Glyph list */}
      <div className="glyph-list">
        <h3 className="mb-2 font-semibold">
          Mapped Characters ({glyphs.length})
        </h3>
        <div className="grid max-h-60 grid-cols-6 gap-2 overflow-y-auto">
          {glyphs.map((glyph) => (
            <button
              key={glyph.id}
              onClick={() => onSelectGlyph(glyph)}
              className={`aspect-square rounded border p-2 text-center hover:bg-gray-100 ${
                selectedGlyph?.id === glyph.id
                  ? "border-blue-500 bg-blue-100"
                  : ""
              }`}
            >
              <div className="text-2xl">{glyph.character}</div>
              <div className="text-sm text-gray-500">
                U+
                {glyph.unicodeValue.toString(16).toUpperCase().padStart(4, "0")}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterMapping;
