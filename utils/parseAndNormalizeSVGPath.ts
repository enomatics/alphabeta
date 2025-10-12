export interface SvgCommand {
  command: string;
  args: number[];
}

/**
 * Parse and normalize an SVG path string:
 * - Splits all path commands into structured objects
 * - Converts relative (lowercase) commands into absolute coordinates
 */
export function parseAndNormalizeSvgPath(path: string): SvgCommand[] {
  const commands: SvgCommand[] = [];
  const commandPattern = /([MmLlHhVvCcSsQqTtAaZz])/g;
  const numberPattern = /[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g;

  const tokens = path.trim().split(commandPattern).filter(Boolean);
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (/^[MmLlHhVvCcSsQqTtAaZz]$/.test(token)) {
      const command = token;
      const args: number[] = [];
      const next = tokens[i + 1];
      if (next && !/^[MmLlHhVvCcSsQqTtAaZz]$/.test(next)) {
        const numbers = next.match(numberPattern);
        if (numbers) args.push(...numbers.map(Number));
      }

      let idx = 0;
      const isRelative = command === command.toLowerCase();
      const cmd = command.toUpperCase();

      while (idx < args.length) {
        switch (cmd) {
          case "M": {
            const x = (isRelative ? currentX : 0) + args[idx++];
            const y = (isRelative ? currentY : 0) + args[idx++];
            currentX = startX = x;
            currentY = startY = y;
            commands.push({ command: "M", args: [x, y] });
            break;
          }

          case "L": {
            const x = (isRelative ? currentX : 0) + args[idx++];
            const y = (isRelative ? currentY : 0) + args[idx++];
            currentX = x;
            currentY = y;
            commands.push({ command: "L", args: [x, y] });
            break;
          }

          case "H": {
            const x = (isRelative ? currentX : 0) + args[idx++];
            currentX = x;
            commands.push({ command: "L", args: [x, currentY] });
            break;
          }

          case "V": {
            const y = (isRelative ? currentY : 0) + args[idx++];
            currentY = y;
            commands.push({ command: "L", args: [currentX, y] });
            break;
          }

          case "Q": {
            const x1 = (isRelative ? currentX : 0) + args[idx++];
            const y1 = (isRelative ? currentY : 0) + args[idx++];
            const x = (isRelative ? currentX : 0) + args[idx++];
            const y = (isRelative ? currentY : 0) + args[idx++];
            currentX = x;
            currentY = y;
            commands.push({ command: "Q", args: [x1, y1, x, y] });
            break;
          }

          case "C": {
            const x1 = (isRelative ? currentX : 0) + args[idx++];
            const y1 = (isRelative ? currentY : 0) + args[idx++];
            const x2 = (isRelative ? currentX : 0) + args[idx++];
            const y2 = (isRelative ? currentY : 0) + args[idx++];
            const x = (isRelative ? currentX : 0) + args[idx++];
            const y = (isRelative ? currentY : 0) + args[idx++];
            currentX = x;
            currentY = y;
            commands.push({ command: "C", args: [x1, y1, x2, y2, x, y] });
            break;
          }

          case "Z": {
            currentX = startX;
            currentY = startY;
            commands.push({ command: "Z", args: [] });
            break;
          }

          default:
            idx = args.length; // skip unsupported commands for now
        }
      }
    }
  }

  console.log(commands);
  return commands;
}
