"use client";

import { useGlyphStore } from "@/app/store";
import { getPathFromStroke, Point } from "@/utils/fontUtils";
import getStroke from "perfect-freehand";
import React, { useRef, useState } from "react";

interface GlyphEditorProps {
  canvasSize: number;
  strokeSize: number;
  thinning?: number;
  smoothing?: number;
  streamline?: number;
  simulatePressure?: boolean;
}

const GlyphEditor: React.FC<GlyphEditorProps> = ({
  canvasSize,
  strokeSize,
  thinning = 0.5,
  smoothing = 0.5,
  streamline = 0.5,
  simulatePressure = true,
}) => {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  // const [points, setPoints] = useState<Point[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  // const [paths, setPaths] = useState<string[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Font Metrics (Relative to canvas)
  const BASELINE = canvasSize * 0.7;
  const ASCENDER = canvasSize * 0.05;
  const TYPO_ASCENDER = canvasSize * 0.125;
  const TYPO_DESCENDER = canvasSize * 0.925;
  const DESCENDER = canvasSize * 0.95;

  const { glyphs, activeGlyph, addPathToGlyph } = useGlyphStore();

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // (e.target as Element).setPointerCapture(e.pointerId);
    // setPoints([{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);

    setIsDrawing(true);
    setCurrentPoints([[e.nativeEvent.offsetX, e.nativeEvent.offsetY] as Point]);
    // console.log(currentPoints);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    // if (e.buttons !== 1) return;
    // setPoints((prevPoints) => [
    //   ...prevPoints,
    //   { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
    // ]);

    if (!isDrawing) return;
    const newPoint: Point = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
    const newPoints = [...currentPoints, newPoint];
    setCurrentPoints(newPoints);
    // console.log(currentPoints);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const stroke = getStroke(currentPoints, {
      size: strokeSize,
      thinning,
      smoothing,
      streamline,
      simulatePressure,
    });

    const pathData = getPathFromStroke(stroke as Point[]);
    if (pathData) {
      // setPaths((prevPaths) => [...prevPaths, pathData]);
      addPathToGlyph(activeGlyph, pathData);
      setCurrentPoints([]);
    }
  };

  // Live update
  const liveStroke = getPathFromStroke(
    getStroke(currentPoints, { size: strokeSize }) as Point[],
  );
  console.log(glyphs);
  // const glyphsMap = glyphs[activeGlyph];

  return (
    <div className="flex items-center justify-center border border-red-600">
      <svg
        ref={svgRef}
        width={`${canvasSize}px`}
        height={`${canvasSize}px`}
        className="touch-none border border-blue-700 bg-white"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* ___Guide lines___ */}
        <g strokeWidth={1}>
          {/* Ascender */}
          <line
            x1={0}
            x2={canvasSize}
            y1={ASCENDER}
            y2={ASCENDER}
            stroke="#ff0000"
            strokeDasharray={"4 4"}
          />
          <text x={5} y={ASCENDER - 5} fontSize={10} fill="#ff0000">
            Ascender
          </text>
          {/* Typo Ascender */}
          <line
            x1={0}
            x2={canvasSize}
            y1={TYPO_ASCENDER}
            y2={TYPO_ASCENDER}
            stroke="#ff0000"
            strokeDasharray={"4 4"}
          />
          <text x={5} y={TYPO_ASCENDER - 5} fontSize={10} fill="#ff0000">
            Typo Ascender
          </text>
          {/* Baseline */}
          <line
            x1={0}
            x2={canvasSize}
            y1={BASELINE}
            y2={BASELINE}
            stroke="#ff0000"
            strokeDasharray={"4 4"}
          />
          <text x={5} y={BASELINE - 5} fontSize={10} fill="#ff0000">
            Baseline
          </text>
          {/* Typo Descender */}
          <line
            x1={0}
            x2={canvasSize}
            y1={TYPO_DESCENDER}
            y2={TYPO_DESCENDER}
            stroke="#ff0000"
            strokeDasharray={"4 4"}
          />
          <text x={5} y={TYPO_DESCENDER - 5} fontSize={10} fill="#ff0000">
            Typo Descender
          </text>
          {/* Descender */}
          <line
            x1={0}
            x2={canvasSize}
            y1={DESCENDER}
            y2={DESCENDER}
            stroke="#ff0000"
            strokeDasharray={"4 4"}
          />
          <text x={5} y={DESCENDER - 5} fontSize={10} fill="#ff0000">
            Descender
          </text>
        </g>

        {/* Static paths */}
        {/* {paths.map((d, i) => (
          <path key={i} d={d} fill="black" />
        ))} */}

        {glyphs[activeGlyph] &&
          glyphs[activeGlyph].map((d, i) => (
            <path key={i} d={d} fill="black" />
          ))}

        {/* Current live path */}
        {isDrawing && <path d={liveStroke} fill="black" />}
      </svg>
    </div>
  );
};

export default GlyphEditor;
