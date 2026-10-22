import type { SolidPaths } from "@/vendor/anatomy/iso-kit";

/** Original React wrapper around the pinned Anatomy geometry output. */
export function AnatomySolid({ paths, accent = false }: { paths: SolidPaths; accent?: boolean }) {
  return <g className={`lab-solid${accent ? " is-accent" : ""}`}>
    <path className="lab-solid-fill" d={paths.fill} />
    {paths.shades.map((d, shade) => d ? <path key={shade} className={`lab-shade lab-shade-${shade}`} d={d} /> : null)}
    <path className="lab-solid-top" d={paths.top} />
    {paths.crease && <path className="lab-solid-crease" d={paths.crease} />}
    <path className="lab-solid-outline" d={paths.outline} />
  </g>;
}
