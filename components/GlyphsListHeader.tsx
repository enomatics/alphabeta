interface GlyphsListHeaderProps {
  children: React.ReactNode;
}

const GlyphsListHeader: React.FC<GlyphsListHeaderProps> = ({ children }) => {
  return (
    <h3 className="w-full text-start text-lg font-semibold">{children}</h3>
  );
};

export default GlyphsListHeader;
