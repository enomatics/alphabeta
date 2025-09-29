import { FontProject } from "@/types/font";
import { Glyph } from "opentype.js";

export class FontGenerator {
  static async generateFont(fontProject: FontProject): Promise<ArrayBuffer> {
    // TODO: Use opentype to generate actual font
    const opentype = await import("opentype.js");

    const glyphs: Glyph[] = [];

    // Notdef glyph
    const notdefGlyph = new opentype.Glyph({
      name: ".notdef",
      unicode: 0,
      advanceWidth: 650,
      path: new opentype.Path(),
    });

    glyphs.push(notdefGlyph);

    // Individual glyph conversion
    fontProject.glyphs.forEach((glyphData) => {
      try {
        const path = new opentype.Path();

        // TODO: Implement SVG path parsing
        if (glyphData.pathData) {
          // Placeholder for SVG path parsing
          //   Implement actual SVG path parsing here
        }

        const glyph = new opentype.Glyph({
          name: glyphData.character,
          unicode: glyphData.unicodeValue,
          advanceWidth: glyphData.advance || 600,
          path,
        });

        glyphs.push(glyph);
      } catch (error) {
        console.log("Error processing glyph:", glyphData, error);
      }
    });

    // Create the font
    const font = new opentype.Font({
      familyName: fontProject.metadata.name,
      styleName: "Regular",
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      glyphs: glyphs,
    });

    return font.toArrayBuffer();
  }

  static async exportAsWoff(fontProject: FontProject): Promise<ArrayBuffer> {
    const ttfBuffer = await this.generateFont(fontProject);
    // TODO: Convert TTF to WOFF using a library or custom implementation
    return ttfBuffer; // Placeholder
  }

  static async exportAsOtf(fontProject: FontProject): Promise<ArrayBuffer> {
    return this.generateFont(fontProject);
  }
}
