import { SvgCommand } from "./parseAndNormalizeSVGPath";

interface Point {
  x: number;
  y: number;
}

/**
 * Parses an SVG path string into an array of commands
 */
function parsePath(pathString: string): SvgCommand[] {
  const commands: SvgCommand[] = [];
  const commandRegex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;

  let match;
  while ((match = commandRegex.exec(pathString)) !== null) {
    const command = match[1];
    const valueString = match[2].trim();

    // Parse numbers, handling negative numbers and scientific notation
    const args =
      valueString
        .match(/-?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g)
        ?.map(Number) || [];

    commands.push({ command, args });
  }

  return commands;
}

/**
 * Converts a quadratic Bezier to a cubic Bezier
 * Q/q: (x1, y1, x, y) -> C: (cp1x, cp1y, cp2x, cp2y, x, y)
 */
function quadraticToCubic(
  start: Point,
  control: Point,
  end: Point,
): { cp1: Point; cp2: Point } {
  return {
    cp1: {
      x: start.x + (2 / 3) * (control.x - start.x),
      y: start.y + (2 / 3) * (control.y - start.y),
    },
    cp2: {
      x: end.x + (2 / 3) * (control.x - end.x),
      y: end.y + (2 / 3) * (control.y - end.y),
    },
  };
}

/**
 * Normalizes and converts SVG path to absolute commands with quadratics converted to cubics
 * Returns an array of SvgCommand objects
 */
export function normalizePathToCubic(pathString: string): SvgCommand[] {
  const commands = parsePath(pathString);
  const result: SvgCommand[] = [];

  let currentPos: Point = { x: 0, y: 0 };
  let startPos: Point = { x: 0, y: 0 };
  let lastControlPoint: Point | null = null;
  let lastCommandType = "";

  for (const cmd of commands) {
    const { command, args } = cmd;
    const isRelative = command === command.toLowerCase();

    switch (command.toUpperCase()) {
      case "M": {
        // Move command
        for (let i = 0; i < args.length; i += 2) {
          const x = isRelative ? currentPos.x + args[i] : args[i];
          const y = isRelative ? currentPos.y + args[i + 1] : args[i + 1];

          if (i === 0) {
            result.push({ command: "M", args: [x, y] });
            startPos = { x, y };
          } else {
            // Subsequent coordinate pairs are treated as lineto
            result.push({ command: "L", args: [x, y] });
          }

          currentPos = { x, y };
        }
        lastControlPoint = null;
        break;
      }

      case "L": {
        // Line command
        for (let i = 0; i < args.length; i += 2) {
          const x = isRelative ? currentPos.x + args[i] : args[i];
          const y = isRelative ? currentPos.y + args[i + 1] : args[i + 1];

          result.push({ command: "L", args: [x, y] });
          currentPos = { x, y };
        }
        lastControlPoint = null;
        break;
      }

      case "H": {
        // Horizontal line
        for (const value of args) {
          const x = isRelative ? currentPos.x + value : value;
          result.push({ command: "L", args: [x, currentPos.y] });
          currentPos.x = x;
        }
        lastControlPoint = null;
        break;
      }

      case "V": {
        // Vertical line
        for (const value of args) {
          const y = isRelative ? currentPos.y + value : value;
          result.push({ command: "L", args: [currentPos.x, y] });
          currentPos.y = y;
        }
        lastControlPoint = null;
        break;
      }

      case "C": {
        // Cubic Bezier
        for (let i = 0; i < args.length; i += 6) {
          const cp1x = isRelative ? currentPos.x + args[i] : args[i];
          const cp1y = isRelative ? currentPos.y + args[i + 1] : args[i + 1];
          const cp2x = isRelative ? currentPos.x + args[i + 2] : args[i + 2];
          const cp2y = isRelative ? currentPos.y + args[i + 3] : args[i + 3];
          const x = isRelative ? currentPos.x + args[i + 4] : args[i + 4];
          const y = isRelative ? currentPos.y + args[i + 5] : args[i + 5];

          result.push({ command: "C", args: [cp1x, cp1y, cp2x, cp2y, x, y] });
          lastControlPoint = { x: cp2x, y: cp2y };
          currentPos = { x, y };
        }
        break;
      }

      case "S": {
        // Smooth cubic Bezier
        for (let i = 0; i < args.length; i += 4) {
          // Reflect last control point or use current position
          const cp1 =
            lastControlPoint &&
            (lastCommandType === "C" || lastCommandType === "S")
              ? {
                  x: 2 * currentPos.x - lastControlPoint.x,
                  y: 2 * currentPos.y - lastControlPoint.y,
                }
              : currentPos;

          const cp2x = isRelative ? currentPos.x + args[i] : args[i];
          const cp2y = isRelative ? currentPos.y + args[i + 1] : args[i + 1];
          const x = isRelative ? currentPos.x + args[i + 2] : args[i + 2];
          const y = isRelative ? currentPos.y + args[i + 3] : args[i + 3];

          result.push({ command: "C", args: [cp1.x, cp1.y, cp2x, cp2y, x, y] });
          lastControlPoint = { x: cp2x, y: cp2y };
          currentPos = { x, y };
        }
        break;
      }

      case "Q": {
        // Quadratic Bezier - convert to cubic
        for (let i = 0; i < args.length; i += 4) {
          const controlX = isRelative ? currentPos.x + args[i] : args[i];
          const controlY = isRelative
            ? currentPos.y + args[i + 1]
            : args[i + 1];
          const x = isRelative ? currentPos.x + args[i + 2] : args[i + 2];
          const y = isRelative ? currentPos.y + args[i + 3] : args[i + 3];

          const control = { x: controlX, y: controlY };
          const end = { x, y };
          const { cp1, cp2 } = quadraticToCubic(currentPos, control, end);

          result.push({
            command: "C",
            args: [cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y],
          });
          lastControlPoint = control; // Store for T command
          currentPos = end;
        }
        break;
      }

      case "T": {
        // Smooth quadratic Bezier - convert to cubic
        for (let i = 0; i < args.length; i += 2) {
          // Reflect last control point or use current position
          const control: Point =
            lastControlPoint &&
            (lastCommandType === "Q" || lastCommandType === "T")
              ? {
                  x: 2 * currentPos.x - lastControlPoint.x,
                  y: 2 * currentPos.y - lastControlPoint.y,
                }
              : currentPos;

          const x = isRelative ? currentPos.x + args[i] : args[i];
          const y = isRelative ? currentPos.y + args[i + 1] : args[i + 1];
          const end = { x, y };

          const { cp1, cp2 } = quadraticToCubic(currentPos, control, end);

          result.push({
            command: "C",
            args: [cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y],
          });
          lastControlPoint = control;
          currentPos = end;
        }
        break;
      }

      case "A": {
        // Arc - keep as is (converting to cubic is complex)
        for (let i = 0; i < args.length; i += 7) {
          const rx = args[i];
          const ry = args[i + 1];
          const rotation = args[i + 2];
          const largeArc = args[i + 3];
          const sweep = args[i + 4];
          const x = isRelative ? currentPos.x + args[i + 5] : args[i + 5];
          const y = isRelative ? currentPos.y + args[i + 6] : args[i + 6];

          result.push({
            command: "A",
            args: [rx, ry, rotation, largeArc, sweep, x, y],
          });
          currentPos = { x, y };
        }
        lastControlPoint = null;
        break;
      }

      case "Z": {
        // Close path
        result.push({ command: "Z", args: [] });
        currentPos = { ...startPos };
        lastControlPoint = null;
        break;
      }
    }

    lastCommandType = command.toUpperCase();
  }

  return result;
}
