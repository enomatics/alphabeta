import { useGlyphStore } from "@/app/store";

interface GlyphsListItem {
  children: React.ReactNode;
}

const GlyphsListItem: React.FC<GlyphsListItem> = ({ children }) => {
  const { activeGlyph, setActiveGlyph } = useGlyphStore();
  const isSelected = activeGlyph === children;

  return (
    <button
      onClick={() => setActiveGlyph(children as string)}
      className={`flex cursor-pointer flex-col gap-1.5 rounded border px-2 hover:bg-blue-300 ${isSelected && "border-blue-600 bg-blue-200 text-blue-600"}`}
    >
      {children}
      <span className="text-xs">{(children as string).charCodeAt(0)}</span>
    </button>
  );
};

export default GlyphsListItem;
