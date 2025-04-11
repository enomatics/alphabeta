import { UNITS_PER_EM } from "@/app/page";
import { useEffect, useRef } from "react";

const PreviewGlyph = ({ path }: { path: string }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Clear Existing
    ref.current.innerHTML = "";

    // Create scaled SVG path
    const svgNS = "http://www.w3.org/2000/svg";
    const pathEl = document.createElementNS(svgNS, "path");
    pathEl.setAttribute("d", path);
    pathEl.setAttribute(
      "transform",
      `
            scale(1, -1)
            scale-y(-1)
            translate(0, -${UNITS_PER_EM})
      `
    );
    pathEl.setAttribute("fill", "none");
    pathEl.setAttribute("stroke", "#000000");
    pathEl.setAttribute("stroke-width", "15");
    pathEl.setAttribute("stroke-linecap", "round");

    ref.current.appendChild(pathEl);
    console.log(path);
  }, [path]);

  return (
    <div className="bg-slate-500 flex items-center justify-center">
      <svg
        className="border-red-400 border"
        ref={ref}
        viewBox={`0 0 ${UNITS_PER_EM} ${UNITS_PER_EM}`}
        width={100}
        height={100}
      />
    </div>
  );
};

export default PreviewGlyph;
