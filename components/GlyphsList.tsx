import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import GlyphsListHeader from "./GlyphsListHeader";
import GlyphsListItem from "./GlyphsListItem";

interface GlyphsListProps {
  listName: string;
  characters: string[];
  isOpen: boolean;
}

const GlyphsList: React.FC<GlyphsListProps> = ({
  characters,
  listName,
  isOpen = false,
}) => {
  const [listOpen, setListOpen] = useState(isOpen);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 px-6">
      <div className="flex w-full items-center justify-between border-b border-zinc-400 py-4">
        <GlyphsListHeader>{listName}</GlyphsListHeader>
        <button
          className="rounded-full p-1 hover:bg-gray-300"
          onClick={() => setListOpen(!listOpen)}
        >
          {!listOpen ? <ChevronDown /> : <ChevronUp />}
        </button>
      </div>
      {listOpen && (
        <div className="flex flex-wrap gap-2">
          {characters.map((char) => (
            <GlyphsListItem key={char.charCodeAt(0)}>{char}</GlyphsListItem>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlyphsList;
