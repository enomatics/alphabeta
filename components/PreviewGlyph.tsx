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
            scale(1 -1)
            translate(0 -${UNITS_PER_EM})
        `
    );

    ref.current.appendChild(pathEl);
    console.log(path);
  }, [path]);

  return (
    <div className="bg-white">
      <svg
        ref={ref}
        viewBox={`0 0 ${UNITS_PER_EM} ${UNITS_PER_EM}`}
        width={100}
        height={100}
      />
      ;
    </div>
  );
};

export default PreviewGlyph;
