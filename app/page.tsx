"use client";
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import opentype from "opentype.js";
import SVGPathParser, { SVGCommand } from "@/utils/SVGPathParser";
import combineSVGPaths from "@/utils/combineSVGPaths";
import PreviewGlyph from "@/components/PreviewGlyph";

export const UNITS_PER_EM = 1000;
const CANVAS_SIZE = 400;
// const BASELINE_Y = 300;
// const X_HEIGHT_Y = 200;
// const CAP_HEIGHT_Y = 100;

const LETTERS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const LINECAPS = ["butt", "round", "square"];

// const toFontSpace = (x: number, y: number) => ({
//   x: (x / CANVAS_SIZE) * UNITS_PER_EM,
//   y: ((CANVAS_SIZE - y) / CANVAS_SIZE) * UNITS_PER_EM,
// });

// console.log(LETTERS);

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [fontName, setFontName] = useState("myFont");
  const [lineCap, setLineCap] = useState<CanvasLineCap>("round");
  // const [isDrawingMode, setIsDrawingMode] = useState(true);
  // const [canvas, setCanvas] = useState(null);
  const [selectedChar, setSelectedChar] = useState("A");
  const [glyphs, setGlyphs] = useState<Record<string, string>>({});

  // const guidelines = useMemo(() => {
  //   const baseline = new fabric.Line([0, 300, 400, 300], {
  //     stroke: "#0e0e0e",
  //     selectable: false,
  //     evented: false,
  //   });

  //   const xHeight = new fabric.Line([0, 200, 400, 200], {
  //     stroke: "#0e0e0e",
  //     selectable: false,
  //     evented: false,
  //   });

  //   return { baseline, xHeight };
  // }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      height: CANVAS_SIZE,
      width: CANVAS_SIZE,
      isDrawingMode: true,
    });

    fabricCanvasRef.current.freeDrawingBrush = new fabric.PencilBrush(
      fabricCanvasRef.current
    );
    fabricCanvasRef.current.freeDrawingBrush.color = "#2dd881";
    fabricCanvasRef.current.freeDrawingBrush.width = 15;
    fabricCanvasRef.current.freeDrawingBrush.strokeLineCap = lineCap;

    // fabricCanvasRef.current.freeDrawingBrush.strokeMiterLimit = 10;
    // fabricCanvasRef.current.freeDrawingBrush.strokeLineJoin = "miter";

    fabric.Object.prototype.set({
      fill: "",
      // fill: "#2dd881",
      // stroke: null,
      stroke: "#000000",
    });

    return () => {
      fabricCanvasRef.current?.dispose();
    };
  }, [lineCap]);

  const handleClearCanvas = () => {
    fabricCanvasRef.current?.clear();
    // fabricCanvasRef.current?.add(guidelines.baseline, guidelines.xHeight);
  };

  //Save Glyph
  const saveGlyph = () => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current?.getObjects();
    if (objects.length === 0) return;
    console.log(objects);

    const svgPaths = objects.map((obj) => {
      const svg = obj
        .toSVG()
        .replace(/"(\d+) (\d+)"/g, (_, x, y) => `"${x} ${CANVAS_SIZE - y}"`)
        .replace(/fill="[^"]*"/g, "")
        .replace(/stroke="[^"]*"/g, "stroke='#000'");

      return svg;
    });
    console.log(svgPaths);

    const svgPath = combineSVGPaths(svgPaths);

    //Remove Later
    const cmd: SVGCommand[] = SVGPathParser(svgPath);
    console.log(cmd);
    console.log(svgPath);

    setGlyphs((prev) => ({ ...prev, [selectedChar]: svgPath }));
    console.log(glyphs);

    fabricCanvasRef.current.clear();
    // fabricCanvasRef.current?.add(guidelines.baseline, guidelines.xHeight);
  };

  //Parse SVG path
  const parseSVGToPath = (svgPath: string) => {
    console.log(svgPath);

    const commands: SVGCommand[] = SVGPathParser(svgPath);
    const path = new opentype.Path();

    //Removing fill and adding stroke instead
    path.fill = null;
    path.stroke = "#000000";
    path.strokeWidth = 15;

    let currentX = 0;
    let currentY = 0;

    console.log(commands);

    commands.forEach((command) => {
      // Handling absolute / relative coords
      const absX = command.relative ? currentX + (command.x || 0) : command.x;
      const absY = command.relative ? currentY + (command.y || 0) : command.y;

      // Convert to font units
      // const { x: fontX, y: fontY } = toFontSpace(
      //   absX as number,
      //   absY as number
      // );

      switch (command.command) {
        case "moveto":
          if (absX && absY) {
            path.moveTo(absX, absY);
            currentX = absX;
            currentY = absY;
          }
          break;

        case "lineto":
          if (absX && absY) {
            path.lineTo(absX, absY);
            currentX = absX;
            currentY = absY;
          }
          break;

        case "curveto":
          if (
            command.x1 &&
            command.y1 &&
            command.x2 &&
            command.y2 &&
            command.x &&
            command.y
          ) {
            const x1 = command.relative ? currentX + command.x1 : command.x1;
            const y1 = command.relative ? currentY + command.y1 : command.y1;
            const x2 = command.relative ? currentX + command.x2 : command.x2;
            const y2 = command.relative ? currentY + command.y2 : command.y2;

            path.curveTo(x1, y1, x2, y2, absX!, absY!);

            currentX = absX as number;
            currentY = absY as number;
          }
          break;

        case "quadratic":
          if (command.x1 && command.y1) {
            // Convert quadratic to font space
            // const qp = toFontSpace(
            //   command.relative ? currentX + command.x1 : command.x1,
            //   command.relative ? currentY + command.y1 : command.y1
            // );

            // Convert quadratic to cubic bézier
            const cp1x = currentX + (2 / 3) * (command.x1 - currentX);
            const cp1y = currentY + (2 / 3) * (command.y1 - currentY);
            const cp2x = absX! + (2 / 3) * (command.x1 - absX!);
            const cp2y = absY! + (2 / 3) * (command.y1 - absY!);

            path.curveTo(cp1x, cp1y, cp2x, cp2y, absX!, absY!);

            currentX = absX as number;
            currentY = absY as number;
          }
          break;

        case "closepath":
          path.close();
          break;
      }
    });

    // path.fill = "black";

    console.log(path);
    return path;
  };

  //Export fn
  const exportFont = () => {
    const font = new opentype.Font({
      familyName: fontName,
      styleName: "Normal",
      unitsPerEm: UNITS_PER_EM,
      ascender: 800,
      descender: -200,
      glyphs: Object.entries<string>(glyphs).map(([char, svgPath]) => {
        // const path = parseSVGToPath(svgPath);
        // const bbox = path.getBoundingBox();

        return new opentype.Glyph({
          name: char,
          unicode: char.charCodeAt(0),
          advanceWidth: 500, // Width + side bearings
          path: parseSVGToPath(svgPath),
        });
      }),
    });

    console.log(font);
    console.log(font.glyphs);

    const blob = new Blob([font.toArrayBuffer()], { type: "font/ttf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fontName}.ttf`;
    link.click();
  };

  return (
    <div className="flex flex-col ">
      <p>Font Creator</p>
      <div className="flex flex-col items-center">
        <input
          type="text"
          value={fontName}
          onChange={(e) => setFontName(e.target.value)}
          placeholder="Font Name"
        />

        <select
          value={selectedChar}
          onChange={(e) => setSelectedChar(e.target.value)}
        >
          {LETTERS.map((letter) => (
            <option value={letter} key={letter}>
              {letter}
            </option>
          ))}
        </select>

        <button onClick={saveGlyph} className="">
          Save {selectedChar}
        </button>

        <button onClick={exportFont}>Export Font</button>
      </div>

      <PreviewGlyph path={glyphs[selectedChar] || ""} />

      <div className="bg-white flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="border border-red-400 overflow-hidden rounded-2xl"
        />

        <div className="flex flex-col">
          <button className="text-black" onClick={handleClearCanvas}>
            Clear Canvas
          </button>

          <select
            className="bg-black"
            value={lineCap}
            onChange={(e) => setLineCap(e.target.value as CanvasLineCap)}
          >
            {LINECAPS.map((linecap) => (
              <option value={linecap} key={linecap}>
                {linecap}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
