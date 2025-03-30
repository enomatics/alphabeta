export interface SVGCommand {
  code: string;
  command: string;
  relative: boolean;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  rx?: number;
  ry?: number;
  rotation?: number;
  largeArc?: boolean;
  sweep?: boolean;
}

export default function SVGPathParser(d: string): SVGCommand[] {
  // const result: SVGCommand[] = [];
  const commandMap: { [key: string]: string } = {
    M: "moveto",
    L: "lineto",
    C: "curveto",
    Q: "quadratic",
    A: "arc",
    Z: "closepath",
    H: "horizontal",
    V: "vertical",
    S: "smooth-curveto",
    T: "smooth-quadratic",
  };

  return d
    .split(/(?=[A-Za-z])/g) // Split at commands
    .filter((cmd) => cmd.trim())
    .map((rawCmd) => {
      const parts = rawCmd.trim().split(/[\s,]+/);
      const code = parts[0];
      const relative = code === code.toLowerCase();
      const baseCmd = commandMap[code.toUpperCase()] || "unknown";
      const numbers = parts
        .slice(1)
        .map(Number)
        .filter((n) => !isNaN(n));

      const command: SVGCommand = {
        code,
        command: baseCmd,
        relative,
      };

      // Handle the different command types
      switch (baseCmd) {
        case "moveto":
        case "lineto":
        case "smooth-quadratic":
          if (numbers.length >= 2) {
            command.x = numbers[0];
            command.y = numbers[1];
          }
          break;

        case "curveto":
          if (numbers.length >= 6) {
            command.x1 = numbers[0];
            command.y1 = numbers[1];
            command.x2 = numbers[2];
            command.y2 = numbers[3];
            command.x = numbers[4];
            command.y = numbers[5];
          }
          break;

        case "quadratic":
          if (numbers.length >= 4) {
            command.x1 = numbers[0];
            command.y1 = numbers[1];
            command.x = numbers[2];
            command.y = numbers[3];
          }
          break;

        case "arc":
          if (numbers.length >= 7) {
            command.rx = numbers[0];
            command.ry = numbers[1];
            command.rotation = numbers[2];
            command.largeArc = numbers[3] === 1;
            command.sweep = numbers[4] === 1;
            command.x = numbers[5];
            command.y = numbers[6];
          }
          break;

        case "horizontal":
          if (numbers.length >= 1) command.x = numbers[0];
          break;

        case "vertical":
          if (numbers.length >= 1) command.y = numbers[0];
          break;
      }

      return command;
    });
}
