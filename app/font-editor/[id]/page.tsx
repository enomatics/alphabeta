import CharacterMapping from "@/components/CharacterMapping";
import FontPreview from "@/components/FontPreview";
import GlyphEditor from "@/components/GlyphEditor";
import { FontProject, GlyphData } from "@/types/font";
import { FontGenerator } from "@/utils/FontGenerator";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const FontEditorPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [fontProject, setFontProject] = useState<FontProject | null>(null);
  const [selectedGlyph, setSelectedGlyph] = useState<GlyphData | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //   Initialise or load font project based on id
  useEffect(() => {
    if (id === "new") {
      const newProject: FontProject = {
        metadata: {
          id: crypto.randomUUID(),
          name: "Untitled Font",
          author: "User", // from user session
          authorId: "user-id", // from user session
          creationDate: new Date(),
          version: "1.0.0",
        },
        glyphs: [],
        fontSettings: {
          unitePerEm: 1000,
          ascender: 800,
          descender: -200,
          lineGap: 90,
        },
      };
      setFontProject(newProject);
    } else if (typeof id === "string") {
      // Load existing font project
      loadFontProject(id.toString());
    }
  }, [id]);

  const loadFontProject = async (fontId: string) => {
    try {
      setIsLoading(true);
      //   TODO: Fetch font project from backend

      const response = await fetch(`api/fonts/${fontId}`);
      const project = await response.json();
      setFontProject(project);
    } catch (error) {
      console.error("Error loading font project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFontProject = async () => {
    if (!fontProject) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/fonts/${fontProject.metadata.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fontProject,
          metadata: {
            ...fontProject.metadata,
            lastModified: new Date(),
          },
        }),
      });

      if (response.ok) {
        console.log("Font project saved successfully");
      }
    } catch (error) {
      console.log("Error saving font project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGlyph = (char: string, unicode: number) => {
    if (!fontProject) return;

    const newGlyph: GlyphData = {
      id: crypto.randomUUID(),
      character: char,
      unicodeValue: unicode,
      konvaData: null,
      pathData: "",
      width: 500,
      height: 500,
      advance: 500,
    };

    setFontProject({
      ...fontProject,
      glyphs: [...fontProject.glyphs, newGlyph],
    });

    setSelectedGlyph(newGlyph);
  };

  const handleGlyphChange = (updatedGlyph: GlyphData) => {
    if (!fontProject) return;

    const updatedGlyphs = fontProject.glyphs.map((glyph) =>
      glyph.id === updatedGlyph.id ? updatedGlyph : glyph,
    );

    setFontProject({
      ...fontProject,
      glyphs: updatedGlyphs,
    });
  };

  const handleExportFont = async (format: "ttf" | "otf" | "woff") => {
    if (!fontProject) return;

    try {
      setIsLoading(true);
      let fontBuffer: ArrayBuffer;

      switch (format) {
        case "ttf":
          fontBuffer = await FontGenerator.generateFont(fontProject);
          break;

        case "otf":
          fontBuffer = await FontGenerator.exportAsOtf(fontProject);
          break;

        case "woff":
          fontBuffer = await FontGenerator.exportAsWoff(fontProject);
          break;

        default:
          throw new Error("Unsupported format");
      }

      //   Create download link
      const blob = new Blob([fontBuffer], {
        type: format === "woff" ? "font/woff" : "font/opentype",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fontProject.metadata.name}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting ${format.toUpperCase()} font:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (!fontProject) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-semibold">No font project found.</div>
      </div>
    );
  }

  return (
    <div className="font-editor-page flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white p-4">
        <div>
          <h1 className="text-2xl font-bold">{fontProject.metadata.name}</h1>
          <p className="text-sm text-gray-500">
            By {fontProject.metadata.author} • {fontProject.glyphs.length}
            glyphs
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={saveFontProject}
            disabled={isLoading}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            Save
          </button>
          <div className="group relative">
            <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
              Export
            </button>
            <div className="invisible absolute right-0 mt-2 w-32 rounded border bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
              <button
                onClick={() => handleExportFont("ttf")}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                TTF
              </button>
              <button
                onClick={() => handleExportFont("otf")}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                OTF
              </button>
              <button
                onClick={() => handleExportFont("woff")}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                WOFF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b bg-gray-100">
        <div className="flex">
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-6 py-3 font-medium ${
              activeTab === "edit"
                ? "border-b-2 border-blue-600 bg-white text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Edit Glyphs
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-6 py-3 font-medium ${
              activeTab === "preview"
                ? "border-b-2 border-blue-600 bg-white text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Preview Font
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {activeTab === "edit" ? (
          <>
            {/* Character Mapping Sidebar */}
            <div className="w-80 overflow-y-auto border-r bg-gray-50 p-4">
              <CharacterMapping
                glyphs={fontProject.glyphs}
                onAddGlyph={handleAddGlyph}
                onSelectGlyph={setSelectedGlyph}
                selectedGlyph={selectedGlyph}
              />
            </div>

            {/* Glyph Editor */}
            <div className="flex-1 p-4">
              {selectedGlyph ? (
                <GlyphEditor
                  glyph={selectedGlyph}
                  onChange={handleGlyphChange}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="mb-2 text-lg">No glyph selected</p>
                    <p className="text-sm">
                      Please select or add a glyph to start editing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // Preview Tab
          <div className="flex-1 p-4">
            <FontPreview fontData={fontProject} />
          </div>
        )}
      </div>
    </div>
  );
};
export default FontEditorPage;
