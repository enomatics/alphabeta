"use client";
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import opentype from "opentype.js";
import SVGPathParser, { SVGCommand } from "@/utils/SVGPathParser";
import combineSVGPaths from "@/utils/combineSVGPaths";
import PreviewGlyph from "@/components/PreviewGlyph";

export const UNITS_PER_EM = 1000;
const CANVAS_SIZE = 400;
const BASELINE_Y = 300;
const X_HEIGHT_Y = 200;
const CAP_HEIGHT_Y = 100;

const LETTERS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const LINECAPS = ["butt", "round", "square"];

const toFontSpace = (x: number, y: number) => ({
  x: (x / CANVAS_SIZE) * UNITS_PER_EM,
  y: ((CANVAS_SIZE - y) / CANVAS_SIZE) * UNITS_PER_EM,
});

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

    const guides = [
      { y: BASELINE_Y, color: "blue", label: "Baseline" },
      { y: X_HEIGHT_Y, color: "green", label: "x-height" },
      { y: CAP_HEIGHT_Y, color: "red", label: "Cap Height" },
    ];

    guides.forEach(({ y, color, label }) => {
      const line = new fabric.Line([0, y, CANVAS_SIZE, y], {
        stroke: color,
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });

      const text = new fabric.Textbox(label, {
        left: 10,
        top: y - 15,
        fontSize: 12,
        // selectable: false,
        // evented: false,
        fill: color,
      });

      fabricCanvasRef.current?.add(line, text);
    });

    fabricCanvasRef.current.freeDrawingBrush = new fabric.PencilBrush(
      fabricCanvasRef.current
    );
    fabricCanvasRef.current.freeDrawingBrush.color = "#080808";
    fabricCanvasRef.current.freeDrawingBrush.width = 15;
    fabricCanvasRef.current.freeDrawingBrush.strokeLineCap = lineCap;
    // fabricCanvasRef.current.freeDrawingBrush.strokeMiterLimit = 10;
    // fabricCanvasRef.current.freeDrawingBrush.strokeLineJoin = "miter";

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

    const svgPaths = objects.map((obj) => obj.toSVG());
    console.log(svgPaths);

    const svgPath = combineSVGPaths(svgPaths);

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
    let currentX = 0;
    let currentY = 0;

    console.log(commands);

    commands.forEach((command) => {
      // Converting coords to font space

      // Handling absolute / relative coords
      const absX = command.x
        ? currentX + (command.x || 0)
        : command.x || currentX;
      const absY = command.y
        ? currentY + (command.y || 0)
        : command.y || currentY;

      // Convert to font units
      const { x: fontX, y: fontY } = toFontSpace(
        absX as number,
        absY as number
      );

      switch (command.command) {
        case "moveto":
          path.moveTo(fontX, fontY);
          break;

        case "lineto":
          path.lineTo(fontX, fontY);
          break;

        case "curveto":
          if (command.x1 && command.y1 && command.x2 && command.y2) {
            const c1 = toFontSpace(
              command.relative ? currentX + command.x1 : command.x1,
              command.relative ? currentY + command.y1 : command.y1
            );

            const c2 = toFontSpace(
              command.relative ? currentX + command.x2 : command.x2,
              command.relative ? currentY + command.y2 : command.y2
            );

            path.curveTo(c1.x, c1.y, c2.x, c2.y, fontX, fontY);
          }
          break;

        case "quadratic":
          if (command.x1 && command.y1) {
            // Convert quadratic to font space
            const qp = toFontSpace(
              command.relative ? currentX + command.x1 : command.x1,
              command.relative ? currentY + command.y1 : command.y1
            );

            // Convert quadratic to cubic bézier
            const cp1 = {
              x:
                currentX * (UNITS_PER_EM / CANVAS_SIZE) +
                (2 / 3) * (qp.x - currentX * (UNITS_PER_EM / CANVAS_SIZE)),
              y:
                currentY * (UNITS_PER_EM / CANVAS_SIZE) +
                (2 / 3) * (qp.y - currentY * (UNITS_PER_EM / CANVAS_SIZE)),
            };

            const cp2 = {
              x: fontX + (2 / 3) * (qp.x - fontX),
              y: fontY + (2 / 3) * (qp.y - fontY),
            };

            path.curveTo(cp1.x, cp1.y, cp2.x, cp2.y, fontX, fontY);
          }
          break;

        case "closepath":
          path.close();
          break;
      }

      currentX = absX;
      currentY = absY;
    });

    // path.fill = "black";

    console.log(path);
    return path;
  };

  //Export fn
  const exportFont = () => {
    // I think .notdef glyph is required, so

    // const notdefGlyph = new opentype.Glyph({
    //   name: ".notdef",
    //   advanceWidth: 650,
    //   path: new opentype.Path(),
    // });

    const font = new opentype.Font({
      familyName: fontName,
      styleName: "Normal",
      unitsPerEm: UNITS_PER_EM,
      ascender: toFontSpace(0, CAP_HEIGHT_Y).y,
      descender: toFontSpace(0, BASELINE_Y).y - UNITS_PER_EM,
      glyphs: [
        new opentype.Glyph({
          name: ".notdef",
          advanceWidth: 650,
          path: new opentype.Path(),
        }),
        ...Object.entries<string>(glyphs).map(([char, svgPath]) => {
          const path = parseSVGToPath(svgPath);
          const bbox = path.getBoundingBox();

          return new opentype.Glyph({
            name: char,
            unicode: char.charCodeAt(0),
            advanceWidth: bbox.x2 - bbox.x1 + 100, // Width + side bearings
            path: path,
          });
        }),
      ],
    });

    // font.download();

    const blob = new Blob([font.toArrayBuffer()], { type: "font/ttf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fontName}.ttf`;
    link.click();
  };

  return (
    <div className="flex flex-col-reverse">
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
