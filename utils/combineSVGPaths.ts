export default function combineSVGPaths(svgElements: string[]): string {
  const parser = new DOMParser();
  const paths: string[] = [];

  svgElements.forEach((svg) => {
    try {
      const doc = parser.parseFromString(svg, "image/svg+xml");
      const pathElements = doc.querySelectorAll("path");

      pathElements.forEach((path) => {
        const d = path.getAttribute("d");
        if (d) paths.push(d);
      });
    } catch (err) {
      console.error("Error parsing SVG: ", err);
    }
  });

  return paths.join(" ");
}
