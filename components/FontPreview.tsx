import { FontProject } from "@/types/font";

interface FontPreviewProps {
  fontData: FontProject;
  SimpleText?: string;
}

const FontPreview: React.FC<FontPreviewProps> = ({
  fontData,
  SimpleText = "The quick brown fox jumps over the lazy dog",
}) => {
  // TODO: Placeholder for future implementation

  return (
    <div className="font-preview p-4">
      <h2 className="mb-4 text-lg font-bold">Font Preview</h2>

      <div className="preview-controls mb-4">
        <div className="flex items-center gap-4">
          <label>
            <span className="mr-2 font-semibold">Size:</span>
            <input
              type="number"
              defaultValue={16}
              min={12}
              max={72}
              className="ml-2 w-16 rounded border"
            />
          </label>
        </div>
      </div>

      <div
        className="preview-text rounded border bg-gray-50 p-4"
        // TODO: style={{ fontFamily: fontData.name }}
      >
        <p className="text-base" style={{ fontSize: "16px" }}>
          {SimpleText}
        </p>
      </div>

      <div className="alphabet-preview mt-4">
        <h3 className="mb-2 font-semibold">Alphabet Preview</h3>
        <div className="grid grid-cols-8 gap-2">
          {fontData.glyphs.map((glyph) => (
            <div
              key={glyph.unicodeValue}
              className="flex flex-col items-center"
            >
              <div className="text-2xl">{glyph.character}</div>
              <div className="text-sm text-gray-500">
                U+
                {glyph.unicodeValue.toString(16).toUpperCase().padStart(4, "0")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FontPreview;
