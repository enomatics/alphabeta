"use client";

import { GlyphData } from "@/types/font";
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Line, Stage } from "react-konva";

interface GlyphEditorProps {
  glyph: GlyphData | null;
  onChange: (updatedGlyph: GlyphData) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

const GlyphEditor: React.FC<GlyphEditorProps> = ({
  glyph,
  onChange,
  canvasWidth = 800,
  canvasHeight = 800,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [tool, setTool] = useState<"pen" | "rectangle" | "circle" | "select">(
    "pen",
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);

  useEffect(() => {
    if (stageRef.current && glyph && glyph.konvaData) {
      stageRef.current.getChildren().forEach((layer) => layer.destroy());
      const stage = stageRef.current;

      try {
        const loadedStage = Konva.Node.create(glyph.konvaData, stage);
        stage.add(loadedStage.getChildren()[0]); // Layer
        stage.draw();
      } catch (error) {
        console.error("Failed to load glyph konvaData:", error);
      }
    }
  }, [glyph]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setIsDrawing(true);
    const pos = e.target.getStage()?.getPointerPosition();

    if (tool === "pen" && pos) {
      setCurrentPath([pos.x, pos.y]);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();

    if (tool === "pen" && point) {
      setCurrentPath((prev) => [...prev, point.x, point.y]);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);

    if (tool === "pen" && currentPath.length > 0) {
      const layer = stageRef.current?.getChildren()[0] as Konva.Layer;
      if (layer) {
        const line = new Konva.Line({
          points: currentPath,
          stroke: "black",
          strokeWidth: 2,
          lineCap: "round",
          lineJoin: "round",
        });
        layer.add(line);
        layer.draw();
      }
    }

    setCurrentPath([]);
    saveGlyphData();
  };

  const saveGlyphData = () => {
    if (!stageRef.current || !glyph) return;

    const stage = stageRef.current;
    const konvaData = stage.toJSON();

    // Convert Konva shapes to SVG path data
    const pathData = convertKonvaToPath(stage);

    const updatedGlyph: GlyphData = {
      ...glyph,
      konvaData,
      pathData,
    };

    onChange(updatedGlyph);
  };

  const convertKonvaToPath = (stage: Konva.Stage): string => {
    // TODO: Implement a more comprehensive conversion if needed
    let pathData = "";

    stage.find("Line").forEach((line: any) => {
      const points = line.points();
      if (points.length >= 4) {
        pathData += `M ${points[0]} ${points[1]} `;
        for (let i = 2; i < points.length; i += 2) {
          pathData += `L ${points[i]} ${points[i + 1]} `;
        }
      }
    });

    return pathData;
  };

  const addRectangle = () => {
    const layer = stageRef.current?.getChildren()[0] as Konva.Layer;
    if (layer) {
      const rect = new Konva.Rect({
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        stroke: "black",
        strokeWidth: 2,
        draggable: true,
      });
      layer.add(rect);
      layer.draw();
      saveGlyphData();
    }
  };

  const addCircle = () => {
    const layer = stageRef.current?.getChildren()[0] as Konva.Layer;
    if (layer) {
      const circle = new Konva.Circle({
        x: 150,
        y: 150,
        radius: 50,
        stroke: "black",
        strokeWidth: 2,
        draggable: true,
      });
      layer.add(circle);
      layer.draw();
      saveGlyphData();
    }
  };

  const clearCanvas = () => {
    const layer = stageRef.current?.getChildren()[0] as Konva.Layer;
    if (layer) {
      layer.destroyChildren();
      layer.draw();
      saveGlyphData();
    }
  };

  return (
    <div className="glyph-editor">
      <div className="toolbar mb-2 flex gap-2">
        <button
          className={`rounded px-4 py-2 ${tool === "pen" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setTool("pen")}
        >
          Pen
        </button>
        <button
          className={`rounded px-4 py-2 ${tool === "pen" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setTool("select")}
        >
          Select
        </button>
        <button
          onClick={addRectangle}
          className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
        >
          Rectangle
        </button>
        <button
          onClick={addCircle}
          className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
        >
          Circle
        </button>
        <button
          onClick={clearCanvas}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Clear
        </button>
      </div>

      <div>
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          ref={stageRef}
        >
          <Layer>
            {/* Refeerence grid lines */}
            <Line
              points={[0, canvasHeight / 2, canvasWidth, canvasHeight / 2]}
              stroke={"#ddd"}
              strokeWidth={1}
            />
            <Line
              points={[canvasWidth / 2, 0, canvasWidth / 2, canvasHeight]}
              stroke={"#ddd"}
              strokeWidth={1}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default GlyphEditor;
