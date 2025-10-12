/**
 * SVG path command types
 */
type CommandType =
  | "M"
  | "m"
  | "L"
  | "l"
  | "H"
  | "h"
  | "V"
  | "v"
  | "C"
  | "c"
  | "S"
  | "s"
  | "Q"
  | "q"
  | "T"
  | "t"
  | "A"
  | "a"
  | "Z"
  | "z";

/**
 * Base command interface
 */
interface BaseCommand {
  type: CommandType;
  params: number[];
}

/**
 * Move command (M, m)
 */
interface MoveCommand extends BaseCommand {
  type: "M" | "m";
  x: number;
  y: number;
}

/**
 * Line command (L, l)
 */
interface LineCommand extends BaseCommand {
  type: "L" | "l";
  x: number;
  y: number;
}

/**
 * Horizontal line command (H, h)
 */
interface HorizontalLineCommand extends BaseCommand {
  type: "H" | "h";
  x: number;
}

/**
 * Vertical line command (V, v)
 */
interface VerticalLineCommand extends BaseCommand {
  type: "V" | "v";
  y: number;
}

/**
 * Cubic Bézier curve command (C, c)
 */
interface CubicCurveCommand extends BaseCommand {
  type: "C" | "c";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x: number;
  y: number;
}

/**
 * Smooth cubic Bézier curve command (S, s)
 */
interface SmoothCubicCurveCommand extends BaseCommand {
  type: "S" | "s";
  x2: number;
  y2: number;
  x: number;
  y: number;
}

/**
 * Quadratic Bézier curve command (Q, q)
 */
interface QuadraticCurveCommand extends BaseCommand {
  type: "Q" | "q";
  x1: number;
  y1: number;
  x: number;
  y: number;
}

/**
 * Smooth quadratic Bézier curve command (T, t)
 */
interface SmoothQuadraticCurveCommand extends BaseCommand {
  type: "T" | "t";
  x: number;
  y: number;
}

/**
 * Elliptical arc command (A, a)
 */
interface ArcCommand extends BaseCommand {
  type: "A" | "a";
  rx: number;
  ry: number;
  xAxisRotation: number;
  largeArcFlag: number;
  sweepFlag: number;
  x: number;
  y: number;
}

/**
 * Close path command (Z, z)
 */
interface ClosePathCommand extends BaseCommand {
  type: "Z" | "z";
}

/**
 * Union of all command types
 */
type PathCommand =
  | MoveCommand
  | LineCommand
  | HorizontalLineCommand
  | VerticalLineCommand
  | CubicCurveCommand
  | SmoothCubicCurveCommand
  | QuadraticCurveCommand
  | SmoothQuadraticCurveCommand
  | ArcCommand
  | ClosePathCommand;

/**
 * Parameter count mapping for each command type
 */
const PARAM_COUNTS: Record<CommandType, number> = {
  M: 2,
  m: 2, // moveto
  L: 2,
  l: 2, // lineto
  H: 1,
  h: 1, // horizontal lineto
  V: 1,
  v: 1, // vertical lineto
  C: 6,
  c: 6, // curveto
  S: 4,
  s: 4, // smooth curveto
  Q: 4,
  q: 4, // quadratic Bézier curve
  T: 2,
  t: 2, // smooth quadratic Bézier curve
  A: 7,
  a: 7, // elliptical arc
  Z: 0,
  z: 0, // closepath
};

/**
 * Converts an SVG path string into an array of command objects
 * @param pathString - The SVG path data string (e.g., "M10 10 L20 20")
 * @returns Array of parsed command objects
 */
function parseSVGPath(pathString: string): PathCommand[] {
  const commands: PathCommand[] = [];

  // Clean up the path string
  const cleanPath = pathString
    .trim()
    .replace(/[\n\r\t]/g, " ")
    .replace(/,/g, " ")
    .replace(/([MmLlHhVvCcSsQqTtAaZz])/g, "|$1 ")
    .replace(/\s+/g, " ")
    .trim();

  // Split by command
  const segments = cleanPath.split("|").filter((s) => s.trim());

  segments.forEach((segment) => {
    const parts = segment.trim().split(/\s+/);
    const type = parts[0] as CommandType;
    const params = parts.slice(1).map(Number);

    const expectedParams = PARAM_COUNTS[type];

    if (expectedParams === 0) {
      // Commands without parameters (Z, z)
      commands.push({ type, params: [] } as ClosePathCommand);
    } else {
      // Commands with parameters - may have multiple sets
      for (let i = 0; i < params.length; i += expectedParams) {
        const commandParams = params.slice(i, i + expectedParams);
        if (commandParams.length === expectedParams) {
          commands.push(createCommand(type, commandParams));
        }
      }
    }
  });

  return commands;
}

/**
 * Creates a typed command object based on command type
 */
function createCommand(type: CommandType, params: number[]): PathCommand {
  const upperType = type.toUpperCase();

  switch (upperType) {
    case "M":
      return { type, params, x: params[0], y: params[1] } as MoveCommand;

    case "L":
      return { type, params, x: params[0], y: params[1] } as LineCommand;

    case "H":
      return { type, params, x: params[0] } as HorizontalLineCommand;

    case "V":
      return { type, params, y: params[0] } as VerticalLineCommand;

    case "C":
      return {
        type,
        params,
        x1: params[0],
        y1: params[1],
        x2: params[2],
        y2: params[3],
        x: params[4],
        y: params[5],
      } as CubicCurveCommand;

    case "S":
      return {
        type,
        params,
        x2: params[0],
        y2: params[1],
        x: params[2],
        y: params[3],
      } as SmoothCubicCurveCommand;

    case "Q":
      return {
        type,
        params,
        x1: params[0],
        y1: params[1],
        x: params[2],
        y: params[3],
      } as QuadraticCurveCommand;

    case "T":
      return {
        type,
        params,
        x: params[0],
        y: params[1],
      } as SmoothQuadraticCurveCommand;

    case "A":
      return {
        type,
        params,
        rx: params[0],
        ry: params[1],
        xAxisRotation: params[2],
        largeArcFlag: params[3],
        sweepFlag: params[4],
        x: params[5],
        y: params[6],
      } as ArcCommand;

    default:
      return { type, params } as PathCommand;
  }
}

// Example usage:
const pathData = "M10 10 L20 20 C30 30 40 40 50 50 Z";
const commands = parseSVGPath(pathData);

console.log("Path:", pathData);
console.log("\nParsed commands:");
commands.forEach((cmd, i) => {
  console.log(`${i + 1}. ${cmd.type}`, cmd);
});

// More complex example
const complexPath = "M100,200 C100,100 250,100 250,200 S400,300 400,200";
console.log("\n\nComplex path:", complexPath);
console.log("Parsed:");
parseSVGPath(complexPath).forEach((cmd, i) => {
  console.log(`${i + 1}. ${cmd.type}:`, cmd);
});
