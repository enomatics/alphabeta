import opentype from "opentype.js";
import { normalizePathToCubic } from "./convertStrokesToPaths";

export type Point = [number, number];

// /*
const average = (a: number, b: number) => (a + b) / 2;

export function getPathFromStroke(points: number[][], closed = true) {
  const len = points.length;

  if (len < 4) {
    return ``;
  }

  let a = points[0];
  let b = points[1];
  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2,
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1],
  ).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2,
    )} `;
  }

  if (closed) {
    result += "Z";
  }

  return result;
}

// */

/*
export function getPathFromStroke(
  points: Point[],
  options?: { tension?: number; closeThreshold?: number },
): string {
  if (!points || points.length === 0) return "";

  if (points.length === 1) {
    const [x, y] = points[0];
    return `M ${x} ${y}`;
  }

  const tension = options?.tension ?? 0.5;
  const closeThreshold = options?.closeThreshold ?? 2;

  // Determine if we should close the path (distance between first and last points)
  const [x0, y0] = points[0];
  const [xn, yn] = points[points.length - 1];
  const dx = xn - x0;
  const dy = yn - y0;
  const shouldClose = Math.sqrt(dx * dx + dy * dy) <= closeThreshold;

  // Move to first point
  let d = `M ${x0} ${y0}`;

  if (points.length === 2) {
    const [x, y] = points[1];
    d += ` L ${x} ${y}`;
    if (shouldClose) d += " Z";
    return d;
  }

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    // Catmull–Rom → Cubic Bézier
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;

    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }

  if (shouldClose) d += " Z";
  return d;
}
*/

const canvasToFontCoords = (
  x: number,
  y: number,
  canvasSize = 500,
  unitsPerEm = 1000,
  offsetX = 0,
) => {
  const BASELINE = canvasSize * 0.7;
  const ASCENDER = BASELINE - canvasSize * 0.65;
  const DESCENDER = BASELINE + canvasSize * 0.27;

  const canvasGlyphHeight = DESCENDER - ASCENDER;
  const scale = unitsPerEm / canvasGlyphHeight;

  const dx = x * scale + offsetX;
  const dy = (BASELINE - y) * scale; //vertically flip
  return [dx, dy];
};

export const createFontFromGlyphs = (
  glyphMap: Record<string, string[]>,
  familyName = "my-handwritten-font",
) => {
  const unitsPerEm = 1000;
  const canvasHeight = 500;
  const glyphs: opentype.Glyph[] = [];

  const BASELINE = canvasHeight * 0.7;
  const ASCENDER = BASELINE - canvasHeight * 0.65;
  const DESCENDER = BASELINE + canvasHeight * 0.27;

  const canvasGlyphHeight = DESCENDER - ASCENDER;
  const scale = unitsPerEm / canvasGlyphHeight;

  const fontAscender = (BASELINE - ASCENDER) * scale;
  const fontDescender = -(DESCENDER - BASELINE) * scale;

  // .notdef required
  const notdefGlyph = new opentype.Glyph({
    name: ".notdef",
    advanceWidth: 300,
    path: new opentype.Path(),
  });

  Object.entries(glyphMap).forEach(([char, paths]) => {
    if (!paths.length) return;

    const glyphPath = new opentype.Path();
    let minX = Infinity,
      maxX = -Infinity;

    paths.forEach((path) => {
      const svgCommands = normalizePathToCubic(path);

      // Determine horizontal bounds
      svgCommands.forEach((cmd) => {
        const allX = [];
        if (cmd.args[0]) allX.push(cmd.args[0]);
        if (cmd.args[2]) allX.push(cmd.args[2]);
        if (cmd.args[4]) allX.push(cmd.args[4]);

        allX.forEach((x) => {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        });
      });

      const glyphWidth = (maxX - minX) * scale;
      const sideBearing = unitsPerEm * 0.05;
      const advanceWidth = glyphWidth + sideBearing * 2;

      const glyphCenter = minX + (maxX - minX) / 2;
      const dx = advanceWidth / 2 - glyphCenter * scale;

      // Build glyph path
      svgCommands.forEach(({ command, args }) => {
        switch (command.toUpperCase()) {
          case "M": {
            const [x, y] = canvasToFontCoords(
              args[0],
              args[1],
              canvasHeight,
              unitsPerEm,
              dx,
            );
            glyphPath.moveTo(x, y);
            break;
          }
          case "L": {
            const [x, y] = canvasToFontCoords(
              args[0],
              args[1],
              canvasHeight,
              unitsPerEm,
              dx,
            );
            glyphPath.lineTo(x, y);
            break;
          }
          case "Q": {
            const [x1, y1] = canvasToFontCoords(
              args[0],
              args[1],
              canvasHeight,
              unitsPerEm,
              dx,
            );
            const [x, y] = canvasToFontCoords(
              args[2],
              args[3],
              canvasHeight,
              unitsPerEm,
              dx,
            );
            glyphPath.quadTo(x1, y1, x, y);
            break;
          }
          case "C": {
            const [x1, y1] = canvasToFontCoords(
              args[0],
              args[1],
              canvasHeight,
              unitsPerEm,
              dx,
            );
            const [x2, y2] = canvasToFontCoords(
              args[2],
              args[3],
              canvasHeight,
              unitsPerEm,
              dx,
            );
            const [x, y] = canvasToFontCoords(
              args[4],
              args[5],
              canvasHeight,
              unitsPerEm,
              dx,
            );
            glyphPath.curveTo(x1, y1, x2, y2, x, y);
            break;
          }
          case "Z":
            glyphPath.close();
            break;
        }
      });
    });

    console.log(glyphPath); // {commands: [...], fill: 'black', stroke: null, strokeWidth: 1}

    const glyphWidth = (maxX - minX) * scale;
    const sideBearing = unitsPerEm * 0.05;
    const advanceWidth = glyphWidth + sideBearing * 2;

    const glyph = new opentype.Glyph({
      name: char,
      unicode: char.charCodeAt(0),
      advanceWidth,
      path: glyphPath,
      leftSideBearing: sideBearing,
    });

    glyphs.push(glyph);

    console.log(glyphs);
  });

  glyphs.unshift(notdefGlyph);

  const font = new opentype.Font({
    familyName,
    styleName: "Regular",
    unitsPerEm,
    ascender: fontAscender,
    descender: fontDescender,
    glyphs,
  });

  return font;
};

export const downloadFont = (
  font: opentype.Font,
  filename = "my-handwritten-font.otf",
) => {
  const sluggedFilename = filename
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-\.]/g, "");

  const buffer = font.toArrayBuffer();
  const blob = new Blob([buffer], { type: "font/opentype" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = sluggedFilename;
  link.click();
};
