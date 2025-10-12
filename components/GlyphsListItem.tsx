interface GlyphsListItem {
  children: React.ReactNode;
}

const GlyphsListItem: React.FC<GlyphsListItem> = ({ children }) => {
  return (
    <button className="cursor-pointer rounded border px-2 hover:bg-blue-300">
      {children}
    </button>
  );
};

export default GlyphsListItem;
